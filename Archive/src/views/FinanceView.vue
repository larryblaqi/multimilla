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
import investmentDetailsComponent from "../components/finance/investmentDetailsComponent.vue";

import ErrorModal from "../components/modal/ErrorModal.vue";
import SuccessModal from "../components/modal/SuccessModal.vue";
import CustomModal from "../components/modal/CustomModal.vue";

import { useHttp } from "../composables/useHttp";
import { generateRequestId } from "../utils/globals";

const router = useRouter();
const customerStore = useCustomerStore();
const {
  customer,
  investments,
  activities,
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
const investmentDetails = ref(null);
const error = ref(null);

const showSuccessModal = ref(false);
const showCustomModal = ref(false);
const showErrorModal = ref(false);
const showInvestmentDetailModal = ref(false);

const successMessage = ref("Contribution request is successful");

const serverError = ref("");
const verificationError = ref("");
const loadingRequest = ref(false);
const isInvestmentLoading = ref(false);
const isFetchingVariationsLoading = ref(false);
const isInvestmentDetailsLoading = ref(false);
const selectedCompany = ref(null);
const amountError = ref(null);
const amntErrors = ref(true);

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
  const customerBalance = Number(customer.value?.balance ?? customer.value?.wallet_balance ?? 0);
  const parseAmountInteger = Number(amount.value);
  const parseMinInvInteger = Number(selectedMinInvestment.value);

  if (!parseAmountInteger || parseAmountInteger <= 0) {
    error.value = "Please enter a valid amount";
    return false;
  }

  if (parseAmountInteger > customerBalance) {
    error.value = "Insufficient balance for this contribution";
    return false;
  }

  if (parseAmountInteger > parseMinInvInteger) {
    error.value = `Amount cannot exceed ₦${parseMinInvInteger.toLocaleString()} for this plan`;
    return false;
  }

  if (parseAmountInteger < parseMinInvInteger) {
    error.value = `Minimum contribution is ₦${parseMinInvInteger.toLocaleString()}`;
    return false;
  }

  error.value = null;
  return true;
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
  console.log(selectedCompany.value.board_id);
  selectedMinInvestment.value = company?.minimum_investment;
  showCustomModal.value = true;
};

const handleSelectInvestmentView = async (item) => {
  await getBoardDetails(item.package_name);
  showInvestmentDetailModal.value = true;
};

const handleBlurEventAmountInput = (amt) => {
  const customerBalance = Number(customer.value?.balance ?? customer.value?.wallet_balance ?? 0);
  const parseAmountInteger = Number(amt);
  const parseMinInvInteger = Number(selectedMinInvestment.value);

  if (!parseAmountInteger || parseAmountInteger <= 0) {
    amountError.value = "Please enter a valid amount";
    amntErrors.value = false;
  } else if (parseAmountInteger > customerBalance) {
    amountError.value = "Insufficient balance";
    amntErrors.value = false;
  } else if (parseAmountInteger > parseMinInvInteger) {
    amountError.value = `Max contribution is ₦${parseMinInvInteger.toLocaleString()}`;
    amntErrors.value = false;
  } else if (parseAmountInteger < parseMinInvInteger) {
    amountError.value = `Min contribution is ₦${parseMinInvInteger.toLocaleString()}`;
    amntErrors.value = false;
  } else {
    amountError.value = "";
    amntErrors.value = true;
  }
};

const handleModalClose = () => {
  showSuccessModal.value = false;
  showErrorModal.value = false;
};

const handleCloseCustomModal = () => {
  showCustomModal.value = false;
  showInvestmentDetailModal.value = false;
};

const handleInvestmentRequest = async () => {
  try {
    if (isValidAmount()) {
      isInvestmentLoading.value = true;
      const requestPayload = {
        package_name: selectedCompany.value?.package_name,
        board_id: selectedCompany.value?.board_id,
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
        await customerStore.fetchCustomer();
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

const getBoardDetails = async (pkgName) => {
  try {
    isInvestmentDetailsLoading.value = true;
    const response = await httpRequest(
      "GET",
      `/customer/getBoardDetails/${pkgName}`
    );
    if (response.data) {
      investmentDetails.value = response.data.data;
      isInvestmentDetailsLoading.value = false;
      console.log(response.data.data);
    }
  } catch (error) {
    isInvestmentDetailsLoading.value = false;
    console.log(error);
  } finally {
    isInvestmentDetailsLoading.value = false;
  }
};

onMounted(async () => {
  await customerStore.fetchCustomer();
});
</script>

<template>
  <div class="min-h-screen">
    <div class="sticky top-0 z-10">
      <TvHeader @back="goBack" @history="goToHistory" />
    </div>

    <main class="px-4 md:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      <div
        v-if="isInvestmentDetailsLoading"
        class="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex justify-center items-center"
      >
        <Spinner />
      </div>
      <!-- <TvBanner /> -->
      <VariationSelector
        :companies="packages"
        :investments="investments"
        :activities="activities"
        :isLoadingPlans="isLoadingCustomerData"
        @selectCompany="handleCompanySelection"
        @emitSelectInvestmentView="handleSelectInvestmentView"
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
          :error="error"
          :amntError="amountError"
          :amntErrors="amntErrors"
          :isValidAmount="isValidAmount"
          :minInvestmentAmount="selectedMinInvestment"
          @emitInvestmentRequest="handleInvestmentRequest"
          @emitBlurEventAmountInput="handleBlurEventAmountInput"
        />
      </CustomModal>
      <CustomModal
        :show-modal="showInvestmentDetailModal"
        @close="handleCloseCustomModal"
      >
        <investmentDetailsComponent
          :investmentDetailsProp="investmentDetails"
          :isLoading="isInvestmentDetailsLoading"
        />
      </CustomModal>
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
