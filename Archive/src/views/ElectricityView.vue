<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useCustomerStore } from "../store";
import { storeToRefs } from "pinia";

import ElectrictyHeader from "../components/eletricity/ElectrictyHeader.vue";
import VariationSelector from "../components/eletricity/VariationSelector.vue";
import TvPlans from "../components/eletricity/TvPlans.vue";
import Spinner from "../components/modal/SpinnerComp.vue";
import SmartCard from "../components/eletricity/SmartCard.vue";
import CustomAmount from "../components/eletricity/CustomAmount.vue";

import ErrorModal from "../components/modal/ErrorModal.vue";
import SuccessModal from "../components/modal/SuccessModal.vue";
import PinValidationModal from "../components/modal/PinValidationModal.vue";

import { useHttp } from "../composables/useHttp";
import { generateRequestId } from "../utils/globals";

const router = useRouter();
const customerStore = useCustomerStore();
const {
  customer,
  tvVariations,
  isLoadingProvider,
  dataPlans,
  isLoadingElectricity,
  electricity,
} = storeToRefs(customerStore);
const { httpRequest } = useHttp();

const selectedTvType = ref("");
const phoneNumber = ref("");
const cardNo = ref("");
const smartCardUserDetails = ref(null);
const amountError = ref("");
const minAmount = ref(null);
const maxAmount = ref(null);
const amount = ref(null);

const selectedVariation = ref(null);
const selectedVariationName = ref(null);
const selectedVariationAmount = ref(null);

const isCardValid = ref(false);
const tvError = ref("");
const packageError = ref("");
const isCardError = ref("");

const showSuccessModal = ref(false);
const showErrorModal = ref(false);
const showPinModal = ref(false);
const successMessage = ref("Successful");
const additionalInfo = ref(null);

const serverError = ref("");
const verificationError = ref("");
const loadingRequest = ref(false);
const isVerificationLoading = ref(false);
const isFetchingVariationsLoading = ref(false);

const tvPlans = [];

const validateInputs = () => {
  packageError.value = "";
  isCardError.value = "";
  verificationError.value = "";
  amountError.value = "";

  if (!isCardValid.value) {
    isCardError.value = "Please enter meter number";
  }
  return !isCardError.value && !amountError.value;
};

const goBack = () => router.back();
const goToHistory = () => router.push("/transactions");

const handleSelectedVariation = async (data) => {
  await customerStore.fetchTvVariations(data);
};

const handleSelectElectricityType = async (data) => {
  console.log(data);
  selectedTvType.value = data?.serviceID;
  isFetchingVariationsLoading.value = true;
  await customerStore.fetchTvVariations(data);
  isFetchingVariationsLoading.value = false;
};

const handlechangeSmartCardNo = async (no) => {
  cardNo.value = no;
  //   const serviceIdKeys = { dstv: 10, gotv: 10, startimes: 11, showmax: 10 };
  if (!cardNo.value) {
    isCardError.value = "Invalid meter number";
    smartCardUserDetails.value = null;
    isCardValid.value = false;
  } else {
    isCardError.value = "";
    isVerificationLoading.value = true;
    const smartCardVerificationPayLoad = {
      billersCode: cardNo.value,
      serviceID: selectedTvType.value,
    };
    const response = await httpRequest(
      "POST",
      "/customer/verify-card",
      smartCardVerificationPayLoad
    );
    if (response.status !== 200 || response.data?.error) {
      if (response.data?.message) {
        verificationError.value = response.data.message;
        isCardError.value = "Invalid smart card number";
        isCardValid.value = false;
      } else {
        serverError.value = "Something went wrong!";
        isCardValid.value = false;
      }
      isVerificationLoading.value = false;
      isCardValid.value = false;
      return;
    }
    if (Object.prototype.hasOwnProperty.call(response.data.content, "error")) {
      verificationError.value = response.data.content.error;
      isVerificationLoading.value = false;
      isCardError.value = "Card Error";
      smartCardUserDetails.value = null;
      isCardValid.value = false;
    } else {
      smartCardUserDetails.value = response.data.content;
      isCardValid.value = true;
      isVerificationLoading.value = false;
      isCardError.value = "";
    }
  }
};

const handleSelectedVariationCode = (data) => {
  selectedVariation.value = data.variation_code;
  selectedVariationName.value = data.name;
  selectedVariationAmount.value = data.variation_amount;
};

const clearCardError = () => {
  isCardError.value = "";
  verificationError.value = "";
};

const clearPackageError = () => {
  packageError.value = "";
};

const handlePinSuccess = async (pin) => {
  try {
    loadingRequest.value = true;
    showPinModal.value = false;

    const merchantPayload = {
      request_id: generateRequestId(),
      billersCode: cardNo.value,
      variation_code: "prepaid",
      serviceID: selectedTvType.value,
      phone: Number(customer.value?.phone),
      amount: parseFloat(amount.value),
      pin: pin,
    };

    await processPayment(merchantPayload);
  } catch (error) {
    console.error("electricity Subscription Error:", error);
    serverError.value = error.message || "Something went wrong!";
    showErrorModal.value = true;
  } finally {
    loadingRequest.value = false;
  }
};

const handlePinError = (error) => {
  serverError.value = "PIN validation failed. Please try again.";
  showErrorModal.value = true;
};

const handleModalClose = () => {
  showSuccessModal.value = false;
  showErrorModal.value = false;
  showPinModal.value = false;
};

const processTvRenewalRequest = async () => {
  if (validateInputs()) {
    showPinModal.value = true;
  }
};

const processPayment = async (payload) => {
  try {
    const response = await httpRequest(
      "POST",
      "/customer/buy-eletricity",
      payload
    );
    console.log(payload);
    if (response.status !== 200 || response.data?.error) {
      throw new Error(response.data?.message || "Something went wrong!");
    }

    const transactionStatus = response.data?.content?.transactions?.status;

    switch (transactionStatus) {
      case "delivered":
        showSuccessModal.value = true;
        additionalInfo.value = response.data?.token;
        break;
      case "failed":
        throw new Error("Subscription Failed!");
      default:
        throw new Error("Unexpected transaction status!");
    }
  } catch (error) {
    serverError.value = error.message;
    showErrorModal.value = true;
  }
};

onMounted(async () => {
  await customerStore.fetchCustomer();
});
</script>

<template>
  <div class="min-h-screen">
    <div class="sticky top-0 z-10">
      <ElectrictyHeader @back="goBack" @history="goToHistory" />
    </div>

    <main class="px-4 md:px-6 lg:px-8 max-w-3xl mx-auto space-y-6 p-4">
      <div class="w-full text-left">
        <div
          v-if="amountError"
          class="mt-4 text-white py-3 px-4 rounded-lg bg-red-400 alert-text capitalize"
        >
          {{ amountError }}
        </div>
      </div>
      <VariationSelector
        :plans="electricity"
        @selectElectricityType="handleSelectElectricityType"
      />
      <SmartCard
        v-model:cardNo="cardNo"
        :selectedTvProvider="selectedTvType"
        :error="isCardError"
        :verificationError="verificationError"
        :verificationDetails="smartCardUserDetails"
        :loading="isVerificationLoading"
        @clear-error="clearCardError"
        @changeSmartCardNo="handlechangeSmartCardNo"
      />

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
        :type="'eletricity'"
        :extraInfo="additionalInfo"
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
      <div class="bottom-0 shadow-top">
        <button
          @click.prevent="processTvRenewalRequest"
          class="w-full bg-red-400 text-white rounded-lg p-4 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex justify-center items-center"
          :class="{
            'opacity-50 cursor-not-allowed':
              !selectedTvType || !isCardValid || !amount,
          }"
          :disabled="!selectedTvType || !isCardValid || !amount"
        >
          <Spinner v-if="loadingRequest" class="mr-2" />
          <span v-else>Buy</span>
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
/*Mobile-first responsive design */
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
