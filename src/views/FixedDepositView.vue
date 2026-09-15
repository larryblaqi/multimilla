<script setup>
import { ref, onMounted } from 'vue'
import { ArrowLeftIcon, EyeIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useRouter } from 'vue-router'
import { useHttp } from '../composables/useHttp'
import { useCustomerStore } from '../store'
import { storeToRefs } from 'pinia'
import FixedDepositModal from '../components/modal/FixedDepositModal.vue'

const router = useRouter()
const { httpRequest } = useHttp()
const customerStore = useCustomerStore()
const { customer } = storeToRefs(customerStore)

const goBack = () => router.back()

// Modal states
const isViewModalOpen = ref(false)
const isCreateModalOpen = ref(false)
const isLoading = ref(false)

// Data will be populated from API
const currentFixedDeposits = ref([])
const fixedDepositProducts = ref([])

const openViewModal = () => {
  console.log('Opening view modal...')
  isViewModalOpen.value = true
  // Refresh data when modal is opened
  fetchFixedDeposits()
}

const closeViewModal = () => {
  console.log('Closing view modal...')
  isViewModalOpen.value = false
}

const openCreateModal = () => {
  console.log('Opening create modal...')
  isCreateModalOpen.value = true
}

const closeCreateModal = () => {
  console.log('Closing create modal...')
  isCreateModalOpen.value = false
}

const handleCreateSuccess = (newDeposit) => {
  // Refresh the deposits list
  fetchFixedDeposits()
  closeCreateModal()
}

const fetchFixedDeposits = async () => {
  try {
    console.log('Fetching fixed deposits...')
    isLoading.value = true
    const response = await httpRequest('GET', '/customer/fixed-deposits')
    console.log('Fixed deposits response:', response)
    if (response.data.success) {
      currentFixedDeposits.value = response.data.data
      console.log('Fixed deposits data:', currentFixedDeposits.value)
    }
  } catch (error) {
    console.error('Error fetching fixed deposits:', error)
  } finally {
    isLoading.value = false
  }
}

const fetchProducts = async () => {
  try {
    console.log('Fetching products...')
    const response = await httpRequest('GET', '/customer/fixed-deposit-products')
    console.log('Products response:', response)
    if (response.data.success) {
      fixedDepositProducts.value = response.data.data
      console.log('Products data:', fixedDepositProducts.value)
    }
  } catch (error) {
    console.error('Error fetching fixed deposit products:', error)
  }
}

const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-NG').format(amount)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-NG')
}

onMounted(() => {
  fetchFixedDeposits()
  fetchProducts()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="flex items-center justify-between p-4 bg-white safe-area-top border-b">
      <div class="flex items-center gap-4 py-4">
        <button @click="goBack">
          <ArrowLeftIcon class="w-6 h-6" />
        </button>
        <h1 class="font-semibold">Fixed Deposits</h1>
      </div>
      <div class="flex items-center gap-2">
        <button 
          @click="openViewModal"
          class="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <EyeIcon class="w-4 h-4" />
          <span class="text-sm font-medium">View Deposits</span>
        </button>
      </div>
    </header>

    <main class="px-4 md:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      <div class="space-y-6 mt-5">
        <!-- Fixed Deposit Products -->
        <div class="space-y-4">
          <div v-if="isLoading" class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p class="text-gray-500 mt-2">Loading products...</p>
          </div>
          
          <div v-else-if="fixedDepositProducts.length === 0" class="text-center py-8">
            <p class="text-gray-500">No fixed deposit products available</p>
          </div>
          
          <div v-else v-for="product in fixedDepositProducts" :key="product.id" 
               class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">{{ product.name }}</h3>
                <p class="text-sm text-gray-600 mt-1">{{ product.description }}</p>
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold text-green-600">₦{{ formatAmount(product.min_amount) }}</p>
                <p class="text-sm text-gray-500">Min Amount</p>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-600">Interest Rate</p>
                <p class="font-semibold text-gray-900">{{ product.interest_rate }}%</p>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-600">Duration</p>
                <p class="font-semibold text-gray-900">{{ product.duration_days }} days</p>
              </div>
            </div>
            
            <button @click="openCreateModal" class="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
              Deposit Now
            </button>
          </div>
        </div>

        <!-- Info Section -->
        <div class="bg-green-50 rounded-xl p-6">
          <h4 class="font-semibold text-green-900 mb-2">Fixed Deposit Benefits</h4>
          <ul class="text-sm text-green-800 space-y-1">
            <li>• Guaranteed returns on your deposit</li>
            <li>• No risk of losing your principal amount</li>
            <li>• Competitive interest rates</li>
            <li>• Flexible deposit amounts</li>
          </ul>
        </div>
      </div>
    </main>

    <!-- Modal for Current Fixed Deposits -->
    <div v-if="isViewModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b">
          <h2 class="text-xl font-semibold text-gray-900">Current Fixed Deposits</h2>
          <button @click="closeViewModal" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-6 overflow-y-auto max-h-[70vh]">
          <div v-if="isLoading" class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p class="text-gray-500 mt-2">Loading deposits...</p>
          </div>
          
          <div v-else-if="currentFixedDeposits.length === 0" class="text-center py-12">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No Fixed Deposits</h3>
            <p class="text-gray-500 mb-4">You don't have any active fixed deposits yet.</p>
            <button @click="openCreateModal" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Create Your First Deposit
            </button>
          </div>
          
          <div v-else class="space-y-4">
            <div v-for="deposit in currentFixedDeposits" :key="deposit.id" 
                 class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div class="flex justify-between items-start mb-3">
                <div>
                  <h3 class="font-semibold text-gray-900">{{ deposit.plan_name }}</h3>
                  <p class="text-sm text-gray-600">Status: <span class="text-green-600 font-medium capitalize">{{ deposit.status }}</span></p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-bold text-green-600">₦{{ formatAmount(deposit.amount) }}</p>
                  <p class="text-xs text-gray-500">Principal Amount</p>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4 mb-3">
                <div class="text-center p-2 bg-white rounded border">
                  <p class="text-xs text-gray-600">Interest Rate</p>
                  <p class="font-semibold text-gray-900">{{ deposit.interest_rate }}%</p>
                </div>
                <div class="text-center p-2 bg-white rounded border">
                  <p class="text-xs text-gray-600">Duration</p>
                  <p class="font-semibold text-gray-900">{{ deposit.duration_days }} days</p>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p class="text-xs text-gray-600">Start Date</p>
                  <p class="text-sm font-medium text-gray-900">{{ formatDate(deposit.start_date) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-600">Maturity Date</p>
                  <p class="text-sm font-medium text-gray-900">{{ formatDate(deposit.maturity_date) }}</p>
                </div>
              </div>
              
              <div class="text-center p-3 bg-green-100 rounded-lg">
                <p class="text-xs text-green-700">Expected Return</p>
                <p class="text-lg font-bold text-green-800">₦{{ formatAmount(deposit.expected_return) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-6 border-t bg-gray-50">
          <div class="text-center">
            <p class="text-sm text-gray-600 mb-2">All fixed deposits earn guaranteed returns</p>
            <button @click="closeViewModal" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Fixed Deposit Creation Modal -->
    <FixedDepositModal 
      :show-modal="isCreateModalOpen"
      :available-balance="parseFloat(customer?.balance || customer?.wallet_balance || 0)"
      @close="closeCreateModal"
      @success="handleCreateSuccess"
    />
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




