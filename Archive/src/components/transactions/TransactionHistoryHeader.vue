<script setup>
import { defineProps } from "vue";
import { ArrowLeftIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  currentV: {
    type: String,
    required: true,
  },
});

defineEmits(["back"]);
</script>

<template>
  <header v-if="currentV == 'list'" class="flex items-center justify-between p-4 safe-area-top border-b">
    <div class="flex items-center gap-4 py-4">
      <button @click="$emit('back')">
        <ArrowLeftIcon class="w-6 h-6" />
      </button>
      <h1 class="font-semibold">Transactions</h1>
    </div>
    <!-- <button class="text-opay-green">
      Download
    </button> -->
  </header>
</template>
