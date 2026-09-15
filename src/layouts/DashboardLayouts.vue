<script setup>
import { onMounted, onUnmounted, ref, computed } from "vue";
import { useCustomerStore } from "../store";
import { storeToRefs } from "pinia";
import { RouterView } from "vue-router";

import DesktopSidebar from "../components/layout/DesktopSidebar.vue";
import RightSidebar from "../components/layout/RightSidebar.vue";
import MobileBottomNav from "../components/layout/MobileBottomNav.vue";
import MobileHeader from "../components/layout/MobileHeader.vue";

const customerStore = useCustomerStore();
const { customer, notifications, isLoadingCustomerData } =
  storeToRefs(customerStore);

const isSidebarOpen = ref(false);

const handleToggleNotifications = async () => {
  isSidebarOpen.value = true;
  await customerStore.markAllNotificationsAsRead();
};

const firstName = computed(() => {
  if (customer.value) {
    return customer.value.first_name || customer.value.full_name?.split(" ")[0] || "";
  }
  return "";
});

// ── Smartsupp Live Chat ──────────────────────────────────────────
const injectSmartsuppChat = () => {
  if (document.getElementById('smartsupp-script')) return; // already loaded

  window._smartsupp = window._smartsupp || {};
  window._smartsupp.key = 'YOUR_SMARTSUPP_KEY'; // ← Replace with your Smartsupp key

  const script = document.createElement('script');
  script.id = 'smartsupp-script';
  script.type = 'text/javascript';
  script.async = true;
  script.src = 'https://www.smartsuppchat.com/loader.js?';
  document.head.appendChild(script);
};

const removeSmartsuppChat = () => {
  // Hide chat widget when leaving dashboard (optional — keeps it loaded for perf)
  if (window.smartsupp) {
    window.smartsupp('chat:hide');
  }
};
// ────────────────────────────────────────────────────────────────

onMounted(async () => {
  if (!customer.value || !customer.value.id) {
    await customerStore.fetchCustomer();
  }
  if (customerStore.providers.length === 0) {
    await customerStore.fetchServiceAirtimeIds();
  }

  // Inject Smartsupp after data loads
  injectSmartsuppChat();

  // Pre-fill Smartsupp with customer info when available
  if (customer.value && window.smartsupp) {
    window.smartsupp('name', customer.value.full_name || customer.value.first_name || '');
    window.smartsupp('email', customer.value.email || '');
  }
});

onUnmounted(() => {
  removeSmartsuppChat();
});
</script>

<template>
  <div class="flex min-h-screen bg-gray-50">
    <!-- Left Sidebar (desktop only) -->
    <DesktopSidebar />

    <!-- Main content area -->
    <div class="flex-1 flex flex-col min-h-screen min-w-0">
      <MobileHeader
        :Cusfirstname="firstName"
        :notifications="notifications"
        @emitShowNotification="handleToggleNotifications"
      />
      <main class="flex-1 bg-white pb-[calc(72px+env(safe-area-inset-bottom))] lg:pb-0">
        <RouterView v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </main>
    </div>

    <!-- Right notification sidebar (desktop only by default, mobile via overlay) -->
    <RightSidebar
      :notifications="notifications"
      v-model:isOpen="isSidebarOpen"
      :isLoadingMessages="isLoadingCustomerData"
    />

    <!-- Mobile bottom nav -->
    <MobileBottomNav v-if="$route.path === '/wallet'" />
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* iOS safe area support */
@supports (padding-top: env(safe-area-inset-top)) {
  .safe-area-top {
    padding-top: env(safe-area-inset-top);
  }
  .safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>
