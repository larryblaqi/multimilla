<script setup>
import { defineProps } from "vue";

defineProps({
  modelValue: String,
});

defineEmits(["update:modelValue"]);

const options = [
  { amount: 50, cashback: 1.75, payAmount: 50 },
  { amount: 100, cashback: 3.5, payAmount: 100 },
  { amount: 200, cashback: 7, payAmount: 200 },
  { amount: 500, cashback: 10, payAmount: 500 },
  { amount: 1000, cashback: 20, payAmount: 1000 },
  { amount: 2000, cashback: 40, payAmount: 2000 },
];
</script>

<template>
  <div>
    <!-- <h2 class="text-md font-bold mb-4 text-gray-800">Quick Top up</h2> -->
    <div class="grid grid-cols-3 gap-4">
      <button
        v-for="option in options"
        :key="option.amount"
        @click.prevent="$emit('update:modelValue', option.amount.toString())"
        class="bg-white px-4 py-4 space-y-2 border border-gray-400 rounded-lg"
      >
        <!-- <div
          class="bg-red-50 text-red-700 text-sm px-2 py-1 rounded-full w-fit"
        >
          ₦{{ option.cashback }} Cashback
        </div> -->
        <div class="text-sm text-gray-600 text-base font-bold">
          ₦ {{ option.amount }}
        </div>
        <!-- <div class="text-gray-500 text-md text-gray-900 text-base">
          Pay ₦{{ option.payAmount }}
        </div> -->
      </button>
    </div>
  </div>
</template>

<style scoped>
/* button,
input,
h2 {
  font-family: "Work Sans", sans-serif;
} */
</style>
