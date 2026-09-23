<script setup>
import { ref, defineProps, defineEmits } from "vue";
import { ChevronDownIcon } from "@heroicons/vue/24/outline";
import Spinner from "../modal/SpinnerComp.vue";
import { formatMoney } from "../../utils/globals";

const props = defineProps({
  investmentDetailsProp: {
    type: Object,
    required: true,
  },
  usersList: {
    type: Array,
    default: () => [],
  },
  isLoading: Boolean,
});

const activeTab = ref("summary");

const emit = defineEmits([
  "update:modelValue",
  "selectCompany",
  "clear-error",
  "emitInvestmentRequest",
  "emitBlurEventAmountInput",
]);
</script>

<template>
  <div class="max-w-7xl mx-auto bg-white overflow-hidden">
    <!-- Loading Overlay -->

    <!-- Tabs Navigation -->
    <div class="border-b border-gray-200">
      <nav class="flex -mb-px">
        <button
          @click="activeTab = 'summary'"
          :class="[
            'px-6 py-3 font-medium',
            activeTab === 'summary'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700',
          ]"
        >
          Contribution Summary
        </button>
        <button
          @click="activeTab = 'users'"
          :class="[
            'px-6 py-3 font-medium ml-8',
            activeTab === 'users'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700',
          ]"
        >
          Board List
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="p-6">
      <!-- Summary Tab -->
      <div v-if="activeTab === 'summary'" class="space-y-3">
        <div class="flex justify-between items-center">
          <span class="text-gray-600 text-md">Package Name</span>
          <span class="text-gray-600">
            {{ investmentDetailsProp.package_name }}
          </span>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-gray-600 text-md">Amount Contributed</span>
          <span class="font-semibold">
            ₦{{ formatMoney(investmentDetailsProp.your_details.amount) }}
          </span>
        </div>

        <!-- <div class="flex justify-between items-center">
          <span class="text-gray-600 text-md">Circle Status</span>
          <span class="font-semibold">
            <span
              :class="[
                'px-2 py-1 rounded-lg text-xs font-semibold',
                investmentDetailsProp.is_completed === 1
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800',
              ]"
            >
              {{
                investmentDetailsProp.is_completed === 1
                  ? "Completed"
                  : "Active"
              }}
            </span>
          </span>
        </div> -->

        <div class="flex justify-between items-center">
          <span class="text-gray-600 text-md">Total spots</span>
          <span class="font-semibold">
            {{ investmentDetailsProp.board_status.total_spots }}
          </span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600 text-md">Filled Spot</span>
          <span class="font-semibold">
            {{ investmentDetailsProp.board_status.filled_spots }}
          </span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600 text-md">Remaining Spots</span>
          <span class="font-semibold">
            {{ investmentDetailsProp.board_status.overall_remaining_spots }}
          </span>
        </div>
      </div>

      <!-- Users Table Tab -->
      <div v-if="activeTab === 'users'" class="overflow-x-auto">
        <div class="max-h-[400px] overflow-y-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Position
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  User ID
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Amount
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Joined
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Level
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <template
                v-for="(
                  members, position
                ) in investmentDetailsProp.board_members"
                :key="position"
              >
                <tr
                  v-for="member in members"
                  :key="member.customer_id"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ position }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ member.customer_id }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₦{{ formatMoney(member.amount) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ member.created_at }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ member.level }}
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center py-4">
          <Spinner />
        </div>

        <!-- Empty State -->
        <div
          v-if="
            investmentDetailsProp.board_members &&
            investmentDetailsProp.board_members.length === 0
          "
          class="text-center py-4 text-gray-500"
        >
          No users found
        </div>
      </div>
    </div>
  </div>
</template>

