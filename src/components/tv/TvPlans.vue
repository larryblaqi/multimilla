<script setup>
import { ref, defineEmits } from "vue";
import { ChevronDownIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  variations: Array,
  error: String,
  selectedTvProvider: String,
  loading: Boolean,
});

const emit = defineEmits(["selectVariationCode", "clear-error"]);

const selectedPlan = ref("");
const isDropdownOpen = ref(false);

const selectPlan = (plan) => {
  selectedPlan.value = plan;
  isDropdownOpen.value = false;
  emit("selectVariationCode", plan);
  emit("clear-error");
};
</script>

<template>
  <!-- Data Plan Section -->
  <div class="relative">
    <button
      @click.prevent="isDropdownOpen = !isDropdownOpen"
      class="w-full transition-all duration-200 rounded-xl px-4 py-4 text-left flex justify-between items-center bg-gray-50 backdrop-blur-sm"
      :class="{
        'border-primary-500 ring-4 ring-primary-100': isDropdownOpen && !error,
        'opacity-50 cursor-not-allowed': !selectedTvProvider,
      }"
      :disabled="!selectedTvProvider || loading"
    >
      <span class="text-gray-400 text-sm placeholder:text-gray-400">
        {{ selectedPlan ? selectedPlan.name : "Select Plan" }}
      </span>

      <!-- Loading Spinner -->
      <div v-if="loading" class="ml-2">
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

      <!-- Dropdown Icon (hidden when loading or no variations) -->
      <ChevronDownIcon
        v-else-if="variations && variations.length > 0"
        class="w-5 h-5 text-gray-500"
        :class="{ 'transform rotate-180': isDropdownOpen }"
      />
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isDropdownOpen && variations && variations.length > 0"
      class="absolute w-full mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-10"
    >
      <div class="max-h-60 overflow-y-auto">
        <button
          v-for="plan in variations"
          :key="plan"
          @click.prevent="selectPlan(plan)"
          class="w-full p-4 text-left hover:bg-gray-50 text-gray-700 border-b border-gray-100 last:border-0"
        >
          {{ plan.name }}
        </button>
      </div>
    </div>
  </div>
</template>


