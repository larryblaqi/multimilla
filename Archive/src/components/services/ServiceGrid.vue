<script setup >
import {
  DevicePhoneMobileIcon,
  WifiIcon,
  PuzzlePieceIcon,
  TvIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  HeartIcon,
  MapIcon,
  BoltIcon,
} from "@heroicons/vue/24/outline";
import { useRouter } from "vue-router";

const router = useRouter();

const services = [
  {
    id: 1,
    name: "Airtime",
    icon: DevicePhoneMobileIcon,
    // badge: "Up to 8%",
    route: "/wallet/airtime",
  },
  { id: 2, name: "Data", icon: WifiIcon, route: "/wallet/data" },
  { id: 4, name: "TV", icon: TvIcon, route: "/wallet/tv" },
  { id: 3, name: "Electricity", icon: BoltIcon },
  { id: 8, name: "Finance", icon: BanknotesIcon, route: "/wallet/finance" },
];

const handleServiceClick = (service) => {
  if (service.route) {
    router.push(service.route);
  }
};
</script>

<template>
  <div class="lg:hidden grid grid-cols-3 gap-2 bg-white rounded-lg  p-3 border-gray-200">
    <button
      v-for="service in services"
      :key="service.id"
      @click="handleServiceClick(service)"
      class="flex flex-col items-center p-4 relative group"
    >
      <div class="bg-gray-100 rounded-full p-3 mb-2 group-hover:bg-gray-200 transition-colors">
        <component
          :is="service.icon"
          class="w-6 h-6 text-red-600 font-bold"
        />
      </div>
      <p class="text-gray-500 text-xs">{{ service.name }}</p>
      <span
        v-if="service.badge"
        class="absolute top-0 right-0 bg-red-500 text-white text-xs px-1"
      >
        {{ service.badge }}
      </span>
    </button>
  </div>
</template>

