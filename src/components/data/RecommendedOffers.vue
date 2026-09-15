<script setup lang="ts">
interface DataOffer {
  id: number
  data: string
  days: number
  discount: number
  price: number
  originalPrice: number
  soldOut?: boolean
}

const offers: DataOffer[] = [
  {
    id: 1,
    data: '1GB',
    days: 7,
    discount: 50,
    price: 300,
    originalPrice: 600,
    soldOut: true
  },
  {
    id: 2,
    data: '3GB',
    days: 2,
    discount: 50,
    price: 400,
    originalPrice: 800
  }
]
</script>

<template>
  <div class="bg-green-50 p-4 rounded-lg">
    <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
      Recommend Data Offers
      <span class="w-4 h-4 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center">i</span>
    </h2>
    <div class="grid grid-cols-2 gap-4">
      <div v-for="offer in offers" :key="offer.id"
        class="bg-white p-4 rounded-lg relative">
        <div class="text-lg font-bold">{{ offer.data }}/{{ offer.days }} Days/{{ offer.discount }}%off</div>
        <div class="flex items-center gap-2 mt-2">
          <span class="text-xl font-bold text-opay-green">₦{{ offer.price }}</span>
          <span class="text-gray-400 line-through">₦{{ offer.originalPrice }}</span>
        </div>
        <button 
          :class="[
            'mt-3 w-20 py-1 rounded-full text-sm font-medium',
            offer.soldOut ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-opay-green'
          ]"
          :disabled="offer.soldOut"
        >
          {{ offer.soldOut ? 'Sold out' : 'Get' }}
        </button>
      </div>
    </div>
  </div>
</template>