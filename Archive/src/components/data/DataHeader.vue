<script setup>
import { ArrowLeftIcon } from "@heroicons/vue/24/outline";

defineEmits(["back", "history"]);
</script>

<template>
  <header class="flex items-center justify-between px-4 py-3 bg-white safe-area-top border-b border-gray-100">
    <div class="flex items-center gap-2">
      <button 
        type="button"
        @click.prevent="$emit('back')" 
        class="w-11 h-11 -ml-2 rounded-full flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation cursor-pointer"
        aria-label="Go Back"
      >
        <ArrowLeftIcon class="w-6 h-6 text-gray-800" />
      </button>
      <h1 class="text-lg font-semibold text-gray-900">Mobile Data</h1>
    </div>
  </header>
</template>

<style scoped>
/* button,
h1 {
  font-family: "Work Sans", sans-serif;
} */
</style>
