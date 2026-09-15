<!-- src/components/Spinner.vue -->
<template>
  <div class="spinner"></div>
</template>

<script setup></script>

<style scoped>
.spinner {
  border: 4px solid rgba(128, 128, 128, 0.3);
  border-top: 4px solid gray;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
