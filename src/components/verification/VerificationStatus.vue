<template>
  <div class="bg-white rounded-lg border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">Identity Verification</h3>
      <div v-if="allVerified" class="flex items-center text-green-600">
        <svg class="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span class="text-sm font-medium">All Verified</span>
      </div>
    </div>

    <div class="space-y-4">
      <!-- NIN Status -->
      <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
          </div>
          <div>
            <h4 class="font-medium text-gray-900">NIN (National Identification Number)</h4>
            <p class="text-sm text-gray-500">
              {{ ninStatus.provided ? `****${ninStatus.value?.slice(-4)}` : 'Not provided' }}
            </p>
          </div>
        </div>
        <div class="flex items-center">
          <div v-if="ninStatus.verified" class="flex items-center text-green-600">
            <svg class="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="text-sm font-medium">Verified</span>
          </div>
          <div v-else class="flex items-center text-orange-500">
            <svg class="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <span class="text-sm font-medium">Pending</span>
          </div>
        </div>
      </div>

      <!-- BVN Status -->
      <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h4 class="font-medium text-gray-900">BVN (Bank Verification Number)</h4>
            <p class="text-sm text-gray-500">
              {{ bvnStatus.provided ? `****${bvnStatus.value?.slice(-4)}` : 'Not provided' }}
            </p>
          </div>
        </div>
        <div class="flex items-center">
          <div v-if="bvnStatus.verified" class="flex items-center text-green-600">
            <svg class="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="text-sm font-medium">Verified</span>
          </div>
          <div v-else class="flex items-center text-orange-500">
            <svg class="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <span class="text-sm font-medium">Pending</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Button -->
    <div v-if="!allVerified" class="mt-6">
      <button
        @click="$emit('verify-required')"
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
      >
        Complete Verification
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  verificationStatus: {
    type: Object,
    required: true,
    default: () => ({
      nin: { provided: false, verified: false, value: null },
      bvn: { provided: false, verified: false, value: null }
    })
  }
})

const emit = defineEmits(['verify-required'])

const ninStatus = computed(() => props.verificationStatus.nin)
const bvnStatus = computed(() => props.verificationStatus.bvn)
const allVerified = computed(() => ninStatus.value.verified && bvnStatus.value.verified)
</script>

