<script setup>
import { onMounted, ref } from "vue";
import { useCustomerStore } from "../store";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

import { useHttp } from "../composables/useHttp";

import AirtimeHeader from "../components/airtime/AirtimeHeader.vue";
import AirtimeBanner from "../components/airtime/AirtimeBanner.vue";
import NetworkSelector from "../components/airtime/NetworkSelector.vue";
import TopUpOptions from "../components/airtime/TopUpOptions.vue";
import CustomAmount from "../components/airtime/CustomAmount.vue";

import ErrorModal from "../components/modal/ErrorModal.vue";
import SuccessModal from "../components/modal/SuccessModal.vue";
import PinValidationModal from "../components/modal/PinValidationModal.vue";
import { generateRequestId } from "../utils/globals";

const router = useRouter();
const customerStore = useCustomerStore();
const { customer, providers, isLoadingProvider } = storeToRefs(customerStore);
const { httpRequest } = useHttp();

const selectedNetwork = ref("");
const phoneNumber = ref("");
const amount = ref("");
const phoneError = ref("");
const amountError = ref("");

const showSuccessModal = ref(false);
const showErrorModal = ref(false);
const showPinModal = ref(false);
const successMessage = ref("airtime purchase successful");

const serverError = ref("");

const loadingRequest = ref(false);

const validateInputs = () => {
  phoneError.value = "";
  amountError.value = "";
  if (!phoneNumber.value.trim()) {
    phoneError.value = "Please enter a phone number";
  }
  // Validate amount
  if (!amount.value.trim()) {
    amountError.value = "Please select or enter an amount";
  } else if (Number(amount.value) > Number(customer.value?.balance)) {
    amountError.value = "Insufficient balance for this transaction";
  }

  return !phoneError.value && !amountError.value;
};

const goBack = () => router.back();
const goToHistory = () => router.push("/transactions");

const processAirtimeBuyRequest = async () => {
  if (validateInputs()) {
    showPinModal.value = true;
  }
};

const handlePinSuccess = async (pin) => {
  try {
    loadingRequest.value = true;
    const requestPayload = {
      serviceID: selectedNetwork.value,
      request_id: generateRequestId(),
      phone: phoneNumber.value,
      amount: amount.value,
      pin: pin,
    };
    const response = await httpRequest(
      "POST",
      "/customer/buy-airtime",
      requestPayload
    );
    if (response.status !== 200 || response.data?.error) {
      if (response.data?.message) {
        serverError.value = response.data.message;
      } else {
        serverError.value = "Something went wrong!";
      }
      showErrorModal.value = true;
      return;
    }
    const transactionStatus = response.data?.content?.transactions?.status;
    if (transactionStatus === "delivered") {
      showSuccessModal.value = true;
    } else if (transactionStatus === "failed") {
      serverError.value = "Airtime Purchase Failed!";
      showErrorModal.value = true;
    } else {
      serverError.value = "Unexpected transaction status!";
      showErrorModal.value = true;
    }
  } catch (error) {
    console.log("error");
  } finally {
    loadingRequest.value = false;
  }
};

const handlePinError = (error) => {
  serverError.value = "PIN validation failed. Please try again.";
  showErrorModal.value = true;
};

const clearPhoneError = () => {
  phoneError.value = "";
};

const clearAmountError = () => {
  amountError.value = "";
};

const handleModalClose = () => {
  showSuccessModal.value = false;
  showErrorModal.value = false;
  showPinModal.value = false;
};

onMounted(async () => {
  await customerStore.fetchCustomer();
  await customerStore.fetchServiceAirtimeIds();
});
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="sticky top-0 z-10">
      <AirtimeHeader @back="goBack" @history="goToHistory" />
    </div>
    <main class="px-4 md:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      <NetworkSelector
        v-model="selectedNetwork"
        v-model:phone="phoneNumber"
        :serviceProviders="providers"
        :error="phoneError"
        :loading="isLoadingProvider"
        @clear-error="clearPhoneError"
      />

      <div class="w-full">
        <TopUpOptions v-model="amount" :error="amountError" />
      </div>

      <CustomAmount
        v-model="amount"
        :error="amountError"
        :isLoading="loadingRequest"
        :selectedNetworkProvider="selectedNetwork"
        @clear-amountError="clearAmountError"
        @handleAirtimeRequest="processAirtimeBuyRequest"
      />

      <SuccessModal
        :show-success-modal="showSuccessModal"
        :message="successMessage"
        :isRegistration="false"
        @close="handleModalClose"
      />
      <ErrorModal
        :show-error-modal="showErrorModal"
        :errMessage="serverError"
        @close="handleModalClose"
      />
      <PinValidationModal
        :show-modal="showPinModal"
        @close="handleModalClose"
        @success="handlePinSuccess"
        @error="handlePinError"
      />
    </main>
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

/* Touch device optimizations */
@media (hover: none) {
  .hover\:bg-gray-50:hover {
    background-color: transparent;
  }
}


/* Smooth animations */
.router-link-active {
  transform: translateX(2px);
  transition: transform 0.2s ease;
}
</style>
