<script setup>
import { onMounted, ref, computed } from "vue";
import { useCustomerStore } from "../store";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

import { ArrowLeftIcon, ArrowDownTrayIcon } from "@heroicons/vue/24/outline";
import NotificationHeader from "../components/notifications/NotificationHeader.vue";
import NotificationList from "../components/notifications/NotificationList.vue";

const router = useRouter();
const selectedMonth = ref("Dec");
const selectedCategory = ref("All Categories");
const selectedStatus = ref("All Status");

const goBack = () => router.back();

const customerStore = useCustomerStore();
const { customer, notifications, isLoadingCustomerData } =
  storeToRefs(customerStore);

onMounted(async () => {
  await customerStore.fetchCustomer();
  // Mark all notifications as read when viewing the notifications page
  await customerStore.markAllNotificationsAsRead();
});
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="lg:hidden">
      <NotificationHeader @back="goBack" />
    </div>

    <main class="p-4 max-w-2xl mx-auto">
      <NotificationList
        :notifications="notifications"
        :loading="isLoadingCustomerData"
      />
    </main>
  </div>
</template>


