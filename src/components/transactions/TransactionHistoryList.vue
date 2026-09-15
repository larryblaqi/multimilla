<script setup>
import { computed, defineProps, defineEmits } from "vue";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  HashtagIcon,
  DevicePhoneMobileIcon,
  WifiIcon,
  TvIcon,
  ChartBarIcon,
  BoltIcon
} from "@heroicons/vue/24/outline";
import { formatMoney, formatTransactionDate } from "../../utils/globals";
import LoadingSpin from "../modal/LoadingSpin.vue";

import EmptyIcon from "../../assets/images/no-history.3bcc05c5.svg";

const props = defineProps({
  transactions: {
    type: Array,
    default: [],
  },
  loading: Boolean,
});

const emit = defineEmits(["transactionClick"]);

const recentTransactions = computed(() => {
  return [...props.transactions].sort((a, b) => b.id - a.id);
});

const getIcon = (transactionType) => {
  switch (transactionType.toLowerCase()) {
    case "airtime":
      return ArrowUpIcon;
    case "data":
      return ArrowUpIcon;
    case "tv":
      return ArrowUpIcon;
    case "investment":
      return ArrowUpIcon;
    case "eletricity":
      return BoltIcon;
    default:
      return ArrowUpIcon;
  }
};
// eletricity
const getTransactionDescription = (transaction) => {
  const type = transaction?.type?.toLowerCase();
  switch (type) {
    case "airtime":
      return "Airtime Purchase";
    case "data":
      return "Data Purchase";
    case "tv":
      return "TV Subscription";
    case "eletricity":
      return "Eletricity";
    case "deposit":
      return "Deposit";
    case "investment":
      return "Contribution";
    case "withdrawal":
      return "Withdrawal";
    case "processing":
      return "Processing";
    default:
      return `${transaction?.type} ${transaction?.recipient}`;
  }
};

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
    default:
      return status ? status.charAt(0).toUpperCase() + status.slice(1) : "Successful";
  }
};

const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-50 text-yellow-600";
    case "active":
      return "bg-blue-50 text-blue-600";
    case "delivered":
    case "paid":
    case "success":
    case "successful":
    case "completed":
      return "bg-green-50 text-green-600";
    case "failed":
    case "reversed":
      return "bg-red-50 text-red-600";
    case "processing":
      return "bg-blue-50 text-blue-600";
    default:
      return "bg-green-50 text-green-600";
  }
};

const handleTransactionClick = (transaction) => {
  emit("transactionClick", transaction);
};
</script>

<template>
  <div class="space-y-4">
    <!-- Loading Spinner -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <LoadingSpin />
    </div>

    <!-- No Transactions Message -->
    <div
      v-else-if="transactions.length === 0"
      class="flex flex-col items-center justify-center py-8 text-gray-500"
    >
      <img :src="EmptyIcon" alt="No transactions" class="w-12 h-12 mb-4" />
      No transactions start buying..
    </div>

    <!-- Transactions List -->
    <div v-else class="max-h-[500px] overflow-y-auto scroll-smooth">
      <div
        v-for="(transaction, index) in recentTransactions"
        :key="transaction.id"
        class="flex items-center justify-between py-4"
        :class="{ 'border-b': index < transactions.length - 1 }"
        @click="handleTransactionClick(transaction)"
        role="button"
        tabindex="0"
        @keydown.enter="handleTransactionClick(transaction)"
        @keydown.space.prevent="handleTransactionClick(transaction)"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-full">
            <div class="bg-red-50 p-2 rounded-full">
              <component
                :is="getIcon(transaction?.type)"
                class="w-5 h-5 text-red-600"
              />
            </div>
          </div>
          <div>
            <p class="text-sm text-gray-600 text-base font-bold">
              {{ getTransactionDescription(transaction) }}
            </p>
            <p class="text-gray-500 text-base text-xs status-txt">
              {{ formatTransactionDate(transaction?.created_at) }}
            </p>
          </div>
        </div>
        <div class="text-right">
          <p class="text-sm font-medium">
            ₦ {{ formatMoney(Math.abs(transaction?.amount || 0)) }}
          </p>
          <span
            class="inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 status-txt"
            :class="getStatusBadgeClass(transaction?.status)"
          >
            {{ formatStatusLabel(transaction?.status) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar styles */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
