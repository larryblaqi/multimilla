<script setup>
import { ref, defineProps, defineEmits, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
} from "@heroicons/vue/24/outline"; // refresh icon
import { formatMoney } from "../../utils/globals";
import { Preferences } from "@capacitor/preferences";

const props = defineProps({
  balance: {
    type: String,
    default: 0,
  },
  loading: Boolean,
});

const emit = defineEmits(["refresh"]);
const router = useRouter();
const showBalance = ref(true); // default visible

// Load preference when component mounts
onMounted(async () => {
  const { value } = await Preferences.get({ key: "showBalance" });
  if (value !== null) {
    showBalance.value = value === "true"; // stored as string
  }
  
  // Listen for global balance visibility changes
  window.addEventListener('balanceVisibilityChanged', handleBalanceVisibilityChange);
});

// Clean up event listener
onUnmounted(() => {
  window.removeEventListener('balanceVisibilityChanged', handleBalanceVisibilityChange);
});

// Handle global balance visibility changes
const handleBalanceVisibilityChange = (event) => {
  showBalance.value = event.detail.showBalance;
};

// Toggle and save preference
const toggleBalance = async () => {
  showBalance.value = !showBalance.value;
  await Preferences.set({
    key: "showBalance",
    value: String(showBalance.value),
  });
  
  // Emit event to update other components
  window.dispatchEvent(new CustomEvent('balanceVisibilityChanged', {
    detail: { showBalance: showBalance.value }
  }));
};

const refreshBalance = () => {
  emit("refresh");
};
</script>

<template>
  <div class="bg-red-700 p-4 text-white rounded-lg transition-colors duration-300">
    <div class="flex items-center gap-2 mb-4">
      <span class="text-xs">Available Balance</span>
      <button @click.prevent="toggleBalance" class="hover:bg-white/20 rounded p-1 transition-colors">
        <EyeIcon v-if="showBalance" class="w-5 h-5" />
        <EyeSlashIcon v-else class="w-5 h-5" />
      </button>
      <!-- Refresh button -->
      <button 
        @click.prevent="refreshBalance" 
        :disabled="loading"
        class="hover:bg-white/20 rounded p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ArrowPathIcon class="w-5 h-5" :class="{ 'animate-spin': loading }" />
      </button>
    </div>
    <div class="flex justify-between items-center">
      <div class="text-2xl font-bold">
        ₦ {{ showBalance ? formatMoney(balance) : "****" }}
      </div>
      <router-link
        to="/wallet/banks"
        class="bg-white text-red-700 px-4 py-2 rounded-full text-xs font-medium hover:bg-gray-50 transition-colors"
      >
        + Add Money
      </router-link>
    </div>
  </div>
</template>

<style scoped>
button {
  font-family: "Work Sans", sans-serif;
}
</style>
