<script setup>
import { ref } from "vue";
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
const showPassword = ref(false);

const formData = ref({
  new_phone: "",
  current_password: "",
  pin: "",
});

const errors = ref({ new_phone: "", current_password: "", pin: "" });

const validateForm = () => {
  errors.value = { new_phone: "", current_password: "", pin: "" };
  let isValid = true;
  const phoneRegex = /^(\+234|234|0)?[789][01]\d{8}$/;
  if (!formData.value.new_phone) { errors.value.new_phone = "New phone number is required"; isValid = false; }
  else if (!phoneRegex.test(formData.value.new_phone.replace(/\s/g, ""))) { errors.value.new_phone = "Please enter a valid Nigerian phone number"; isValid = false; }
  if (!formData.value.current_password) { errors.value.current_password = "Password is required"; isValid = false; }
  if (!formData.value.pin || formData.value.pin.length !== 4) { errors.value.pin = "Please enter your 4-digit PIN"; isValid = false; }
  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  try {
    isLoading.value = true;
    const response = await httpRequest("POST", "/customer/update-phone", {
      new_phone: formData.value.new_phone,
      current_password: formData.value.current_password,
      pin: formData.value.pin,
    });
    if (response.data?.success) {
      successMessage.value = "Phone number updated successfully!";
      showSuccessModal.value = true;
      formData.value = { new_phone: "", current_password: "", pin: "" };
    } else {
      errorMessage.value = response.data?.message || "Failed to update phone number";
      showErrorModal.value = true;
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "An error occurred. Please try again.";
    showErrorModal.value = true;
  } finally { isLoading.value = false; }
};

const goBack = () => router.back();
const handleModalClose = () => {
  showErrorModal.value = false;
  if (showSuccessModal.value) { showSuccessModal.value = false; router.back(); }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="flex items-center justify-between p-4 bg-white safe-area-top border-b">
      <div class="flex items-center gap-4 py-4">
        <button @click="goBack"><ArrowLeftIcon class="w-6 h-6" /></button>
        <h1 class="font-semibold">Reset Phone Number</h1>
      </div>
    </header>

    <main class="px-4 md:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      <div class="space-y-6 mt-5">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="space-y-6">
            <!-- New Phone -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">New Phone Number</label>
              <input
                type="tel"
                v-model="formData.new_phone"
                placeholder="e.g. 08012345678"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <p v-if="errors.new_phone" class="text-red-500 text-sm mt-1">{{ errors.new_phone }}</p>
            </div>

            <!-- Current Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <div class="relative">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  v-model="formData.current_password"
                  placeholder="Enter your current password"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2">
                  <EyeIcon v-if="!showPassword" class="w-5 h-5 text-gray-400" />
                  <EyeSlashIcon v-else class="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <p v-if="errors.current_password" class="text-red-500 text-sm mt-1">{{ errors.current_password }}</p>
            </div>

            <!-- PIN -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">4-Digit PIN</label>
              <input
                type="password"
                v-model="formData.pin"
                inputmode="numeric"
                maxlength="4"
                placeholder="Enter your PIN"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 tracking-widest text-center text-xl"
              />
              <p v-if="errors.pin" class="text-red-500 text-sm mt-1">{{ errors.pin }}</p>
            </div>

            <!-- Submit -->
            <button
              @click="handleSubmit"
              :disabled="isLoading"
              class="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div class="flex items-center justify-center">
                <Spinner v-if="isLoading" class="mr-2" />
                <span v-if="isLoading">Updating...</span>
                <span v-else>Update Phone Number</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </main>

    <ErrorModal :show-error-modal="showErrorModal" :errMessage="errorMessage" @close="handleModalClose" />
    <SuccessModal :show-success-modal="showSuccessModal" :message="successMessage" @close="handleModalClose" />
  </div>
</template>
