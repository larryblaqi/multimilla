<script setup>
import { onMounted, ref, onActivated, computed } from "vue";
import { useCustomerStore } from "../store";
import { storeToRefs } from "pinia";

import BalanceCard from "../components/balance/BalanceCard.vue";
import TransactionList from "../components/transactions/TransactionList.vue";
import QuickActions from "../components/actions/QuickActions.vue";
import AdvertisementSlider from "../components/advertisements/AdvertisementSlider.vue";

const customerStore = useCustomerStore();
const { customer, transactions, isLoadingCustomerData } =
  storeToRefs(customerStore);

const advertisementSliderRef = ref(null);
const isRefreshing = ref(false);

// Dynamically extract and format authenticated user's first name
const userFirstName = computed(() => {
  if (customer.value?.first_name) {
    const parts = customer.value.first_name.trim().split(/\s+/);
    if (parts[0]) {
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
  }
  if (customer.value?.full_name) {
    const parts = customer.value.full_name.trim().split(/\s+/);
    if (parts[0]) {
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
  }
  return "";
});

const fetchData = async () => {
  // Only fetch if customer data is not already loaded
  if (!customer.value || !customer.value.id) {
    await customerStore.fetchCustomer();
  }
};

const refreshData = async () => {
  if (isRefreshing.value) return;
  isRefreshing.value = true;
  try {
    await customerStore.fetchCustomer(true);
  } catch (error) {
    console.error("Failed to refresh customer data:", error);
  } finally {
    isRefreshing.value = false;
  }
};

const refreshAdvertisements = () => {
  if (advertisementSliderRef.value) {
    advertisementSliderRef.value.refreshAdvertisements();
  }
};

onMounted(fetchData);

// Refresh advertisements when component becomes active (user returns to dashboard)
onActivated(() => {
  refreshAdvertisements();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <main class="w-full max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
      <!-- Greeting -->
      <div>
        <h4 class="font-bold text-gray-900 text-sm sm:text-base">
          Hello {{ userFirstName || 'User' }} 👋
        </h4>
      </div>

      <!-- Balance Card -->
      <BalanceCard :balance="customer?.balance" :loading="isRefreshing" @refresh="refreshData" />

      <!-- Quick Actions -->
      <QuickActions />

      <!-- Advertisement Slider -->
      <AdvertisementSlider ref="advertisementSliderRef" />

      <!-- Transactions -->
      <TransactionList
        :transactions="transactions"
        :loading="isLoadingCustomerData"
      />
    </main>
  </div>
</template>
