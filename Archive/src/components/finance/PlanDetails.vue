<script setup>
import { ref, defineProps, defineEmits } from "vue";
import { ChevronDownIcon } from "@heroicons/vue/24/outline";
import Spinner from "../modal/SpinnerComp.vue";
import { formatMoney } from "../../utils/globals";

const props = defineProps({
  company: {
    type: Object,
    required: true,
  },
  modelValue: String,
  error: {
    type: String,
    default: "",
  },
  isLoading: Boolean,
  amntError: String,
  amntErrors: Boolean,
  isValidAmount: {
    type: Function,
    default: () => false, // Default function that returns a boolean
    validator: (value) =>
      typeof value === "function" && typeof value() === "boolean",
  },
  minInvestmentAmount: String,
});

const activeTab = ref("header");

const emit = defineEmits([
  "update:modelValue",
  "selectCompany",
  "clear-error",
  "emitInvestmentRequest",
  "emitBlurEventAmountInput",
]);

const tabs = [
  { id: "header", label: "Overview" },
  { id: "details", label: "Plan Details" },
  { id: "investment", label: "Contribute" },
];

const switchTab = (tabId) => {
  activeTab.value = tabId;
};
</script>

<template>
  <div class="max-w-md mx-auto bg-white overflow-hidden">
    <!-- Tabs Navigation -->
    <div class="flex border-b">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="switchTab(tab.id)"
        :class="{
          'text-red-400 border-b-2 border-red-400': activeTab === tab.id,
          'text-gray-800': activeTab !== tab.id,
        }"
        class="flex-1 py-3 text-center text-sm font-semibold transition-colors"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="p-6">
      <!-- Overview Tab -->
      <div v-if="activeTab === 'header'" class="text-center">
        <!-- <h2 class="text-2xl font-bold text-gray-800">{{ company.name }}</h2> -->
        <p class="text-gray-500 mt-2 text-sm">{{ company.description }}</p>
      </div>

      <!-- Plan Details Tab -->
      <div v-else-if="activeTab === 'details'" class="space-y-3">
        <div class="flex justify-between items-center">
          <span class="text-gray-600 text-sm">Cycle Return</span>
          <span class="font-semibold text-emerald-600">
            {{ company.annual_return }}
          </span>
        </div>
        <!-- <div class="flex justify-between items-center">
          <span class="text-gray-600 text-sm">Risk Level</span>
          <span
            :class="{
              'text-green-600 text-xs': company.risk_level === 'Low',
              'text-yellow-600 text-xs': company.risk_level === 'Medium',
              'text-red-600 text-xs': company.risk_level === 'High',
            }"
          >
            {{ company.risk_level }}
          </span>
        </div> -->
        <div class="flex justify-between items-center">
          <span class="text-gray-600 text-sm">Minimum Contribution</span>
          <span class="font-semibold">
            ₦{{ formatMoney(company.minimum_investment) }}
          </span>
        </div>
      </div>

      <!-- Investment Tab -->
      <div v-else-if="activeTab === 'investment'">
        <div>
          <div
            class="flex items-center border-b border-gray-200 py-2 shadow-sm"
            :class="{ 'border-b border-red-500 ': !isValidAmount() }"
          >
            <span class="text-xl font-semibold">₦</span>
            <input
              type="number"
              placeholder="Enter Amount"
              @blur="emit('emitBlurEventAmountInput', $event.target.value)"
              @input="$emit('update:modelValue', $event.target.value)"
              class="flex-1 ml-2 outline-none text-md text-gray-700"
            />
          </div>
          <p v-if="amntError" class="text-red-500 text-sm mt-4">
            {{ amntError }}
          </p>
          <!-- <p v-if="error" class="text-red-500 text-sm mt-4">
            {{ error }}
          </p> -->
        </div>

        <button
          class="w-full mt-4 bg-red-400 text-white py-3 rounded-lg font-bold flex justify-center items-center"
          :class="{
            'opacity-50 cursor-not-allowed': !amntErrors,
          }"
          :disabled="!amntErrors"
          @click="$emit('emitInvestmentRequest')"
        >
          <Spinner v-if="isLoading" class="mr-2" />
          <span v-else>Proceed</span>
        </button>
      </div>
    </div>
  </div>
</template>
