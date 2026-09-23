<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useCustomerStore } from "../store";
import { storeToRefs } from "pinia";

import DataHeader from "../components/data/DataHeader.vue";
import NetworkSelector from "../components/data/NetworkSelector.vue";
import RecommendedOffers from "../components/data/RecommendedOffers.vue";
import DataPlans from "../components/data/DataPlans.vue";
import Spinner from "../components/modal/SpinnerComp.vue";

import ErrorModal from "../components/modal/ErrorModal.vue";
import SuccessModal from "../components/modal/SuccessModal.vue";
import PinValidationModal from "../components/modal/PinValidationModal.vue";

import { useHttp } from "../composables/useHttp";
import { generateRequestId } from "../utils/globals";

const router = useRouter();
const customerStore = useCustomerStore();
const {
  customer,
  dataProviders,
  isLoadingProvider,
  dataPlans,
  isLoadingDataVariations,
} = storeToRefs(customerStore);
const { httpRequest } = useHttp();

const selectedNetwork = ref("");
const phoneNumber = ref("");
const selectedVariation = ref(null);
const phoneError = ref("");
const dataError = ref("");
const amountError = ref("");
const amount = ref(null);

const showSuccessModal = ref(false);
const showErrorModal = ref(false);
const showPinModal = ref(false);
const successMessage = ref("Data purchase successful");

const serverError = ref("");
const loadingRequest = ref(false);

const validateInputs = () => {
  phoneError.value = "";
  dataError.value = "";

  if (Number(amount.value) > Number(customer.value?.balance)) {
    amountError.value = "Insufficient balance for this transaction";
  }
  if (!phoneNumber.value.trim()) {
    phoneError.value = "Please enter a phone number";
  }

  if (!selectedVariation.value) {
    dataError.value = "Please select network";
  }
  return !phoneError.value && !dataError.value && !amountError.value;
};

const goBack = () => router.back();
const goToHistory = () => router.push("/transactions");

const handleSelectedVariation = (data) => {
  selectedVariation.value = data.variation_code;
  amount.value = data.variation_amount;
};

const processDataBuyRequest = async () => {
  if (validateInputs()) {
    showPinModal.value = true;
  }
};

const handlePinSuccess = async (pin) => {
  try {
    loadingRequest.value = true;
    showPinModal.value = false;

    const requestPayload = {
      variation_code: selectedVariation.value,
      request_id: generateRequestId(),
      billersCode: "",
      serviceID: selectedNetwork.value,
      phone: phoneNumber.value,
      amount: amount.value,
      pin: pin,
    };
    const response = await httpRequest(
      "POST",
      "/customer/buy-data",
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
      serverError.value = "Data Purchase Failed!";
      showErrorModal.value = true;
    } else {
      serverError.value = "Unexpected transaction status!";
      showErrorModal.value = true;
    }
  } catch (error) {
    console.log("error");
    serverError.value = "Data purchase failed. Please try again.";
    showErrorModal.value = true;
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

const clearDataError = () => {
  dataError.value = "";
};

const handleModalClose = () => {
  showSuccessModal.value = false;
  showErrorModal.value = false;
  showPinModal.value = false;
};

watch(selectedNetwork, async (newNetwork, oldNetwork) => {
  try {
    await customerStore.fetchDataPlans(newNetwork);
  } catch (error) {
    console.error("Failed to fetch data plans:", error);
  }
});

onMounted(async () => {
  await customerStore.fetchCustomer();
  await customerStore.fetchServiceDataIds();
});
</script>

<template>
  <div class="min-h-screen">
    <div class="sticky top-0 z-10">
      <DataHeader @back="goBack" @history="goToHistory" />
    </div>

    <main class="px-4 md:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      <!-- <div class="w-full text-left">
        <div
          v-if="amountError"
          class="mt-4 text-white py-3 px-4 rounded-lg bg-red-400 alert-text capitalize"
        >
          {{ amountError }}
        </div>
      </div> -->
      <NetworkSelector
        v-model="selectedNetwork"
        :serviceProviders="dataProviders"
        :loading="isLoadingProvider"
        v-model:phone="phoneNumber"
        :error="phoneError"
        @clear-error="clearPhoneError"
      />
      <DataPlans
        :dataPlans="dataPlans"
        :selectedNetwork="selectedNetwork"
        :loading="isLoadingDataVariations"
        @selectVariationCode="handleSelectedVariation"
        :error="dataError"
        @clear-error="clearDataError"
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
      <!-- Proceed Button -->
      <div class="sticky bottom-0 shadow-top">
        <button
          @click.prevent="processDataBuyRequest"
          class="w-full bg-red-400 text-white rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex justify-center items-center"
          :class="{ 'opacity-50 cursor-not-allowed': !selectedNetwork }"
          :disabled="!selectedNetwork"
        >
          <Spinner v-if="loadingRequest" class="mr-2" />
          <span v-else>Buy Data</span>
        </button>
      </div>
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
