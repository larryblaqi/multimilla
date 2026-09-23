<template>
  <div
    v-if="showModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-auto shadow-2xl border border-gray-100">
      <div class="text-center mb-6">
        <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">
          Complete Your KYC Verification
        </h3>
        <p class="text-sm text-gray-600 leading-relaxed mb-3">
          To keep your account secure and comply with our verification requirements, you need to complete your KYC before making a withdrawal.
        </p>
        <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium text-left">
          {{ verificationMessage }}
        </div>
      </div>

      <!-- Verification Status Display -->
      <div class="mb-6 space-y-3">
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-700">NIN</span>
          </div>
          <div class="flex items-center">
            <div v-if="verificationStatus.nin.verified" class="flex items-center text-green-600">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span class="text-xs font-medium">Verified</span>
            </div>
            <div v-else class="flex items-center text-orange-500">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <span class="text-xs font-medium">Pending</span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-700">BVN</span>
          </div>
          <div class="flex items-center">
            <div v-if="verificationStatus.bvn.verified" class="flex items-center text-green-600">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span class="text-xs font-medium">Verified</span>
            </div>
            <div v-else class="flex items-center text-orange-500">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <span class="text-xs font-medium">Pending</span>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <!-- Verification Type Selection -->
        <div class="space-y-3">
          <label class="text-sm font-medium text-gray-700">Choose verification method</label>
          <div class="flex space-x-4">
            <label class="flex items-center">
              <input
                v-model="verificationType"
                type="radio"
                value="nin"
                :disabled="verificationStatus.nin.verified"
                class="mr-2 text-red-600 focus:ring-red-500 disabled:opacity-50"
              />
              <span class="text-sm" :class="{ 'opacity-50': verificationStatus.nin.verified }">NIN</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="verificationType"
                type="radio"
                value="bvn"
                :disabled="verificationStatus.bvn.verified"
                class="mr-2 text-red-600 focus:ring-red-500 disabled:opacity-50"
              />
              <span class="text-sm" :class="{ 'opacity-50': verificationStatus.bvn.verified }">BVN</span>
            </label>
          </div>
        </div>

        <!-- NIN Input -->
        <div v-if="verificationType === 'nin'" class="space-y-2">
          <label class="text-sm font-medium text-gray-700">NIN Number</label>
          <input
            v-model="ninNumber"
            type="text"
            placeholder="Enter your 11-digit NIN"
            maxlength="11"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            :class="{ 'border-red-500': ninError }"
            @input="clearNinError"
          />
          <p v-if="ninError" class="text-sm text-red-600">{{ ninError }}</p>
        </div>

        <!-- BVN Input -->
        <div v-if="verificationType === 'bvn'" class="space-y-2">
          <label class="text-sm font-medium text-gray-700">BVN Number</label>
          <input
            v-model="bvnNumber"
            type="text"
            placeholder="Enter your 11-digit BVN"
            maxlength="11"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            :class="{ 'border-red-500': bvnError }"
            @input="clearBvnError"
          />
          <p v-if="bvnError" class="text-sm text-red-600">{{ bvnError }}</p>
        </div>

        <!-- General Error -->
        <p v-if="generalError" class="text-sm text-red-600">{{ generalError }}</p>

        <!-- Action Buttons -->
        <div class="flex space-x-3 pt-4">
          <button
            @click="closeModal"
            class="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            :disabled="isSubmitting"
          >
            Cancel
          </button>
          <button
            @click="submitVerification"
            :disabled="isSubmitting || !verificationType"
            class="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
          >
            <span v-if="isSubmitting">Verifying...</span>
            <span v-else>Complete Verification</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useHttp } from '../../composables/useHttp'

const props = defineProps({
  showModal: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: Object,
    required: true,
    default: () => ({
      nin: { provided: false, verified: false, value: null },
      bvn: { provided: false, verified: false, value: null }
    })
  },
  needsVerification: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'success', 'error'])

const { httpRequest } = useHttp()

const verificationType = ref('')
const ninNumber = ref('')
const bvnNumber = ref('')
const ninError = ref('')
const bvnError = ref('')
const generalError = ref('')
const isSubmitting = ref(false)

const verificationMessage = computed(() => {
  const ninVerified = Boolean(props.verificationStatus?.nin?.verified || props.verificationStatus?.has_nin)
  const bvnVerified = Boolean(props.verificationStatus?.bvn?.verified || props.verificationStatus?.has_bvn)

  if (ninVerified && !bvnVerified) {
    return 'You have already verified your NIN. Please provide and verify your BVN to continue.'
  } else if (bvnVerified && !ninVerified) {
    return 'You have already verified your BVN. Please provide and verify your NIN to continue.'
  } else if (!ninVerified && !bvnVerified) {
    return 'Please provide and verify your NIN and BVN to continue.'
  }
  return 'To keep your account secure and comply with our verification requirements, you need to complete your KYC before making a withdrawal.'
})

// Auto-select verification type based on what is missing
watch(() => [props.verificationStatus, props.needsVerification], () => {
  const ninVerified = Boolean(props.verificationStatus?.nin?.verified || props.verificationStatus?.has_nin)
  const bvnVerified = Boolean(props.verificationStatus?.bvn?.verified || props.verificationStatus?.has_bvn)

  if (ninVerified && !bvnVerified) {
    verificationType.value = 'bvn'
  } else if (bvnVerified && !ninVerified) {
    verificationType.value = 'nin'
  } else if (props.needsVerification?.length === 1) {
    verificationType.value = props.needsVerification[0]
  } else if (!verificationType.value) {
    verificationType.value = 'nin'
  }
}, { immediate: true, deep: true })

const clearNinError = () => {
  ninError.value = ''
  generalError.value = ''
}

const clearBvnError = () => {
  bvnError.value = ''
  generalError.value = ''
}

const validateInput = () => {
  ninError.value = ''
  bvnError.value = ''
  generalError.value = ''

  if (verificationType.value === 'nin') {
    if (!ninNumber.value) {
      ninError.value = 'NIN is required'
      return false
    }
    if (ninNumber.value.length !== 11) {
      ninError.value = 'NIN must be 11 digits'
      return false
    }
    if (!/^\d{11}$/.test(ninNumber.value)) {
      ninError.value = 'NIN must contain only numbers'
      return false
    }
  } else if (verificationType.value === 'bvn') {
    if (!bvnNumber.value) {
      bvnError.value = 'BVN is required'
      return false
    }
    if (bvnNumber.value.length !== 11) {
      bvnError.value = 'BVN must be 11 digits'
      return false
    }
    if (!/^\d{11}$/.test(bvnNumber.value)) {
      bvnError.value = 'BVN must contain only numbers'
      return false
    }
  }

  return true
}

const submitVerification = async () => {
  if (!validateInput()) return

  isSubmitting.value = true
  generalError.value = ''

  try {
    const payload = {
      verification_type: verificationType.value,
      nin: verificationType.value === 'nin' ? ninNumber.value : null,
      bvn: verificationType.value === 'bvn' ? bvnNumber.value : null
    }

    const response = await httpRequest('POST', '/customer/verify-identity', payload)

    if (response.data.success) {
      emit('success', {
        type: verificationType.value,
        number: verificationType.value === 'nin' ? ninNumber.value : bvnNumber.value
      })
      closeModal()
    } else {
      generalError.value = response.data.message || 'Verification failed. Please try again.'
    }
  } catch (error) {
    generalError.value = 'Failed to verify identity. Please try again.'
    emit('error', error)
  } finally {
    isSubmitting.value = false
  }
}

const closeModal = () => {
  // Reset form
  verificationType.value = ''
  ninNumber.value = ''
  bvnNumber.value = ''
  ninError.value = ''
  bvnError.value = ''
  generalError.value = ''
  isSubmitting.value = false
  
  emit('close')
}
</script>

