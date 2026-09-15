<template>
  <div class="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-3">
    <router-link
      v-for="action in actions"
      :key="action.id"
      :to="action.path === 'cards' ? '/cards' : `/wallet/${action.path}`"
      class="group flex flex-col items-center justify-center gap-1.5 py-3 px-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
    >
      <div
        class="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-colors duration-200"
        :class="action.accent ? 'bg-red-50 group-hover:bg-red-100' : 'bg-gray-50 group-hover:bg-gray-100'"
      >
        <component
          :is="action.icon"
          class="w-5 h-5 sm:w-5 sm:h-5 transition-colors"
          :class="action.accent ? 'text-red-600' : 'text-gray-600 group-hover:text-red-600'"
        />
      </div>
      <span class="text-xs font-semibold text-gray-700 text-center leading-tight">
        {{ action.name }}
      </span>
    </router-link>
  </div>
</template>

<script setup>
import {
  BanknotesIcon,
  ArrowPathIcon,
  TvIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CreditCardIcon,
} from "@heroicons/vue/24/outline";

const actions = [
  { id: 1, name: "Bills",         icon: TvIcon,            path: "bill-payment",  accent: true  },
  { id: 2, name: "Contribute",    icon: BanknotesIcon,     path: "finance",       accent: false },
  { id: 3, name: "Withdraw",      icon: ArrowPathIcon,     path: "withdraw",      accent: false },
  { id: 4, name: "Loan",          icon: CurrencyDollarIcon, path: "loan",         accent: true  },
  { id: 5, name: "Fixed Deposit", icon: ChartBarIcon,      path: "fixed-deposit", accent: false },
  { id: 6, name: "Cards",         icon: CreditCardIcon,    path: "cards",         accent: false },
];
</script>
