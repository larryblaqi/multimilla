<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
        @click="closeModal"
      ></div>

      <!-- Modal panel -->
      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
      >
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                {{ title }}
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  {{ message }}
                </p>
              </div>

              <!-- OTP Input -->
              <div class="mt-6">
                <label class="block text-sm font-medium text-gray-700 mb-4">
                  Enter 6-digit verification code
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
                      @paste="handlePaste"
                      inputmode="numeric"
                      pattern="[0-9]*"
                      class="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                      :class="{ 'border-red-500': error }"
                    />
                  </template>
                </div>
                <p v-if="error" class="text-red-500 text-sm mt-2 text-center">
                  {{ error }}
                </p>
                <p v-if="resendMessage" class="text-blue-600 text-sm mt-2 text-center">
                  {{ resendMessage }}
                </p>
              </div>

              <!-- Resend OTP -->
              <div class="mt-4 text-center">
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
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            @click="verifyOtp"
            :disabled="isVerifying || !isOtpComplete"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Spinner v-if="isVerifying" class="mr-2" />
            {{ isVerifying ? 'Verifying...' : 'Verify' }}
          </button>
          <button
            @click="closeModal"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import Spinner from './SpinnerComp.vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Verify Your Identity'
  },
  message: {
    type: String,
    default: 'We\'ve sent a verification code to your registered contact method.'
  }
});

const emit = defineEmits(['close', 'verify', 'resend']);

const otpInputs = ref(Array(6).fill(''));
const error = ref('');
const isVerifying = ref(false);
const isResending = ref(false);
const resendCooldown = ref(0);
const resendMessage = ref('');

const isOtpComplete = computed(() => {
  return otpInputs.value.every(digit => digit !== '');
});

const handleOtpInput = (event, index) => {
  const value = event.target.value;
  
  // Only allow digits
  if (!/^\d$/.test(value)) {
    event.target.value = '';
    otpInputs.value[index] = '';
    return;
  }

  otpInputs.value[index] = value;
  error.value = '';

  // Auto-focus next input
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

const handlePaste = (event) => {
  event.preventDefault();
  const pastedData = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
  
  if (pastedData.length === 6) {
    otpInputs.value = pastedData.split('');
    const lastInput = event.target.parentElement.querySelector(`input[data-otp-index="5"]`);
    if (lastInput) {
      lastInput.focus();
    }
  }
};

const verifyOtp = async () => {
  if (!isOtpComplete.value) {
    error.value = 'Please enter the complete verification code';
    return;
  }

  isVerifying.value = true;
  error.value = '';

  try {
    const otpCode = otpInputs.value.join('');
    emit('verify', otpCode);
  } catch (err) {
    error.value = 'Verification failed. Please try again.';
  } finally {
    isVerifying.value = false;
  }
};

const resendOtp = async () => {
  isResending.value = true;
  resendMessage.value = '';
  
  try {
    emit('resend');
    startResendCooldown();
  } catch (err) {
    resendMessage.value = 'Failed to resend code. Please try again.';
  } finally {
    isResending.value = false;
  }
};

const startResendCooldown = () => {
  resendCooldown.value = 60;
  resendMessage.value = 'Verification code sent successfully!';
  
  const interval = setInterval(() => {
    resendCooldown.value--;
    if (resendCooldown.value <= 0) {
      clearInterval(interval);
      resendMessage.value = '';
    }
  }, 1000);
};

const closeModal = () => {
  // Reset form
  otpInputs.value = Array(6).fill('');
  error.value = '';
  resendMessage.value = '';
  resendCooldown.value = 0;
  emit('close');
};

// Auto-focus first input when modal opens
watch(() => props.show, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      const firstInput = document.querySelector('input[data-otp-index="0"]');
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
  }
});

// Cleanup on unmount
onUnmounted(() => {
  resendCooldown.value = 0;
});
</script>
