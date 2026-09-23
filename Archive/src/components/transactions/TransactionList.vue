<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";

import {
  ArrowUpIcon,
  ArrowDownIcon,
  DevicePhoneMobileIcon,
  WifiIcon,
  TvIcon,
  ChartBarIcon,
} from "@heroicons/vue/24/outline";
import { formatMoney, formatTransactionDate } from "../../utils/globals";
import LoadingSpin from "../modal/LoadingSpin.vue";

import EmptyIcon from "../../assets/images/no-history.3bcc05c5.svg";

const router = useRouter();

const props = defineProps({
  transactions: {
    type: Array,
    default: [],
  },
  loading: Boolean,
});

const recentTransactions = computed(() => {
  return [...props.transactions].sort((a, b) => b.id - a.id).slice(0, 2);
});

const getIcon = (transactionType) => {
  switch (transactionType?.toLowerCase()) {
    case "airtime":
      return ArrowUpIcon;
    case "data":
      return ArrowUpIcon;
    case "tv":
      return ArrowUpIcon;
    case "deposit":
      return ArrowDownIcon;
    case "investment":
      return ArrowUpIcon;
    default:
      return ArrowUpIcon;
  }
};

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
    case "investment":
      return "Investment";
    case "deposit":
      return "Deposit";
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

const navigateToSummary = (transactionId) => {
  router.push(`/transaction/${transactionId}`);
};
</script>

<template>
  <div class="space-y-4 rounded-lg">
    <div v-if="loading" class="flex justify-center items-center py-8">
      <LoadingSpin />
    </div>
    <div
      v-else-if="transactions.length === 0"
      class="flex flex-col items-center justify-center py-8 text-gray-500"
    >
      <img :src="EmptyIcon" alt="No transactions" class="w-12 h-12 mb-4" />
      <p class="no-transaction text-sm capitalize">No transactions yet</p>
    </div>

    <div v-else>
      <div
        v-for="(transaction, index) in recentTransactions"
        :key="transaction.id"
        @click="navigateToSummary(transaction.id)"
        class="flex items-center justify-between mb-3 p-4 bg-white rounded-lg shadow-sm border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-full bg-red-50">
            <component
              :is="getIcon(transaction.type)"
              class="w-5 h-5 text-red-600"
            />
          </div>
          <div>
            <p class="font-medium text-gray-600 tx-name text-xs uppercase">
              {{ getTransactionDescription(transaction) }}
            </p>
            <p class="text-gray-500 text-xs xs:text-xs sm:text-xs">
              {{ formatTransactionDate(transaction.created_at) }}
            </p>
          </div>
        </div>
        <div class="text-right">
          <p class="font-bold text-xs text-gray-900">
            {{ transaction.type === "Deposit" ? "+ ₦" : "- ₦"
            }}{{ formatMoney(transaction.amount) }}
          </p>

          <!-- <p class="font-bold text-xs">- ₦{{ Number(transaction.amount) }}</p> -->
          <span
            class="inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1"
            :class="getStatusBadgeClass(transaction.status)"
          >
            {{ formatStatusLabel(transaction.status) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
