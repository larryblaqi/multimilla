<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useHttp } from "../composables/useHttp";
import { useCustomerStore } from "../store";
import AirtimeHeader from "../components/payout/AirtimeHeader.vue";
import BankSelector from "../components/payout/NetworkSelector.vue";
import CustomAmount from "../components/payout/CustomAmount.vue";
import ErrorModal from "../components/modal/ErrorModal.vue";
import SuccessModal from "../components/modal/SuccessModal.vue";
import PinValidationModal from "../components/modal/PinValidationModal.vue";
import EnhancedNinBvnVerificationModal from "../components/modal/EnhancedNinBvnVerificationModal.vue";
import { generateRequestId } from "../utils/globals";

const router = useRouter();
const customerStore = useCustomerStore();
const { customer, banks, providers, isLoadingProvider } = storeToRefs(customerStore);
const { httpRequest } = useHttp();

const selectedNetwork = ref("");
const selectedBankName = ref("");
const selectedBankCode = ref("");
const selectedBank = ref(null);
const showPinModal = ref(false);
const accountNumber = ref("");
const amount = ref("");
const accountNumberError = ref("");
const amountError = ref("");
const validationError = ref("");
const isAccountVerified = ref(false);
const accountDetails = ref(null);
const accountVerificationError = ref(null);
const showSuccessModal = ref(false);
const showErrorModal = ref(false);
const showNinBvnModal = ref(false);
const successMessage = ref("Withdrawal request successful");
const serverError = ref("");
const loadingRequest = ref(false);
const isVerifyingAccount = ref(false);
const phoneError = ref("");
const clearPhoneError = () => { phoneError.value = ""; };
const verificationStatus = ref({ nin: { provided: false, verified: false, value: null }, bvn: { provided: false, verified: false, value: null } });
const needsVerification = ref([]);
const allVerified = ref(false);

// Daily limit status
const dailyLimitStatus = ref(null);
const dailyLimitLoading = ref(false);
const currentTime = ref(new Date());
let countdownInterval = null;

// Dynamic withdrawal limits from backend
const minWithdrawal = ref(100);
const maxWithdrawal = ref(10000000);

const fetchWithdrawalConfig = async () => {
  try {
    const res = await httpRequest("GET", "/customer/withdrawal-fees");
    if (res.data?.min_amount) minWithdrawal.value = res.data.min_amount;
    if (res.data?.max_amount) maxWithdrawal.value = res.data.max_amount;
  } catch (e) { /* silent fallback */ }
};

const fetchDailyLimitStatus = async () => {
  try {
    dailyLimitLoading.value = true;
    const res = await httpRequest("GET", "/customer/daily-limit-status");
    if (res.data?.success) dailyLimitStatus.value = res.data.data;
  } catch (e) { /* silent */ } finally { dailyLimitLoading.value = false; }
};

const countdownToReset = computed(() => {
  if (!dailyLimitStatus.value?.resets_at) return null;
  const diffMs = new Date(dailyLimitStatus.value.resets_at) - currentTime.value;
  if (diffMs <= 0) return "00:00:00";
  const h = Math.floor(diffMs / 3600000);
  const m = Math.floor((diffMs % 3600000) / 60000);
  const s = Math.floor((diffMs % 60000) / 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
});

const remainingLimit = computed(() => dailyLimitStatus.value?.remaining_today ?? 10000000);
const limitUsedPercent = computed(() => dailyLimitStatus.value?.percentage_used ?? 0);

const showAppToast = (msg, type = "success") => {
  serverError.value = msg;
  showErrorModal.value = true;
};

const initiateWithdrawal = () => { 
  if (remainingLimit.value <= 0) {
    showAppToast("You’ve reached your ₦10,000,000 daily transfer limit. Transfers are unavailable until your daily limit resets.", "error");
    return;
  }
  if (!validateInputs()) return;

  // Enforce that both NIN and BVN must be verified before withdrawal proceeds
  const hasNin = Boolean(customer.value?.nin || customer.value?.has_nin || verificationStatus.value?.has_nin || verificationStatus.value?.nin?.verified);
  const hasBvn = Boolean(customer.value?.bvn || customer.value?.has_bvn || verificationStatus.value?.has_bvn || verificationStatus.value?.bvn?.verified);

  if (!hasNin || !hasBvn) {
    showNinBvnModal.value = true;
    return;
  }

  showPinModal.value = true; 
};

const handlePinSuccess = async (pin) => {
  try {
    loadingRequest.value = true;
    const response = await httpRequest("POST", "/customer/processPayout", {
      reference: generateRequestId(),
      amount: amount.value,
      pin,
      customer_id: customer.value.id,
      bank_code: selectedBankCode.value,
      bank_name: selectedBankName.value,
      account_number: accountNumber.value,
      account_name: accountDetails.value.accountName
    });
    if (response.status !== 200 || response.data?.error) {
      if (response.data?.requires_verification) {
        if (response.data.verification_status) verificationStatus.value = response.data.verification_status;
        if (response.data.needs_verification) needsVerification.value = response.data.needs_verification;
        showNinBvnModal.value = true;
        return;
      }
      serverError.value = response.data?.message || "Something went wrong!";
      showErrorModal.value = true;
    } else {
      const withdrawnAmount = Number(amount.value) || 0;
      successMessage.value = response.data?.message || "Withdrawal successful! Funds released to your account.";
      showSuccessModal.value = true;
      amount.value = "";
      accountNumber.value = "";
      accountDetails.value = null;
      isAccountVerified.value = false;

      // Realtime countdown: immediately decrement remaining limit in local state
      if (dailyLimitStatus.value) {
        dailyLimitStatus.value.withdrawn_today = (dailyLimitStatus.value.withdrawn_today || 0) + withdrawnAmount;
        dailyLimitStatus.value.remaining_today = Math.max(0, (dailyLimitStatus.value.remaining_today ?? 10000000) - withdrawnAmount);
        const limit = dailyLimitStatus.value.daily_limit || 10000000;
        dailyLimitStatus.value.percentage_used = Math.min(100, (dailyLimitStatus.value.withdrawn_today / limit) * 100);
      }

      await fetchDailyLimitStatus();
      await customerStore.fetchCustomer();
    }
  } catch (error) {
    if (error.response?.data?.requires_verification) {
      if (error.response.data.verification_status) verificationStatus.value = error.response.data.verification_status;
      if (error.response.data.needs_verification) needsVerification.value = error.response.data.needs_verification;
      showNinBvnModal.value = true;
      return;
    }
    serverError.value = error.response?.data?.message || error?.message || "Withdrawal failed. Please try again.";
    showErrorModal.value = true;
  } finally { loadingRequest.value = false; }
};

const clearValidatedAccount = () => { accountDetails.value = null; };

const validateInputs = () => {
  accountNumberError.value = "";
  amountError.value = "";
  validationError.value = "";
  if (!accountNumber.value.trim()) accountNumberError.value = "Please enter an account number";
  if (!amount.value.trim()) {
    amountError.value = "Please select or enter an amount";
  } else {
    const amountValue = Number(amount.value);
    const walletBalance = Number(customer.value?.balance ?? customer.value?.wallet_balance ?? 0);
    if (amountValue < minWithdrawal.value) amountError.value = `Minimum withdrawal amount is ₦${minWithdrawal.value.toLocaleString()}`;
    else if (amountValue > maxWithdrawal.value) amountError.value = `Maximum withdrawal amount is ₦${maxWithdrawal.value.toLocaleString()}`;
    else if (amountValue > remainingLimit.value) {
      amountError.value = remainingLimit.value <= 0
        ? "You’ve reached your ₦10,000,000 daily transfer limit. Transfers are unavailable until your daily limit resets."
        : `You can transfer up to ₦${remainingLimit.value.toLocaleString()} more today.`;
    }
    else if (amountValue > walletBalance) amountError.value = `Insufficient balance. You need ₦${amountValue.toLocaleString()} to complete this withdrawal`;
  }
  return !accountNumberError.value && !amountError.value && !validationError.value;
};

const goBack = () => router.back();
const goToHistory = () => router.push("/transactions");
const handlePinError = () => { serverError.value = "PIN validation failed. Please try again."; showErrorModal.value = true; };
const selectBankRequest = (item) => { selectedBankCode.value = item.code; selectedBankName.value = item.name; selectedBank.value = item; };

const handleAccountValidation = async () => {
  if (selectedBankName.value && accountNumber.value) {
    isVerifyingAccount.value = true;
    try {
      const response = await httpRequest("POST", "/customer/verify-account", { accountNumber: accountNumber.value, bankCode: selectedBankCode.value });
      if (response.data.success) { accountDetails.value = response.data.data; isAccountVerified.value = true; }
      else { accountVerificationError.value = response.data.message; isAccountVerified.value = false; }
    } catch (err) { accountVerificationError.value = err.response?.data?.message || "An error occurred."; isAccountVerified.value = false; }
    finally { isVerifyingAccount.value = false; }
  }
};

const clearAccountNumberError = () => { accountNumberError.value = ""; };
const clearAmountError = () => { amountError.value = ""; };
const handleNinBvnSuccess = async () => { 
  showNinBvnModal.value = false; 
  await fetchVerificationStatus(); 
  await customerStore.fetchCustomer();

  const hasNin = Boolean(customer.value?.nin || customer.value?.has_nin || verificationStatus.value?.has_nin || verificationStatus.value?.nin?.verified);
  const hasBvn = Boolean(customer.value?.bvn || customer.value?.has_bvn || verificationStatus.value?.has_bvn || verificationStatus.value?.bvn?.verified);

  if (hasNin && hasBvn) {
    successMessage.value = "KYC Verification completed successfully! You can now proceed with your withdrawal.";
    showSuccessModal.value = true;
  } else {
    showNinBvnModal.value = true;
  }
};
const handleNinBvnError = () => { serverError.value = "Identity verification failed."; showErrorModal.value = true; };
const handleModalClose = () => { showSuccessModal.value = false; showErrorModal.value = false; showPinModal.value = false; showNinBvnModal.value = false; };

const fetchVerificationStatus = async () => {
  try {
    const response = await httpRequest("GET", "/customer/verification-status");
    if (response.data.success) { verificationStatus.value = response.data.verification_status; needsVerification.value = response.data.needs_verification; allVerified.value = response.data.all_verified; }
  } catch (error) { console.error("Failed to fetch verification status:", error); }
};

onMounted(async () => {
  await customerStore.fetchCustomer();
  await customerStore.fetchBanks();
  await customerStore.fetchServiceAirtimeIds();
  await fetchVerificationStatus();
  await fetchDailyLimitStatus();
  await fetchWithdrawalConfig();

  countdownInterval = setInterval(() => {
    const oldTime = currentTime.value;
    currentTime.value = new Date();
    if (dailyLimitStatus.value?.resets_at) {
      const resetTime = new Date(dailyLimitStatus.value.resets_at);
      if (oldTime < resetTime && currentTime.value >= resetTime) {
        fetchDailyLimitStatus();
        customerStore.fetchCustomer();
      }
    }
  }, 1000);
});

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval);
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="sticky top-0 z-10 bg-white border-b border-gray-200">
      <AirtimeHeader @back="goBack" @history="goToHistory" />
    </div>
    <main class="px-4 md:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">

      <!-- Daily Transfer Limit Banner -->
      <div v-if="dailyLimitStatus" class="mt-4 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-4 text-white shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <div>
            <p class="text-xs text-slate-400 font-medium uppercase tracking-wider">Daily Transfer Limit</p>
            <p class="text-lg font-bold">&#8358;{{ remainingLimit.toLocaleString() }} <span class="text-sm font-normal text-slate-300">remaining</span></p>
          </div>
          <div class="text-right">
            <p class="text-xs text-slate-400">Resets in</p>
            <p class="text-sm font-semibold text-emerald-400 font-mono">{{ countdownToReset }}</p>
          </div>
        </div>
        <!-- Progress bar -->
        <div class="w-full bg-slate-700 rounded-full h-2">
          <div
            class="h-2 rounded-full transition-all duration-500"
            :class="limitUsedPercent >= 90 ? 'bg-red-500' : limitUsedPercent >= 60 ? 'bg-amber-400' : 'bg-emerald-400'"
            :style="{ width: Math.min(limitUsedPercent, 100) + '%' }"
          ></div>
        </div>
        <p class="text-xs text-slate-400 mt-1">{{ limitUsedPercent.toFixed(1) }}% of &#8358;{{ (dailyLimitStatus?.daily_limit ?? 10000000).toLocaleString() }} used today</p>
      </div>

      <!-- Limit Blocked Message -->
      <div v-if="remainingLimit <= 0" class="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-sm text-rose-800 flex flex-col gap-1">
        <p class="font-bold text-base text-rose-700">Daily Transfer Limit Reached</p>
        <p>You have reached your maximum daily withdrawal limit of <strong>&#8358;10,000,000</strong>.</p>
        <p class="mt-2 font-medium">Next transfer will be available in: <span class="font-bold text-rose-600 font-mono">{{ countdownToReset }}</span></p>
      </div>

      <BankSelector
        v-model="selectedNetwork"
        v-model:accountNumber="accountNumber"
        :banks="banks"
        :selected-bank="selectedBank"
        :error="phoneError"
        :loading="isLoadingProvider"
        :account="accountDetails"
        :accountVerificationError="accountVerificationError"
        :loadingVerification="isVerifyingAccount"
        @clear-error="clearPhoneError"
        @clear-accounts="clearValidatedAccount"
        @selectBank="selectBankRequest"
        @handle-accountvalidation="handleAccountValidation"
        :disabled="remainingLimit <= 0"
      />

      <CustomAmount
        v-model="amount"
        :error="amountError"
        :isLoading="loadingRequest"
        :selectedNetworkProvider="selectedBank"
        :isVerified="isAccountVerified"
        :remaining-limit="remainingLimit"
        @clear-amountError="clearAmountError"
        @handleAirtimeRequest="initiateWithdrawal"
        :disabled="remainingLimit <= 0"
      />
       <SuccessModal :show-success-modal="showSuccessModal" :message="successMessage" :isRegistration="false" @close="handleModalClose" />
      <ErrorModal :show-error-modal="showErrorModal" :errMessage="serverError" @close="handleModalClose" />
      <PinValidationModal :show-modal="showPinModal" @close="handleModalClose" @success="handlePinSuccess" @error="handlePinError" />
      <EnhancedNinBvnVerificationModal :show-modal="showNinBvnModal" :verification-status="verificationStatus" :needs-verification="needsVerification" @close="handleModalClose" @success="handleNinBvnSuccess" @error="handleNinBvnError" />
    </main>
  </div>
</template>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
input[type="number"] { -moz-appearance: textfield; }
@media (max-width: 640px) { .sticky { position: sticky; backdrop-filter: blur(8px); background-color: rgba(255,255,255,0.95); } }
</style>
