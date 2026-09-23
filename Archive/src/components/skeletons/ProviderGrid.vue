<template>
  <div
    class="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-6"
  >
    <div
      v-for="n in 4"
      :key="n"
      class="flex-1 p-3 border border-gray-200 rounded-lg bg-white shadow-sm animate-pulse"
    >
      <div class="h-8 w-8 bg-gray-300 mx-auto rounded-full mb-3"></div>
      <div class="h-4 bg-gray-300 w-2/3 mx-auto rounded"></div>
    </div>
  </div>
</template>

<script setup>
// Skeleton loader component
</script>
