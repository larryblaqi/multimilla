<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-white p-4"
  >
    <div>
      <img src="../assets/images/lg.png" alt="Bank Logo" class="h-15 w-20" />
    </div>

    <!-- Registration Form -->
    <div class="w-full max-w-md space-y-6">
      <div class="text-center text-gray-700 text-md mb-8">Create Account</div>

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

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Step 1: Basic Information -->
        <template v-if="currentStep === 1">
          <!-- First Name Input -->
          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
            >
              <UserIcon class="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="First Name"
              v-model="formData.first_name"
              class="w-full px-4 py-4 pl-10 bg-gray-50 rounded-lg focus:outline-none focus:ring-0 text-gray-700 text-md placeholder:text-gray-400 shadow-sm"
              :class="{ 'border-red-500 border': firstnameError }"
            />
            <div class="input-background"></div>
            <div class="input-shadow"></div>
            <p v-if="firstnameError" class="text-red-500 text-sm mt-1 px-1">
              {{ firstnameError }}
            </p>
          </div>

          <!-- Last Name Input -->
          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
            >
              <UserIcon class="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Last Name"
              v-model="formData.last_name"
              class="w-full px-4 py-4 pl-10 bg-gray-50 rounded-lg focus:outline-none focus:ring-0 text-gray-700 text-md placeholder:text-gray-400 shadow-sm"
              :class="{ 'border-red-500 border': lastnameError }"
            />
            <div class="input-background"></div>
            <div class="input-shadow"></div>
            <p v-if="lastnameError" class="text-red-500 text-sm mt-1 px-1">
              {{ lastnameError }}
            </p>
          </div>

          <!-- Phone Number Input -->
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
              placeholder="Phone Number"
              v-model="formData.phone"
              @focus="phoneError = null"
              class="w-full px-4 py-4 pl-10 bg-gray-50 rounded-lg focus:outline-none focus:ring-0 text-gray-700 text-md placeholder:text-gray-400 shadow-sm"
              :class="{ 'border-red-500 border': phoneError }"
            />
            <div class="input-background"></div>
            <div class="input-shadow"></div>
            <p v-if="phoneError" class="text-red-500 text-sm mt-1 px-1">
              {{ phoneError }}
            </p>
          </div>

          <!-- Confirm Phone Number Input -->
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
              placeholder="Confirm Phone Number"
              v-model="formData.confirmPhone"
              @focus="confirmPhoneError = null"
              class="w-full px-4 py-4 pl-10 bg-gray-50 rounded-lg focus:outline-none focus:ring-0 text-gray-700 text-md placeholder:text-gray-400 shadow-sm"
              :class="{ 'border-red-500 border': confirmPhoneError }"
            />
            <div class="input-background"></div>
            <div class="input-shadow"></div>
            <p v-if="confirmPhoneError" class="text-red-500 text-sm mt-1 px-1">
              {{ confirmPhoneError }}
            </p>
          </div>

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
              class="w-full px-4 py-4 pl-10 bg-gray-50 rounded-lg focus:outline-none focus:ring-0 text-gray-700 text-md placeholder:text-gray-400 shadow-sm"
              :class="{ 'border-red-500 border': emailError }"
            />
            <div class="input-background"></div>
            <div class="input-shadow"></div>
            <p v-if="emailError" class="text-red-500 text-sm mt-1 px-1">
              {{ emailError }}
            </p>
          </div>

          <!-- Confirm Email Input -->
          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
            >
              <EnvelopeIcon class="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              placeholder="Confirm Email Address"
              v-model="formData.email_confirmation"
              class="w-full px-4 py-4 pl-10 bg-gray-50 rounded-lg focus:outline-none focus:ring-0 text-gray-700 text-md placeholder:text-gray-400 shadow-sm"
              :class="{ 'border-red-500 border': confirmEmailError }"
            />
            <div class="input-background"></div>
            <div class="input-shadow"></div>
            <p v-if="confirmEmailError" class="text-red-500 text-sm mt-1 px-1">
              {{ confirmEmailError }}
            </p>
          </div>

          <!-- Password Input -->
          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
            >
              <LockClosedIcon class="h-5 w-5 text-gray-400" />
            </div>
            <input
              :type="showPassword ? 'text' : 'password'"
              placeholder="Create Password"
              v-model="formData.password"
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
            </ul>
          </div>

          <!-- Next Button for Step 1 -->
          <button
            type="button"
            @click.prevent="proceedToNextStep"
            class="w-full bg-red-600 text-white py-4 rounded-lg hover:bg-red-500 transition-colors font-medium text-md mt-8 flex justify-center items-center"
            :disabled="!isFirstStepValid"
            :class="{ 'opacity-50 cursor-not-allowed': !isFirstStepValid }"
          >
            Next
          </button>
        </template>

        <!-- Step 2: Additional Information -->
        <template v-if="currentStep === 2">
          <div class="text-center space-y-2 mb-4">
            <h2 class="font-bold text-xl text-gray-900">Identity Verification</h2>
            <p class="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
              According to CBN latest regulations, please select and provide either your BVN or NIN before using your MultiMilla account. We protect your information security.
            </p>
          </div>

          <!-- Selection Toggle between BVN and NIN -->
          <div class="bg-gray-100 p-1 rounded-xl flex space-x-1 mb-5">
            <button
              type="button"
              @click="selectVerificationMethod('bvn')"
              class="flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
              :class="verificationMethod === 'bvn' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'"
            >
              <DocumentIcon class="h-4 w-4" />
              <span>Verify with BVN</span>
            </button>
            <button
              type="button"
              @click="selectVerificationMethod('nin')"
              class="flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
              :class="verificationMethod === 'nin' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'"
            >
              <QrCodeIcon class="h-4 w-4" />
              <span>Verify with NIN</span>
            </button>
          </div>

          <!-- BVN Input -->
          <div v-if="verificationMethod === 'bvn'" class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
            >
              <DocumentIcon class="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              maxlength="11"
              placeholder="Enter 11-digit BVN"
              v-model="formData.bvn"
              @input="handleBvnInput"
              class="w-full px-4 py-4 pl-10 bg-gray-50 rounded-lg focus:outline-none focus:ring-0 text-gray-700 text-md placeholder:text-gray-400 shadow-sm"
              :class="{ 'border-red-500 border': bvnError }"
            />
            <div class="input-background"></div>
            <div class="input-shadow"></div>
            <p v-if="bvnError" class="text-red-500 text-sm mt-1 px-1">
              {{ bvnError }}
            </p>
          </div>

          <!-- Nin Input -->
          <div v-if="verificationMethod === 'nin'" class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
            >
              <QrCodeIcon class="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              maxlength="11"
              placeholder="Enter 11-digit NIN"
              v-model="formData.nin"
              @input="handleNinInput"
              class="w-full px-4 py-4 pl-10 bg-gray-50 rounded-lg focus:outline-none focus:ring-0 text-gray-700 text-md placeholder:text-gray-400 shadow-sm"
              :class="{ 'border-red-500 border': ninError }"
            />
            <div class="input-background"></div>
            <div class="input-shadow"></div>
            <p v-if="ninError" class="text-red-500 text-sm mt-1 px-1">
              {{ ninError }}
            </p>
          </div>

          <!-- Note about BVN/NIN requirement -->
          <div class="text-center text-xs text-gray-600 bg-red-50/60 p-3 rounded-lg border border-red-100">
            <p>💡 Provide your valid 11-digit {{ verificationMethod.toUpperCase() }} to complete registration.</p>
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
              <span v-else>Create Account</span>
            </button>
          </div>
          <div class="text-center mt-4 text-xs text-gray-500">
            By creating an account, you agree to our 
            <a href="https://multimilla.com/terms-of-use/" target="_blank" class="text-red-600 font-medium hover:underline">Terms of Use</a> 
            and 
            <a href="https://multimilla.com/privacy/" target="_blank" class="text-red-600 font-medium hover:underline">Privacy Policy</a>.
          </div>
        </template>
      </form>

      <div class="text-center pt-6">
        <span class="text-login"
          >Have an account ?
          <router-link to="/login" class="text-red-600 font-medium"
            >Login
          </router-link></span
        >
      </div>

      <!-- Success and Error Modals -->
      <SuccessModal
        :show-success-modal="showSuccessModal"
        :account-id="accountId"
        :message="successMessage"
        :duration="duration"
        :is-registration="true"
        @close="handleSuccessModalClose"
        @continue="handleSuccessModalClose"
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
/*eslint-disable*/
import { ref, computed, watch } from "vue";
import Spinner from "../components/modal/SpinnerComp.vue";
import ErrorModal from "../components/modal/ErrorModal.vue";
import SuccessModal from "../components/modal/SuccessModal.vue";
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  DocumentIcon,
  QrCodeIcon,
  PhoneIcon,
} from "@heroicons/vue/24/outline";
import { useHttp } from "../composables/useHttp";
import { Preferences } from "@capacitor/preferences";
import { useRouter } from "vue-router";

const loading = ref(false);
const router = useRouter();
const { httpRequest } = useHttp();

const showSuccessModal = ref(false);
const showErrorModal = ref(false);
const showModal = ref(false);
const successMessage = ref(
  "Your account has been successfully created click the button below to continue"
);
const errorMessage = ref("");

const currentStep = ref(1);

const formData = ref({
  first_name: "",
  last_name: "",
  phone: "",
  confirmPhone: "", // Add new field
  email: "",
  email_confirmation: "",
  password: "",
  bvn: "",
  nin: "",
});

const tempSelectedDate = ref(null);

// errors
const passwordError = ref(null);
const firstnameError = ref(null);
const lastnameError = ref(null);
const phoneError = ref(null);
const emailError = ref(null);
const bvnError = ref(null);
const ninError = ref(null);
const confirmPhoneError = ref(null);
const confirmEmailError = ref(null);

// server Error
const serverError = ref(null);
const showPassword = ref(false);

// Password validation computed properties
const hasMinLength = computed(() => formData.value.password.length >= 6);

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{11}$/;
  return phoneRegex.test(phone);
};

const isPhoneMatching = computed(() => {
  return formData.value.phone === formData.value.confirmPhone;
});

const isEmailMatching = computed(() => {
  return formData.value.email === formData.value.email_confirmation;
});

const isFirstStepValid = computed(() => {
  return (
    formData.value.first_name.length > 0 &&
    formData.value.last_name.length > 0 &&
    isValidEmail(formData.value.email) &&
    isValidEmail(formData.value.email_confirmation) &&
    formData.value.phone.length == 11 &&
    formData.value.confirmPhone.length == 11 &&
    isPhoneMatching.value &&
    isEmailMatching.value &&
    hasMinLength.value
  );
});

const verificationMethod = ref("bvn"); // 'bvn' or 'nin'

const selectVerificationMethod = (method) => {
  verificationMethod.value = method;
  bvnError.value = null;
  ninError.value = null;
  if (method === 'bvn') {
    formData.value.nin = "";
  } else {
    formData.value.bvn = "";
  }
};

const handleBvnInput = () => {
  bvnError.value = null;
  formData.value.bvn = (formData.value.bvn || "").replace(/\D/g, "").slice(0, 11);
};

const handleNinInput = () => {
  ninError.value = null;
  formData.value.nin = (formData.value.nin || "").replace(/\D/g, "").slice(0, 11);
};

const isFormValid = computed(() => {
  if (!isFirstStepValid.value) return false;
  if (verificationMethod.value === "bvn") {
    return formData.value.bvn && formData.value.bvn.length === 11;
  } else {
    return formData.value.nin && formData.value.nin.length === 11;
  }
});

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const proceedToNextStep = () => {
  if (isFirstStepValid.value) {
    console.log(formData.value.password);

    currentStep.value = 2;
  }
};

// Handle date selection
const handleDateSelect = (date) => {
  tempSelectedDate.value = date;
};

const clearErrors = () => {
  emailError.value = null;
  confirmEmailError.value = null;
  firstnameError.value = null;
  lastnameError.value = null;
  passwordError.value = null;
  bvnError.value = null;
  ninError.value = null;
  phoneError.value = null;
  confirmPhoneError.value = null;
};

const handlePasswordInput = (event) => {
  // Clear password error if it exists
  if (passwordError.value) {
    passwordError.value = null;
  }
};

const handleSubmit = async () => {
  if (isFormValid.value) {
    clearErrors();
    loading.value = true;

    try {
      const payload = {
        first_name: formData.value.first_name,
        last_name: formData.value.last_name,
        phone: formData.value.phone,
        confirmPhone: formData.value.confirmPhone,
        email: formData.value.email,
        email_confirmation: formData.value.email_confirmation,
        password: formData.value.password,
        verification_type: verificationMethod.value,
        bvn: verificationMethod.value === 'bvn' ? formData.value.bvn : null,
        nin: verificationMethod.value === 'nin' ? formData.value.nin : null,
      };

      const response = await httpRequest(
        "POST",
        "/auth/registerCus",
        payload
      );
      if (response.data.error || response.status == 500) {
        if (response.data.error) {
          errorMessage.value = response.data.error;
          showErrorModal.value = true;
        }
        if (response.data.messages) {
          const errorMessages = response.data.messages;
          if (errorMessages.phone) {
            phoneError.value = errorMessages.phone[0];
          }
          if (errorMessages.email) {
            emailError.value = errorMessages.email[0];
          }
          if (errorMessages.email_confirmation) {
            confirmEmailError.value = errorMessages.email_confirmation[0];
          }
          if (errorMessages.first_name) {
            firstnameError.value = errorMessages.first_name[0];
          }
          if (errorMessages.last_name) {
            lastnameError.value = errorMessages.last_name[0];
          }
          if (errorMessages.password) {
            passwordError.value = errorMessages.password[0];
          }
          if (errorMessages.bvn) {
            bvnError.value = errorMessages.bvn[0];
          }
          if (errorMessages.nin) {
            ninError.value = errorMessages.nin[0];
          }
          return;
        } else if (!response.data.error) {
          serverError.value = "Something went wrong !";
          showErrorModal.value = true;
        }
      } else {
        showSuccessModal.value = true;
      }
    } catch (error) {
      const genericError = error.response?.data?.error || error.response?.data?.message || "An unexpected error occurred.";
      errorMessage.value = genericError;
      showErrorModal.value = true;
    } finally {
      loading.value = false;
    }
  }
};

const handleSuccessModalClose = () => {
  showSuccessModal.value = false;
  router.push("/login");
};

const handleModalClose = () => {
  if (showSuccessModal.value) {
    handleSuccessModalClose();
    return;
  }
  showErrorModal.value = false;
  showModal.value = false;
};

const handleContinue = () => {
  showSuccessModal.value = false;
  router.push("/login");
};

const confirmDateOfBirth = () => {
  if (tempSelectedDate.value) {
    const date = tempSelectedDate.value;
    const formattedDate = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    formData.value.date_of_birth = formattedDate;
    showModal.value = false;
  }
};

const openDateOfBirthModal = () => {
  showModal.value = true;
};

watch([() => formData.value.phone, () => formData.value.confirmPhone], () => {
  if (formData.value.confirmPhone && !isPhoneMatching.value) {
    confirmPhoneError.value = "Phone numbers do not match";
  } else {
    confirmPhoneError.value = null;
  }
});

watch([() => formData.value.email, () => formData.value.email_confirmation], () => {
  if (formData.value.email_confirmation && !isEmailMatching.value) {
    confirmEmailError.value = "Emails do not match";
  } else {
    confirmEmailError.value = null;
  }
});
</script>
