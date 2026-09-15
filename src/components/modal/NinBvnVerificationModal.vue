<template>
  <div
    v-if="showModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-lg p-6 w-full max-w-md mx-auto">
      <div class="text-center mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          Identity Verification Required
        </h3>
        <p class="text-sm text-gray-600">
          This is your first withdrawal. Please provide either your NIN or BVN for verification.
        </p>
      </div>

      <div class="space-y-4">
        <!-- Verification Type Selection -->
        <div class="space-y-3">
          <label class="text-sm font-medium text-gray-700">Verification Type</label>
          <div class="flex space-x-4">
            <label class="flex items-center">
              <input
                v-model="verificationType"
                type="radio"
                value="nin"
                class="mr-2 text-red-600 focus:ring-red-500"
              />
              <span class="text-sm">NIN</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="verificationType"
                type="radio"
                value="bvn"
                class="mr-2 text-red-600 focus:ring-red-500"
              />
              <span class="text-sm">BVN</span>
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
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
            :class="{ 'border-red-500': ninError }"
            @input="clearNinError"
          />
          <p v-if="ninError" class="text-red-500 text-xs">{{ ninError }}</p>
        </div>

        <!-- BVN Input -->
        <div v-if="verificationType === 'bvn'" class="space-y-2">
          <label class="text-sm font-medium text-gray-700">BVN Number</label>
          <input
            v-model="bvnNumber"
            type="text"
            placeholder="Enter your 11-digit BVN"
            maxlength="11"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
            :class="{ 'border-red-500': bvnError }"
            @input="clearBvnError"
          />
          <p v-if="bvnError" class="text-red-500 text-xs">{{ bvnError }}</p>
        </div>

        <!-- Error Message -->
        <p v-if="generalError" class="text-red-500 text-sm text-center">
          {{ generalError }}
        </p>

        <!-- Loading State -->
        <div v-if="isSubmitting" class="flex justify-center">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-3 mt-6">
        <button
          @click="closeModal"
          :disabled="isSubmitting"
          class="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          @click="submitVerification"
          :disabled="!isFormValid || isSubmitting"
          class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {{ isSubmitting ? 'Submitting...' : 'Verify' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useHttp } from '../../composables/useHttp'

const props = defineProps({
  showModal: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'success', 'error'])

const { httpRequest } = useHttp()

const verificationType = ref('nin')
const ninNumber = ref('')
const bvnNumber = ref('')
const ninError = ref('')
const bvnError = ref('')
const generalError = ref('')
const isSubmitting = ref(false)

const isFormValid = computed(() => {
  if (verificationType.value === 'nin') {
    return ninNumber.value.length === 11 && /^\d{11}$/.test(ninNumber.value)
  } else if (verificationType.value === 'bvn') {
    return bvnNumber.value.length === 11 && /^\d{11}$/.test(bvnNumber.value)
  }
  return false
})

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
  verificationType.value = 'nin'
  ninNumber.value = ''
  bvnNumber.value = ''
  ninError.value = ''
  bvnError.value = ''
  generalError.value = ''
  isSubmitting.value = false
  
  emit('close')
}
</script>


