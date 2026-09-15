<script setup>
import { ref, computed, onMounted } from 'vue'
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon, ClockIcon, DocumentTextIcon, CurrencyDollarIcon, ExclamationCircleIcon } from '@heroicons/vue/24/outline'
import { useRouter } from 'vue-router'
import { useHttp } from '../composables/useHttp'
import { storeToRefs } from 'pinia'
import { useCustomerStore } from '../store'

const router = useRouter()
const { httpRequest } = useHttp()
const customerStore = useCustomerStore()
const { customer } = storeToRefs(customerStore)

const goBack = () => router.back()

// ─── State ───────────────────────────────────────────────────────────────
const loanProducts     = ref([])
const loanApplications = ref([])
const isLoadingProducts      = ref(true)
const isLoadingApplications  = ref(false)
const isSubmitting           = ref(false)

const showApplicationModal  = ref(false)
const showApplicationsModal = ref(false)
const showSuccessModal      = ref(false)
const showErrorModal        = ref(false)

const selectedProduct  = ref(null)
const successMessage   = ref('')
const errorMessage     = ref('')

// Application form
const form = ref({
  loan_product_id: null,
  requested_amount: '',
  duration_days: '',
  purpose: '',
  additional_notes: ''
})

// ─── Helpers ──────────────────────────────────────────────────────────────
const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount || 0)

const statusColor = (status) => {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-700'
    case 'rejected': return 'bg-red-100 text-red-700'
    case 'cleared':  return 'bg-blue-100 text-blue-700'
    default:         return 'bg-yellow-100 text-yellow-700'
  }
}

const statusIcon = (status) => {
  switch (status) {
    case 'approved': return CheckCircleIcon
    case 'rejected': return XCircleIcon
    default:         return ClockIcon
  }
}

// ─── Computed repayment breakdown ────────────────────────────────────────
const repaymentBreakdown = computed(() => {
  if (!selectedProduct.value || !form.value.requested_amount || !form.value.duration_days) return null
  const amount   = parseFloat(form.value.requested_amount) || 0
  const days     = parseFloat(form.value.duration_days)    || 0
  const rate     = parseFloat(selectedProduct.value.interest_rate) / 100  // monthly rate decimal
  const months   = days / 30

  if (!amount || !days || days <= 0) return null

  let monthlyPayment, totalPayable
  if (rate === 0) {
    monthlyPayment = amount / months
    totalPayable   = amount
  } else {
    monthlyPayment = amount * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1)
    totalPayable   = monthlyPayment * months
  }

  const totalInterest = totalPayable - amount
  const processingFee = parseFloat(selectedProduct.value.processing_fee) || 0

  return {
    principal:      amount,
    monthlyPayment: Math.round(monthlyPayment),
    totalInterest:  Math.round(totalInterest),
    processingFee,
    totalPayable:   Math.round(totalPayable + processingFee),
    months:         Math.round(months * 10) / 10
  }
})

// Amount within product bounds?
const amountError = computed(() => {
  if (!form.value.requested_amount || !selectedProduct.value) return ''
  const v = parseFloat(form.value.requested_amount)
  if (v < parseFloat(selectedProduct.value.min_amount))
    return `Minimum amount is ${formatCurrency(selectedProduct.value.min_amount)}`
  if (v > parseFloat(selectedProduct.value.max_amount))
    return `Maximum amount is ${formatCurrency(selectedProduct.value.max_amount)}`
  return ''
})

const durationError = computed(() => {
  if (!form.value.duration_days || !selectedProduct.value) return ''
  const v = parseInt(form.value.duration_days)
  if (v < selectedProduct.value.min_duration_days)
    return `Minimum duration is ${selectedProduct.value.min_duration_days} days`
  if (v > selectedProduct.value.max_duration_days)
    return `Maximum duration is ${selectedProduct.value.max_duration_days} days`
  return ''
})

const canSubmit = computed(() =>
  form.value.requested_amount &&
  form.value.duration_days &&
  form.value.purpose.trim() &&
  !amountError.value &&
  !durationError.value
)

// ─── API Calls ────────────────────────────────────────────────────────────
const fetchLoanProducts = async () => {
  isLoadingProducts.value = true
  try {
    const res = await httpRequest('GET', '/customer/loan-products')
    const raw = res?.data?.data ?? res?.data ?? []
    // Only show active products
    loanProducts.value = raw.filter(p => p.is_active)
  } catch (e) {
    console.error('Failed to load loan products:', e)
    loanProducts.value = []
  } finally {
    isLoadingProducts.value = false
  }
}

const fetchLoanApplications = async () => {
  isLoadingApplications.value = true
  try {
    const res = await httpRequest('GET', '/customer/loan-applications')
    loanApplications.value = res?.data?.data ?? res?.data ?? []
  } catch (e) {
    console.error('Failed to load applications:', e)
    loanApplications.value = []
  } finally {
    isLoadingApplications.value = false
  }
}

// ─── Open Application Modal ────────────────────────────────────────────
const openApplicationModal = (product) => {
  selectedProduct.value = product
  form.value = {
    loan_product_id: product.id,
    requested_amount: product.min_amount,
    duration_days: product.min_duration_days,
    purpose: '',
    additional_notes: ''
  }
  showApplicationModal.value = true
}

const closeApplicationModal = () => {
  showApplicationModal.value = false
  selectedProduct.value = null
}

// ─── Submit Application ───────────────────────────────────────────────
const submitApplication = async () => {
  if (!canSubmit.value) return
  isSubmitting.value = true
  try {
    const res = await httpRequest('POST', '/customer/loan-application', {
      loan_product_id:       form.value.loan_product_id,
      requested_amount:      parseFloat(form.value.requested_amount),
      requested_duration_days: parseInt(form.value.duration_days),
      purpose:               form.value.purpose,
      additional_info:       form.value.additional_notes
    })

    if (res?.data?.success || res?.status === 200 || res?.status === 201) {
      closeApplicationModal()
      successMessage.value = `Your loan application for ${formatCurrency(form.value.requested_amount)} has been submitted. We will review it and contact you within 24 hours.`
      showSuccessModal.value = true
      await fetchLoanApplications()
    } else {
      errorMessage.value = res?.data?.message || 'Failed to submit application'
      showErrorModal.value = true
    }
  } catch (e) {
    errorMessage.value = e?.response?.data?.message || e?.message || 'Failed to submit application'
    showErrorModal.value = true
  } finally {
    isSubmitting.value = false
  }
}

const isRepaying = ref(null)

const repayLoan = async (appId) => {
  isRepaying.value = appId
  try {
    const res = await httpRequest('POST', `/customer/loan-applications/${appId}/repay`)
    if (res?.data?.success || res?.status === 200) {
      successMessage.value = 'Loan repaid successfully. The amount was deducted from your wallet.'
      showSuccessModal.value = true
      if (customerStore.fetchCustomer) {
        await customerStore.fetchCustomer()
      }
      await fetchLoanApplications()
    } else {
      errorMessage.value = res?.data?.message || 'Failed to repay loan'
      showErrorModal.value = true
    }
  } catch (e) {
    errorMessage.value = e?.response?.data?.message || e?.message || 'Failed to repay loan'
    showErrorModal.value = true
  } finally {
    isRepaying.value = null
  }
}

const pendingApplicationsCount = computed(() => {
  return loanApplications.value.filter(app => ['pending', 'under_review'].includes(app.status)).length
})

const viewMyApplications = async () => {
  await fetchLoanApplications()
  showApplicationsModal.value = true
}

onMounted(async () => {
  await Promise.all([fetchLoanProducts(), fetchLoanApplications()])
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="flex items-center justify-between px-4 py-4 bg-white border-b sticky top-0 z-10">
      <div class="flex items-center gap-3">
        <button @click="goBack" class="p-1 rounded-full hover:bg-gray-100">
          <ArrowLeftIcon class="w-5 h-5 text-gray-700" />
        </button>
        <h1 class="font-semibold text-gray-900">Loans</h1>
      </div>
      <button
        @click="viewMyApplications"
        class="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-200"
      >
        <DocumentTextIcon class="w-4 h-4" />
        My Applications
        <span v-if="pendingApplicationsCount" class="ml-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
          {{ pendingApplicationsCount }}
        </span>
      </button>
    </header>

    <main class="max-w-3xl mx-auto px-4 py-6 space-y-6">

      <!-- Hero Banner -->
      <div class="bg-gradient-to-br from-red-600 to-rose-700 rounded-2xl p-6 text-white">
        <div class="flex items-center gap-3 mb-2">
          <CurrencyDollarIcon class="w-7 h-7 opacity-90" />
          <h2 class="text-xl font-bold">Get a Loan Today</h2>
        </div>
        <p class="text-red-100 text-sm">
          Choose a loan plan below, enter your amount, and submit your application. Our team reviews within 24 hours.
        </p>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="isLoadingProducts" class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-white rounded-2xl p-5 animate-pulse">
          <div class="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div class="h-3 bg-gray-100 rounded w-2/3 mb-5"></div>
          <div class="grid grid-cols-3 gap-3">
            <div class="h-10 bg-gray-100 rounded-lg"></div>
            <div class="h-10 bg-gray-100 rounded-lg"></div>
            <div class="h-10 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      </div>

      <!-- No Products State -->
      <div v-else-if="!loanProducts.length" class="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
        <ExclamationCircleIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 class="font-semibold text-gray-700 mb-1">No Loan Products Available</h3>
        <p class="text-sm text-gray-400">Please check back later. New loan plans will appear here.</p>
      </div>

      <!-- Loan Products Grid -->
      <div v-else class="space-y-4">
        <div
          v-for="product in loanProducts"
          :key="product.id"
          class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          <!-- Product header -->
          <div class="px-5 pt-5 pb-4 border-b border-gray-50">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-bold text-gray-900 text-base">{{ product.name }}</h3>
                <p v-if="product.description" class="text-sm text-gray-500 mt-0.5 line-clamp-2">{{ product.description }}</p>
              </div>
              <span class="ml-3 flex-shrink-0 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Active</span>
            </div>
          </div>

          <!-- Stats grid -->
          <div class="grid grid-cols-3 gap-0 divide-x divide-gray-100 text-center">
            <div class="px-3 py-4">
              <p class="text-xs text-gray-400 mb-1">Interest Rate</p>
              <p class="font-bold text-red-600 text-base">{{ product.interest_rate }}%</p>
              <p class="text-xs text-gray-400">monthly</p>
            </div>
            <div class="px-3 py-4">
              <p class="text-xs text-gray-400 mb-1">Loan Range</p>
              <p class="font-semibold text-gray-800 text-sm">{{ formatCurrency(product.min_amount) }}</p>
              <p class="text-xs text-gray-400">to {{ formatCurrency(product.max_amount) }}</p>
            </div>
            <div class="px-3 py-4">
              <p class="text-xs text-gray-400 mb-1">Duration</p>
              <p class="font-semibold text-gray-800 text-sm">{{ product.min_duration_days }}</p>
              <p class="text-xs text-gray-400">to {{ product.max_duration_days }} days</p>
            </div>
          </div>

          <!-- Requirements -->
          <div v-if="product.requirements && product.requirements.length" class="px-5 pb-4">
            <p class="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Requirements</p>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="req in product.requirements"
                :key="req.name"
                class="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                <CheckCircleIcon class="w-3 h-3 text-green-500" />
                {{ req.name }}
              </span>
            </div>
          </div>

          <!-- Apply Button -->
          <div class="px-5 pb-5">
            <button
              @click="openApplicationModal(product)"
              class="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Apply for This Loan
            </button>
          </div>
        </div>
      </div>

    </main>

    <!-- ── Application Modal ─────────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showApplicationModal" class="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div class="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[92vh] overflow-y-auto">

          <!-- Modal header -->
          <div class="sticky top-0 bg-white px-5 pt-5 pb-4 border-b z-10">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-bold text-gray-900">{{ selectedProduct?.name }}</h3>
                <p class="text-sm text-gray-500 mt-0.5">
                  {{ selectedProduct?.interest_rate }}% monthly interest • {{ selectedProduct?.min_duration_days }}–{{ selectedProduct?.max_duration_days }} days
                </p>
              </div>
              <button @click="closeApplicationModal" class="p-1 text-gray-400 hover:text-gray-600">
                <XCircleIcon class="w-6 h-6" />
              </button>
            </div>
          </div>

          <div class="px-5 py-5 space-y-5">
            <!-- Amount -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Loan Amount *
                <span class="text-gray-400 font-normal">
                  ({{ formatCurrency(selectedProduct?.min_amount) }} – {{ formatCurrency(selectedProduct?.max_amount) }})
                </span>
              </label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₦</span>
                <input
                  v-model="form.requested_amount"
                  type="number"
                  :min="selectedProduct?.min_amount"
                  :max="selectedProduct?.max_amount"
                  class="w-full pl-8 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm"
                  :class="amountError ? 'border-red-400 bg-red-50' : 'border-gray-200'"
                  placeholder="Enter amount"
                />
              </div>
              <p v-if="amountError" class="mt-1 text-xs text-red-600">{{ amountError }}</p>
            </div>

            <!-- Duration -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Duration (days) *
                <span class="text-gray-400 font-normal">
                  ({{ selectedProduct?.min_duration_days }}–{{ selectedProduct?.max_duration_days }} days)
                </span>
              </label>
              <input
                v-model="form.duration_days"
                type="number"
                :min="selectedProduct?.min_duration_days"
                :max="selectedProduct?.max_duration_days"
                class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm"
                :class="durationError ? 'border-red-400 bg-red-50' : 'border-gray-200'"
                placeholder="e.g. 90"
              />
              <p v-if="durationError" class="mt-1 text-xs text-red-600">{{ durationError }}</p>
            </div>

            <!-- Repayment Breakdown -->
            <div v-if="repaymentBreakdown" class="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
              <h4 class="text-sm font-semibold text-blue-800 flex items-center gap-1.5">
                💰 Repayment Breakdown
              </h4>
              <div class="text-sm space-y-1.5 text-gray-700">
                <div class="flex justify-between">
                  <span>Principal</span>
                  <span class="font-medium">{{ formatCurrency(repaymentBreakdown.principal) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Monthly Payment</span>
                  <span class="font-medium text-red-600">{{ formatCurrency(repaymentBreakdown.monthlyPayment) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Total Interest ({{ repaymentBreakdown.months }} months)</span>
                  <span class="font-medium">{{ formatCurrency(repaymentBreakdown.totalInterest) }}</span>
                </div>
                <div v-if="repaymentBreakdown.processingFee > 0" class="flex justify-between">
                  <span>Processing Fee</span>
                  <span class="font-medium">{{ formatCurrency(repaymentBreakdown.processingFee) }}</span>
                </div>
                <div class="flex justify-between pt-1.5 border-t border-blue-200 font-semibold text-blue-900">
                  <span>Total Payable</span>
                  <span>{{ formatCurrency(repaymentBreakdown.totalPayable) }}</span>
                </div>
              </div>
            </div>

            <!-- Purpose -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Purpose of Loan *</label>
              <textarea
                v-model="form.purpose"
                rows="3"
                placeholder="Briefly describe what you need the loan for"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm resize-none"
              ></textarea>
            </div>

            <!-- Additional Notes -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Additional Notes <span class="text-gray-400">(optional)</span></label>
              <textarea
                v-model="form.additional_notes"
                rows="2"
                placeholder="Any other information..."
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm resize-none"
              ></textarea>
            </div>

            <!-- Requirements reminder -->
            <div v-if="selectedProduct?.requirements?.length" class="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p class="text-xs font-semibold text-amber-700 mb-2 uppercase tracking-wide">Required Documents</p>
              <ul class="space-y-1">
                <li
                  v-for="req in selectedProduct.requirements"
                  :key="req.name"
                  class="flex items-start gap-2 text-xs text-amber-700"
                >
                  <CheckCircleIcon class="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-500" />
                  <span><strong>{{ req.name }}</strong> — {{ req.description }}</span>
                </li>
              </ul>
            </div>

            <!-- Buttons -->
            <div class="flex gap-3 pt-1 pb-2">
              <button
                @click="closeApplicationModal"
                class="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                @click="submitApplication"
                :disabled="!canSubmit || isSubmitting"
                class="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg v-if="isSubmitting" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                {{ isSubmitting ? 'Submitting...' : 'Submit Application' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── My Applications Modal ───────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showApplicationsModal" class="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div class="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[92vh] overflow-y-auto">

          <div class="sticky top-0 bg-white px-5 pt-5 pb-4 border-b z-10 flex justify-between items-center">
            <h3 class="text-lg font-bold text-gray-900">My Loan Applications</h3>
            <button @click="showApplicationsModal = false" class="p-1 text-gray-400 hover:text-gray-600">
              <XCircleIcon class="w-6 h-6" />
            </button>
          </div>

          <div class="px-5 py-5">
            <!-- Loading -->
            <div v-if="isLoadingApplications" class="text-center py-10">
              <div class="animate-spin w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p class="text-sm text-gray-500">Loading applications...</p>
            </div>

            <!-- Empty -->
            <div v-else-if="!loanApplications.length" class="text-center py-10">
              <DocumentTextIcon class="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p class="text-gray-500 font-medium">No applications yet</p>
              <p class="text-xs text-gray-400 mt-1">Your submitted loan applications will appear here.</p>
              <button
                @click="showApplicationsModal = false"
                class="mt-4 px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium"
              >
                View Loan Plans
              </button>
            </div>

            <!-- List -->
            <div v-else class="space-y-4">
              <div
                v-for="app in loanApplications"
                :key="app.id"
                class="border border-gray-100 rounded-xl p-4"
              >
                <div class="flex justify-between items-start mb-3">
                  <div>
                    <h4 class="font-semibold text-gray-900 text-sm">
                      {{ app.loan_product?.name || app.loanType || 'Loan Request' }}
                    </h4>
                    <p class="text-sm text-gray-600 font-medium mt-0.5">
                      {{ formatCurrency(app.requested_amount || app.amount) }}
                    </p>
                    <p class="text-xs text-gray-400 mt-0.5">
                      {{ new Date(app.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) }}
                    </p>
                  </div>
                  <span :class="`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor(app.status)}`">
                    {{ (app.status || 'pending').toUpperCase() }}
                  </span>
                </div>

                <p v-if="app.purpose" class="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 mb-2">
                  {{ app.purpose }}
                </p>

                <div v-if="app.admin_note || app.rejection_reason" class="text-xs rounded-lg px-3 py-2 mb-2"
                  :class="app.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'">
                  <strong>Admin Note: </strong>{{ app.admin_note || app.rejection_reason }}
                </div>

                <div v-if="['approved', 'overdue', 'disbursed'].includes(app.status)" class="mt-3 pt-3 border-t border-gray-100 flex justify-end items-center">
                  <button
                    @click="repayLoan(app.id)"
                    :disabled="isRepaying === app.id"
                    class="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <svg v-if="isRepaying === app.id" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    {{ isRepaying === app.id ? 'Processing...' : 'Repay from Wallet' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── Success Modal ───────────────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showSuccessModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl p-7 max-w-sm w-full text-center">
          <div class="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon class="w-8 h-8 text-green-600" />
          </div>
          <h3 class="font-bold text-gray-900 text-lg mb-2">Application Submitted!</h3>
          <p class="text-sm text-gray-600 mb-6">{{ successMessage }}</p>
          <button
            @click="showSuccessModal = false"
            class="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700"
          >
            Done
          </button>
        </div>
      </div>
    </Teleport>

    <!-- ── Error Modal ─────────────────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showErrorModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl p-7 max-w-sm w-full text-center">
          <div class="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircleIcon class="w-8 h-8 text-red-600" />
          </div>
          <h3 class="font-bold text-gray-900 text-lg mb-2">Submission Failed</h3>
          <p class="text-sm text-gray-600 mb-6">{{ errorMessage }}</p>
          <button
            @click="showErrorModal = false"
            class="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    </Teleport>

  </div>
</template>
