<script setup>
import { computed, defineProps, defineEmits } from "vue";
import { useRoute } from "vue-router";
import { useCustomerStore } from "../../store";
import { storeToRefs } from "pinia";
import {
  BellIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon,
} from "@heroicons/vue/24/outline";
import BrandLogo from "../header/BrandLogo.vue";
import ProfileAvatar from "../header/ProfileAvatar.vue";
import NotificationBell from "../header/NotificationBell.vue";

import userIcon from "../../assets/images/profile-big.40164a24.svg";

const props = defineProps({
  Cusfirstname: String,
  notifications: Array,
});

const emit = defineEmits(["emitShowNotification"]);

const route = useRoute();
const showDefaultHeader = computed(() => route.path === "/wallet");

// Get unread count from store
const customerStore = useCustomerStore();
const { unreadCount } = storeToRefs(customerStore);
</script>

<template>
  <!-- <header
    v-if="showDefaultHeader"
    class="bg-white px-4 py-3 safe-area-top border-b border-gray-100"
  >
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        <img :src="userIcon" alt="No transactions" class="w-8 h-8" />

        <div>
          <p class="text-sm text-gray-500">Hi,</p>
          <p class="font-semibold">{{ Cusfirstname }}</p>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <button @click.prevent="emit('emitShowNotification')">
          <div class="relative">
            <BellIcon class="w-6 h-6 text-gray-600" />
            <span
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1"
            >
              {{ notifications?.length }}
            </span>
          </div>
        </button>
      </div>
    </div>
  </header> -->
  <!-- <header
    v-if="showDefaultHeader"
    class="bg-white px-4 py-3 safe-area-top border-b border-gray-100"
  >
    <div class="flex items-center justify-between">
      <ProfileAvatar />
      <BrandLogo />
      <NotificationBell />
    </div>
  </header> -->
  <header
    v-if="showDefaultHeader"
    class="bg-white px-4 py-3 safe-area-top border-b border-gray-00/20"
  >
    <div class="flex items-center justify-between max-w-screen-xl mx-auto">
      <!-- Left: Profile Avatar -->
      <div class="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
        <img :src="userIcon" alt="Profile" class="w-full h-full object-cover" />
      </div>

      <!-- Center: Petrol Padi Logo -->
      <!-- <div class="flex items-center">
        <div class="text-blue-800 font-bold text-xl flex items-center gap-1">
          <span>Multi Milla</span>
        </div>
      </div> -->

      <!-- Right: Notification Bell -->
      <button @click.prevent="emit('emitShowNotification')">
        <div class="relative">
          <BellIcon class="w-6 h-6 text-gray-600" />
          <span
            v-if="unreadCount > 0"
            class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
          >
            {{ unreadCount }}
          </span>
        </div>
      </button>
    </div>
  </header>
</template>

<style scoped>
header {
  position: sticky;
  top: 0;
  z-index: 50;
}

</style>
