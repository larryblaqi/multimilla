<script setup>
import { ref, defineProps, defineEmits, computed } from "vue";
import {
  ChevronDownIcon,
  CheckIcon,
  ClipboardIcon,
  ChevronRightIcon,
} from "@heroicons/vue/24/outline";
import LoadingSpin from "../modal/LoadingSpin.vue";
import { formatTransactionDate } from "../../utils/globals";

const props = defineProps({
  companies: {
    type: Array,
    required: true,
  },
  investments: {
    type: Array,
    required: true,
  },
  activities: {
    type: Array,
    required: true,
  },
  isLoadingPlans: Boolean,
  error: {
    type: String,
    default: "",
  },
});

const activeTab = ref("companies");
const searchQuery = ref("");
const investmentSearchQuery = ref("");
const selectedPackage = ref(null);
const showPackages = ref(false);

// Get all companies for a package name including all levels
const getAllLevelsForPackage = (companies, packageName) => {
  return companies
    .filter((company) => company.package_name === packageName)
    .sort((a, b) => a.level - b.level);
};

// Get only level 1 companies
const getLevel1Companies = (companies) => {
  return companies.filter((company) => company.level === 1);
};

// Package filters computation
const packageFilters = computed(() => {
  const uniquePackages = new Set(
    props.companies.map((company) => company.package_name)
  );
  return Array.from(uniquePackages)
    .map((packageName) => {
      const packagesWithLevels = props.companies.filter(
        (company) => company.package_name === packageName
      );
      return {
        name: packageName,
        count: packagesWithLevels.length,
        levels: [...new Set(packagesWithLevels.map((p) => p.level))].sort(),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
});

// Updated filtered companies computation
const filteredCompanies = computed(() => {
  const query = searchQuery.value.toLowerCase();

  // If packages are hidden and no package is selected, return empty array
  if (!showPackages && !selectedPackage.value) {
    return [];
  }

  // Start with the original companies array
  let filtered = [...props.companies];

  // Apply search filter
  if (query) {
    filtered = filtered.filter(
      (company) =>
        company.package_name.toLowerCase().includes(query) ||
        (company.board_id && company.board_id.toLowerCase().includes(query))
    );
  }

  // If a package is selected, show all levels for that package
  if (selectedPackage.value) {
    filtered = getAllLevelsForPackage(filtered, selectedPackage.value);
  } else {
    // If no package is selected, only show level 1 packages
    filtered = getLevel1Companies(filtered);
  }

  // Remove duplicates while keeping all levels for selected package
  const uniqueMap = new Map();
  filtered.forEach((company) => {
    const key = `${company.package_name}-${company.level}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, company);
    }
  });

  return Array.from(uniqueMap.values()).sort((a, b) => {
    if (a.package_name !== b.package_name) {
      return a.package_name.localeCompare(b.package_name);
    }
    return a.level - b.level;
  });
});

const filteredInvestments = computed(() => {
  const query = investmentSearchQuery.value.toLowerCase();
  return props.activities.filter(
    (investment) =>
      investment.package_name.toLowerCase().includes(query) ||
      investment.amount.toString().includes(query)
  );
});

// Handle package filter selection
const selectPackageFilter = (packageName) => {
  selectedPackage.value = packageName;
  showPackages.value = true;
};

// Reset package selection and hide packages
const resetFilters = () => {
  selectedPackage.value = null;
  searchQuery.value = "";
  showPackages.value = false;
};

const emit = defineEmits([
  "selectCompany",
  "clear-error",
  "emitSelectInvestmentView",
]);

const selectedCompany = ref(null);

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatMinMoney = (amount) => {
  const amt = Number(amount);
  return amt.toLocaleString();

};

const copiedStates = ref({});

const calculateProgress = (filled, remaining) => {
  const total = filled + remaining;
  return total > 0 ? (filled / total) * 100 : 0;
};

const formatProgress = (value) => {
  return Math.round(value);
};

const selectCompanyLocale = (company) => {
  selectedCompany.value = company;
  emit("selectCompany", company);
  emit("clear-error");
};

const copyToClipboard = async (text, investmentId) => {
  try {
    await navigator.clipboard.writeText(text);
    copiedStates.value[investmentId] = true;
    setTimeout(() => {
      copiedStates.value[investmentId] = false;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
};

const selectInvestmentView = (item) => {
  emit("emitSelectInvestmentView", item);
};
</script>

<template>
  <div>
    <!-- Tab Navigation -->
    <div class="border-b border-gray-200 mb-4">
      <nav class="-mb-px flex space-x-8">
        <button
          @click.prevent="activeTab = 'companies'"
          :class="[
            activeTab === 'companies'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:text-base',
          ]"
        >
          Contribution Packages
        </button>
        <button
          @click.prevent="activeTab = 'investments'"
          :class="[
            activeTab === 'investments'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:text-base',
          ]"
        >
          My Contributions
        </button>
      </nav>
    </div>

    <!-- Content -->
    <div class="space-y-4">
      <!-- Loading State -->
      <div v-if="isLoadingPlans" class="flex justify-center items-center py-8">
        <LoadingSpin />
      </div>

      <!-- Companies Tab Content -->
      <div v-else-if="activeTab === 'companies'" class="space-y-4">
        <!-- Search Bar -->
        <div class="relative">
          <input
            type="search"
            placeholder="Search package name or board Id..."
            class="w-full py-3 pl-10 pr-4 text-sm bg-gray-50 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-red-500"
            v-model="searchQuery"
          />
          <div
            class="absolute inset-y-0 left-3 flex items-center pointer-events-none"
          >
            <svg
              class="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <!-- Amount Filters -->
        <!-- <div class="relative mb-6">
          <div
            class="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-3"
          >
            <button
              v-for="filter in amountFilters"
              :key="filter.id"
              @click.prevent="selectedAmountFilter = filter.id"
              :class="[
                'px-4 py-2.5 text-sm font-medium rounded-xl border-2 transition-all duration-200',
                'flex items-center justify-center',
                selectedAmountFilter === filter.id
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50',
              ]"
            >
              <span class="hidden md:inline">{{ filter.label }}</span>
              <span class="md:hidden">{{ filter.shortLabel }}</span>
            </button>
          </div>
        </div> -->

        <!-- Package Filters -->
        <div class="flex flex-wrap gap-2 mb-4">
          <button
            v-for="package_ in packageFilters"
            :key="package_.name"
            @click.prevent="selectPackageFilter(package_.name)"
            :class="[
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
              selectedPackage === package_.name
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            ]"
          >
            {{ package_.name }}
            <!-- <span class="ml-1 text-xs opacity-75">({{ package_.count }})</span> -->
          </button>
        </div>
        <div class="mt-4" v-if="showPackages">
          <button
            @click.prevent="resetFilters"
            class="px-4 py-2 rounded-full text-sm font-medium bg-gray-300 text-gray-700 hover:bg-gray-400 transition-all duration-200"
          >
            Reset
          </button>
        </div>
        <!-- Company List -->
        <div class="bg-white rounded-lg" v-if="showPackages">
          <div
            v-if="filteredCompanies.length === 0"
            class="p-4 text-center text-gray-500"
          >
            No packages found
          </div>
          <div v-else class="divide-y divide-gray-200">
            <!-- Pricing Plan Style Company List -->
            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
              <div
                v-for="company in filteredCompanies"
                :key="company.code"
                class="relative flex flex-col p-6 bg-white border-2 border-gray-200 rounded-2xl shadow-sm hover:border-red-200 transition-all duration-200"
              >
                <!-- Package Header -->
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <div
                      class="w-12 h-12 flex-shrink-0 bg-red-50 rounded-xl overflow-hidden flex items-center justify-center"
                    >
                      <img
                        v-if="company.logo"
                        :src="company.logo"
                        :alt="company.package_name"
                        class="w-full h-full object-cover"
                      />
                      <span v-else class="text-xl font-semibold text-red-600">
                        {{ company.package_name[0] }}
                      </span>
                    </div>
                    <div class="text-right">
                      <p class="text-lg font-bold text-gray-900">
                        ₦{{ formatMinMoney(company.minimum_investment) }}
                      </p>
                      <p class="text-sm text-gray-500">
                        Level {{ company.level }}
                      </p>
                    </div>
                  </div>

                  <h3 class="mt-4 text-md font-semibold text-gray-600">
                    {{ company.package_name }}
                  </h3>
                  <p class="mt-2 text-sm text-gray-500">
                    {{ company.subtitle }}
                  </p>

                  <!-- Progress Bar -->
                  <div class="mt-4">
                    <div class="flex justify-between text-sm mb-1">
                      <span class="text-gray-500 mb-1">Available Spots</span>
                      <span class="font-medium text-gray-900">
                        {{ company.remaining_spots }} left
                      </span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        class="bg-green-600 h-2.5 rounded-full"
                        :style="`width: ${calculateProgress(
                          company.filled_spots,
                          company.remaining_spots
                        )}%`"
                      ></div>
                    </div>
                  </div>

                  <!-- Features List -->
                  <!-- <ul class="mt-6 space-y-3">
                    <li class="flex items-start">
                      <CheckIcon class="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span class="ml-3 text-sm text-gray-600"
                        >Monthly returns</span
                      >
                    </li>
                    <li class="flex items-start">
                      <CheckIcon class="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span class="ml-3 text-sm text-gray-600"
                        >12 months duration</span
                      >
                    </li>
                    <li class="flex items-start">
                      <CheckIcon class="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span class="ml-3 text-sm text-gray-600"
                        >15% annual returns</span
                      >
                    </li>
                  </ul> -->
                </div>

                <!-- Action Button -->
                <button
                  @click.prevent="selectCompanyLocale(company)"
                  class="mt-6 w-full px-4 py-3 text-sm font-medium text-white bg-red-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  Contribute 
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Investment List - Enhanced Design -->
      <div v-if="activeTab === 'investments'" class="space-y-4">
        <!-- Investment Search Bar -->
        <div class="relative mb-6">
          <input
            type="search"
            placeholder="Search your contributions..."
            class="w-full py-3.5 pl-11 pr-4 text-sm bg-gray-50 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-red-500"
            v-model="investmentSearchQuery"
          />
          <div
            class="absolute inset-y-0 left-3 flex items-center pointer-events-none"
          >
            <svg
              class="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div v-if="filteredInvestments.length === 0" class="text-center py-8">
          <div class="text-gray-400">
            <svg
              class="mx-auto h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p class="mt-4 text-sm text-gray-500">No Contribution found</p>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="investment in filteredInvestments"
            :key="investment.id"
            class="bg-white rounded-xl border-2 border-gray-200 hover:border-indigo-200 transition-all duration-200 cursor-pointer overflow-hidden"
          >
            <div class="p-4 sm:p-5">
              <!-- Board ID Copy Section -->
              <div class="mt-4 border-gray-100 pt-4">
                <!-- <label class="block text-sm font-medium text-gray-700 mb-2">
                  Board ID
                </label> -->
                <div class="relative w-full">
                  <input
                    type="text"
                    :value="investment.board_id"
                    readonly
                    class="w-full py-2 pl-3 pr-10 bg-gray-50 text-gray-400 text-sm rounded-lg focus:ring-0 cursor-default"
                    @click.stop
                  />
                  <button
                    @click.stop="
                      copyToClipboard(investment.board_id, investment.board_id)
                    "
                    class="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-gray-500 hover:text-red-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    :title="
                      copiedStates[investment.board_id]
                        ? 'Copied!'
                        : 'Copy to clipboard'
                    "
                  >
                    <CheckIcon
                      v-if="copiedStates[investment.board_id]"
                      class="h-5 w-5 text-green-500"
                    />
                    <ClipboardIcon v-else class="h-5 w-5" />
                  </button>
                </div>
              </div>

              <!-- Investment Header -->
              <div class="flex items-start justify-between mb-4 mt-4">
                <div>
                  <h3 class="text-lg font-semibold text-gray-600 mb-1">
                    {{ investment.package_name }}
                  </h3>
                  <p class="text-sm text-gray-500">
                    Contributed on
                    {{ formatTransactionDate(investment.created_at) }}
                  </p>
                </div>
                <span
                  :class="[
                    'px-3 py-1 text-xs font-semibold rounded-full',
                    investment.status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800',
                  ]"
                >
                  {{ investment.status === "paid" ? "PAID" : "Active" }}
                </span>
              </div>

              <!-- Investment Details -->
              <div
                class="grid grid-cols-2 sm:grid-cols-3 gap-4 py-3 border-t border-gray-100"
              >
                <div>
                  <p class="text-sm text-gray-500 mb-1">Contribution Amount</p>
                  <p class="text-lg font-semibold text-gray-900">
                    {{ formatCurrency(investment.amount) }}
                  </p>
                </div>
                <!-- <div>
                  <p class="text-sm text-gray-500 mb-1">Monthly Returns</p>
                  <p class="text-lg font-semibold text-green-600">
                    {{ formatCurrency(calculateROI(investment)) }}
                  </p>
                </div> -->
                <!-- <div class="col-span-2 sm:col-span-1">
                  <p class="text-sm text-gray-500 mb-1">Duration</p>
                  <p class="text-lg font-semibold text-gray-900">12 Months</p>
                </div> -->
              </div>

              <!-- Progress Bar (if active) -->
              <div class="mt-2">
                <!-- <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-500">Investment Progress</span>
                  <span class="font-medium text-gray-900">
                    {{
                      formatProgress(
                        calculateProgress(
                          investment.total_filled_spots,
                          investment.total_remaining_spots
                        )
                      )
                    }}%
                  </span>
                </div> -->
                <!-- <div class="w-full bg-gray-100 rounded-full h-2">
                  <div
                    class="bg-green-600 h-2 rounded-full"
                    :style="`width: ${calculateProgress(
                      investment.total_filled_spots,
                      investment.total_remaining_spots
                    )}%`"
                  ></div>
                </div> -->
              </div>

              <!-- Action Link -->
              <div
                class="mt-4 flex items-center justify-end text-sm text-red-600 font-medium"
              >
                <button
                  @click.prevent="selectInvestmentView(investment)"
                  class="text-sm text-red-600 font-medium"
                >
                  View Details
                  <!-- <ChevronRightIcon class="ml-1 h-4 w-4" /> -->
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hide scrollbar but keep functionality */
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Mobile-first responsive styles */
@media (max-width: 640px) {
  .max-w-3xl {
    width: 100%;
  }

  .px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
/* Enhanced responsive styles */
@media (max-width: 640px) {
  .filter-grid {
    gap: 0.5rem;
  }
}

/* Smooth transitions */
button {
  transition: all 0.2s ease-in-out;
}

/* Additional styles for copy feature */
input::selection {
  background-color: rgba(79, 70, 229, 0.1);
}

.copied-tooltip {
  animation: fadeOut 2s forwards;
}

@keyframes fadeOut {
  0% {
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

/* Active state enhancement */
button:active {
  transform: scale(0.98);
}

/* Enhanced card hover effects */
.hover\:shadow-lg:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Progress bar animation */
.rounded-full {
  transition: width 0.5s ease-in-out;
}

/* Smooth scrolling for iOS */
* {
  -webkit-overflow-scrolling: touch;
}
</style>
