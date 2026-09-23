<template>
  <div
    class="hidden lg:flex flex-col w-64 bg-white border-r h-screen sticky top-0"
  >
    <div class="fixed flex flex-col top-0 left-0 w-64 bg-white h-full border-r">
      <!-- Logo Section -->
      <!-- <div class="flex items-center justify-center h-14 border-b">
        <div class="flex items-center gap-4">
          <img
            src="../../assets/images/lg.png"
            alt="Bank Logo"
            class="h-10 w-10"
          />
          <div class="text-2xl font-bold text-red-800">Multi Milla</div>
        </div>
      </div> -->

      <div class="overflow-y-auto overflow-x-hidden flex-grow">
        <nav class="p-4">
          <!-- Menu Items (Dashboard) -->
          <div class="space-y-2">
            <h2 class="px-2 text-sm font-semibold text-gray-600 mb-3">
              Dashboard
            </h2>
            <router-link
              v-for="item in menuItems"
              :key="item.path"
              :to="item.path"
              class="flex items-center p-2 rounded-lg transition-colors duration-200"
              :class="[
                isActive(item.path)
                  ? 'bg-red-50 text-red-600'
                  : 'hover:bg-gray-100',
              ]"
            >
              <i
                :class="[
                  item.icon,
                  isActive(item.path) ? 'text-red-600' : 'text-blue-500',
                ]"
                class="w-6"
              ></i>
              <span class="ml-3">{{ item.label }}</span>
            </router-link>
          </div>

          <!-- Service Items -->
          <div class="mt-8 space-y-2">
            <h2 class="px-2 text-sm font-semibold text-gray-600 mb-3">
              Services
            </h2>
            <router-link
              v-for="item in serviceItems"
              :key="item.path"
              :to="item.path"
              class="flex items-center p-2 rounded-lg transition-colors duration-200"
              :class="[
                isActive(item.path)
                  ? 'bg-red-50 text-red-600'
                  : 'hover:bg-gray-100',
              ]"
            >
              <i
                :class="[
                  item.icon,
                  item.color,
                  isActive(item.path) ? 'text-red-600' : '',
                ]"
                class="w-6"
              ></i>
              <span class="ml-3">{{ item.label }}</span>
            </router-link>
          </div>

          <!-- Account Items -->
          <div class="mt-8 space-y-2">
            <h2 class="px-2 text-sm font-semibold text-gray-600 mb-3">
              Account
            </h2>
            <router-link
              v-for="item in accountItems"
              :key="item.path"
              :to="item.path"
              class="flex items-center p-2 rounded-lg transition-colors duration-200"
              :class="[
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-600'
                  : 'hover:bg-gray-100',
              ]"
            >
              <i
                :class="[
                  item.icon,
                  item.color,
                  isActive(item.path) ? 'text-blue-600' : '',
                ]"
                class="w-6"
              ></i>
              <span class="ml-3">{{ item.label }}</span>
            </router-link>
          </div>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { computed } from "vue";

const route = useRoute();
const currentPath = computed(() => route.path);

const menuItems = [
  {
    icon: "fas fa-home",
    label: "Home",
    path: "/wallet",
    color: "text-blue-500",
  },
];

const serviceItems = [
  {
    icon: "fas fa-mobile-alt",
    label: "Airtime Topup",
    path: "/wallet/airtime",
    color: "text-blue-500",
  },
  {
    icon: "fas fa-wifi",
    label: "Data",
    path: "/wallet/data",
    color: "text-green-500",
  },
  {
    icon: "fas fa-tv",
    label: "Tv Subscriptions",
    path: "/wallet/tv",
    color: "text-purple-500",
  },
  {
    icon: "fas fa-bolt",
    label: "Electricity",
    path: "/wallet/electricity",
    color: "text-purple-600",
  },
  // NON-VTU FEATURES (Uncomment on command)
  {
    icon: "fas fa-money-bill-wave",
    label: "Financials",
    path: "/wallet/finance",
    color: "text-yellow-500",
  },
  {
    icon: "fas fa-university",
    label: "Banks",
    path: "/wallet/banks",
    color: "text-red-500",
  },
];
const accountItems = [
  {
    icon: "fas fa-history",
    label: "History",
    path: "/transactions",
    color: "text-indigo-500",
  },
  {
    icon: "fas fa-user-circle",
    label: "My Profile",
    path: "/wallet/profile",
    color: "text-teal-500",
  },
];

const isActive = (path) => {
  return route.path === path || route.path.startsWith(path + "/");
};
</script>
