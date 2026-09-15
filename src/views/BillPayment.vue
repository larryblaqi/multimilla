<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useCustomerStore } from "../store";
import { storeToRefs } from "pinia";
import { useHttp } from "../composables/useHttp";
import BillPaymentHeader from "../components/actions/BillPaymentHeader.vue";

import airtimeIcon from "../assets/images/airtime-icon.f4a25259.svg";
import dataIcon from "../assets/images/data-icon.f1b42f5a.svg";
import CableIcon from "../assets/images/cable-tv-icon.5332b6d5.svg";
import ElectricityIcon from "../assets/images/electric-icon.35c57427.svg";
import FinanceIcon from "../assets/images/betting-icon.fa471450.svg";

const router = useRouter();
const customerStore = useCustomerStore();
const { customer, isLoadingCustomerData } = storeToRefs(customerStore);
const { httpRequest } = useHttp();

const goBack = () => router.back();

const profileItems = computed(() => [
  {
    imgSrc: airtimeIcon,
    alt: "Mobile phone icon",
    label: "Airtime",
    description: "Purchase airtime for any mobile network",
    route: "/wallet/airtime",
  },
  {
    imgSrc: dataIcon,
    alt: "Wifi icon",
    label: "Data",
    description: "Buy internet data bundles for all networks",
    route: "/wallet/data",
  },
  {
    imgSrc: CableIcon,
    alt: "TV icon",
    label: "Tv",
    description: "Pay for DStv, GOtv and other cable subscriptions",
    route: "/wallet/tv",
  },
  {
    imgSrc: ElectricityIcon,
    alt: "Lightning bolt icon",
    label: "Electricity",
    description: "Pay your electricity bills instantly",
    route: "/wallet/electricity",
  },
  // NON-VTU FEATURES — Contribution removed from bills page
]);

const products = ref([
  {
    id: 1,
    name: "Electricity",
    description: "Power your home and workplace",
    icon: ElectricityIcon,
    bgColor: "bg-purple-50",
    route: "/wallet/electricity",
  },
  {
    id: 2,
    name: "Airtime",
    description: "Buy airtime top-up",
    icon: airtimeIcon,
    bgColor: "bg-yellow-50",
    route: "/wallet/airtime",
  },
  {
    id: 3,
    name: "Data",
    description: "Buy data bundles",
    icon: dataIcon,
    bgColor: "bg-blue-50",
    route: "/wallet/data",
  },
  {
    id: 4,
    name: "Tv",
    description: "Pay for DStv, GOtv and other cable subscriptions",
    icon: CableIcon,
    bgColor: "bg-red-50",
    route: "/wallet/tv",
  },
  // NON-VTU FEATURES — Contribution removed from bills page
]);

onMounted(async () => {
  await customerStore.fetchCustomer();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="sticky top-0 z-10">
      <BillPaymentHeader @back="goBack" />
    </div>

    <main class="px-4 md:px-6 lg:px-8 max-w-3xl mx-auto">
      <!-- Services Grid -->
      <div class="mt-6">
        <div class="px-4 space-y-3">
          <template v-for="product in products" :key="product.id">
            <router-link
              v-if="!product.isComingSoon"
              :to="product.route"
              class="w-full bg-white rounded-2xl p-4 flex items-center justify-between border border-gray-100 hover:bg-gray-50 transition-colors duration-200"
            >
              <div class="flex items-center space-x-4">
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center"
                  :class="product.bgColor"
                >
                  <img
                    :src="product.icon"
                    :alt="product.name"
                    class="w-8 h-8"
                  />
                </div>
                <div class="text-left">
                  <h3 class="font-semibold text-sm">{{ product.name }}</h3>
                  <p class="text-gray-600 text-sm">{{ product.description }}</p>
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </router-link>

            <!-- Non-clickable button for coming soon items -->
            <div
              v-else
              class="w-full bg-white rounded-2xl p-4 flex items-center justify-between border border-gray-100 opacity-70 cursor-not-allowed"
            >
              <div class="flex items-center space-x-4">
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center"
                  :class="product.bgColor"
                >
                  <img
                    :src="product.icon"
                    :alt="product.name"
                    class="w-8 h-8"
                  />
                </div>
                <div class="text-left">
                  <h3 class="font-semibold text-sm">{{ product.name }}</h3>
                  <p class="text-gray-600 text-sm">{{ product.description }}</p>
                  <span class="text-xs text-purple-600 font-medium"
                    >Coming Soon!</span
                  >
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Base styles */
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
