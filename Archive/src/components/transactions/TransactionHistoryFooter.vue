<script setup>
import { ArrowPathIcon, ChartBarIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <footer class="fixed bottom-0 left-0 right-0 bg-white border-t">
    <div class="flex justify-around p-4">
      <button class="flex flex-col items-center gap-1">
        <ArrowPathIcon class="w-6 h-6 text-red-700" />
        <span class="text-sm text-red-700">Transactions</span>
      </button>
      <button class="flex flex-col items-center gap-1">
        <ChartBarIcon class="w-6 h-6 text-gray-400" />
        <span class="text-sm text-gray-400">Statistics</span>
      </button>
    </div>
  </footer>
</template>