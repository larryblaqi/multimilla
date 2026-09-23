<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-white p-4"
  >
    <div>
      <img src="../assets/images/lg.png" alt="Bank Logo" class="h-15 w-20" />
    </div>

    <!-- Registration Form -->
    <div class="w-full max-w-md space-y-6">
      <div class="text-center text-gray-700 text-md mb-8 font-bold">
        Reset Password
      </div>

      <!-- Stepper Indicators -->
      <div class="flex justify-center space-x-4 mb-6">
        <div
          class="w-10 h-2 rounded-full transition-colors"
          :class="currentStep === 1 ? 'bg-red-500' : 'bg-gray-300'"
        ></div>
        <div
          class="w-10 h-2 rounded-full transition-colors"
          :class="currentStep === 2 ? 'bg-red-500' : 'bg-gray-300'"
        ></div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- Step 1: Basic Information -->
        <template v-if="currentStep === 1">
          <!-- Email Input -->
          <!-- Email Input -->
          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
            >
              <EnvelopeIcon class="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              placeholder="Email Address"
              v-model="formData.email"
              @blur="handleEmailBlur"
              class="w-full px-4 py-4 pl-10 bg-gray-50 rounded-lg focus:outline-none focus:ring-0 text-gray-700 text-md placeholder:text-gray-400 shadow-sm"
              :class="{
                'border-red-500 border': emailError,
                'pr-12': verifyingEmail,
              }"
            />
            <!-- Loading Spinner -->
            <div
              v-if="verifyingEmail"
              class="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              <svg
                class="animate-spin h-5 w-5 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <div class="input-background"></div>
            <div class="input-shadow"></div>
            <p
              v-if="emailError || mailResponse"
              class="text-red-500 text-sm mt-1 px-1"
            >
              {{ emailError || mailResponse }}
            </p>
          </div>

          <!-- Account Reference Input -->
          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
            >
              <UserIcon class="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Account Reference"
              v-model="formData.account_reference"
              :disabled="!accountRefEnabled"
              class="w-full px-4 py-4 pl-10 bg-gray-50 rounded-lg focus:outline-none focus:ring-0 text-gray-700 text-md placeholder:text-gray-400 shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              :class="{ 'border-red-500 border': accountrefError }"
            />
            <div class="input-background"></div>
            <div class="input-shadow"></div>
            <p v-if="accountrefError" class="text-red-500 text-sm mt-1 px-1">
              {{ accountrefError }}
            </p>
          </div>

          <!-- Verify Button -->
          <button
            type="button"
            @click.prevent="proceedToNextStep"
            class="w-full bg-red-600 text-white py-4 rounded-lg hover:bg-red-500 transition-colors font-medium text-md mt-8 flex justify-center items-center"
            :disabled="!isFirstStepValid || loading"
            :class="{
              'opacity-50 cursor-not-allowed': !isFirstStepValid || loading,
            }"
          >
            <Spinner v-if="loading" class="mr-2" />
            <span>{{ loading ? "Verifying..." : "Verify" }}</span>
          </button>
        </template>

        <!-- Step 2: Password Reset -->
        <template v-if="currentStep === 2">
          <!-- Password Input -->
          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
            >
              <LockClosedIcon class="h-5 w-5 text-gray-400" />
            </div>
            <input
              :type="showPassword ? 'text' : 'password'"
              placeholder="Create New Password"
              v-model="formData.password"
              @input="handlePasswordInput"
              class="w-full px-4 py-4 pl-10 pr-10 bg-gray-50 rounded-lg focus:outline-none focus:ring-0 text-gray-700 text-md placeholder:text-gray-400 shadow-sm"
              :class="{ 'border-red-500 border': passwordError }"
            />
            <div
              class="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
              @click.prevent="togglePasswordVisibility"
            >
              <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400" />
              <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
            </div>
            <div class="input-background"></div>
            <div class="input-shadow"></div>
            <p v-if="passwordError" class="text-red-500 text-sm mt-1 px-1">
              {{ passwordError }}
            </p>
          </div>

          <!-- Password Requirements -->
          <div class="text-sm text-gray-500 space-y-1 px-1 text-right">
            <p>Password must contain:</p>
            <ul class="space-y-1">
              <li class="flex items-center gap-2 justify-end">
                <div
                  class="w-1.5 h-1.5 rounded-full"
                  :class="hasMinLength ? 'bg-red-500' : 'bg-gray-300'"
                ></div>
                At least 6 characters
              </li>
              <!-- <li class="flex items-center gap-2 justify-end">
                <div
                  class="w-1.5 h-1.5 rounded-full"
                  :class="isLowercase ? 'bg-red-500' : 'bg-gray-300'"
                ></div>
                password must be in lower caps
              </li> -->
            </ul>
          </div>

          <!-- Back and Submit Buttons -->
          <div class="flex space-x-4">
            <button
              type="button"
              @click.prevent="currentStep = 1"
              class="w-1/2 border shadow-sm text-gray-700 py-4 rounded-lg hover:bg-gray-300 transition-colors font-medium text-md mt-8"
            >
              Back
            </button>
            <button
              type="submit"
              class="w-1/2 bg-red-600 text-white py-4 rounded-lg transition-colors font-medium text-md mt-8 flex justify-center items-center"
              :disabled="!isFormValid || loading"
              :class="{
                'opacity-50 cursor-not-allowed': !isFormValid || loading,
              }"
            >
              <Spinner v-if="loading" class="mr-2" />
              <span v-else>Reset</span>
            </button>
          </div>
        </template>
      </form>

      <div class="text-center pt-6">
        <span class="text-login"
          >Have an account?
          <router-link to="/login" class="text-red-600 font-medium"
            >Login</router-link
          >
        </span>
      </div>

      <!-- Modals -->
      <SuccessModal
        :show-success-modal="showSuccessModal"
        :message="successMessage"
        :duration="duration"
        @close="handleModalClose"
        @continue="handleContinue"
      />
      <ErrorModal
        :show-error-modal="showErrorModal"
        :err-message="errorMessage"
        :duration="duration"
        @close="handleModalClose"
        @continue="handleContinue"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import Spinner from "../components/modal/SpinnerComp.vue";
import ErrorModal from "../components/modal/ErrorModal.vue";
import SuccessModal from "../components/modal/SuccessModal.vue";
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
} from "@heroicons/vue/24/outline";
import { useHttp } from "../composables/useHttp";
import { useRouter } from "vue-router";

// Router and HTTP setup
const router = useRouter();
const { httpRequest } = useHttp();

// Loading and verification states
const loading = ref(false);
const verifyingEmail = ref(false);
const accountRefEnabled = ref(false);

// const isLowercase = computed(() => {
//   const password = formData.value.password;
//   return password === password.toLowerCase();
// });

// Modal states
const showSuccessModal = ref(false);
const showErrorModal = ref(false);
const duration = ref(3000);

// Messages
const successMessage = ref(
  "Password reset successful! You can now login with your new password."
);
const errorMessage = ref("");

// Form state
const currentStep = ref(1);
const showPassword = ref(false);

// Form data
const formData = ref({
  account_reference: "",
  email: "",
  password: "",
});

// Error states
const passwordError = ref(null);
const accountrefError = ref(null);
const emailError = ref(null);
const mailResponse = ref(null);
const serverError = ref(null);

// Validations
const hasMinLength = computed(() => formData.value.password.length >= 6);

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isFirstStepValid = computed(() => {
  return (
    formData.value.account_reference.length > 0 &&
    isValidEmail(formData.value.email) &&
    accountRefEnabled.value
  );
});

const isFormValid = computed(() => {
  return isFirstStepValid.value && hasMinLength.value;
});

const handlePasswordInput = (event) => {
  // Convert input to lowercase
  // formData.value.password = event.target.value.toLowerCase();
  // Clear password error if it exists
  if (passwordError.value) {
    passwordError.value = null;
  }
};

// Email verification on blur
const handleEmailBlur = async () => {
  if (isValidEmail(formData.value.email)) {
    verifyingEmail.value = true;
    emailError.value = null;

    try {
      const response = await httpRequest("POST", "/auth/verify", {
        email: formData.value.email,
      });

      if (response.data.error || response.status === 500) {
        emailError.value = response.data.error || "Failed to verify email";
        accountRefEnabled.value = false;
      } else {
        accountRefEnabled.value = true;
        mailResponse.value = "Account ref email has been sent !";
      }
    } catch (error) {
      emailError.value = "Failed to verify email";
      accountRefEnabled.value = false;
    } finally {
      verifyingEmail.value = false;
    }
  }
};

// Verification step
const proceedToNextStep = async () => {
  if (!isFirstStepValid.value) return;

  loading.value = true;
  try {
    const response = await httpRequest("POST", "/auth/verify-credentials", {
      email: formData.value.email,
      account_reference: formData.value.account_reference,
    });

    if (response.data.error || response.status === 500) {
      errorMessage.value = response.data.error || "Verification failed";
      showErrorModal.value = true;
    } else {
      currentStep.value = 2;
    }
  } catch (error) {
    errorMessage.value = "Failed to verify credentials";
    showErrorModal.value = true;
  } finally {
    loading.value = false;
  }
};

// Password visibility toggle
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

// Error clearing
const clearErrors = () => {
  emailError.value = null;
  accountrefError.value = null;
  passwordError.value = null;
  serverError.value = null;
};

// Form submission
const handleSubmit = async () => {
  if (!isFormValid.value) {
    return;
  }
  clearErrors();
  loading.value = true;

  try {
    const response = await httpRequest(
      "POST",
      "/auth/reset-password",
      formData.value
    );

    if (response.data.error || response.status === 500) {
      if (response.data.error) {
        errorMessage.value = response.data.error;
        showErrorModal.value = true;
      }
      if (response.data.messages) {
        const errorMessages = response.data.messages;
        emailError.value = errorMessages.email?.[0];
        accountrefError.value = errorMessages.account_reference?.[0];
        passwordError.value = errorMessages.password?.[0];
      }
    } else {
      showSuccessModal.value = true;
    }
  } catch (error) {
    handleGenericError();
  } finally {
    loading.value = false;
  }
};

const handleGenericError = () => {
  const genericError = "An unexpected error occurred.";
  emailError.value = genericError;
  accountrefError.value = genericError;
  passwordError.value = genericError;
};

// Modal handlers
const handleModalClose = () => {
  showSuccessModal.value = false;
  showErrorModal.value = false;
};

const handleContinue = () => {
  showSuccessModal.value = false;
  router.push("/login");
};
</script>

