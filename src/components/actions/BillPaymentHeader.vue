<script setup>
import { ArrowLeftIcon } from "@heroicons/vue/24/outline";

defineEmits(["back", "history"]);
</script>

<template>
  <header class="flex items-center justify-between p-4 safe-area-top border-b">
    <div class="flex items-center gap-4 py-4">
      <button @click="$emit('back')" class="">
        <ArrowLeftIcon class="w-6 h-6" />
      </button>
      <h1 class="font-semibold">Bills</h1>
    </div>
  </header>
</template>

<style scoped>
/* h1 {
  font-family: "Work Sans", sans-serif;
} */
</style>
