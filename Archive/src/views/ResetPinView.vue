<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useHttp } from "../composables/useHttp";
import { ArrowLeftIcon } from "@heroicons/vue/24/outline";
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
  newPin: "",
  confirmPin: "",
});

const pinInputs = ref({
  new: Array(4).fill(""),
  confirm: Array(4).fill(""),
});

const newPinIndex = ref(0);
const confirmPinIndex = ref(0);

const errors = ref({
  currentPassword: "",
  newPin: "",
  confirmPin: "",
});

const handlePinInput = (event, index, type) => {
  const value = event.target.value;
  
  // Only allow digits
  if (!/^\d$/.test(value)) {
    event.target.value = '';
    pinInputs.value[type][index] = '';
    return;
  }

  pinInputs.value[type][index] = value;
  errors.value[`${type}Pin`] = '';

  // Auto-focus next input
  if (value && index < 3) {
    const nextIndex = index + 1;
    const nextInput = event.target.parentElement.querySelector(`input[data-pin-index="${nextIndex}"]`);
    if (nextInput) {
      nextInput.focus();
    }
  }
};

const handleBackspace = (event, index, type) => {
  if (event.key === 'Backspace' && !pinInputs.value[type][index] && index > 0) {
    const prevIndex = index - 1;
    const prevInput = event.target.parentElement.querySelector(`input[data-pin-index="${prevIndex}"]`);
    if (prevInput) {
      prevInput.focus();
    }
  }
};

const validateForm = () => {
  errors.value = {
    currentPassword: "",
    newPin: "",
    confirmPin: "",
  };

  let isValid = true;

  if (!formData.value.currentPassword) {
    errors.value.currentPassword = "Current password is required";
    isValid = false;
  }

  const newPin = pinInputs.value.new.join('');
  const confirmPin = pinInputs.value.confirm.join('');

  if (newPin.length !== 4) {
    errors.value.newPin = "Please enter a new 4-digit PIN";
    isValid = false;
  }

  if (confirmPin.length !== 4) {
    errors.value.confirmPin = "Please confirm your new PIN";
    isValid = false;
  } else if (newPin !== confirmPin) {
    errors.value.confirmPin = "PINs do not match";
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    isLoading.value = true;
    const response = await httpRequest("POST", "/customer/reset-pin", {
      current_password: formData.value.currentPassword,
      new_pin: pinInputs.value.new.join(''),
      confirm_pin: pinInputs.value.confirm.join(''),
    });

    if (response.data.success) {
      successMessage.value = "PIN updated successfully";
      showSuccessModal.value = true;
      // Reset form
      formData.value = {
        currentPassword: "",
        newPin: "",
        confirmPin: "",
      };
      pinInputs.value = {
        new: Array(4).fill(""),
        confirm: Array(4).fill(""),
      };
    } else {
      errorMessage.value = response.data.message || "Failed to update PIN";
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
        <h1 class="font-semibold">Reset PIN</h1>
      </div>
    </header>

    <main class="px-4 md:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      <div class="space-y-6 mt-5">
        <!-- Form -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="space-y-8">
            <!-- Current Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                v-model="formData.currentPassword"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter your current password"
              />
              <p v-if="errors.currentPassword" class="text-red-500 text-sm mt-1">
                {{ errors.currentPassword }}
              </p>
            </div>

            <!-- New PIN -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-4">
                New PIN
              </label>
              <div class="flex justify-center gap-4">
                <template v-for="(_, index) in 4" :key="index">
                  <input
                    type="text"
                    :data-pin-index="index"
                    v-model="pinInputs.new[index]"
                    maxlength="1"
                    @input="(e) => handlePinInput(e, index, 'new')"
                    @keydown="(e) => handleBackspace(e, index, 'new')"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    class="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-red-500 focus:outline-none"
                  />
                </template>
              </div>
              <p v-if="errors.newPin" class="text-red-500 text-sm mt-2 text-center">
                {{ errors.newPin }}
              </p>
            </div>

            <!-- Confirm PIN -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-4">
                Confirm New PIN
              </label>
              <div class="flex justify-center gap-4">
                <template v-for="(_, index) in 4" :key="index">
                  <input
                    type="text"
                    :data-pin-index="index"
                    v-model="pinInputs.confirm[index]"
                    maxlength="1"
                    @input="(e) => handlePinInput(e, index, 'confirm')"
                    @keydown="(e) => handleBackspace(e, index, 'confirm')"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    class="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-red-500 focus:outline-none"
                  />
                </template>
              </div>
              <p v-if="errors.confirmPin" class="text-red-500 text-sm mt-2 text-center">
                {{ errors.confirmPin }}
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
                <span v-if="isLoading">Updating PIN...</span>
                <span v-else>Update PIN</span>
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

