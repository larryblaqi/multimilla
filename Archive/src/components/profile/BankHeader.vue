<script setup>
import { ArrowLeftIcon } from "@heroicons/vue/24/outline";

defineEmits(["back", "history"]);
</script>

<template>
  <header class="flex items-center justify-between p-4 bg-white safe-area-top border-b">
    <div class="flex items-center gap-4 py-4">
      <button @click="$emit('back')" >
        <ArrowLeftIcon class="w-6 h-6" />
      </button>
      <h1 class="font-semibold">Banks</h1>
    </div>
  </header>
</template>
