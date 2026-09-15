<script setup>
import { defineProps, ref } from "vue";
import Spinner from "../modal/SpinnerComp.vue";

const props = defineProps({
  modelValue: String,
  isLoading: Boolean,
  error: String,
  selectedNetworkProvider: String,
});

const emit = defineEmits([
  "update:modelValue",
  "handleAirtimeRequest",
  "clear-amountError",
]);

const handleFocus = () => {
  focused.value = true;
  emit("clear-amountError");
};

const focused = ref(false);
</script>

<template>
  <div class="space-y-6">
    <!-- <label class="block text-sm md:text-base font-medium text-gray-800 mb-1"
      >Enter Amount</label
    > -->
    <div
      class="flex items-center w-full mb-4 px-4 py-3.5 rounded-xl bg-gray-50 backdrop-blur-sm transition-all duration-200"
      :class="{
        'border-red-500 ring-4 ring-red-100': error,
      }"
    >
      <span
        class="text-xl font-semibold transition-colors duration-200"
        :class="focused ? 'text-primary-600' : 'text-gray-700'"
        >₦</span
      >
      <input
        type="number"
        :value="modelValue"
        @focus="handleFocus"
        @blur="() => (focused = false)"
        @input="$emit('update:modelValue', $event.target.value)"
        placeholder="0.00"
        class="flex-1 ml-2 bg-transparent text-lg text-dark placeholder:text-gray-400 focus:outline-none"
      />
    </div>
    <div class="flex flex-col justify-between h-full mt-6">
      <button
        class="w-full bg-red-400 text-white py-4 rounded-lg flex justify-center items-center"
        :class="{ 'opacity-50 cursor-not-allowed': !selectedNetworkProvider }"
        :disabled="!selectedNetworkProvider"
        @click.prevent="$emit('handleAirtimeRequest')"
      >
        <Spinner v-if="isLoading" class="mr-2" />
        <span v-else>Buy Airtime</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* button,
input,
label,
span {
  font-family: "Work Sans", sans-serif;
} */

/* Remove number input spinners */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

/* Smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Focus animations */
.ring-4 {
  transition: box-shadow 0.2s ease;
}

/* Input placeholder styling */
input::placeholder {
  color: #9ca3af;
  transition: color 0.2s ease;
}

input:focus::placeholder {
  color: #d1d5db;
}

</style>
