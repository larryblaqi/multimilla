<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  ArrowLeftIcon, 
  CreditCardIcon, 
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  BoltIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'
import { useRouter } from 'vue-router'
import { useCustomerStore } from '../store'
import { storeToRefs } from 'pinia'
import { useHttp } from '../composables/useHttp'

const router = useRouter()
const customerStore = useCustomerStore()
const { customer } = storeToRefs(customerStore)
const { httpRequest } = useHttp()

// State
const isLoading = ref(false)
const isFetchingCards = ref(false)
const showPinModal = ref(false)
const showRequestModal = ref(false)
const pinInput = ref('')
const toastMessage = ref('')
const toastType = ref('success')
const showToast = ref(false)
const cards = ref([])
const activeUpgrade = ref(false) // Toggle whether the current PIN entry is for upgrade vs card creation

// Toggle card number/CVV visibility
const cardVisibility = ref({})

const showAppToast = (msg, type = 'success') => {
  toastMessage.value = msg
  toastType.value = type
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 3500)
}

const goBack = () => router.back()

const fetchCards = async () => {
  isFetchingCards.value = true
  try {
    const res = await httpRequest('GET', '/customer/cards')
    if (res.data?.success) {
      cards.value = res.data.data || []
    }
  } catch (e) {
    console.error('Failed to fetch cards:', e)
  } finally {
    isFetchingCards.value = false
  }
}

onMounted(async () => {
  if (customerStore.fetchCustomer) {
    await customerStore.fetchCustomer()
  }
  await fetchCards()
})

// Waitlist status checks
const hasActiveOrFrozenCard = computed(() => {
  return cards.value.some(c => c.status !== 'pending release')
})

const pendingReleaseCard = computed(() => {
  return cards.value.find(c => c.status === 'pending release')
})

const isVip = computed(() => {
  return !!pendingReleaseCard.value
})

const handleUpgradeClick = () => {
  activeUpgrade.value = true
  pinInput.value = ''
  showPinModal.value = true
}

const openRequestModal = () => {
  const balance = Number(customer.value?.balance ?? customer.value?.wallet_balance ?? 0)
  if (balance < 5000) {
    showAppToast('Insufficient wallet balance (₦5,000 required). Please top up your wallet.', 'error')
    return
  }
  showRequestModal.value = true
}

const initiateCardCreation = () => {
  showRequestModal.value = false
  activeUpgrade.value = false
  pinInput.value = ''
  showPinModal.value = true
}

const processPinSubmission = () => {
  if (activeUpgrade.value) {
    processVipUpgrade()
  } else {
    processCardRequest()
  }
}

const processVipUpgrade = async () => {
  if (!pinInput.value || pinInput.value.length < 4) {
    showAppToast('Please enter a valid 4-digit PIN', 'error')
    return
  }
  if (isLoading.value) return

  isLoading.value = true

  try {
    const response = await httpRequest('POST', '/customer/cards/vip-upgrade', {
      pin: pinInput.value
    })

    if (response.status === 200 || response.data?.success) {
      showAppToast(response.data?.message || "Congratulations, you’ve joined the VIP Card waitlist! We’ll notify you when your card is ready.", 'success')
      showPinModal.value = false
      pinInput.value = ''
      await fetchCards()
      if (customerStore.fetchCustomer) {
        await customerStore.fetchCustomer()
      }
    } else {
      showAppToast(response.data?.message || 'Failed to join VIP waitlist. Please check details.', 'error')
      pinInput.value = ''
    }
  } catch (error) {
    console.error('Error joining VIP waitlist:', error)
    showAppToast(error.response?.data?.message || 'VIP waitlist registration failed. Please try again.', 'error')
    pinInput.value = ''
  } finally {
    isLoading.value = false
  }
}

const processCardRequest = async () => {
  if (!pinInput.value || pinInput.value.length < 4) {
    showAppToast('Please enter a valid 4-digit PIN', 'error')
    return
  }
  if (isLoading.value) return

  isLoading.value = true

  try {
    const cardHolderName = customer.value ? `${customer.value.first_name} ${customer.value.last_name}` : 'VIP USER'
    const response = await httpRequest('POST', '/customer/cards', {
      card_holder_name: cardHolderName,
      card_type: 'virtual',
      pin: pinInput.value,
      spending_limit: 500000
    })

    if (response.status === 201 || response.data?.success) {
      showAppToast(response.data?.message || 'Card requested successfully!')
      showPinModal.value = false
      pinInput.value = ''
      await fetchCards()
      if (customerStore.fetchCustomer) {
        await customerStore.fetchCustomer()
      }
    } else {
      showAppToast(response.data?.message || 'Failed to create card. Please check details.', 'error')
      pinInput.value = ''
    }
  } catch (error) {
    console.error('Error creating card:', error)
    showAppToast(error.response?.data?.message || 'Card creation failed. Please try again.', 'error')
    pinInput.value = ''
  } finally {
    isLoading.value = false
  }
}

const toggleCardNumber = (cardId) => {
  cardVisibility.value[cardId] = !cardVisibility.value[cardId]
}

const toggleCardStatus = async (card) => {
  const isCurrentlyActive = card.status === 'active'
  const targetStatus = isCurrentlyActive ? 'blocked' : 'active'
  try {
    const res = await httpRequest('POST', `/customer/cards/${card.id}/toggle-status`, {
      status: targetStatus
    })
    if (res.data?.success) {
      showAppToast(`Card successfully ${isCurrentlyActive ? 'frozen' : 'unfrozen'}!`)
      await fetchCards()
    }
  } catch (e) {
    showAppToast(e.response?.data?.message || `Failed to change card status.`, 'error')
  }
}

const formatCardNumber = (pan, visible) => {
  if (!pan) return '•••• •••• •••• ••••'
  if (visible) {
    return pan.replace(/(\d{4})/g, '$1 ').trim()
  }
  return `•••• •••• •••• ${pan.slice(-4)}`
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white pb-12">
    <!-- Toast Notification -->
    <Teleport to="body">
      <Transition name="toast">
        <div
          v-if="showToast"
          :class="[
            'fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold max-w-xs w-[90vw]',
            toastType === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          ]"
        >
          <CheckCircleIcon v-if="toastType === 'success'" class="w-5 h-5 text-white flex-shrink-0" />
          <XCircleIcon v-else class="w-5 h-5 text-white flex-shrink-0" />
          {{ toastMessage }}
        </div>
      </Transition>
    </Teleport>

    <!-- Header -->
    <header class="sticky top-0 z-20 bg-slate-900/85 backdrop-blur-xl border-b border-slate-800">
      <div class="flex items-center justify-between p-4 max-w-md mx-auto">
        <div class="flex items-center gap-3">
          <button @click="goBack" class="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeftIcon class="w-6 h-6 text-slate-300" />
          </button>
          <h1 class="text-lg font-bold text-white tracking-wide">Cards & Virtual Pay</h1>
        </div>
      </div>
    </header>

    <main class="p-4 space-y-6 max-w-md mx-auto mt-2">
      <!-- Active Dashboard View -->
      <div v-if="hasActiveOrFrozenCard" class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold text-slate-400 uppercase tracking-wider">Your Cards</h2>
          <span class="text-xs text-slate-500 font-semibold">{{ cards.filter(c => c.status !== 'pending release').length }} active card(s)</span>
        </div>

        <div v-for="card in cards.filter(c => c.status !== 'pending release')" :key="card.id" class="relative group">
          <div class="absolute -inset-1 rounded-3xl blur-xl opacity-30 transition duration-1000 bg-gradient-to-r from-purple-500 via-indigo-600 to-indigo-500"></div>
          
          <div class="relative rounded-3xl p-6 shadow-2xl overflow-hidden h-52 flex flex-col justify-between border bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900/80 border-slate-800">
            <div class="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <!-- Top Section -->
            <div class="flex justify-between items-start z-10">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Virtual Mastercard</span>
                <h3 class="text-sm font-black tracking-wider text-white">DEBIT CARD</h3>
              </div>
              <div class="flex items-center gap-2">
                <span :class="[
                  'px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm border',
                  card.status === 'active' ? 'bg-emerald-500/10 border-emerald-400/20 text-emerald-400' : 'bg-rose-500/10 border-rose-400/20 text-rose-400'
                ]">
                  {{ card.status }}
                </span>
              </div>
            </div>

            <!-- Card Number -->
            <div class="flex items-center justify-between z-10 my-4">
              <span class="text-lg font-mono font-bold tracking-widest text-slate-100">
                {{ formatCardNumber(card.card_number, cardVisibility[card.id]) }}
              </span>
              <button @click="toggleCardNumber(card.id)" class="text-slate-400 hover:text-white transition-colors">
                <EyeIcon v-if="!cardVisibility[card.id]" class="w-5 h-5" />
                <EyeSlashIcon v-else class="w-5 h-5" />
              </button>
            </div>

            <!-- Bottom Section -->
            <div class="z-10 flex justify-between items-end">
              <div>
                <p class="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Cardholder</p>
                <p class="text-xs font-bold tracking-wide text-white uppercase">{{ card.card_holder_name }}</p>
              </div>
              <div class="flex gap-4 text-right">
                <div>
                  <p class="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Expiry</p>
                  <p class="text-xs font-bold text-white">{{ card.expiry_month }}/{{ card.expiry_year.slice(-2) }}</p>
                </div>
                <div>
                  <p class="text-[9px] font-medium text-slate-400 uppercase tracking-widest">CVV</p>
                  <p class="text-xs font-bold text-white">{{ cardVisibility[card.id] ? card.cvv : '•••' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Action Buttons for Card -->
          <div class="flex gap-2 mt-2">
            <button 
              @click="toggleCardStatus(card)"
              :class="[
                'flex-1 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-700/50',
                card.status === 'active' ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              ]"
            >
              <ShieldCheckIcon class="w-4 h-4" />
              {{ card.status === 'active' ? 'Freeze Card' : 'Unfreeze Card' }}
            </button>
          </div>
        </div>

        <!-- Issue Option (Virtual Only) -->
        <div class="space-y-4 pt-4 border-t border-slate-800">
          <h2 class="text-sm font-bold text-slate-400 uppercase tracking-wider">Get a New Card</h2>
          
          <div class="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 shadow-lg flex items-center justify-between">
            <div class="space-y-1">
              <h3 class="text-base font-extrabold text-white flex items-center gap-1.5">
                <span>Virtual Mastercard</span>
                <span class="text-[10px] bg-indigo-500/20 border border-indigo-400/20 text-indigo-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Instant</span>
              </h3>
              <p class="text-xs text-slate-400">Great for secure global online shopping.</p>
              <p class="text-xs font-bold text-indigo-400 mt-1">Fee: ₦5,000 (One-Time)</p>
            </div>
            <button 
              @click="openRequestModal"
              class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-3 rounded-2xl transition-colors"
            >
              <PlusIcon class="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <!-- Waitlist Screen (No active cards) -->
      <div v-else class="space-y-6">
        <!-- Mock Dark Blue VISA Card -->
        <div class="relative group">
          <div class="absolute -inset-1 rounded-3xl blur-xl opacity-20 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
          <div class="relative rounded-3xl p-6 h-52 flex flex-col justify-between border border-blue-900/50 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
            <div class="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            <div class="flex justify-between items-start z-10">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-widest text-blue-400">VIP Priority</span>
                <h3 class="text-sm font-black tracking-wider text-white">VIP DEBIT CARD</h3>
              </div>
              <div class="text-xl font-bold italic text-white tracking-widest">VISA</div>
            </div>

            <div class="my-4 z-10">
              <span class="text-lg font-mono font-bold tracking-widest text-slate-300">
                •••• •••• •••• ••••
              </span>
            </div>

            <div class="z-10 flex justify-between items-end">
              <div>
                <p class="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Cardholder</p>
                <p class="text-xs font-bold tracking-wide text-white uppercase">{{ customer?.first_name ? `${customer.first_name} ${customer.last_name}` : 'VIP USER' }}</p>
              </div>
              <div class="text-right">
                <p class="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Status</p>
                <p class="text-xs font-bold text-blue-400 uppercase">{{ isVip ? 'VIP Queue' : 'Waitlist' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Three Feature Badges -->
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3 text-center space-y-1">
            <GlobeAltIcon class="w-6 h-6 text-blue-400 mx-auto" />
            <p class="text-xs font-bold text-white">Global Pay</p>
          </div>
          <div class="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3 text-center space-y-1">
            <BoltIcon class="w-6 h-6 text-amber-400 mx-auto" />
            <p class="text-xs font-bold text-white">Instant Issue</p>
          </div>
          <div class="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3 text-center space-y-1">
            <ShieldCheckIcon class="w-6 h-6 text-emerald-400 mx-auto" />
            <p class="text-xs font-bold text-white">Zero Theft</p>
          </div>
        </div>

        <!-- Waitlist Status Card -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl text-center space-y-4">
          <div>
            <h3 class="text-lg font-extrabold text-white">You're on the Waitlist!</h3>
            <p class="text-xs text-slate-400 mt-1">Joined on {{ new Date(customer?.created_at || Date.now()).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) }}</p>
          </div>

          <div class="border-t border-slate-800/80 pt-4 flex items-center justify-around">
            <div>
              <p class="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Queue Position</p>
              <p class="text-2xl font-black text-white font-mono mt-0.5">#{{ isVip ? '12' : (4615 + Number(customer?.id || 0)) }}</p>
            </div>
            <div class="h-8 w-px bg-slate-800"></div>
            <div>
              <p class="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Access Tier</p>
              <p :class="isVip ? 'text-blue-400' : 'text-slate-400'" class="text-sm font-black uppercase mt-1.5 tracking-wider">
                {{ isVip ? 'VIP ACCESS' : 'STANDARD ACCESS' }}
              </p>
            </div>
          </div>

          <!-- Action or Wait Message -->
          <div v-if="!isVip" class="pt-2">
            <button 
              @click="handleUpgradeClick"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 px-6 rounded-2xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <SparklesIcon class="w-5 h-5 text-yellow-300" />
              Join VIP Card Waitlist (Free)
            </button>
          </div>
          <div v-else class="bg-blue-950/20 border border-blue-800/30 rounded-2xl p-4 text-xs text-blue-300 pt-3 leading-relaxed">
            ✨ <strong>Priority Waitlist Registered:</strong> You’ve joined the VIP Card waitlist. We’ll notify you when your card is ready. You have not been charged.
          </div>
        </div>
      </div>
    </main>

    <!-- Request Confirmation / Modal -->
    <Teleport to="body">
      <div v-if="showRequestModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-5 text-center shadow-2xl text-white">
          <div class="w-14 h-14 rounded-full flex items-center justify-center mx-auto border bg-indigo-500/20 border-indigo-400/40 text-indigo-400">
            <CreditCardIcon class="w-7 h-7" />
          </div>

          <div>
            <h3 class="text-lg font-bold text-white">Request Virtual Card</h3>
            <p class="text-xs text-slate-400 mt-1">
              A one-time charge of <strong>₦5,000</strong> will be deducted from your wallet balance.
            </p>
          </div>

          <div class="flex gap-3 pt-2">
            <button 
              @click="showRequestModal = false"
              class="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
            <button 
              @click="initiateCardCreation"
              class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md flex items-center justify-center"
            >
              Proceed
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- PIN Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showPinModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-white">
          <form @submit.prevent="processPinSubmission" class="space-y-5">
            <div class="w-14 h-14 bg-amber-500/20 border border-amber-400/40 rounded-full flex items-center justify-center mx-auto">
              <LockClosedIcon class="w-7 h-7 text-amber-400" />
            </div>

            <div>
              <h3 class="text-lg font-bold text-white text-center">Enter Transaction PIN</h3>
              <p v-if="activeUpgrade" class="text-xs text-slate-400 mt-1 text-center">Please enter your 4-digit transaction PIN to join the VIP Card waitlist. You will not be charged.</p>
              <p v-else class="text-xs text-slate-400 mt-1 text-center">Please enter your 4-digit transaction PIN to complete your payment.</p>
            </div>

            <div class="space-y-2">
              <input 
                v-model="pinInput"
                type="password" 
                maxlength="4"
                placeholder="••••"
                :disabled="isLoading"
                class="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-center text-xl font-bold tracking-widest text-white focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
            </div>

            <div class="flex gap-3 pt-2">
              <button 
                type="button"
                @click="showPinModal = false"
                :disabled="isLoading"
                class="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                type="submit"
                :disabled="isLoading || !pinInput || pinInput.length < 4"
                class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md disabled:opacity-50 flex items-center justify-center"
              >
                <span v-if="!isLoading">{{ activeUpgrade ? 'Join Waitlist' : 'Confirm Payment' }}</span>
                <span v-else class="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>