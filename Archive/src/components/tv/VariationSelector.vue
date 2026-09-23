<script setup>
import { ref, defineProps, defineEmits } from "vue";
import { ChevronDownIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  plans: {
    type: Array,
    required: true,
  },
  error: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["selectVariationCode", "clear-error"]);

const selectedPlan = ref(null);
const isDropdownOpen = ref(false);

const selectPlan = (plan) => {
  selectedPlan.value = plan;
  isDropdownOpen.value = false;
  emit("selectTvType", plan);
  emit("clear-error");
};
</script>

<template>
  <div class="mb-8 mt-8 ">
    <h1 class="text-2xl md:text-3xl font-bold mb-2 text-gray-600">Buy Tv Subscription</h1>
    <p class="text-gray-600 text-sm md:text-base">
      Purchase tv subscription plan for any network provider instantly
    </p>
  </div>
  <div class="relative">
    <button
      @click.prevent="isDropdownOpen = !isDropdownOpen"
      class="w-full transition-all duration-200 rounded-xl px-4 py-4 text-left flex justify-between items-center bg-gray-50 backdrop-blur-sm"
      :class="{
        'border-primary-500 ring-4 ring-primary-100': isDropdownOpen && !error,
      }"
    >
      <span class="text-gray-400 text-sm placeholder:text-gray-400">
        {{ selectedPlan ? selectedPlan : "Select TV Service" }}
      </span>
      <ChevronDownIcon
        class="w-5 h-5 text-gray-500 transition-transform duration-300"
        :class="{ 'rotate-180': isDropdownOpen }"
      />
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isDropdownOpen"
      class="absolute w-full mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-10"
    >
      <div class="max-h-60 overflow-y-auto">
        <button
          v-for="plan in plans"
          :key="plan.variation_code"
          @click.prevent="selectPlan(plan)"
          class="w-full p-4 text-left hover:bg-gray-50 text-gray-700 border-b border-gray-100 last:border-0"
        >
          {{ plan }}
        </button>
      </div>
    </div>
  </div>
</template>

