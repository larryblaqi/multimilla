<script setup>
import { defineProps, computed, ref, watch } from "vue";
import { XMarkIcon, BellIcon } from "@heroicons/vue/24/outline";
import LoadingSpin from "../modal/LoadingSpin.vue";
import { formatTimestamp } from "../../utils/globals";
import { useCustomerStore } from "../../store";
import { storeToRefs } from "pinia";

const props = defineProps({
  notifications: Array,
  isLoadingMessages: Boolean,
  isOpen: Boolean,
});

const emit = defineEmits(["update:isOpen"]);

// Get unread count from store
const customerStore = useCustomerStore();
const { unreadCount } = storeToRefs(customerStore);

const sortedNotifications = computed(() => {
  return props.notifications
    ? [...props.notifications].sort((a, b) => b.id - a.id)
    : [];
});

// Watch for sidebar opening and mark notifications as read
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    // Mark all notifications as read when sidebar is opened
    await customerStore.markAllNotificationsAsRead();
  }
});

const closeSidebar = () => {
  emit("update:isOpen", false);
};

const getNotificationClass = (isFirst, isLast) => {
  return {
    "first:rounded-t-lg": isFirst,
    "last:rounded-b-lg": isLast,
    "border-b last:border-b-0": true,
  };
};
</script>

<template>
  <!-- Desktop Sidebar -->
  <aside
    class="hidden lg:flex flex-col w-80 bg-white border-l border-gray-200 h-screen sticky top-0 "
  >
    <div
      class="p-4 border-b border-gray-200 flex justify-between items-center bg-white/95 backdrop-blur sticky top-0 z-10"
    >
      <h2 class="font-semibold text-gray-800 text-lg">Recent Messages</h2>
      <div class="relative">
        <button class="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <BellIcon class="w-6 h-6 text-gray-600" />
          <span
            v-if="unreadCount > 0"
            class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse"
          >
            {{ unreadCount }}
          </span>
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-auto">
      <div
        v-if="isLoadingMessages"
        class="flex justify-center items-center py-12"
      >
        <LoadingSpin class="w-8 h-8" />
      </div>

      <div
        v-else-if="sortedNotifications.length === 0"
        class="text-center py-12 px-4"
      >
        <BellIcon class="mx-auto w-12 h-12 text-gray-300 mb-4" />
        <p class="text-gray-500 text-sm">No New Messages</p>
      </div>

      <div v-else class="divide-y divide-gray-100">
        <div
          v-for="(activity, index) in sortedNotifications"
          :key="activity?.id"
          :class="[
            'p-4 hover:bg-gray-50/80 transition-all cursor-pointer group',
            getNotificationClass(
              index === 0,
              index === sortedNotifications.length - 1
            ),
          ]"
        >
          <div class="flex justify-between items-start gap-4">
            <h3
              class="font-medium text-gray-900 group-hover:text-blue-600 transition-colors"
            >
              {{ activity?.title }}
            </h3>
            <span class="text-xs text-gray-400 whitespace-nowrap">
              {{ formatTimestamp(activity.created_at) }}
            </span>
          </div>
          <p class="text-sm text-gray-600 mt-1 line-clamp-2">
            {{ activity?.body }}
          </p>
        </div>
      </div>
    </div>
  </aside>

  <!-- Mobile Sidebar -->
  <div
    v-if="isOpen"
    class="lg:hidden fixed inset-0 bg-gray-600 bg-opacity-75 z-40 transition-opacity duration-300"
    @click.prevent="closeSidebar"
  ></div>

  <aside
    :class="[
      'lg:hidden fixed inset-y-0 right-0 w-80 bg-white z-50 transform transition-all duration-300 ease-in-out shadow-xl',
      isOpen ? 'translate-x-0' : 'translate-x-full',
    ]"
  >
    <div class="h-full flex flex-col">
      <div
        class="p-4 border-b border-gray-200 flex justify-between items-center bg-white/95 backdrop-blur sticky top-0 z-10"
      >
        <h2 class="font-semibold text-gray-800 text-lg">Recent Messages</h2>
        <button
          class="p-2 rounded-full hover:bg-gray-100 transition-colors"
          @click.prevent="closeSidebar"
        >
          <XMarkIcon class="h-6 w-6 text-gray-600" />
        </button>
      </div>

      <div class="flex-1 overflow-auto">
        <div
          v-if="isLoadingMessages"
          class="flex justify-center items-center py-12"
        >
          <LoadingSpin class="w-8 h-8" />
        </div>

        <div
          v-else-if="sortedNotifications.length === 0"
          class="text-center py-12 px-4"
        >
          <BellIcon class="mx-auto w-12 h-12 text-gray-300 mb-4" />
          <p class="text-gray-500 text-sm">No New Messages</p>
        </div>

        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="(activity, index) in sortedNotifications"
            :key="activity?.id"
            :class="[
              'p-4 hover:bg-gray-50/80 transition-all cursor-pointer group',
              getNotificationClass(
                index === 0,
                index === sortedNotifications.length - 1
              ),
            ]"
          >
            <div class="flex justify-between items-start gap-4">
              <h3
                class="font-medium text-gray-900 group-hover:text-blue-600 transition-colors"
              >
                {{ activity?.title }}
              </h3>
              <span class="text-xs text-gray-400 whitespace-nowrap">
                {{ formatTimestamp(activity.created_at) }}
              </span>
            </div>
            <p class="text-sm text-gray-600 mt-1 line-clamp-2">
              {{ activity?.body }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
