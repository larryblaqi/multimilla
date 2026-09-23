<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-white p-4"
  >
    <!-- Logo -->
    <div>
      <img src="../assets/images/lg.png" alt="Bank Logo" class="h-15 w-20" />
    </div>

    <!-- Login Form -->
    <div class="w-full max-w-md space-y-6">
      <!-- Username Display -->
      <div class="text-center text-gray-700 text-md mb-8 font-bold">
        Welcome Back
      </div>

      <!-- Phone Number Input -->
      <div class="space-y-4">
        <div class="relative">
          <div
            class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
          >
            <div class="flex items-center">
              <PhoneIcon class="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <input
            type="tel"
            placeholder="Enter Phone Number"
            v-model="phoneNumber"
            @focus="handlePhoneInput"
            @blur="hideKeyboard"
            class="w-full px-4 py-4 pl-10 bg-gray-50 rounded-lg focus:outline-none focus:ring-0 text-gray-700 text-md placeholder:text-gray-400 shadow-sm input-field"
            :class="{
              'letter-spacing-wide': phoneNumber.length > 0,
            }"
          />
          <div class="absolute inset-0 rounded-xl bg-gray-100/50 -z-10"></div>
          <div
            class="absolute inset-0 rounded-xl shadow-inner-custom -z-10"
          ></div>
          <p v-if="phoneError" class="text-red-500 text-sm mt-1 px-1">
            {{ phoneError }}
          </p>
        </div>
      </div>

      <!-- Password Input -->
      <div class="space-y-4">
        <!-- Password Input -->
        <div class="relative">
          <div
            class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
          >
            <LockClosedIcon class="h-5 w-5 text-gray-400" />
          </div>
          <input
            :type="showPassword ? 'text' : 'password'"
            placeholder="Enter Password"
            v-model="password"
            @focus="handlePhoneInput"
            @blur="hideKeyboard"
            class="w-full px-4 py-4 pl-10 pr-10 bg-gray-50 rounded-lg focus:outline-none focus:ring-0 text-gray-700 text-md placeholder:text-gray-400 shadow-sm input-field"
          />
          <div
            class="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
            @click.prevent="togglePassword"
          >
            <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400" />
            <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
          </div>
          <div class="input-background"></div>
          <div class="input-shadow"></div>
        </div>

        <div class="text-right">
          <!-- <a href="#" class="text-red-600 text-sm font-medium"
            >Forgot Password?</a
          > -->
          <router-link to="/recover" class="text-red-600 text-sm font-medium"
            >Forgot Password?</router-link
          >
        </div>
      </div>

      <!-- Login Button -->
      <button
        @click.prevent="handleLogin"
        class="w-full bg-red-600 text-white py-4 rounded-lg transition-colors font-medium text-md mt-8 flex justify-center items-center"
      >
        <Spinner v-if="loading" class="mr-2" />
        <span v-else>login</span>
      </button>

      <!-- Switch Account Link -->
      <div class="text-center pt-6">
        <router-link to="/join" class="text-gray-600 font-medium"
          >Create new account</router-link
        >
      </div>
    </div>
    <ErrorModal
      :show-error-modal="showErrorModal"
      :duration="duration"
      :errMessage="errorMessage"
      @close="handleModalClose"
      @continue="handleContinue"
    />
  </div>
</template>

<script setup>
/*eslint-disable*/
import { ref, onMounted } from "vue";
import Spinner from "../components/modal/SpinnerComp.vue";
import ErrorModal from "../components/modal/ErrorModal.vue";
import { Keyboard } from "@capacitor/keyboard";
import { Capacitor } from "@capacitor/core";

import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  PhoneIcon,
} from "@heroicons/vue/24/outline";

import { useHttp } from "../composables/useHttp";
import { Preferences } from "@capacitor/preferences";
import { useRouter } from "vue-router";

const router = useRouter();
const { httpRequest } = useHttp();

const showErrorModal = ref(false);

const errorMessage = ref("");
const phoneNumber = ref("");
const password = ref("");
const phoneError = ref(null);
const passwordError = ref(null);
const loading = ref(false);

const showPassword = ref(false);
const duration = ref("3000"); // Add missing duration variable

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const handleLogin = async () => {
  loading.value = true;
  phoneError.value = null;
  passwordError.value = null;
  errorMessage.value = null;
  try {
    const payLoad = {
      phone: phoneNumber.value,
      password: password.value,
    };

    const response = await httpRequest("POST", "/auth/loginCus", payLoad);
    loading.value = false;

    if (response.data.errors) {
      const errorData = response.data.errors;
      if (errorData.phone) {
        phoneError.value = errorData.phone[0];
      }
      if (errorData.password) {
        passwordError.value = errorData.password[0];
      }
      return;
    }

    // Check for invalid credentials
    if (response.data.invalid) {
      errorMessage.value = response.data.invalid;
      showErrorModal.value = true;

      return;
    }
    
    // Check for device verification requirement
    if (response.data.requires_device_verification) {
      errorMessage.value = response.data.message || "New device detected. Please verify with the OTP sent to your email.";
      showErrorModal.value = true;
      // TODO: Implement an OTP input flow to complete login
      return;
    }

    // Store token first
    await Preferences.set({
      key: "token",
      value: response.data.token,
    });

    // Navigate directly based on PIN status
    if (response.data.isPinSet === true || response.data.isPinSet === 1 || response.data.isPinSet === "1") {
      router.push("/wallet");
    } else {
      router.push("/account-pin");
    }
  } catch (error) {
    loading.value = false;
    console.error("Login error:", error);
    
    // Check if it's a network error
    if (error.message && error.message.includes('fetch')) {
      errorMessage.value = "Unable to connect to server. Please check your internet connection and try again.";
      showErrorModal.value = true;
    } else {
      phoneError.value = "An unexpected error occurred.";
      passwordError.value = "An unexpected error occurred.";
    }
  }
};

const handleModalClose = () => {
  showErrorModal.value = false;
};

const handlePhoneInput = () => {
  phoneError.value = null;
  showKeyboard();
};

const handleContinue = () => {
  showErrorModal.value = false;
  router.push("/login"); // Fallback to login page
};

const showKeyboard = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      await Keyboard.show();
      console.log("Showing keyboard");
    } catch (error) {
      console.error("Error showing keyboard:", error);
    }
  }
};

const hideKeyboard = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      await Keyboard.hide();
      console.log("Hiding keyboard");
    } catch (error) {
      console.error("Error hiding keyboard:", error);
    }
  }
};

onMounted(async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      await Keyboard.hide();
      console.log("Keyboard hidden on mount");
    } catch (error) {
      console.error("Error hiding keyboard:", error);
    }
  }
});
</script>

<style scoped>
.shadow-inner-custom {
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.letter-spacing-wide {
  letter-spacing: 8px;
}

/* Custom autofill styling */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0 30px #fafafa inset !important;
  -webkit-text-fill-color: #374151 !important;
  caret-color: #374151 !important;
}

/* Hide password reveal button in Edge/IE */
input::-ms-reveal,
input::-ms-clear {
  display: none;
}

/* Custom placeholder styling */
::placeholder {
  font-weight: 400;
  opacity: 0.7;
}
</style>
