<script setup>
import { computed, defineProps } from "vue";
import { useCustomerStore } from "../../store";
import { BellIcon } from "@heroicons/vue/24/outline";
import { formatTimestamp } from "../../utils/globals";
import LoadingSpin from "../modal/LoadingSpin.vue";

const props = defineProps({
  notifications: {
    type: Array,
    default: [],
  },
  loading: Boolean,
});

const customerStore = useCustomerStore();
const { unreadNotifications } = storeToRefs(customerStore);

// Computed property to sort notifications by ID in descending order
const sortedNotifications = computed(() => {
  return [...props.notifications].sort((a, b) => b.id - a.id);
});

// Function to check if notification is unread
const isUnread = (notificationId) => {
  return unreadNotifications.value.some(notif => notif.id === notificationId);
};

// Function to mark individual notification as read
const markAsRead = async (notificationId) => {
  await customerStore.markNotificationAsRead(notificationId);
};
</script>

<template>
  <div class="space-y-4">
    <!-- Loading Spinner -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <LoadingSpin />
    </div>

    <!-- No Transactions Message -->
    <div
      v-else-if="notifications.length === 0"
      class="text-center py-8 text-gray-500 no-transaction flex flex-col items-center justify-center"
    >
      <BellIcon class="w-12 h-12 text-gray-400 mb-4" />
      <p>No New Messages</p>
    </div>

    <!-- Notifications List -->
    <div v-else class="max-h-[700px] overflow-y-auto scroll-smooth">
      <div
        v-for="activity in sortedNotifications"
        :key="activity?.id"
        @click="markAsRead(activity.id)"
        class="p-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors"
        :class="{ 'bg-blue-50 border-l-4 border-l-blue-500': isUnread(activity.id) }"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="font-medium" :class="{ 'text-blue-900': isUnread(activity.id) }">
              {{ activity?.title }}
            </h3>
            <p class="text-sm text-gray-600 mt-1">{{ activity?.body }}</p>
            <span class="text-xs text-gray-400 mt-2 block">
              {{ formatTimestamp(activity.created_at) }}
            </span>
          </div>
          <div v-if="isUnread(activity.id)" class="ml-2">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>


/* Custom scrollbar styles */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
