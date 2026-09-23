<template>
  <div
    v-if="showModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-lg p-6 w-full max-w-sm mx-auto">
      <div class="text-center mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          Enter Your PIN
        </h3>
        <p class="text-sm text-gray-600">
          Please enter your 4-digit PIN to complete this transaction
        </p>
      </div>

      <div class="space-y-4">
        <!-- PIN Input -->
        <div class="flex justify-center space-x-2">
          <input
            v-for="(digit, index) in pinDigits"
            :key="index"
            ref="pinInputs"
            v-model="pinDigits[index]"
            type="password"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="1"
            class="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
            :class="{ 'border-red-500': pinError }"
            @input="handlePinInput(index, $event)"
            @keydown="handleKeyDown(index, $event)"
            @paste="handlePaste"
          />
        </div>

        <!-- Error Message -->
        <p v-if="pinError" class="text-red-500 text-sm text-center">
          {{ pinError }}
        </p>

        <!-- Loading State -->
        <div v-if="isValidating" class="flex justify-center">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-3 mt-6">
        <button
          @click="closeModal"
          :disabled="isValidating"
          class="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          @click="validatePin"
          :disabled="!isPinComplete || isValidating"
          class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {{ isValidating ? 'Validating...' : 'Confirm' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useHttp } from '../../composables/useHttp'

const props = defineProps({
  showModal: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'success', 'error'])

const { httpRequest } = useHttp()

const pinDigits = ref(['', '', '', ''])
const pinInputs = ref([])
const pinError = ref('')
const isValidating = ref(false)

const isPinComplete = computed(() => {
  return pinDigits.value.every(digit => digit !== '')
})

const closeModal = () => {
  resetPin()
  emit('close')
}

const resetPin = () => {
  pinDigits.value = ['', '', '', '']
  pinError.value = ''
  isValidating.value = false
}

const handlePinInput = (index, event) => {
  const value = event.target.value
  
  // Only allow digits
  if (!/^\d$/.test(value)) {
    event.target.value = ''
    pinDigits.value[index] = ''
    return
  }

  pinDigits.value[index] = value
  pinError.value = ''

  // Auto-focus next input
  if (value && index < 3) {
    nextTick(() => {
      pinInputs.value[index + 1]?.focus()
    })
  }
}

const handleKeyDown = (index, event) => {
  // Handle backspace
  if (event.key === 'Backspace' && !pinDigits.value[index] && index > 0) {
    nextTick(() => {
      pinInputs.value[index - 1]?.focus()
    })
  }
}

const handlePaste = (event) => {
  event.preventDefault()
  const pastedData = event.clipboardData.getData('text').replace(/\D/g, '')
  
  if (pastedData.length === 4) {
    pinDigits.value = pastedData.split('')
    nextTick(() => {
      pinInputs.value[3]?.focus()
    })
  }
}

const validatePin = async () => {
  if (!isPinComplete.value) return

  isValidating.value = true
  pinError.value = ''

  try {
    const pin = pinDigits.value.join('')
    const response = await httpRequest('POST', '/customer/validate-pin', { pin })

    if (response.data.success) {
      emit('success', pin)
      closeModal()
    } else {
      pinError.value = response.data.message || 'Invalid PIN'
    }
  } catch (error) {
    pinError.value = 'Failed to validate PIN. Please try again.'
    emit('error', error)
  } finally {
    isValidating.value = false
  }
}

// Focus first input when modal opens
watch(() => props.showModal, (newVal) => {
  if (newVal) {
    nextTick(() => {
      pinInputs.value[0]?.focus()
    })
  }
})
</script>

