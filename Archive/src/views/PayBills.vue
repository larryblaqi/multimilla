<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useCustomerStore } from "../store";
import { storeToRefs } from "pinia";

import TvHeader from "../components/finance/FinanceHeader.vue";
import VariationSelector from "../components/finance/PackageSelector.vue";
import TvPlans from "../components/finance/TvPlans.vue";
import Spinner from "../components/modal/SpinnerComp.vue";
import TvBanner from "../components/finance/TvBanner.vue";
import SmartCard from "../components/finance/SmartCard.vue";
import PlanDetails from "../components/finance/PlanDetails.vue";
import ErrorModal from "../components/modal/ErrorModal.vue";
import SuccessModal from "../components/modal/SuccessModal.vue";
import CustomModal from "../components/modal/CustomModal.vue";

import { useHttp } from "../composables/useHttp";
import { generateRequestId } from "../utils/globals";

const router = useRouter();
const customerStore = useCustomerStore();
const {
  customer,
  tvVariations,
  isLoadingProvider,
  dataPlans,
  packages,
  isLoadingCustomerData,
} = storeToRefs(customerStore);
const { httpRequest } = useHttp();

const selectedTvType = ref("");
const amount = ref("");
const selectedMinInvestment = ref("");

const selectedVariation = ref(null);
const selectedVariationName = ref(null);
const selectedVariationAmount = ref(null);

const isCardValid = ref(false);
const tvError = ref("");
const packageError = ref("");
const isCardError = ref("");

const showSuccessModal = ref(false);
const showCustomModal = ref(false);
const showErrorModal = ref(false);
const successMessage = ref("Investment request is successful");

const serverError = ref("");
const verificationError = ref("");
const loadingRequest = ref(false);
const isInvestmentLoading = ref(false);
const isFetchingVariationsLoading = ref(false);

const selectedCompany = ref(null);

const validateInputs = () => {
  packageError.value = "";
  isCardError.value = "";
  verificationError.value = "";

  if (!selectedVariation.value) {
    packageError.value = "Please select a subscription package";
  }

  if (!isCardValid.value) {
    isCardError.value = "Please enter IUC card number";
  }
  return !packageError.value && !isCardError.value;
};

const isValidAmount = () => {
  const parseAmountInteger = Number(amount.value);
  const parseMinInvInteger = Number(selectedMinInvestment.value);
  return parseAmountInteger >= parseMinInvInteger;
};

const goBack = () => router.back();
const goToHistory = () => router.push("/transactions");

const clearCardError = () => {
  isCardError.value = "";
  verificationError.value = "";
};

const clearPackageError = () => {
  packageError.value = "";
};

const handleCompanySelection = (company) => {
  selectedCompany.value = company;
  selectedMinInvestment.value = company?.minimum_investment;
  showCustomModal.value = true;
};

const handleBlurEventAmountInput = () => {
  isInvestmentLoading.value = false;
};

const handleModalClose = () => {
  showSuccessModal.value = false;
  showErrorModal.value = false;
};

const handleCloseCustomModal = () => {
  showCustomModal.value = false;
};

const handleInvestmentRequest = async () => {
  try {
    if (isValidAmount()) {
      isInvestmentLoading.value = true;
      const requestPayload = {
        package_name: selectedCompany.value?.name,
        amount: amount.value,
        customer_id: customer.value.id,
        position: 1,
        level: 1,
        is_completed: false,
        request_id: generateRequestId(),
      };
      const response = await httpRequest(
        "POST",
        "/customer/investment-requests",
        requestPayload
      );
      if (response.status !== 200 || response.data?.error) {
        if (response.data?.message) {
          serverError.value = response.data.message;
          showCustomModal.value = false;
        } else {
          serverError.value = "Something went wrong!";
          showCustomModal.value = false;
        }
        showCustomModal.value = false;
        showErrorModal.value = true;
        return;
      } else {
        showCustomModal.value = false;
        showSuccessModal.value = true;
      }
    }
  } catch (error) {
    console.log("error");
  } finally {
    isInvestmentLoading.value = false;
  }
};

onMounted(async () => {
  await customerStore.fetchCustomer();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="lg:hidden">
      <TvHeader @back="goBack" @history="goToHistory" />
    </div>

    <main class="p-4 space-y-6 pb-24 max-w-2xl mx-auto">
      <!-- <TvBanner /> -->
      <VariationSelector
        :companies="packages"
        :isLoadingPlans="isLoadingCustomerData"
        @selectCompany="handleCompanySelection"
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
      <CustomModal
        :show-modal="showCustomModal"
        :message="successMessage"
        @close="handleCloseCustomModal"
      >
        <PlanDetails
          v-model="amount"
          :company="selectedCompany"
          :isLoading="isInvestmentLoading"
          :isValidAmount="isValidAmount"
          :minInvestmentAmount="selectedMinInvestment"
          @emitInvestmentRequest="handleInvestmentRequest"
          @emitBlurEventAmountInput="handleBlurEventAmountInput"
        />
      </CustomModal>
    </main>
  </div>
</template>

