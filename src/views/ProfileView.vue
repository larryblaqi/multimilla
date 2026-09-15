<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from "vue";

import {
  UserCircleIcon,
  KeyIcon,
  BellIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  CalendarIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShieldExclamationIcon,
  WalletIcon,
  LockClosedIcon,
  DocumentTextIcon,
  TrashIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  CheckIcon,
} from "@heroicons/vue/24/outline";
import { useCustomerStore } from "../store";
import { storeToRefs } from "pinia";
import { useHttp } from "../composables/useHttp";
import { useRouter } from "vue-router";
import { Preferences } from "@capacitor/preferences";

import ProfileHeader from "../components/profile/ProfileHeader.vue";
import Spinner from "../components/modal/SpinnerComp.vue";

const customerStore = useCustomerStore();
const { customer, tvVariations, isLoadingProvider, isLoadingCustomerData, dataPlans } =
  storeToRefs(customerStore);
const { httpRequest } = useHttp();
const router = useRouter();

const isLoadingRequest = ref(false);

const walletBalance = ref(true);

// Check if both NIN and BVN are verified
const isFullyVerified = computed(() => {
  return customer.value?.nin && customer.value?.bvn;
});

// Update privacy security items with verification status
const updatedPrivacySecurityItems = computed(() => {
  return privacySecurityItems.map(item => {
    if (item.action === 'verifyNin') {
      return {
        ...item,
        isVerified: isFullyVerified.value,
        label: isFullyVerified.value ? "Verified" : "Verify NIN/BVN"
      };
    }
    return item;
  });
});

// Profile information
const profileInfo = computed(() => {
  const c = customer.value;
  const fullName = (c?.full_name || [c?.first_name, c?.last_name].filter(Boolean).join(' ')).trim();

  let formattedDate = "Not available";
  const rawDate = c?.dateJoined || c?.created_at;
  if (rawDate) {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      formattedDate = d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  } else if (isLoadingCustomerData.value) {
    formattedDate = "Loading...";
  }

  return [
    {
      id: 1,
      label: "Full Name",
      value: fullName || (isLoadingCustomerData.value ? "Loading..." : "Not provided"),
      icon: UserCircleIcon,
    },
    {
      id: 2,
      label: "Email",
      value: c?.email || (isLoadingCustomerData.value ? "Loading..." : "Not provided"),
      icon: EnvelopeIcon,
    },
    {
      id: 3,
      label: "Phone",
      value: c?.phone || (isLoadingCustomerData.value ? "Loading..." : "Not provided"),
      icon: PhoneIcon,
    },
    {
      id: 4,
      label: "Date Joined",
      value: formattedDate,
      icon: CalendarIcon,
    },
  ];
});

// Profile settings with toggles
const profileSettings = [
  {
    id: 1,
    label: "Wallet Balance",
    icon: WalletIcon,
    action: 'toggleWalletBalance'
  },
];

// Privacy & Security section
const privacySecurityItems = [
  {
    id: 2,
    label: "Reset PIN",
    icon: KeyIcon,
    action: 'resetPin'
  },
  {
    id: 3,
    label: "Reset Phone Number",
    icon: PhoneIcon,
    action: 'resetPhone'
  },
  {
    id: 4,
    label: "Verify NIN/BVN",
    icon: ShieldExclamationIcon,
    action: 'verifyNin',
    isVerified: false
  },
];

// More section
const moreItems = [
  {
    id: 1,
    label: "Legal",
    icon: DocumentTextIcon,
    action: 'legal'
  },
  {
    id: 2,
    label: "Deactivate/Delete Account",
    icon: TrashIcon,
    action: 'deactivateAccount'
  },
  {
    id: 3,
    label: "Logout",
    icon: ArrowRightOnRectangleIcon,
    action: 'logout',
    isDestructive: true
  },
];

// Action handlers
const handleAction = async (action) => {
  switch (action) {
    case 'toggleWalletBalance':
      await toggleWalletBalance();
      break;
    case 'resetPassword':
      router.push('/wallet/reset-password');
      break;
    case 'resetPin':
      router.push('/wallet/reset-pin');
      break;
    case 'resetPhone':
      router.push('/wallet/reset-phone');
      break;
    case 'verifyNin':
      router.push('/wallet/verify-nin');
      break;
    case 'legal':
      router.push('/wallet/legal');
      break;
    case 'deactivateAccount':
      router.push('/wallet/deactivate-account');
      break;
    case 'logout':
      await logOutUser();
      break;
    default:
      console.log('Unknown action:', action);
  }
};

const logOutUser = async () => {
  try {
    isLoadingRequest.value = true;
    const response = await httpRequest("POST", "/customer/signOutCustomer");
    await Preferences.remove({ key: "token" });
    router.push("/login");
  } catch (error) {
    console.log("error");
  } finally {
    isLoadingRequest.value = false;
  }
};

// Toggle implementations

const toggleWalletBalance = async () => {
  walletBalance.value = !walletBalance.value;
  await Preferences.set({
    key: "showBalance",
    value: String(walletBalance.value),
  });
  
  // Emit event to update other components
  window.dispatchEvent(new CustomEvent('balanceVisibilityChanged', {
    detail: { showBalance: walletBalance.value }
  }));
};

// Load saved preferences
const loadPreferences = async () => {
  try {
    // Load wallet balance preference
    const { value: balanceValue } = await Preferences.get({ key: "showBalance" });
    if (balanceValue !== null) {
      walletBalance.value = balanceValue === "true";
    }
    
    // Listen for global balance visibility changes
    window.addEventListener('balanceVisibilityChanged', handleBalanceVisibilityChange);
  } catch (error) {
    console.error('Error loading preferences:', error);
  }
};

// Handle global balance visibility changes
const handleBalanceVisibilityChange = (event) => {
  walletBalance.value = event.detail.showBalance;
};

onMounted(async () => {
  await customerStore.fetchCustomer();
  await loadPreferences();
});

onUnmounted(() => {
  // Clean up event listeners
  window.removeEventListener('balanceVisibilityChanged', handleBalanceVisibilityChange);
});

const goBack = () => router.back();
const goToHistory = () => router.push("/transactions");
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="sticky top-0 z-10">
      <ProfileHeader @back="goBack" @history="goToHistory" />
    </div>
    <main class="px-4 md:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      <div class="space-y-6 mt-5">
        <!-- Profile Information Section -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="p-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">Profile Information</h3>
          </div>
          <div
            v-for="(item, index) in profileInfo"
            :key="index"
            class="flex items-center justify-between p-4 hover:bg-gray-50 border-b last:border-b-0"
          >
            <div class="flex items-center gap-3">
              <component :is="item.icon" class="w-5 h-5 text-gray-400" />
              <span class="text-sm font-medium text-gray-700">{{ item.label }}</span>
            </div>
            <div class="text-sm text-gray-600">
              {{ item.value }}
            </div>
          </div>
        </div>

        <!-- Profile Settings Section -->
        <!-- <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="p-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">Profile Settings</h3>
          </div>
          <div
            v-for="(item, index) in profileSettings"
            :key="index"
            class="flex items-center justify-between p-4 hover:bg-gray-50 border-b last:border-b-0"
          >
            <div class="flex items-center gap-3">
              <component :is="item.icon" class="w-5 h-5 text-gray-400" />
              <span class="text-sm font-medium text-gray-700">{{ item.label }}</span>
            </div>
            <button
              @click="handleAction(item.action)"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              :class="walletBalance ? 'bg-red-600' : 'bg-gray-200'"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                :class="walletBalance ? 'translate-x-6' : 'translate-x-1'"
              />
            </button>
          </div>
        </div> -->

        <!-- Privacy & Security Section -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="p-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">Privacy & Security</h3>
          </div>
          <div
            v-for="(item, index) in updatedPrivacySecurityItems"
            :key="index"
            @click="handleAction(item.action)"
            class="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
          >
            <div class="flex items-center gap-3">
              <component 
                :is="item.isVerified ? CheckIcon : item.icon" 
                class="w-5 h-5"
                :class="item.isVerified ? 'text-green-500' : 'text-gray-400'"
              />
              <span 
                class="text-sm font-medium"
                :class="item.isVerified ? 'text-green-600' : 'text-gray-700'"
              >
                {{ item.label }}
              </span>
            </div>
            <ChevronRightIcon 
              class="w-4 h-4"
              :class="item.isVerified ? 'text-green-500' : 'text-gray-400'"
            />
          </div>
        </div>

        <!-- More Section -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="p-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">More</h3>
          </div>
          <div
            v-for="(item, index) in moreItems"
            :key="index"
            @click="handleAction(item.action)"
            class="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
            :class="{ 'text-red-600': item.isDestructive }"
          >
            <div class="flex items-center gap-3">
              <component 
                :is="item.icon" 
                class="w-5 h-5"
                :class="item.isDestructive ? 'text-red-600' : 'text-gray-400'"
              />
              <span 
                class="text-sm font-medium"
                :class="item.isDestructive ? 'text-red-600' : 'text-gray-700'"
              >
                {{ item.label }}
              </span>
            </div>
            <ChevronRightIcon 
              class="w-4 h-4"
              :class="item.isDestructive ? 'text-red-600' : 'text-gray-400'"
            />
          </div>
        </div>

        <!-- Version Information -->
        <div class="text-center py-4">
          <p class="text-sm text-gray-500">Version 1.1.3 (28)</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Mobile-first responsive design */
@media (max-width: 640px) {
  .sticky {
    position: sticky;
    backdrop-filter: blur(8px);
    background-color: rgba(255, 255, 255, 0.95);
  }
}
</style>
