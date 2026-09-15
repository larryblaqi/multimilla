<script setup >
import { ArrowLeftIcon } from "@heroicons/vue/24/outline";

defineEmits(["back"]);
</script>

<template>
  <header class="flex items-center justify-between p-4 border-b">
    <div class="flex items-center gap-4">
      <button @click="$emit('back')" class="p-1">
        <ArrowLeftIcon class="w-6 h-6" />
      </button>
      <h1 class="text-xl font-semibold">Messages</h1>
    </div>
  </header>
</template>


