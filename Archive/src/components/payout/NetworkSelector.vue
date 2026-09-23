<script setup>
import { computed, defineProps, ref } from "vue";
import { BanknotesIcon, ChevronDownIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  accountNumber: String,
  banks: Array,
  error: String,
  accountVerificationError: String,
  loading: Boolean,
  loadingVerification: Boolean,
  selectedBank: Object,
  account: Object,
  disabled: Boolean,
});

const emit = defineEmits([
  "update:accountNumber",
  "selectBank",
  "clear-error",
  "handle-accountvalidation",
  "clear-accounts",
]);
const isDropdownOpen = ref(false);
const searchQuery = ref("");
const accountInputFocused = ref(false);

const handleFocus = () => {
  accountInputFocused.value = true;
  emit("clear-accounts");
  emit("clear-error");
};

const handleBlur = () => {
  accountInputFocused.value = false;
  emit("handle-accountvalidation");
};

const selectBank = (bank) => {
  emit("selectBank", bank);
  isDropdownOpen.value = false;
};

const filteredBanks = computed(() => {
  const allBanks = props.banks || [];

  if (!searchQuery.value) return allBanks;

  const query = searchQuery.value.toLowerCase();
  return allBanks.filter(
    (bank) =>
      bank.name.toLowerCase().includes(query) ||
      bank.code.toLowerCase().includes(query)
  );
});

const formatAccountNumber = (number) => {
  if (!number) return "";
  const cleaned = number.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`;
  }
  return number;
};
</script>

<template>
  <!-- Form Header -->
  <div class="mb-8 mt-8">
    <h1 class="text-2xl md:text-3xl font-bold mb-2 text-gray-600">
      Bank Account Details
    </h1>
    <p class="text-gray-600 text-sm md:text-base">
      Select your bank and enter your account number
    </p>
  </div>

  <div class="space-y-6">
    <!-- Bank Selection -->
    <div class="space-y-2">
      <div class="relative">
        <button
          @click="isDropdownOpen = !isDropdownOpen"
          class="w-full transition-all duration-200 rounded-xl px-4 py-3.5 text-left flex justify-between items-center bg-gray-50 backdrop-blur-sm"
          :class="{
            'border-primary-500 ring-4 ring-primary-100':
              isDropdownOpen && !error,
            'opacity-50 cursor-not-allowed': disabled || loading,
          }"
          :disabled="disabled || loading"
        >
          <div class="flex items-center gap-3">
            <div v-if="loading" class="animate-pulse">
              <div class="h-8 w-8 bg-gray-200 rounded-full"></div>
            </div>
            <template v-else-if="selectedBank">
              <div class="flex items-center gap-3">
                <BanknotesIcon class="h-6 w-6 text-gray-600" />
                <span class="font-medium text-gray-900 text-sm">
                  {{ selectedBank.name }}
                </span>
              </div>
            </template>
            <span v-else class="text-gray-400 text-sm">Select your bank</span>
          </div>
          <ChevronDownIcon
            class="w-5 h-5 text-gray-400 transition-transform duration-300"
            :class="{ 'rotate-180': isDropdownOpen }"
          />
        </button>

        <!-- Dropdown -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform -translate-y-2 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform -translate-y-2 opacity-0"
        >
          <div
            v-if="isDropdownOpen"
            class="absolute w-full mt-2 bg-white rounded-xl border shadow-lg overflow-hidden z-20"
            v-click-outside="() => (isDropdownOpen = false)"
          >
            <!-- Search -->
            <div class="p-3 border-b">
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search banks..."
                  class="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                  @click.stop
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1115 3.65a7.5 7.5 0 011.65 12.65z"
                  />
                </svg>
              </div>
            </div>

            <!-- Bank List -->
            <div class="max-h-64 overflow-y-auto">
              <template v-if="filteredBanks.length">
                <button
                  v-for="bank in filteredBanks"
                  :key="bank.code"
                  @click="selectBank(bank)"
                  class="w-full p-4 text-left hover:bg-gray-50 text-gray-700 flex items-center gap-3 transition-colors border-b border-gray-100 last:border-0"
                >
                  <div class="flex flex-col">
                    <span class="font-medium">{{ bank.name }}</span>
                  </div>
                </button>
              </template>
              <div
                v-else
                class="p-8 text-center text-gray-500 flex flex-col items-center"
              >
                <span class="block mb-2">No banks found</span>
                <span class="text-sm text-gray-400"
                  >Try a different search term</span
                >
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Account Number Input -->
    <div class="space-y-2">
      <div class="relative">
        <input
          type="tel"
          placeholder="Enter account number"
          :value="formatAccountNumber(accountNumber)"
          @input="
            $emit(
              'update:accountNumber',
              $event.target.value.replace(/\D/g, '')
            )
          "
          @focus="handleFocus"
          @blur="handleBlur"
          maxlength="10"
          :disabled="disabled"
          class="w-full pl-4 pr-10 py-3.5 rounded-xl bg-gray-50 backdrop-blur-sm transition-all duration-200 text-gray-900 text-sm placeholder:text-gray-400"
          :class="[
            error
              ? 'border border-red-500 focus:border-red-500 focus:ring-red-200'
              : 'border-gray-200 focus:border-primary-500 focus:ring-primary-200',
            'focus:outline-none focus:ring-4',
            accountInputFocused
              ? 'border-primary-500 ring-4 ring-primary-100'
              : '',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
          ]"
        />
        <!-- Loading Spinner -->

        <div
          v-if="loadingVerification"
          class="absolute right-3 top-1/2 transform -translate-y-1/2"
        >
          <svg
            class="animate-spin h-5 w-5 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </div>
    </div>

    <!--account name-->

    <div v-if="account" class="mt-4 p-4 border rounded">
      <p>{{ account?.accountName }}</p>
    </div>
    <div v-if="accountVerificationError" class="mt-4 p-4 border rounded">
      <p class="text-red-700">{{ accountVerificationError }}</p>
    </div>
  </div>
</template>

<style scoped>
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 2px;
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

input:focus::placeholder {
  color: #a1a1aa;
  transition: color 0.2s ease;
}

button:not(:disabled):hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
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
