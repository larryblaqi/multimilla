<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeftIcon, TrashIcon } from "@heroicons/vue/24/outline";

const router = useRouter();

const goBack = () => router.back();
const goToProfile = () => router.push('/wallet/profile');

const openLiveChat = () => {
  if (window.smartsupp) {
    window.smartsupp('chat:show');
    window.smartsupp('chat:open');
  } else {
    alert("Live chat is currently unavailable. Please try again later.");
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 pb-12">
    <!-- Header -->
    <header class="flex items-center justify-between p-4 bg-white safe-area-top border-b">
      <div class="flex items-center gap-4 py-4">
        <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeftIcon class="w-6 h-6 text-gray-700" />
        </button>
        <h1 class="font-semibold text-lg text-gray-900">Delete Account</h1>
      </div>
    </header>

    <main class="px-4 md:px-6 lg:px-8 max-w-md mx-auto space-y-6 mt-8">
      <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center space-y-6">
        <div class="w-16 h-16 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mx-auto text-red-600">
          <TrashIcon class="w-8 h-8" />
        </div>

        <div class="space-y-3">
          <h2 class="text-xl font-bold text-gray-900">Delete Account</h2>
          <p class="text-sm text-gray-600 leading-relaxed">
            To delete your account, please contact Customer Support.
          </p>
          <p class="text-xs text-gray-500 leading-relaxed">
            Our support team will assist you with the account deletion process.
          </p>
        </div>

        <div class="space-y-3 pt-4">
          <button
            @click="openLiveChat"
            class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
          >
            Chat with Customer Support
          </button>
          
          <button
            @click="goToProfile"
            class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-2xl text-sm transition-all flex items-center justify-center"
          >
            Go Back
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Mobile-first responsive design */
@media (max-width: 640px) {
  .sticky {
    position: sticky;
    backdrop-filter: blur(8px);
    background-color: rgba(255, 255, 255, 0.95);
  }
}
</style>
