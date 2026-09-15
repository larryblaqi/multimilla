<script setup>
import { onMounted, ref, computed } from "vue";
import { useCustomerStore } from "../store";
import { storeToRefs } from "pinia";
import { useRouter, useRoute } from "vue-router";

import { ArrowLeftIcon, ArrowDownTrayIcon } from "@heroicons/vue/24/outline";
import TransactionHistoryHeader from "../components/transactions/TransactionHistoryHeader.vue";
import TransactionHistoryList from "../components/transactions/TransactionHistoryList.vue";
import TransactionHistoryFooter from "../components/transactions/TransactionHistoryFooter.vue";

import TransactionSummary from "../components/transactions/TransactionSummary.vue";

const router = useRouter();
const route = useRoute();

const selectedMonth = ref("All Months");
const selectedCategory = ref("All Categories");
const selectedStatus = ref("All Status");

const goBack = () => router.back();

const customerStore = useCustomerStore();
const { customer, transactions, isLoadingCustomerData } =
  storeToRefs(customerStore);

const transactionId = computed(() => route.params.id);

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

// Computed property to filter transactions
const filteredTransactions = computed(() => {
  if (!transactions.value) return [];

  return transactions.value.filter((transaction) => {
    // Month filtering
    const transactionMonth = new Date(transaction.created_at).toLocaleString(
      "default",
      { month: "short" }
    );
    const monthMatch =
      selectedMonth.value === "All Months" ||
      transactionMonth === selectedMonth.value;

    // Category filtering
    const categoryMatch =
      selectedCategory.value === "All Categories" ||
      transaction.type === selectedCategory.value;

    // Status filtering
    const statusMatch =
      selectedStatus.value === "All Status" ||
      selectedStatus.value === "All" ||
      formatStatusLabel(transaction.status).toLowerCase() === selectedStatus.value.toLowerCase() ||
      (transaction.status && transaction.status.toLowerCase() === selectedStatus.value.toLowerCase());

    return monthMatch && categoryMatch && statusMatch;
  });
});

const selectedTransaction = computed(() => {
  if (!transactions.value || !transactionId.value) return null;

  return transactions.value.find(
    (transaction) =>
      transaction.id === transactionId.value ||
      transaction.id === parseInt(transactionId.value)
  );
});

const handleBackToList = () => {
  router.back();
};

onMounted(async () => {
  await customerStore.fetchCustomer();
});
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="lg:hidden">
      <TransactionHistoryHeader @back="goBack" />
    </div>

    <main class="p-4 max-w-2xl mx-auto">
      <!-- Transaction Summary View -->
      <div>
        <TransactionSummary
          :transaction="selectedTransaction"
          @back="handleBackToList"
        />
      </div>
    </main>

    <!-- <div class="lg:hidden">
      <TransactionHistoryFooter />
    </div> -->
  </div>
</template>
