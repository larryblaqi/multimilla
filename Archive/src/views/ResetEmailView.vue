<template>
  <div class="min-h-screen bg-gray-50">
    <div class="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div class="flex items-center justify-between p-4">
        <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-full">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-lg font-semibold text-gray-900">Reset Email</h1>
        <div class="w-10"></div>
      </div>
    </div>

    <main class="p-4 max-w-md mx-auto">
      <div class="space-y-6 mt-5">
        <!-- Step 1: Enter New Email -->
        <div v-if="step === 1" class="bg-white rounded-xl shadow-sm p-6">
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Enter New Email Address</h2>
            <p class="text-gray-600">
              Enter your new email address. We'll send a verification code to confirm the change.
            </p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                New Email Address
              </label>
              <input
                v-model="newEmail"
                type="email"
                placeholder="example@email.com"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-500': errors.email }"
              />
              <p v-if="errors.email" class="text-red-500 text-sm mt-1">
                {{ errors.email }}
              </p>
            </div>

            <button
              @click="sendOtp"
              :disabled="isLoading || !isValidEmail"
              class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div class="flex items-center justify-center">
                <Spinner v-if="isLoading" class="mr-2" />
                <span v-if="isLoading">Sending Code...</span>
                <span v-else>Send Verification Code</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Step 2: Verify OTP -->
        <div v-if="step === 2" class="bg-white rounded-xl shadow-sm p-6">
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Verify Email Address</h2>
            <p class="text-gray-600">
              We've sent a 6-digit verification code to <strong>{{ newEmail }}</strong>
            </p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-4">
                Enter Verification Code
              </label>
              <div class="flex justify-center gap-3">
                <template v-for="(_, index) in 6" :key="index">
                  <input
                    type="text"
                    :data-otp-index="index"
                    v-model="otpInputs[index]"
                    maxlength="1"
                    @input="(e) => handleOtpInput(e, index)"
                    @keydown="(e) => handleBackspace(e, index)"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    class="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                    :class="{ 'border-red-500': errors.otp }"
                  />
                </template>
              </div>
              <p v-if="errors.otp" class="text-red-500 text-sm mt-2 text-center">
                {{ errors.otp }}
              </p>
            </div>

            <div class="text-center">
              <button
                @click="resendOtp"
                :disabled="isResending || resendCooldown > 0"
                class="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <span v-if="resendCooldown > 0">
                  Resend code in {{ resendCooldown }}s
                </span>
                <span v-else-if="isResending">
                  Sending...
                </span>
                <span v-else>
                  Resend verification code
                </span>
              </button>
            </div>

            <button
              @click="verifyOtp"
              :disabled="isVerifying || !isOtpComplete"
              class="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div class="flex items-center justify-center">
                <Spinner v-if="isVerifying" class="mr-2" />
                <span v-if="isVerifying">Verifying...</span>
                <span v-else>Verify & Update Email</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Step 3: Success -->
        <div v-if="step === 3" class="bg-white rounded-xl shadow-sm p-6">
          <div class="text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Email Address Updated!</h2>
            <p class="text-gray-600 mb-6">
              Your email address has been successfully updated to <strong>{{ newEmail }}</strong>
            </p>
            <button 
              @click="goBack"
              class="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Error Modal -->
    <ErrorModal
      :show-error-modal="showErrorModal"
      :errMessage="errorMessage"
      @close="handleErrorClose"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useHttp } from '../composables/useHttp';
import Spinner from '../components/modal/SpinnerComp.vue';
import ErrorModal from '../components/modal/ErrorModal.vue';

const router = useRouter();
const { httpRequest } = useHttp();

const step = ref(1);
const isLoading = ref(false);
const isVerifying = ref(false);
const isResending = ref(false);
const resendCooldown = ref(0);
const showErrorModal = ref(false);
const errorMessage = ref('');

const newEmail = ref('');
const otpInputs = ref(Array(6).fill(''));

const errors = ref({
  email: '',
  otp: ''
});

const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(newEmail.value);
});

const isOtpComplete = computed(() => {
  return otpInputs.value.every(digit => digit !== '');
});

const handleOtpInput = (event, index) => {
  const value = event.target.value;
  
  if (!/^\d$/.test(value)) {
    event.target.value = '';
    otpInputs.value[index] = '';
    return;
  }

  otpInputs.value[index] = value;
  errors.value.otp = '';

  if (value && index < 5) {
    const nextIndex = index + 1;
    const nextInput = event.target.parentElement.querySelector(`input[data-otp-index="${nextIndex}"]`);
    if (nextInput) {
      nextInput.focus();
    }
  }
};

const handleBackspace = (event, index) => {
  if (event.key === 'Backspace' && !otpInputs.value[index] && index > 0) {
    const prevIndex = index - 1;
    const prevInput = event.target.parentElement.querySelector(`input[data-otp-index="${prevIndex}"]`);
    if (prevInput) {
      prevInput.focus();
    }
  }
};

const sendOtp = async () => {
  if (!isValidEmail.value) {
    errors.value.email = 'Please enter a valid email address';
    return;
  }

  try {
    isLoading.value = true;
    errors.value.email = '';

    const response = await httpRequest('POST', '/customer/send-email-otp', {
      email: newEmail.value
    });

    if (response.data.success) {
      step.value = 2;
      startResendCooldown();
    } else {
      errorMessage.value = response.data.message || 'Failed to send verification code';
      showErrorModal.value = true;
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Failed to send verification code';
    showErrorModal.value = true;
  } finally {
    isLoading.value = false;
  }
};

const verifyOtp = async () => {
  if (!isOtpComplete.value) {
    errors.value.otp = 'Please enter the complete verification code';
    return;
  }

  try {
    isVerifying.value = true;
    errors.value.otp = '';

    const response = await httpRequest('POST', '/customer/verify-email-otp', {
      email: newEmail.value,
      otp_code: otpInputs.value.join('')
    });

    if (response.data.success) {
      step.value = 3;
    } else {
      errors.value.otp = response.data.message || 'Invalid verification code';
    }
  } catch (error) {
    errors.value.otp = error.response?.data?.message || 'Verification failed';
  } finally {
    isVerifying.value = false;
  }
};

const resendOtp = async () => {
  try {
    isResending.value = true;
    const response = await httpRequest('POST', '/customer/resend-email-otp', {
      email: newEmail.value
    });

    if (response.data.success) {
      startResendCooldown();
    } else {
      errorMessage.value = response.data.message || 'Failed to resend code';
      showErrorModal.value = true;
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Failed to resend code';
    showErrorModal.value = true;
  } finally {
    isResending.value = false;
  }
};

const startResendCooldown = () => {
  resendCooldown.value = 60;
  const interval = setInterval(() => {
    resendCooldown.value--;
    if (resendCooldown.value <= 0) {
      clearInterval(interval);
    }
  }, 1000);
};

const goBack = () => {
  router.back();
};

const handleErrorClose = () => {
  showErrorModal.value = false;
};

// Cleanup on unmount
onUnmounted(() => {
  resendCooldown.value = 0;
});
</script>
