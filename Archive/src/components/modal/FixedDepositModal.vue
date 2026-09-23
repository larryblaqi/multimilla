<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-2xl p-6 w-full max-w-md">
      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Create Fixed Deposit</h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Product Selection -->
      <div v-if="!selectedProduct" class="space-y-4">
        <h4 class="font-medium text-gray-900">Select a Plan</h4>
        <div class="space-y-3">
          <div 
            v-for="product in products" 
            :key="product.id"
            @click="selectProduct(product)"
            class="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <div class="flex justify-between items-start">
              <div>
                <h5 class="font-medium text-gray-900">{{ product.name }}</h5>
                <p class="text-sm text-gray-600">{{ product.description }}</p>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold text-green-600">₦{{ formatAmount(product.min_amount) }}</p>
                <p class="text-xs text-gray-500">Min Amount</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4 mt-3">
              <div class="text-center p-2 bg-gray-50 rounded">
                <p class="text-xs text-gray-600">Interest Rate</p>
                <p class="font-semibold text-gray-900">{{ product.interest_rate }}%</p>
              </div>
              <div class="text-center p-2 bg-gray-50 rounded">
                <p class="text-xs text-gray-600">Duration</p>
                <p class="font-semibold text-gray-900">{{ product.duration_days }} days</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Amount Input -->
      <div v-else-if="!showPinConfirmation" class="space-y-4">
        <div class="flex items-center gap-2 mb-4">
          <button @click="goBackToProducts" class="p-1 hover:bg-gray-100 rounded">
            <ArrowLeftIcon class="w-5 h-5" />
          </button>
          <h4 class="font-medium text-gray-900">{{ selectedProduct.name }}</h4>
        </div>

        <form @submit.prevent="proceedToPinConfirmation" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input 
              v-model="amount"
              type="number"
              :min="selectedProduct.min_amount"
              :max="selectedProduct.max_amount || 999999999"
              placeholder="Enter amount"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
            <p class="text-xs text-gray-500 mt-1">
              Min: ₦{{ formatAmount(selectedProduct.min_amount) }}
              <span v-if="selectedProduct.max_amount">
                | Max: ₦{{ formatAmount(selectedProduct.max_amount) }}
              </span>
            </p>
          </div>

          <div class="bg-green-50 rounded-lg p-4">
            <h5 class="font-medium text-green-900 mb-2">Expected Returns</h5>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-green-700">Interest Rate</p>
                <p class="font-semibold text-green-900">{{ selectedProduct.interest_rate }}%</p>
              </div>
              <div>
                <p class="text-green-700">Duration</p>
                <p class="font-semibold text-green-900">{{ selectedProduct.duration_days }} days</p>
              </div>
              <div class="col-span-2">
                <p class="text-green-700">Expected Return</p>
                <p class="text-lg font-bold text-green-900">₦{{ formatAmount(calculateExpectedReturn()) }}</p>
              </div>
            </div>
          </div>

          <div class="text-sm text-gray-600">
            <p>Available balance: ₦{{ formatAmount(availableBalance) }}</p>
          </div>

          <button 
            type="submit"
            :disabled="!amount || parseFloat(amount) < selectedProduct.min_amount || parseFloat(amount) > availableBalance"
            class="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Continue
          </button>
        </form>
      </div>

      <!-- PIN Confirmation -->
      <div v-else class="space-y-4">
        <div class="flex items-center gap-2 mb-4">
          <button @click="goBackToAmount" class="p-1 hover:bg-gray-100 rounded">
            <ArrowLeftIcon class="w-5 h-5" />
          </button>
          <h4 class="font-medium text-gray-900">Confirm Transaction</h4>
        </div>

        <div class="text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyIcon class="w-8 h-8 text-green-600" />
          </div>
          <p class="text-sm text-gray-600 mb-2">
            Create Fixed Deposit - ₦{{ formatAmount(amount) }}
          </p>
          <p class="text-xs text-gray-500 mb-4">
            Enter your transaction PIN to confirm
          </p>
        </div>

        <form @submit.prevent="createFixedDeposit" class="space-y-4">
          <div class="grid grid-cols-4 gap-2">
            <input
              v-for="(digit, index) in pinDigits"
              :key="index"
              :ref="el => pinInputs[index] = el"
              v-model="pinDigits[index]"
              @input="handlePinInput(index, $event)"
              @keydown="handleKeyDown(index, $event)"
              type="password"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="1"
              class="w-full h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <p v-if="pinError" class="text-red-500 text-sm text-center">{{ pinError }}</p>

          <button 
            type="submit"
            :disabled="!isPinComplete || isLoading"
            class="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-colors"
          >
            <span v-if="isLoading">Creating...</span>
            <span v-else>Create Fixed Deposit</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { XMarkIcon, ArrowLeftIcon, KeyIcon } from '@heroicons/vue/24/outline'
import { useHttp } from '../../composables/useHttp'

const props = defineProps({
  showModal: {
    type: Boolean,
    default: false
  },
  availableBalance: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close', 'success', 'error'])

const { httpRequest } = useHttp()

// State
const products = ref([])
const selectedProduct = ref(null)
const amount = ref('')
const showPinConfirmation = ref(false)
const pinDigits = ref(['', '', '', ''])
const pinInputs = ref([])
const pinError = ref('')
const isLoading = ref(false)

// Computed
const isPinComplete = computed(() => {
  return pinDigits.value.every(digit => digit !== '')
})

// Methods
const closeModal = () => {
  resetForm()
  emit('close')
}

const resetForm = () => {
  selectedProduct.value = null
  amount.value = ''
  showPinConfirmation.value = false
  pinDigits.value = ['', '', '', '']
  pinError.value = ''
  isLoading.value = false
}

const selectProduct = (product) => {
  selectedProduct.value = product
}

const goBackToProducts = () => {
  selectedProduct.value = null
  amount.value = ''
}

const goBackToAmount = () => {
  showPinConfirmation.value = false
}

const calculateExpectedReturn = () => {
  if (!amount.value || !selectedProduct.value) return 0
  const principal = parseFloat(amount.value)
  const rate = selectedProduct.value.interest_rate
  const days = selectedProduct.value.duration_days
  return (principal * rate / 100) * (days / 365)
}

const proceedToPinConfirmation = () => {
  if (amount.value && parseFloat(amount.value) >= selectedProduct.value.min_amount) {
    showPinConfirmation.value = true
  }
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

const createFixedDeposit = async () => {
  if (!isPinComplete.value) return

  isLoading.value = true
  pinError.value = ''

  try {
    const pin = pinDigits.value.join('')
    
    const response = await httpRequest('POST', '/customer/create-fixed-deposit', {
      product_id: selectedProduct.value.id,
      amount: parseFloat(amount.value),
      pin: pin
    })

    if (response.data.success) {
      emit('success', response.data.data)
      closeModal()
    } else {
      pinError.value = response.data.message || 'Failed to create fixed deposit'
    }
  } catch (error) {
    console.error('Error creating fixed deposit:', error)
    pinError.value = error.response?.data?.message || 'Failed to create fixed deposit'
  } finally {
    isLoading.value = false
  }
}

const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-NG').format(amount)
}

const fetchProducts = async () => {
  try {
    const response = await httpRequest('GET', '/customer/fixed-deposit-products')
    if (response.data.success) {
      products.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching fixed deposit products:', error)
  }
}

// Watch for modal opening to fetch products
watch(() => props.showModal, (newVal) => {
  if (newVal) {
    fetchProducts()
  }
})
</script>


