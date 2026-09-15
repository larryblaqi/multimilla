<!-- components/actions/QuickActions.vue -->
<script setup>
import {
  Wallet,
  UserCircle,
  PiggyBank,
  Receipt,
  Send,
  CreditCard,
} from "lucide-vue-next";

const actions = [
  {
    id: 1,
    name: "Pay Bills",
    icon: Receipt,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    id: 2,
    name: "Transfer",
    icon: Send,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    id: 3,
    name: "Profile",
    icon: UserCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    id: 4,
    name: "Invest",
    icon: PiggyBank,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  {
    id: 5,
    name: "Cards",
    icon: CreditCard,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    id: 6,
    name: "Wallet",
    icon: Wallet,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
];
</script>

<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h2 class="text-lg font-semibold mb-4">Quick Actions</h2>
    <div class="grid grid-cols-3 gap-4">
      <button
        v-for="action in actions"
        :key="action.id"
        class="flex flex-col items-center p-4 rounded-lg transition-all hover:shadow-md"
        :class="action.bgColor"
      >
        <component
          :is="action.icon"
          class="w-6 h-6 mb-2"
          :class="action.color"
        />
        <span class="text-sm font-medium text-gray-700">{{ action.name }}</span>
      </button>
    </div>
  </div>
</template>
