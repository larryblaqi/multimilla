<script setup>
import { computed } from "vue";
import {
  ArrowUpIcon,
  DevicePhoneMobileIcon,
  WifiIcon,
  TvIcon,
  ChartBarIcon
} from "@heroicons/vue/24/outline";
import { formatTransactionDate } from "../../utils/globals";
import LoadingSpin from "../modal/LoadingSpin.vue";

const props = defineProps({
  transactions: {
    type: Array,
    default: [],
  },
  loading: Boolean,
});

const recentTransactions = computed(() => {
  return [...props.transactions].sort((a, b) => b.id - a.id).slice(0, 3);
});

const getIcon = (transactionType) => {
  switch (transactionType?.toLowerCase()) {
    case "airtime":
      return DevicePhoneMobileIcon;
    case "data":
      return WifiIcon;
    case "tv":
      return TvIcon;
    case "investment":
      return ChartBarIcon;
    default:
      return ArrowUpIcon;
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
</script>

<template>
  <div class="space-y-4">
    <div v-if="loading" class="flex justify-center items-center py-8">
      <LoadingSpin />
    </div>
    <div
      v-else-if="transactions.length === 0"
      class="text-center py-8 text-gray-500 no-transaction"
    >
      No transactions start buying..
    </div>

    <div v-else>
      <div
        v-for="(transaction, index) in recentTransactions"
        :key="transaction.id"
        class="flex items-center justify-between p-4 border-b border-gray-200 last:border-b-0 "
      >
        <div class="flex items-center gap-3">
          <div class="border p-2 rounded-full">
            <component 
              :is="getIcon(transaction.type)" 
              class="w-5 h-5 text-gray-600" 
            />
          </div>
          <div>
            <p class="font-medium text-sm text-gray-900 text-base capitalize">
              {{ transaction.type }} {{ transaction.recipient }}
            </p>
            <p class="text-sm text-gray-500 text-base">
              {{ formatTransactionDate(transaction.created_at) }}
            </p>
          </div>
        </div>
        <div class="text-right">
          <p class="font-medium">-₦ {{ Number(transaction.amount) }}</p>
          <p class="text-sm text-green-500">{{ formatStatusLabel(transaction.status) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

