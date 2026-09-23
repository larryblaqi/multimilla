<script setup>
import { ref, onMounted, watch, computed } from "vue";

import { useCustomerStore } from "../store";
import { storeToRefs } from "pinia";
import { useHttp } from "../composables/useHttp";
import { useRouter } from "vue-router";

import BankHeader from "../components/profile/BankHeader.vue";
import LoadingSpin from "../components/modal/LoadingSpin.vue";
import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/vue/24/outline";

const customerStore = useCustomerStore();
const { customer, accounts, isLoadingCustomerData } =
  storeToRefs(customerStore);
const { httpRequest } = useHttp();
const router = useRouter();

const copiedStates = ref({});

const formatAccountNumber = (number) => {
  return number.replace(/(.{4})/g, "$1 ").trim();
};

const copyToClipboard = async (text, accountId) => {
  try {
    await navigator.clipboard.writeText(text);
    copiedStates.value[accountId] = true;
    setTimeout(() => {
      copiedStates.value[accountId] = false;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
};

onMounted(async () => {
  await customerStore.fetchCustomer();
});

const goBack = () => router.back();
const goToHistory = () => router.push("/transactions");
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="sticky top-0 z-10">
      <BankHeader @back="goBack" @history="goToHistory" />
    </div>
    <main class="px-4 md:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      <div class="space-y-6 mt-5">
        <div
          v-if="isLoadingCustomerData"
          class="flex justify-center items-center py-8"
        >
          <LoadingSpin />
        </div>
        <div class="bg-white rounded-xl shadow-sm overflow-hidden" v-else>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="account in accounts"
              :key="account.id"
              class="relative bg-red-700 rounded-lg p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <!-- Account Number with Copy Button -->
                  <div class="flex items-center gap-2 mb-1">
                    <h2 class="text-md font-mono">
                      {{ formatAccountNumber(account.account_number) }}
                    </h2>
                    <button
                      @click="copyToClipboard(account.account_number, account.id)"
                      class="p-1 text-blue-100 hover:text-white hover:bg-white/20 rounded transition-colors"
                      :title="
                        copiedStates[account.id]
                          ? 'Copied!'
                          : 'Copy account number'
                      "
                    >
                      <CheckIcon 
                        v-if="copiedStates[account.id]" 
                        class="w-4 h-4" 
                      />
                      <ClipboardDocumentIcon 
                        v-else 
                        class="w-4 h-4" 
                      />
                    </button>
                  </div>
                  <p class="text-xs text-blue-100 mb-2">Account Number</p>

                  <!-- Account Holder and Type -->
                  <div class="flex justify-between items-end">
                    <div class="uppercase tracking-wider text-sm">
                      <p class="text-xs font-medium truncate">
                        {{ account.account_name }}
                      </p>
                    </div>
                    <div class="text-right">
                      <p class="text-xs uppercase font-medium">
                        {{ account.bank_name }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>

/* Mobile-first responsive design */
@media (max-width: 640px) {
  .sticky {
    position: sticky;
    backdrop-filter: blur(8px);
    background-color: rgba(255, 255, 255, 0.95);
  }
}
</style>
