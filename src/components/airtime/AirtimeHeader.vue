<script setup>
import { ArrowLeftIcon } from "@heroicons/vue/24/outline";

defineEmits(["back", "history"]);
</script>

<template>
  <header class="flex items-center justify-between p-4 safe-area-top border-b">
    <div class="flex items-center gap-4 py-4">
      <button @click.prevent="$emit('back')" >
        <ArrowLeftIcon class="w-6 h-6" />
      </button>
      <h1 class="font-semibold">Airtime</h1>
    </div>
    <!-- <button @click="$emit('history')" class="text-blue-700 font-medium">
      History
    </button> -->
  </header>
</template>

<style scoped>
/* button,
h1 {
  font-family: "Work Sans", sans-serif;
} */
</style>
