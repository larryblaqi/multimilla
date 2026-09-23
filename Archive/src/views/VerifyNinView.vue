<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useHttp } from "../composables/useHttp";
import { ArrowLeftIcon, ShieldCheckIcon } from "@heroicons/vue/24/outline";
import Spinner from "../components/modal/SpinnerComp.vue";
import ErrorModal from "../components/modal/ErrorModal.vue";
import SuccessModal from "../components/modal/SuccessModal.vue";

const router = useRouter();
const { httpRequest } = useHttp();

const isLoading = ref(false);
const showErrorModal = ref(false);
const showSuccessModal = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const formData = ref({
  nin: "",
  verificationType: "nin", // 'nin' or 'bvn'
});

const errors = ref({
  nin: "",
});

const validateForm = () => {
  errors.value = {
    nin: "",
  };

  let isValid = true;

  if (!formData.value.nin) {
    errors.value.nin = `${formData.value.verificationType.toUpperCase()} is required`;
    isValid = false;
  } else if (formData.value.nin.length !== 11) {
    errors.value.nin = `${formData.value.verificationType.toUpperCase()} must be exactly 11 digits`;
    isValid = false;
  } else if (!/^\d{11}$/.test(formData.value.nin)) {
    errors.value.nin = `${formData.value.verificationType.toUpperCase()} must contain only numbers`;
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    isLoading.value = true;
    const response = await httpRequest("POST", "/customer/verify-identity", {
      verification_type: formData.value.verificationType,
      nin: formData.value.verificationType === 'nin' ? formData.value.nin : null,
      bvn: formData.value.verificationType === 'bvn' ? formData.value.nin : null,
    });

    if (response.data.success) {
      successMessage.value = `${formData.value.verificationType.toUpperCase()} verification completed successfully`;
      showSuccessModal.value = true;
      // Reset form
      formData.value = {
        nin: "",
        verificationType: "nin",
      };
    } else {
      errorMessage.value = response.data.message || "Verification failed";
      showErrorModal.value = true;
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "An error occurred. Please try again.";
    showErrorModal.value = true;
  } finally {
    isLoading.value = false;
  }
};

const goBack = () => router.back();

const handleModalClose = () => {
  showErrorModal.value = false;
  showSuccessModal.value = false;
  if (showSuccessModal.value) {
    router.back();
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
        <h1 class="font-semibold">Verify NIN</h1>
      </div>
    </header>

    <main class="px-4 md:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      <div class="space-y-6 mt-5">
        <!-- Info Card -->
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div class="flex items-start gap-3">
            <ShieldCheckIcon class="w-6 h-6 text-blue-600 mt-0.5" />
            <div>
              <h3 class="text-sm font-medium text-blue-900 mb-1">
                Identity Verification
              </h3>
              <p class="text-sm text-blue-700">
                Verify your identity using your NIN or BVN. This helps us ensure account security and compliance with regulations.
              </p>
            </div>
          </div>
        </div>

        <!-- Form -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="space-y-6">
            <!-- Verification Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Verification Type
              </label>
              <select
                v-model="formData.verificationType"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="nin">NIN (National Identification Number)</option>
                <option value="bvn">BVN (Bank Verification Number)</option>
              </select>
            </div>

            <!-- NIN/BVN Input -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ formData.verificationType.toUpperCase() }} Number
              </label>
              <input
                type="text"
                v-model="formData.nin"
                maxlength="11"
                inputmode="numeric"
                pattern="[0-9]*"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                :placeholder="`Enter your ${formData.verificationType.toUpperCase()} (11 digits)`"
              />
              <p v-if="errors.nin" class="text-red-500 text-sm mt-1">
                {{ errors.nin }}
              </p>
              <p class="text-gray-500 text-xs mt-1">
                Enter your 11-digit {{ formData.verificationType.toUpperCase() }} number
              </p>
            </div>

            <!-- Submit Button -->
            <button
              @click="handleSubmit"
              :disabled="isLoading"
              class="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div class="flex items-center justify-center">
                <Spinner v-if="isLoading" class="mr-2" />
                <span v-if="isLoading">Verifying...</span>
                <span v-else>Verify {{ formData.verificationType.toUpperCase() }}</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Help Section -->
        <div class="bg-gray-50 rounded-xl p-4">
          <h3 class="text-sm font-medium text-gray-900 mb-2">Need Help?</h3>
          <p class="text-sm text-gray-600 mb-2">
            If you don't have your {{ formData.verificationType.toUpperCase() }} or are having trouble, please contact our support team.
          </p>
          <div class="text-sm text-gray-600">
            <p>Email: support@multimilla.com</p>
            <p>Phone: +2348032688415</p>
          </div>
        </div>
      </div>
    </main>

    <!-- Modals -->
    <ErrorModal
      :show-error-modal="showErrorModal"
      :errMessage="errorMessage"
      @close="handleModalClose"
    />
    <SuccessModal
      :show-success-modal="showSuccessModal"
      :message="successMessage"
      @close="handleModalClose"
    />
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

