<script setup>
import { computed, defineProps, ref, watch, onMounted } from "vue";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CreditCardIcon,
  CalendarIcon,
  HashtagIcon,
  PhoneIcon,
  TvIcon,
  BoltIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  QuestionMarkCircleIcon
} from "@heroicons/vue/24/outline";
import { formatMoney, formatTransactionDate } from "../../utils/globals";
import { useHttp } from "../../composables/useHttp";
import { useCustomerStore } from "../../store";

const props = defineProps({
  transaction: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["back"]);
const { httpRequest } = useHttp();
const customerStore = useCustomerStore();

// Reactive transaction copy so real-time status updates can be displayed instantly
const liveTransaction = ref({ ...props.transaction });

watch(
  () => props.transaction,
  (newVal) => {
    if (newVal) {
      liveTransaction.value = { ...newVal };
    }
  },
  { deep: true, immediate: true }
);

// Format human-friendly status label: display "Successful" instead of processing/completed
const formatStatusLabel = (status) => {
  const s = status?.toString()?.toLowerCase()?.trim();
  switch (s) {
    case "success":
    case "successful":
    case "completed":
    case "paid":
    case "delivered":
      return "Successful";
    case "processing":
      return "Processing";
    case "pending":
      return "Pending";
    case "failed":
      return "Failed";
    case "reversed":
      return "Reversed";
    case "active":
      return "Active";
    default:
      return status ? status.charAt(0).toUpperCase() + status.slice(1) : "Successful";
  }
};

// Check with backend if processing withdrawal has been released by Paystack
onMounted(async () => {
  const status = liveTransaction.value?.status?.toLowerCase();
  const txId = liveTransaction.value?.id || liveTransaction.value?.transaction_id || liveTransaction.value?.reference;
  if ((status === "processing" || status === "pending") && txId) {
    try {
      const res = await httpRequest("GET", `/customer/transactions/${txId}/verify-status`);
      if (res?.data?.success && res?.data?.status) {
        liveTransaction.value.status = res.data.status;
        if (res.data.transaction) {
          liveTransaction.value = { ...liveTransaction.value, ...res.data.transaction };
        }
        customerStore.fetchCustomer();
      }
    } catch (e) {
      // Silent error: keep current status
    }
  }
});

const getTransactionIcon = (type) => {
  switch (type?.toLowerCase()) {
    case "airtime":
      return PhoneIcon;
    case "data":
      return PhoneIcon;
    case "tv":
      return TvIcon;
    case "eletricity":
      return BoltIcon;
    case "deposit":
      return ArrowDownIcon;
    case "withdrawal":
      return ArrowUpIcon;
    case "investment":
      return CreditCardIcon;
    default:
      return CreditCardIcon;
  }
};

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case "success":
    case "successful":
    case "completed":
    case "delivered":
    case "paid":
      return CheckCircleIcon;
    case "failed":
    case "reversed":
      return XCircleIcon;
    case "pending":
    case "processing":
    case "active":
      return ClockIcon;
    default:
      return CheckCircleIcon;
  }
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "success":
    case "successful":
    case "completed":
    case "delivered":
    case "paid":
      return "text-green-600";
    case "failed":
    case "reversed":
      return "text-red-600";
    case "pending":
    case "processing":
    case "active":
      return "text-yellow-600";
    default:
      return "text-green-600";
  }
};

const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-50 text-yellow-600 border-yellow-200";
    case "active":
      return "bg-blue-50 text-blue-600 border-blue-200";
    case "delivered":
    case "paid":
    case "success":
    case "successful":
    case "completed":
      return "bg-green-50 text-green-600 border-green-200";
    case "failed":
    case "reversed":
      return "bg-red-50 text-red-600 border-red-200";
    case "processing":
      return "bg-blue-50 text-blue-600 border-blue-200";
    default:
      return "bg-green-50 text-green-600 border-green-200";
  }
};

const getTransactionTitle = (transaction) => {
  const type = transaction?.type?.toLowerCase();
  switch (type) {
    case "airtime":
      return "Airtime Purchase";
    case "data":
      return "Data Purchase";
    case "tv":
      return "TV Subscription";
    case "electricity":
      return "Electricity Bill";
    case "deposit":
      return "Account Deposit";
    case "investment":
      return "Investment Request";
    case "withdrawal":
      return "Withdrawal Request";
    case "processing":
      return "Processing Transaction";
    default:
      return `${transaction?.type || 'Transaction'} Transaction`;
  }
};

const totalReceiptAmount = computed(() => {
  const baseAmount = Math.abs(liveTransaction.value?.amount || 0);
  const fee = Number(liveTransaction.value?.processing_fee || 0);
  return baseAmount + fee;
});

const transactionDetails = computed(() => {
  const details = [
    {
      label: "Amount",
      value: `₦${formatMoney(Math.abs(liveTransaction.value?.amount || 0))}`,
      icon: CreditCardIcon,
    },
    {
      label: "Type",
      value: liveTransaction.value?.transaction_type || liveTransaction.value?.type || "Transfer",
      icon: QuestionMarkCircleIcon,
    },
    {
      label: "Date & Time",
      value: formatTransactionDate(liveTransaction.value?.created_at),
      icon: CalendarIcon,
    },
    {
      label: "Status",
      value: formatStatusLabel(liveTransaction.value?.status),
      rawStatus: liveTransaction.value?.status,
      icon: getStatusIcon(liveTransaction.value?.status),
      isStatus: true,
    },
  ];

  // Add processing fee for any transaction that has a processing fee > 0
  const fee = Number(liveTransaction.value?.processing_fee || 0);
  if (fee > 0) {
    details.splice(1, 0, {
      label: "Processing Fee",
      value: `₦${formatMoney(fee)}`,
      icon: CreditCardIcon,
    });
    
    // Add total amount (amount + processing fee)
    const isDeposit = liveTransaction.value?.type === 'deposit';
    details.splice(2, 0, {
      label: isDeposit ? "Total Credited" : "Total Deducted",
      value: `₦${formatMoney(totalReceiptAmount.value)}`,
      icon: CreditCardIcon,
    });
  }

  // Add recipient if available
  if (liveTransaction.value?.recipient) {
    const recipientIndex = fee > 0 ? 4 : 2;
    details.splice(recipientIndex, 0, {
      label: "Recipient",
      value: liveTransaction.value.recipient,
      icon: PhoneIcon,
    });
  }

  // Add description if available
  if (liveTransaction.value?.element) {
    const elementLabel = liveTransaction.value?.type?.toLowerCase() === 'tv' ? 'Voucher' : 'Token';

    details.push({
      label: elementLabel,
      value: liveTransaction.value.element,
      icon: HashtagIcon,
    });
  }

  return details;
});
</script>

<template>
  <div class="max-w-md mx-auto bg-white">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b ">
      <button
        @click="emit('back')"
        class="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ArrowLeftIcon class="w-5 h-5" />
        <span class="text-sm font-medium">Back</span>
      </button>
      <h1 class="text-lg font-semibold text-gray-900">Transaction Details</h1>
      <div class="w-16"></div>
      <!-- Spacer for centering -->
    </div>

    <!-- Transaction Summary Card -->
    <div class="p-6">
      <div class="text-center mb-6">
        <!-- Transaction Icon -->
        <div
          class="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4"
        >
          <component
            :is="getTransactionIcon(liveTransaction?.type)"
            class="w-8 h-8 text-red-600"
          />
        </div>

        <!-- Transaction Title -->
        <h2 class="text-xl font-semibold text-gray-900 mb-2">
          {{ getTransactionTitle(liveTransaction) }}
        </h2>

        <!-- Amount -->
        <p class="text-3xl font-bold text-gray-900 mb-2">
          ₦{{ formatMoney(totalReceiptAmount) }}
        </p>

        <!-- Status Badge -->
        <div class="flex justify-center">
          <span
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border"
            :class="getStatusBadgeClass(liveTransaction?.status)"
          >
            <component
              :is="getStatusIcon(liveTransaction?.status)"
              class="w-4 h-4"
            />
            {{ formatStatusLabel(liveTransaction?.status) }}
          </span>
        </div>
      </div>

      <!-- Transaction Details -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">
          Transaction Details
        </h3>

        <div
          v-for="detail in transactionDetails"
          :key="detail.label"
          class="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
        >
          <div class="flex items-center gap-3">
            <component
              v-if="detail.icon"
              :is="detail.icon"
              class="w-5 h-5 text-gray-400"
            />
            <span class="text-sm text-gray-600 font-medium">{{
              detail.label
            }}</span>
          </div>
          <div class="text-right">
            <span
              v-if="detail.isStatus"
              class="inline-flex items-center gap-1 text-sm font-semibold"
              :class="getStatusColor(detail.rawStatus || detail.value)"
            >
              {{ detail.value }}
            </span>
            <span v-else class="text-sm text-gray-900 font-medium">
              {{ detail.value }}
            </span>
          </div>
        </div>
      </div>

      <!-- Additional Information -->
      <div
        v-if="liveTransaction?.notes || liveTransaction?.reference"
        class="mt-6 pt-6 border-t"
      >
        <h3 class="text-lg font-semibold text-gray-900 mb-3">
          Additional Information
        </h3>

        <div v-if="liveTransaction?.reference" class="mb-3">
          <p class="text-sm text-gray-600 mb-1">Reference Number</p>
          <p
            class="text-sm text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded"
          >
            {{ liveTransaction.reference }}
          </p>
        </div>

        <div v-if="liveTransaction?.notes" class="mb-3">
          <p class="text-sm text-gray-600 mb-1">Notes</p>
          <p class="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
            {{ liveTransaction.notes }}
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <!-- <div class="mt-8 space-y-3">
        <button
          v-if="transaction?.status === 'failed'"
          class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Retry Transaction
        </button>

        <button
          class="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Download Receipt
        </button>

        <button
          class="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Contact Support
        </button>
      </div> -->
    </div>
  </div>
</template>

<style scoped>
/* Custom styles if needed */
.font-mono {
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
}
</style>
