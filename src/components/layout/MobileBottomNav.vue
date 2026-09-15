<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  HomeIcon,
  ClockIcon,
  WalletIcon,
  UserIcon,
  PlusCircleIcon,
} from "@heroicons/vue/24/outline";
import {
  HomeIcon as HomeSolid,
  ClockIcon as ClockSolid,
  WalletIcon as WalletSolid,
  UserIcon as UserSolid,
  PlusCircleIcon as PlusCircleSolid,
  PlusIcon
} from "@heroicons/vue/24/solid";

const route = useRoute();
const router = useRouter();

const navItems = [
  {
    name: "Home",
    path: "/wallet",
    icon: HomeSolid,
    activeIcon: HomeSolid,
  },
  {
    name: "History",
    path: "/transactions",
    icon: ClockIcon,
    activeIcon: ClockSolid,
  },
  {
    name: "Profile",
    path: "/wallet/profile",
    icon: UserIcon,
    activeIcon: UserSolid,
  },
];

const currentPath = computed(() => route.path);
const isActive = (path) => currentPath.value === path;
</script>

<template>
  <nav
    class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-2 safe-area-bottom"
  >
    <div class="flex justify-between items-center">
      <button
        v-for="item in navItems"
        :key="item.name"
        @click.prevent="router.push(item.path)"
        class="flex flex-col items-center gap-1 py-1 px-3 active:opacity-70 touch-manipulation font-bold"
      >
        <component
          :is="isActive(item.path) ? item.activeIcon : item.icon"
          class="w-6 h-6"
          :class="isActive(item.path) ? 'text-red-600' : 'text-gray-500'"
        />
        <span
          class="text-xs"
          :class="
            isActive(item.path) ? 'text-red-600 font-bold' : 'text-gray-500'
          "
        >
          {{ item.name }}
        </span>
      </button>
    </div>
  </nav>
</template>

