<script setup>
import { onMounted, ref, computed } from "vue";
import { useCustomerStore } from "../store";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { formatMoney, formatTransactionDate } from "../utils/globals";
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PhoneIcon,
  WifiIcon,
  TvIcon,
  BoltIcon,
  CreditCardIcon,
  BanknotesIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/vue/24/outline";

const router = useRouter();
const goBack = () => router.back();

const customerStore = useCustomerStore();
const { customer, transactions, isLoadingCustomerData } = storeToRefs(customerStore);

// ─── Filters ─────────────────────────────────────────────────────────────────
const searchQuery = ref("");
const selectedMonth = ref("All");
const selectedCategory = ref("All");
const selectedStatus = ref("All");
const showFilters = ref(false);

// ─── Detail Panel ─────────────────────────────────────────────────────────────
const selectedTx = ref(null);

// ─── Helpers ─────────────────────────────────────────────────────────────────
const txTypeLabel = (type) => {
  const map = {
    airtime: "Airtime",
    data: "Data Purchase",
    tv: "TV Subscription",
    eletricity: "Electricity",
    electricity: "Electricity",
    deposit: "Deposit",
    investment: "Contribution",
    withdrawal: "Withdrawal",
    loan: "Loan",
    loan_disbursement: "Loan Disbursement",
    loan_repayment: "Loan Repayment",
    loan_auto_repayment: "Auto Loan Repayment",
    loan_cancellation: "Loan Cancellation",
    processing: "Processing Fee",
  };
  return map[type?.toLowerCase()] || type || "Transaction";
};

const isCredit = (tx) => {
  const t = tx?.type?.toLowerCase();
  return ["deposit", "loan_disbursement", "loan"].includes(t) || Number(tx?.amount) > 0;
};

const getIcon = (type) => {
  const t = type?.toLowerCase();
  if (t === "airtime") return PhoneIcon;
  if (t === "data") return WifiIcon;
  if (t === "tv") return TvIcon;
  if (["eletricity", "electricity"].includes(t)) return BoltIcon;
  if (t === "deposit") return ArrowDownIcon;
  if (t === "withdrawal") return ArrowUpIcon;
  if (["investment", "contribution"].includes(t)) return CreditCardIcon;
  if (t?.includes("loan")) return BanknotesIcon;
  return CreditCardIcon;
};

const getIconBg = (type) =>
  isCredit({ type }) ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500";

const formatStatusLabel = (status) => {
  const s = status?.toString()?.toLowerCase()?.trim();
  switch (s) {
    case "success":
    case "successful":
    case "completed":
    case "paid":
    case "delivered":
      return "Successful";
    case "processing":
      return "Processing";
    case "pending":
      return "Pending";
    case "failed":
      return "Failed";
    case "reversed":
      return "Reversed";
    case "active":
      return "Active";
    default:
      return status ? status.charAt(0).toUpperCase() + status.slice(1) : "Successful";
  }
};

const statusBadge = (status) => {
  const s = status?.toString()?.toLowerCase()?.trim();
  const map = {
    completed: "bg-emerald-100 text-emerald-700",
    delivered: "bg-emerald-100 text-emerald-700",
    paid: "bg-emerald-100 text-emerald-700",
    successful: "bg-emerald-100 text-emerald-700",
    success: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    processing: "bg-blue-100 text-blue-700",
    active: "bg-blue-100 text-blue-700",
    failed: "bg-red-100 text-red-700",
    reversed: "bg-red-100 text-red-700",
  };
  return map[s] || "bg-gray-100 text-gray-600";
};

const statusIcon = (status) => {
  const s = status?.toString()?.toLowerCase()?.trim();
  if (["completed", "delivered", "paid", "successful", "success"].includes(s)) return CheckCircleIcon;
  if (["failed", "reversed"].includes(s)) return XCircleIcon;
  return ClockIcon;
};

// ─── Available Filter Options ────────────────────────────────────────────────
const availableStatuses = ["All", "Successful", "Pending", "Processing", "Failed", "Reversed"];

const availableMonths = computed(() => {
  if (!transactions.value?.length) return ["All"];
  const months = new Set(
    transactions.value.map((t) =>
      new Date(t.created_at).toLocaleString("default", { month: "short", year: "numeric" })
    )
  );
  return ["All", ...Array.from(months)];
});

const availableCategories = computed(() => {
  if (!transactions.value?.length) return ["All"];
  const cats = new Set(transactions.value.map((t) => txTypeLabel(t.type)));
  return ["All", ...Array.from(cats)];
});

// ─── Filtered Transactions ────────────────────────────────────────────────────
const filteredTransactions = computed(() => {
  if (!transactions.value) return [];
  return transactions.value.filter((tx) => {
    const monthStr = new Date(tx.created_at).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    const monthMatch = selectedMonth.value === "All" || monthStr === selectedMonth.value;
    const catMatch =
      selectedCategory.value === "All" || txTypeLabel(tx.type) === selectedCategory.value;
    
    const normalizedTxStatus = formatStatusLabel(tx.status).toLowerCase();
    const filterStatus = selectedStatus.value.toLowerCase();
    const statusMatch =
      selectedStatus.value === "All" ||
      normalizedTxStatus === filterStatus ||
      (tx.status && tx.status.toLowerCase() === filterStatus);

    const searchMatch =
      !searchQuery.value ||
      txTypeLabel(tx.type).toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (tx.recipient || "").toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      String(tx.amount).includes(searchQuery.value);
    return monthMatch && catMatch && statusMatch && searchMatch;
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
});

// ─── Summary Stats ────────────────────────────────────────────────────────────
const totalIn = computed(() =>
  filteredTransactions.value
    .filter((t) => isCredit(t))
    .reduce((s, t) => s + Math.abs(Number(t.amount)), 0)
);
const totalOut = computed(() =>
  filteredTransactions.value
    .filter((t) => !isCredit(t))
    .reduce((s, t) => s + Math.abs(Number(t.amount)), 0)
);

// ─── Group by date ────────────────────────────────────────────────────────────
const groupedTransactions = computed(() => {
  const groups = {};
  filteredTransactions.value.forEach((tx) => {
    const d = new Date(tx.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let label;
    if (d.toDateString() === today.toDateString()) {
      label = "Today";
    } else if (d.toDateString() === yesterday.toDateString()) {
      label = "Yesterday";
    } else {
      label = d.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
    }
    if (!groups[label]) groups[label] = [];
    groups[label].push(tx);
  });
  return groups;
});

const resetFilters = () => {
  selectedMonth.value = "All";
  selectedCategory.value = "All";
  selectedStatus.value = "All";
  searchQuery.value = "";
};

const activeFilterCount = computed(
  () =>
    (selectedMonth.value !== "All" ? 1 : 0) +
    (selectedCategory.value !== "All" ? 1 : 0) +
    (selectedStatus.value !== "All" ? 1 : 0)
);

onMounted(() => customerStore.fetchCustomer());
</script>

<template>
  <div class="min-h-screen bg-gray-50">

    <!-- ─── Header ──────────────────────────────────────────────────────────── -->
    <header class="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
      <div class="flex items-center gap-3 px-4 py-4">
        <button @click="goBack" class="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeftIcon class="w-5 h-5 text-gray-700" />
        </button>
        <h1 class="text-lg font-bold text-gray-900 flex-1">Transaction History</h1>
        <button
          @click="showFilters = !showFilters"
          class="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <FunnelIcon class="w-5 h-5 text-gray-600" />
          <span
            v-if="activeFilterCount"
            class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
          >{{ activeFilterCount }}</span>
        </button>
      </div>

      <!-- Search -->
      <div class="px-4 pb-3">
        <div class="relative">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search transactions..."
            class="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
          />
        </div>
      </div>
    </header>

    <!-- ─── Filter Panel ─────────────────────────────────────────────────────── -->
    <div v-if="showFilters" class="bg-white border-b border-gray-100 px-4 py-4 space-y-3">
      <div class="flex justify-between items-center">
        <p class="text-sm font-semibold text-gray-700">Filters</p>
        <button @click="resetFilters" class="text-xs text-red-600 font-medium hover:underline">Reset All</button>
      </div>
      <div class="grid grid-cols-3 gap-2">
        <div>
          <label class="block text-xs text-gray-500 mb-1">Month</label>
          <select v-model="selectedMonth" class="w-full text-xs px-2 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-red-500 outline-none">
            <option v-for="m in availableMonths" :key="m">{{ m }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">Category</label>
          <select v-model="selectedCategory" class="w-full text-xs px-2 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-red-500 outline-none">
            <option v-for="c in availableCategories" :key="c">{{ c }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">Status</label>
          <select v-model="selectedStatus" class="w-full text-xs px-2 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-red-500 outline-none">
            <option v-for="s in availableStatuses" :key="s">{{ s }}</option>
          </select>
        </div>
      </div>
    </div>

    <main class="max-w-2xl mx-auto px-4 py-4 space-y-4">

      <!-- ─── Summary Cards ───────────────────────────────────────────────── -->
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center">
              <ArrowDownIcon class="w-4 h-4 text-emerald-600" />
            </div>
            <span class="text-xs font-medium text-gray-500">Money In</span>
          </div>
          <p class="text-lg font-bold text-emerald-600">₦{{ formatMoney(totalIn) }}</p>
        </div>
        <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center">
              <ArrowUpIcon class="w-4 h-4 text-red-500" />
            </div>
            <span class="text-xs font-medium text-gray-500">Money Out</span>
          </div>
          <p class="text-lg font-bold text-red-500">₦{{ formatMoney(totalOut) }}</p>
        </div>
      </div>

      <!-- ─── Loading ─────────────────────────────────────────────────────── -->
      <div v-if="isLoadingCustomerData" class="space-y-3">
        <div v-for="i in 5" :key="i" class="bg-white rounded-2xl p-4 flex items-center gap-3 animate-pulse">
          <div class="w-12 h-12 bg-gray-100 rounded-full flex-shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-100 rounded w-2/5"></div>
            <div class="h-3 bg-gray-100 rounded w-1/4"></div>
          </div>
          <div class="h-4 bg-gray-100 rounded w-16"></div>
        </div>
      </div>

      <!-- ─── Empty State ─────────────────────────────────────────────────── -->
      <div
        v-else-if="!filteredTransactions.length"
        class="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200"
      >
        <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <BanknotesIcon class="w-8 h-8 text-gray-300" />
        </div>
        <h3 class="font-semibold text-gray-700 mb-1">No transactions found</h3>
        <p class="text-sm text-gray-400">Try adjusting your filters</p>
        <button
          v-if="activeFilterCount || searchQuery"
          @click="resetFilters"
          class="mt-4 px-4 py-2 bg-red-600 text-white text-sm rounded-lg font-medium"
        >Clear Filters</button>
      </div>

      <!-- ─── Grouped Transaction List ────────────────────────────────────── -->
      <div v-else class="space-y-5">
        <div v-for="(txs, dateLabel) in groupedTransactions" :key="dateLabel">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">{{ dateLabel }}</p>
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
            <div
              v-for="tx in txs"
              :key="tx.id"
              @click="selectedTx = tx"
              class="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <!-- Icon -->
              <div :class="`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBg(tx.type)}`">
                <component :is="getIcon(tx.type)" class="w-5 h-5" />
              </div>

              <!-- Details -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 truncate">{{ txTypeLabel(tx.type) }}</p>
                <p class="text-xs text-gray-400 mt-0.5">
                  {{ tx.recipient ? `To: ${tx.recipient}` : formatTransactionDate(tx.created_at) }}
                </p>
              </div>

              <!-- Amount + Status -->
              <div class="text-right flex-shrink-0">
                <p
                  class="text-sm font-bold"
                  :class="isCredit(tx) ? 'text-emerald-600' : 'text-gray-900'"
                >
                  {{ isCredit(tx) ? '+' : '-' }}₦{{ formatMoney(Math.abs(tx.amount || 0)) }}
                </p>
                <span
                  class="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5"
                  :class="statusBadge(tx.status)"
                >{{ formatStatusLabel(tx.status) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p class="text-center text-xs text-gray-400 pb-6">
        Showing {{ filteredTransactions.length }} transaction{{ filteredTransactions.length !== 1 ? 's' : '' }}
      </p>
    </main>

    <!-- ─── Detail Slide-Up Modal ────────────────────────────────────────────── -->
    <Teleport to="body">
      <div
        v-if="selectedTx"
        class="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
        @click.self="selectedTx = null"
      >
        <div class="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
          <!-- Handle -->
          <div class="flex justify-center pt-3 pb-1">
            <div class="w-10 h-1.5 bg-gray-200 rounded-full"></div>
          </div>

          <div class="px-5 pb-8">
            <!-- Icon + amount -->
            <div class="text-center py-6">
              <div
                :class="`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${getIconBg(selectedTx.type)}`"
              >
                <component :is="getIcon(selectedTx.type)" class="w-8 h-8" />
              </div>
              <h2 class="text-xl font-bold text-gray-900">{{ txTypeLabel(selectedTx.type) }}</h2>
              <p
                class="text-3xl font-extrabold mt-2"
                :class="isCredit(selectedTx) ? 'text-emerald-600' : 'text-gray-900'"
              >
                {{ isCredit(selectedTx) ? '+' : '-' }}₦{{ formatMoney(Math.abs(selectedTx.amount || 0)) }}
              </p>
              <span
                class="inline-flex items-center gap-1 mt-3 px-3 py-1.5 rounded-full text-sm font-semibold border"
                :class="statusBadge(selectedTx.status)"
              >
                <component :is="statusIcon(selectedTx.status)" class="w-4 h-4" />
                {{ formatStatusLabel(selectedTx.status) }}
              </span>
            </div>

            <!-- Details -->
            <div class="bg-gray-50 rounded-2xl p-4 space-y-3">
              <div v-if="selectedTx.recipient" class="flex justify-between items-start">
                <span class="text-sm text-gray-500">Recipient</span>
                <span class="text-sm font-semibold text-gray-900 text-right max-w-[60%]">{{ selectedTx.recipient }}</span>
              </div>
              <div v-if="selectedTx.transaction_type" class="flex justify-between">
                <span class="text-sm text-gray-500">Type</span>
                <span class="text-sm font-semibold text-gray-900">{{ selectedTx.transaction_type }}</span>
              </div>
              <div v-if="Number(selectedTx.processing_fee) > 0" class="flex justify-between">
                <span class="text-sm text-gray-500">Processing Fee</span>
                <span class="text-sm font-semibold text-red-500">₦{{ formatMoney(selectedTx.processing_fee) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500">Date</span>
                <span class="text-sm font-semibold text-gray-900">{{ formatTransactionDate(selectedTx.created_at) }}</span>
              </div>
              <div v-if="selectedTx.reference" class="flex justify-between">
                <span class="text-sm text-gray-500">Reference</span>
                <span class="text-sm font-semibold text-gray-900 font-mono text-right max-w-[60%] break-all">{{ selectedTx.reference }}</span>
              </div>
              <div v-if="selectedTx.element" class="flex justify-between">
                <span class="text-sm text-gray-500">Token / Voucher</span>
                <span class="text-sm font-semibold text-gray-900 text-right max-w-[60%] break-all">{{ selectedTx.element }}</span>
              </div>
            </div>

            <button
              @click="selectedTx = null"
              class="mt-5 w-full py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >Close</button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>
