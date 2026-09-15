<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useHttp } from "../composables/useHttp";
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/outline";
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
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const showPasswords = ref({
  current: false,
  new: false,
  confirm: false,
});

const errors = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const validateForm = () => {
  errors.value = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  let isValid = true;

  if (!formData.value.currentPassword) {
    errors.value.currentPassword = "Current password is required";
    isValid = false;
  }

  if (!formData.value.newPassword) {
    errors.value.newPassword = "New password is required";
    isValid = false;
  } else if (formData.value.newPassword.length < 6) {
    errors.value.newPassword = "Password must be at least 6 characters";
    isValid = false;
  }

  if (!formData.value.confirmPassword) {
    errors.value.confirmPassword = "Please confirm your new password";
    isValid = false;
  } else if (formData.value.newPassword !== formData.value.confirmPassword) {
    errors.value.confirmPassword = "Passwords do not match";
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    isLoading.value = true;
    const response = await httpRequest("POST", "/customer/reset-password", {
      current_password: formData.value.currentPassword,
      new_password: formData.value.newPassword,
      confirm_password: formData.value.confirmPassword,
    });

    if (response.data.success) {
      successMessage.value = "Password updated successfully";
      showSuccessModal.value = true;
      // Reset form
      formData.value = {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      };
    } else {
      errorMessage.value = response.data.message || "Failed to update password";
      showErrorModal.value = true;
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "An error occurred. Please try again.";
    showErrorModal.value = true;
  } finally {
    isLoading.value = false;
  }
};

const togglePasswordVisibility = (field) => {
  showPasswords.value[field] = !showPasswords.value[field];
};

const goBack = () => router.back();

const handleModalClose = () => {
  showErrorModal.value = false;
  if (showSuccessModal.value) {
    showSuccessModal.value = false;
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
        <h1 class="font-semibold">Reset Password</h1>
      </div>
    </header>

    <main class="px-4 md:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      <div class="space-y-6 mt-5">
        <!-- Form -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="space-y-6">
            <!-- Current Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div class="relative">
                <input
                  :type="showPasswords.current ? 'text' : 'password'"
                  v-model="formData.currentPassword"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  @click="togglePasswordVisibility('current')"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <EyeIcon v-if="!showPasswords.current" class="w-5 h-5 text-gray-400" />
                  <EyeSlashIcon v-else class="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <p v-if="errors.currentPassword" class="text-red-500 text-sm mt-1">
                {{ errors.currentPassword }}
              </p>
            </div>

            <!-- New Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div class="relative">
                <input
                  :type="showPasswords.new ? 'text' : 'password'"
                  v-model="formData.newPassword"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  @click="togglePasswordVisibility('new')"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <EyeIcon v-if="!showPasswords.new" class="w-5 h-5 text-gray-400" />
                  <EyeSlashIcon v-else class="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <p v-if="errors.newPassword" class="text-red-500 text-sm mt-1">
                {{ errors.newPassword }}
              </p>
            </div>

            <!-- Confirm Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div class="relative">
                <input
                  :type="showPasswords.confirm ? 'text' : 'password'"
                  v-model="formData.confirmPassword"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  @click="togglePasswordVisibility('confirm')"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <EyeIcon v-if="!showPasswords.confirm" class="w-5 h-5 text-gray-400" />
                  <EyeSlashIcon v-else class="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <p v-if="errors.confirmPassword" class="text-red-500 text-sm mt-1">
                {{ errors.confirmPassword }}
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
                <span v-if="isLoading">Updating Password...</span>
                <span v-else>Update Password</span>
              </div>
            </button>
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

