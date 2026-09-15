<script setup>
import { computed, ref } from "vue";
import { PhoneIcon, WifiIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  selectedTvProvider: String,
  cardNo: String,
  error: String,
  verificationError: String,
  verificationDetails: Object,
  loading: Boolean,
});

const emit = defineEmits(["update:cardNo", "clear-error", "changeSmartCardNo"]);
const phoneInputFocused = ref(false);

const handleFocus = () => {
  phoneInputFocused.value = true;
  emit("clear-error");
};
const handleBlur = (e) => {
  phoneInputFocused.value = false;
  emit("changeSmartCardNo", e.target.value);
  console.log(e.target.value);
};
</script>

<template>
  <div class="space-y-4 mb-4">
    <div class="relative">
      <input
        type="tel"
        placeholder="Enter Meter Number"
        :value="cardNo"
        @focus="handleFocus"
        @blur="handleBlur($event)"
        class="w-full pl-4 pr-4 py-3.5 rounded-xl bg-gray-50 backdrop-blur-sm transition-all duration-200 text-gray-400 text-sm placeholder:text-gray-400"
        @input="$emit('update:cardNo', $event.target.value)"
        :class="[
          error
            ? 'border border-red-500 focus:border-red-500 focus:ring-red-200'
            : 'border-gray-200 focus:border-primary-500 focus:ring-primary-200',
          'focus:outline-none focus:ring-4',
          phoneInputFocused ? 'border-primary-500 ring-4 ring-primary-100' : '',
        ]"
        :disabled="!selectedTvProvider"
      />

      <!-- Loading Spinner -->
      <div
        v-if="loading"
        class="absolute inset-y-0 right-0 flex items-center pr-4"
      >
        <svg
          class="animate-spin h-5 w-5 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>

      <div class="absolute inset-0 rounded-xl bg-gray-100/50 -z-10"></div>
      <div class="absolute inset-0 rounded-xl shadow-inner-custom -z-10"></div>
    </div>
  </div>

  <div class="error-block p-1" v-if="verificationError">
    <span class="text-red-500">{{ verificationError }}</span>
  </div>

  <div class="bg-white rounded-lg shadow-lg" v-if="verificationDetails">
    <div class="p-4">
      <div
        class="flex justify-between items-center py-3 border-b last:border-b-0 border-gray-100"
      >
        <span class="font-medium text-gray-700 text-sm">Customer_Name </span>
        <span class="text-gray-900 text-sm">
          {{ verificationDetails?.Customer_Name }}
        </span>
      </div>
      <div
        class="flex justify-between items-center py-3 border-b last:border-b-0 border-gray-100"
      >
        <span class="font-medium text-gray-700 text-sm">Address</span>
        <span class="text-gray-900 text-sm">
          {{ verificationDetails?.Address }}
        </span>
      </div>
    </div>
  </div>
</template>
