<script setup>
import { computed, defineProps, ref } from "vue";
import { PhoneIcon, ChevronDownIcon } from "@heroicons/vue/24/outline";

import mtnLogo from "../../assets/images/mtn.svg";
import airtelLogo from "../../assets/images/airtel.svg";
import gloLogo from "../../assets/images/glo.svg";
import etisalatLogo from "../../assets/images/9.svg";
import ProviderGrid from "../skeletons/ProviderGrid.vue";

const props = defineProps({
  modelValue: String,
  phone: String,
  serviceProviders: Array,
  error: String,
  loading: Boolean,
});
const isDropdownOpen = ref(false);
const searchQuery = ref("");
const imageLoadErrors = ref({});
const phoneInputFocused = ref(false);

const selectProvider = (serviceID) => {
  emit("update:modelValue", serviceID);
  isDropdownOpen.value = false;
};

const emit = defineEmits(["update:modelValue", "update:phone", "clear-error"]);

const handleFocus = () => {
  phoneInputFocused.value = true;
  emit("clear-error");
};
const handleBlur = () => {
  phoneInputFocused.value = false;
};

const serviceProviderImages = {
  "mtn-data": mtnLogo,
  "airtel-data": airtelLogo,
  "glo-data": gloLogo,
  "etisalat-data": etisalatLogo,
};

const filteredProviders = computed(() => {
  const localProviders = props.serviceProviders.filter(
    (provider) =>
      !provider.serviceID.toLowerCase().includes("smile-direct") &&
      !provider.serviceID.toLowerCase().includes("spectranet") &&
      !provider.serviceID.toLowerCase().includes("9mobile-sme-data") &&
      !provider.serviceID.toLowerCase().includes("glo-sme-data")
  );

  if (!searchQuery.value) return localProviders;
  const query = searchQuery.value.toLowerCase();
  return localProviders.filter((provider) =>
    provider.serviceID.toLowerCase().includes(query)
  );
});

const getProviderImage = (serviceID) => {
  return serviceProviderImages[serviceID];
};

const handleImageError = (serviceID) => {
  imageLoadErrors.value[serviceID] = true;
};

const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{4})(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`;
  }
  return phone;
};
</script>

<template>
  <div class="mb-8 mt-8">
    <h1 class="text-2xl md:text-3xl font-bold mb-2 text-gray-600">Buy Mobile Data</h1>
    <p class="text-gray-600 text-sm md:text-base">
      Purchase airtime for any network provider instantly
    </p>
  </div>

  <div class="space-y-6">
    <!-- Phone Number Input -->
    <div class="space-y-2">
      <!-- <label class="block text-sm md:text-base font-medium text-gray-700 mb-4"
        >Phone Number</label
      > -->
      <div class="relative">
        <!-- <div
          class="absolute inset-y-0 left-0 flex items-center pl-4"
          :class="{ 'text-primary-600': phoneInputFocused }"
        >
          <PhoneIcon
            class="h-5 w-5"
            :class="phoneInputFocused ? 'text-primary-600' : 'text-gray-400'"
          />
        </div> -->
        <input
          type="tel"
          placeholder="Enter recipient's number"
          :value="formatPhoneNumber(phone)"
          @input="$emit('update:phone', $event.target.value.replace(/\D/g, ''))"
          @focus="handleFocus"
          @blur="handleBlur"
          maxlength="15"
          class="w-full pl-4 pr-4 py-3.5 rounded-xl bg-gray-50 backdrop-blur-sm transition-all duration-200 text-gray-900 text-sm placeholder:text-gray-400"
          :class="[
            error
              ? 'border border-red-500 focus:border-red-500 focus:ring-red-200'
              : 'border-gray-200 focus:border-primary-500 focus:ring-primary-200',
            'focus:outline-none focus:ring-4',
            phoneInputFocused
              ? 'border-primary-500 ring-4 ring-primary-100'
              : '',
          ]"
        />
        <!-- <div
          v-if="error"
          class="absolute left-0 -bottom-6 text-red-500 text-sm err-text"
        >
          {{ error }}
        </div> -->
      </div>
    </div>
    <div class="space-y-2">
      <!-- <label class="block text-sm md:text-base font-medium text-gray-700 mb-4"
        >Service Provider</label
      > -->
      <div class="relative">
        <button
          @click.prevent="isDropdownOpen = !isDropdownOpen"
          class="w-full transition-all duration-200 rounded-xl px-4 py-3.5 text-left flex justify-between items-center bg-gray-50 backdrop-blur-sm"
          :class="{
            'border-primary-500 ring-4 ring-primary-100':
              isDropdownOpen && !error,
            'opacity-50 cursor-not-allowed': loading,
          }"
          :disabled="loading"
        >
          <div class="flex items-center gap-3">
            <div v-if="loading" class="animate-pulse">
              <div class="h-8 w-8 bg-gray-200 rounded-full"></div>
            </div>
            <template v-else-if="modelValue">
              <div class="relative h-8 w-8">
                <img
                  :src="getProviderImage(modelValue)"
                  class="h-8 w-8 object-contain rounded-full"
                  :alt="modelValue"
                  @error="handleImageError(modelValue)"
                />
              </div>
              <span class="font-medium text-gray-900 text-lg">{{
                modelValue
              }}</span>
            </template>
            <span v-else class="text-gray-400 text-sm placeholder:text-gray-400"
              >Select your provider</span
            >
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
                  placeholder="Search networks..."
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

            <!-- Provider List -->
            <div class="max-h-64 overflow-y-auto">
              <template v-if="filteredProviders.length">
                <button
                  v-for="provider in filteredProviders"
                  :key="provider.serviceID"
                  @click.prevent="selectProvider(provider.serviceID)"
                  class="w-full p-4 text-left hover:bg-gray-50 text-gray-700 flex items-center gap-3 transition-colors border-b border-gray-100 last:border-0"
                >
                  <div class="relative h-8 w-8 flex-shrink-0">
                    <img
                      :src="getProviderImage(provider.serviceID)"
                      class="h-8 w-8 object-contain rounded-full"
                      :alt="provider.serviceID"
                      @error="handleImageError(provider.serviceID)"
                    />
                    <div
                      v-if="imageLoadErrors[provider.serviceID]"
                      class="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-full"
                    >
                      <span class="text-gray-400 text-xs">Logo</span>
                    </div>
                  </div>
                  <div class="flex flex-col">
                    <span class="font-medium">{{ provider.serviceID }}</span>
                    <span class="text-sm text-gray-500">Top up instantly</span>
                  </div>
                </button>
              </template>
              <div
                v-else
                class="p-8 text-center text-gray-500 flex flex-col items-center"
              >
                <span class="block mb-2">No providers found</span>
                <span class="text-sm text-gray-400"
                  >Try a different search term</span
                >
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

