<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeftIcon, DocumentTextIcon } from "@heroicons/vue/24/outline";

const router = useRouter();

const legalDocuments = ref([
  {
    id: 1,
    title: "Terms of Service",
    description: "Our terms and conditions for using the Multimilla platform",
    type: "terms"
  },
  {
    id: 2,
    title: "Privacy Policy",
    description: "How we collect, use, and protect your personal information",
    type: "privacy"
  }
]);

const goBack = () => router.back();

const openDocument = (document) => {
  if (document.type === 'privacy') {
    window.open('https://multimilla.com/privacy/', '_blank');
  } else if (document.type === 'terms') {
    window.open('https://multimilla.com/terms-of-use/', '_blank');
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="flex items-center justify-between p-4 bg-white safe-area-top border-b">
      <div class="flex items-center gap-4 py-4">
        <button @click="goBack">
          <ArrowLeftIcon class="w-6 h-6" />
        </button>
        <h1 class="font-semibold">Legal Documents</h1>
      </div>
    </header>

    <main class="px-4 md:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      <div class="space-y-6 mt-5">
        <!-- Info Card -->
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div class="flex items-start gap-3">
            <DocumentTextIcon class="w-6 h-6 text-blue-600 mt-0.5" />
            <div>
              <h3 class="text-sm font-medium text-blue-900 mb-1">
                Legal Information
              </h3>
              <p class="text-sm text-blue-700">
                Review our legal documents to understand your rights and our responsibilities when using Multimilla.
              </p>
            </div>
          </div>
        </div>

        <!-- Legal Documents List -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div
            v-for="(document, index) in legalDocuments"
            :key="document.id"
            @click="openDocument(document)"
            class="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
          >
            <div class="flex items-center gap-3">
              <DocumentTextIcon class="w-5 h-5 text-gray-400" />
              <div>
                <h3 class="text-sm font-medium text-gray-900">{{ document.title }}</h3>
                <p class="text-xs text-gray-500 mt-1">{{ document.description }}</p>
              </div>
            </div>
            <div class="text-gray-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="bg-gray-50 rounded-xl p-4">
          <h3 class="text-sm font-medium text-gray-900 mb-3">Legal Contact</h3>
          <div class="space-y-2 text-sm text-gray-600">
            <p><strong>Legal Department</strong></p>
            <p>Multimilla Financial Services</p>
            <p>Email: support@multimilla.com</p>
            <p>Phone: +2348032688415</p>
            <p class="text-xs text-gray-500 mt-3">
              For any legal inquiries or concerns, please contact our legal department.
            </p>
          </div>
        </div>

        <!-- Version Information -->
        <div class="text-center py-4">
          <p class="text-sm text-gray-500">Legal Documents v1.1.3</p>
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

