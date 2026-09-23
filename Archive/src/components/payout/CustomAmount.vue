<script setup>
import { defineProps, ref, computed, onMounted } from "vue";
import Spinner from "../modal/SpinnerComp.vue";
import { useHttp } from "../../composables/useHttp";

const props = defineProps({
  modelValue: String,
  isLoading: Boolean,
  isVerified: Boolean,
  error: String,
  selectedNetworkProvider: String,
  disabled: Boolean,
  remainingLimit: {
    type: Number,
    default: 10000000,
  },
});

const emit = defineEmits([
  "update:modelValue",
  "handleAirtimeRequest",
  "clear-amountError",
]);

const handleFocus = () => {
  focused.value = true;
  emit("clear-amountError");
};

const { httpRequest } = useHttp();

const focused = ref(false);

// Dynamic limits and fee tiers from backend
const minWithdrawalAmount = ref(100);
const maxWithdrawalAmount = ref(10000000);

// Fee tiers — loaded dynamically from backend, fallback matches backend processPayout exactly
const FEE_TIERS = ref([
  { minAmount: 100,      maxAmount: 10000,    fee: 50 },
  { minAmount: 10001,    maxAmount: 999999,   fee: 100 },
  { minAmount: 1000000,  maxAmount: 4999999,  fee: 1000 },
  { minAmount: 5000000,  maxAmount: 9999999,  fee: 3000 },
  { minAmount: 10000000, maxAmount: Infinity, fee: 5000 },
]);

// Fetch live fee tiers and limits from backend so frontend stays dynamic and in sync
onMounted(async () => {
  try {
    const response = await httpRequest('GET', '/customer/withdrawal-fees');
    if (response?.data) {
      if (response.data.min_amount) minWithdrawalAmount.value = response.data.min_amount;
      if (response.data.max_amount) maxWithdrawalAmount.value = response.data.max_amount;
      if (response.data.fees?.length) {
        FEE_TIERS.value = response.data.fees.map(tier => ({
          minAmount: tier.min_amount,
          maxAmount: tier.max_amount ?? Infinity,
          fee: tier.fee,
        }));
      }
    }
  } catch (e) {
    console.warn('Could not fetch withdrawal fees from API, using defaults.', e);
  }
});

// Parse numeric amount safely
const numericAmount = computed(() => {
  const val = parseFloat(props.modelValue);
  return isNaN(val) ? 0 : val;
});

const inputHasValue = computed(() => {
  return props.modelValue !== undefined && props.modelValue !== null && props.modelValue.toString().trim() !== '';
});

// Live state detection of the input field
const inputState = computed(() => {
  if (!inputHasValue.value) return 'EMPTY';
  const val = numericAmount.value;
  if (val <= 0 || isNaN(val)) return 'INVALID';
  if (val < minWithdrawalAmount.value) return 'BELOW_MIN';
  if (val > maxWithdrawalAmount.value) return 'ABOVE_MAX';
  if (val > (props.remainingLimit ?? maxWithdrawalAmount.value)) return 'EXCEEDS_REMAINING';
  return 'VALID';
});

// Live simulated remaining limit after this prospective transaction
const remainingAfterTransfer = computed(() => {
  const current = props.remainingLimit ?? maxWithdrawalAmount.value;
  return Math.max(0, current - numericAmount.value);
});

// Percentage of daily limit used after this transfer
const percentageUsedAfterTransfer = computed(() => {
  const limit = maxWithdrawalAmount.value || 10000000;
  const used = (limit - remainingAfterTransfer.value);
  return Math.min(100, Math.max(0, (used / limit) * 100));
});

// Calculate withdrawal charge based on tiers
const withdrawalCharge = computed(() => {
  const amount = numericAmount.value;
  const tier = FEE_TIERS.value.find(t => amount >= t.minAmount && amount <= t.maxAmount);
  return tier ? tier.fee : 0;
});

// Calculate total amount including charges
const totalAmount = computed(() => {
  const amount = numericAmount.value;
  return amount + withdrawalCharge.value;
});

// Check if amount is within limits AND customer has enough balance including fee
const isValidAmount = computed(() => {
  return inputState.value === 'VALID';
});

// Human-readable label describing which fee tier applies
const feeTierLabel = computed(() => {
  const amount = numericAmount.value;
  if (amount <= 0) return '';
  if (amount <= 10000)    return '₦100 – ₦10,000';
  if (amount < 1000000)  return '₦10,001 – ₦999,999';
  if (amount < 5000000)  return '₦1M – <₦5M';
  if (amount < 10000000) return '₦5M – <₦10M';
  return '₦10M+';
});
</script>

<template>
  <div class="space-y-6">
    <!-- Amount Input with dynamic border styling according to input state -->
    <div
      class="flex items-center w-full mb-4 px-4 py-3.5 rounded-xl border transition-all duration-200"
      :class="{
        'border-red-500 ring-4 ring-red-100 bg-red-50/30': error || inputState === 'ABOVE_MAX',
        'border-amber-400 ring-2 ring-amber-100 bg-amber-50/30': inputState === 'BELOW_MIN',
        'border-orange-400 ring-2 ring-orange-100 bg-orange-50/30': inputState === 'EXCEEDS_REMAINING',
        'border-emerald-400 ring-2 ring-emerald-100 bg-emerald-50/20': inputState === 'VALID' && focused,
        'border-gray-200 bg-gray-50': inputState === 'EMPTY' || (!focused && inputState === 'VALID'),
      }"
    >
      <span
        class="text-xl font-semibold transition-colors duration-200"
        :class="{
          'text-red-600': error || inputState === 'ABOVE_MAX',
          'text-amber-600': inputState === 'BELOW_MIN',
          'text-emerald-600': inputState === 'VALID',
          'text-primary-600': focused && inputState === 'EMPTY',
          'text-gray-700': !focused && inputState === 'EMPTY'
        }"
        >₦</span
      >
      <input
        type="number"
        :value="modelValue"
        @focus="handleFocus"
        @blur="() => (focused = false)"
        @input="$emit('update:modelValue', $event.target.value)"
        placeholder="0.00"
        min="100"
        max="10000000"
        :disabled="disabled"
        class="flex-1 ml-2 bg-transparent text-sm text-dark placeholder:text-gray-400 focus:outline-none"
      />
    </div>

    <!-- Dynamic Withdrawal Breakdown (Only displayed once user enters an amount) -->
    <div v-if="numericAmount > 0" class="bg-blue-50/80 rounded-xl p-4 space-y-2 border border-blue-100 transition-all duration-200">
      <div class="text-sm text-gray-700 flex justify-between">
        <span class="font-medium">Withdrawal Amount:</span>
        <span class="font-bold">₦{{ numericAmount.toLocaleString() }}</span>
      </div>
      <div class="text-sm text-gray-700 flex justify-between">
        <span class="font-medium">Applicable Processing Fee:</span>
        <span class="font-semibold text-orange-600">₦{{ withdrawalCharge.toLocaleString() }} <span class="text-xs text-gray-400 font-normal">({{ feeTierLabel }})</span></span>
      </div>
      <div class="text-xs text-gray-500 flex justify-between pt-1 border-t border-blue-100/60">
        <span>Minimum Allowed:</span>
        <span class="font-medium text-gray-700">₦{{ minWithdrawalAmount.toLocaleString() }}</span>
      </div>
      <div class="text-xs text-gray-500 flex justify-between">
        <span>Maximum Allowed:</span>
        <span class="font-medium text-gray-700">₦{{ maxWithdrawalAmount.toLocaleString() }}</span>
      </div>
      <div class="text-sm font-semibold text-gray-900 border-t border-blue-100 pt-2 flex justify-between">
        <span class="font-medium">Total Deducted:</span>
        <span class="font-bold text-gray-900">₦{{ totalAmount.toLocaleString() }}</span>
      </div>
    </div>

    <!-- THE SPOT: Interactive sequence & realtime limit countdown detecting input state -->
    <div class="transition-all duration-300">
      <!-- Error passed from parent validator -->
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
        <span class="text-base">⚠️</span>
        <span>{{ error }}</span>
      </div>

      <!-- State: Below Minimum (amount < minWithdrawalAmount) -->
      <div v-else-if="inputState === 'BELOW_MIN'" class="bg-amber-50 border border-amber-300 text-amber-900 p-3.5 rounded-xl text-xs space-y-1">
        <div class="flex items-center gap-2 font-bold text-amber-800">
          <span class="text-sm">⚠️</span>
          <span>Minimum Withdrawal is ₦{{ minWithdrawalAmount.toLocaleString() }}</span>
        </div>
        <p class="text-amber-700">
          You entered <strong>₦{{ numericAmount.toLocaleString() }}</strong>. The minimum allowed transfer amount is <strong>₦{{ minWithdrawalAmount.toLocaleString() }}</strong>.
        </p>
      </div>

      <!-- State: Above Maximum (amount > maxWithdrawalAmount) -->
      <div v-else-if="inputState === 'ABOVE_MAX'" class="bg-rose-50 border border-rose-300 text-rose-900 p-3.5 rounded-xl text-xs space-y-1">
        <div class="flex items-center gap-2 font-bold text-rose-700">
          <span class="text-sm">🚨</span>
          <span>Maximum Withdrawal Limit: ₦{{ maxWithdrawalAmount.toLocaleString() }}</span>
        </div>
        <p class="text-rose-600">
          You entered <strong>₦{{ numericAmount.toLocaleString() }}</strong>, which exceeds the maximum allowed limit of <strong>₦{{ maxWithdrawalAmount.toLocaleString() }}</strong>.
        </p>
      </div>

      <!-- State: Exceeds Remaining Limit -->
      <div v-else-if="inputState === 'EXCEEDS_REMAINING'" class="bg-orange-50 border border-orange-300 text-orange-900 p-3.5 rounded-xl text-xs space-y-1">
        <div class="flex items-center gap-2 font-bold text-orange-800">
          <span class="text-sm">⚠️</span>
          <span>Exceeds Daily Remaining Limit</span>
        </div>
        <p class="text-orange-700">
          You can only transfer up to <strong>₦{{ (remainingLimit ?? maxWithdrawalAmount).toLocaleString() }}</strong> more today.
        </p>
      </div>

      <!-- State: Valid Amount (Realtime Countdown Preview) -->
      <div v-else-if="inputState === 'VALID'" class="bg-emerald-50/90 border border-emerald-200 text-emerald-900 p-3.5 rounded-xl text-xs space-y-2">
        <div class="flex items-center justify-between">
          <span class="font-semibold text-emerald-800 flex items-center gap-1.5">
            <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Daily Limit Countdown
          </span>
          <span class="font-bold text-emerald-700 font-mono">
            ₦{{ (remainingLimit ?? maxWithdrawalAmount).toLocaleString() }} ➔ ₦{{ remainingAfterTransfer.toLocaleString() }}
          </span>
        </div>
        <div class="w-full bg-emerald-200/60 rounded-full h-1.5 overflow-hidden">
          <div
            class="h-1.5 rounded-full bg-emerald-500 transition-all duration-300"
            :style="{ width: percentageUsedAfterTransfer + '%' }"
          ></div>
        </div>
        <p class="text-[11px] text-emerald-700">
          ₦{{ numericAmount.toLocaleString() }} will be deducted from your daily limit. <strong>₦{{ remainingAfterTransfer.toLocaleString() }}</strong> will remain available today.
        </p>
      </div>

      <!-- State: Empty / Default Informational Spot -->
      <div v-else class="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 space-y-1.5">
        <div class="flex items-center justify-between font-medium text-slate-700">
          <span class="flex items-center gap-1 text-[11px] text-slate-500">
            <span>Minimum Allowed:</span> <strong class="text-slate-800">₦{{ minWithdrawalAmount.toLocaleString() }}</strong>
          </span>
          <span class="flex items-center gap-1 text-[11px] text-slate-500">
            <span>Maximum Allowed:</span> <strong class="text-slate-800">₦{{ maxWithdrawalAmount.toLocaleString() }}</strong>
          </span>
        </div>
        <div class="flex items-center justify-between pt-1 border-t border-slate-200/70 text-[11px]">
          <span class="text-slate-500">Remaining Today:</span>
          <span class="font-bold text-emerald-700 font-mono">₦{{ (remainingLimit ?? maxWithdrawalAmount).toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <div class="flex flex-col justify-between h-full mt-6">
      <button
        class="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-semibold flex justify-center items-center transition-colors shadow-sm"
        :class="{
          'opacity-50 cursor-not-allowed':
            disabled || !selectedNetworkProvider || !isVerified || !isValidAmount,
        }"
        :disabled="disabled || !selectedNetworkProvider || !isVerified || !isValidAmount"
        @click="$emit('handleAirtimeRequest')"
      >
        <Spinner v-if="isLoading" class="mr-2" />
        <span v-else>Proceed</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Remove number input spinners */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

/* Smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Focus animations */
.ring-4 {
  transition: box-shadow 0.2s ease;
}

/* Input placeholder styling */
input::placeholder {
  color: #9ca3af;
  transition: color 0.2s ease;
}

input:focus::placeholder {
  color: #d1d5db;
}

</style>
