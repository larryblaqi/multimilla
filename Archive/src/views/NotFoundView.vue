<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="text-center">
      <div class="mb-8">
        <h1 class="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 class="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
        <p class="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
      </div>
      
      <div class="space-y-4">
        <button
          @click="goHome"
          class="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Go to Dashboard
        </button>
        
        <div class="text-sm text-gray-400">
          <button @click="goBack" class="hover:text-gray-600 transition-colors">
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/wallet');
};

const goBack = () => {
  router.go(-1);
};
</script>

