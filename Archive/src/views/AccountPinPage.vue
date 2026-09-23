<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-white p-4"
  >
    <!-- Logo -->
    <div>
      <img src="../assets/images/lg.png" alt="Bank Logo" class="h-15 w-20" />
    </div>

    <!-- PIN Creation Form -->
    <div class="w-full max-w-md space-y-6">
      <div class="text-center">
        <h4 class="text-gray-700 text-md mb-3 font-bold">Create PIN</h4>
        <p class="text-gray-500">
          create a safe pin to authenticate withdrawals
        </p>
      </div>

      <!-- PIN Input -->
      <div class="space-y-4">
        <div class="relative">
          <div
            class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
          >
            <LockClosedIcon class="h-5 w-5 text-gray-400" />
          </div>
          <input
            :type="showPin ? 'text' : 'password'"
            placeholder="Enter 4-digit PIN"
            v-model="pin"
            maxlength="4"
            @focus="handlePinInput"
            @blur="hideKeyboard"
            @input="validatePin"
            class="w-full px-4 py-4 pl-10 pr-10 bg-gray-50 rounded-lg focus:outline-none focus:ring-0 text-gray-700 text-md placeholder:text-gray-400 shadow-sm input-field letter-spacing-wide"
          />
          <div
            class="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
            @click.prevent="togglePin"
          >
            <EyeIcon v-if="!showPin" class="h-5 w-5 text-gray-400" />
            <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
          </div>
        </div>

        <!-- Confirm PIN Input -->
        <div class="relative">
          <div
            class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
          >
            <LockClosedIcon class="h-5 w-5 text-gray-400" />
          </div>
          <input
            :type="showConfirmPin ? 'text' : 'password'"
            placeholder="Confirm PIN"
            v-model="confirmPin"
            maxlength="4"
            @focus="handlePinInput"
            @blur="hideKeyboard"
            @input="validatePin"
            class="w-full px-4 py-4 pl-10 pr-10 bg-gray-50 rounded-lg focus:outline-none focus:ring-0 text-gray-700 text-md placeholder:text-gray-400 shadow-sm input-field letter-spacing-wide"
          />
          <div
            class="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
            @click.prevent="toggleConfirmPin"
          >
            <EyeIcon v-if="!showConfirmPin" class="h-5 w-5 text-gray-400" />
            <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
          </div>
        </div>

        <p v-if="pinError" class="text-red-500 text-sm mt-1 px-1">
          {{ pinError }}
        </p>
      </div>

      <!-- Create PIN Button -->
      <button
        @click.prevent="handleCreatePin"
        class="w-full bg-red-600 text-white py-4 rounded-lg transition-colors font-medium text-md mt-8 flex justify-center items-center"
        :disabled="!isValidPin || loading"
      >
        <Spinner v-if="loading" class="mr-2" />
        <span v-else>Create PIN</span>
      </button>
    </div>

    <ErrorModal
      :show-error-modal="showErrorModal"
      :errMessage="errorMessage"
      @close="handleModalClose"
      @continue="handleContinue"
    />

    <SuccessModal
      :show-success-modal="showSuccessModal"
      :message="'PIN created successfully!'"
      @close="handleModalClose"
      @continue="handleContinue"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import Spinner from "../components/modal/SpinnerComp.vue";
import ErrorModal from "../components/modal/ErrorModal.vue";
import SuccessModal from "../components/modal/SuccessModal.vue";
import { Keyboard } from "@capacitor/keyboard";
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import { useRouter } from "vue-router";
import { useHttp } from "../composables/useHttp";
import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
} from "@heroicons/vue/24/outline";

const router = useRouter();
const { httpRequest } = useHttp();

const showSuccessModal = ref(false);
const showErrorModal = ref(false);
const errorMessage = ref("");
const pin = ref("");
const confirmPin = ref("");
const pinError = ref(null);
const loading = ref(false);
const showPin = ref(false);
const showConfirmPin = ref(false);

const isValidPin = computed(() => {
  return (
    pin.value.length === 4 &&
    confirmPin.value.length === 4 &&
    pin.value === confirmPin.value &&
    /^\d+$/.test(pin.value)
  );
});

const togglePin = () => {
  showPin.value = !showPin.value;
};

const toggleConfirmPin = () => {
  showConfirmPin.value = !showConfirmPin.value;
};

const validatePin = () => {
  pinError.value = null;

  if (pin.value && !/^\d+$/.test(pin.value)) {
    pinError.value = "PIN must contain only numbers";
    return;
  }

  if (confirmPin.value && pin.value !== confirmPin.value) {
    pinError.value = "PINs do not match";
    return;
  }
};

const handleCreatePin = async () => {
  if (!isValidPin.value) {
    pinError.value = "Please enter a valid 4-digit PIN and confirm it";
    return;
  }

  loading.value = true;
  pinError.value = null;
  errorMessage.value = null;

  try {
    // Send PIN to backend
    const response = await httpRequest("POST", "/customer/create-pin", {
      pin: pin.value,
    });

    if (response.data.error) {
      errorMessage.value = response.data.error;
      showErrorModal.value = true;
      loading.value = false;
      return;
    }

    // Store PIN locally
    await Preferences.set({
      key: "pin",
      value: pin.value,
    });

    showSuccessModal.value = true;
    loading.value = false;
    router.push("/wallet");
  } catch (error) {
    loading.value = false;
    pinError.value = "An unexpected error occurred.";
  }
};

const handleModalClose = () => {
  showErrorModal.value = false;
  showSuccessModal.value = false;
};

const handlePinInput = () => {
  pinError.value = null;
  showKeyboard();
};

const handleContinue = () => {
  if (showSuccessModal.value) {
    router.push("/wallet");
  }
  handleModalClose();
};

const showKeyboard = async () => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await Keyboard.show();
  } catch (error) {
    console.error("Error showing keyboard:", error);
  }
};

const hideKeyboard = async () => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await Keyboard.hide();
  } catch (error) {
    console.error("Error hiding keyboard:", error);
  }
};
</script>

<style scoped>
.letter-spacing-wide {
  letter-spacing: 8px;
}

input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0 30px #fafafa inset !important;
  -webkit-text-fill-color: #374151 !important;
  caret-color: #374151 !important;
}

input::-ms-reveal,
input::-ms-clear {
  display: none;
}

::placeholder {
  font-weight: 400;
  opacity: 0.7;
}
</style>
