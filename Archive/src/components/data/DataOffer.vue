<script setup>
defineProps({
  data: String,
  days: Number,
  discount: String,
  price: Number,
  originalPrice: Number,
  soldOut: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="bg-white rounded-lg p-4 shadow-sm relative">
    <div class="flex justify-between items-center">
      <div>
        <h3 class="font-bold">{{ data }}</h3>
        <p class="text-sm text-gray-600">{{ days }} Days/{{ discount }}</p>
        <div class="flex items-center gap-2">
          <span class="text-primary font-bold">₦{{ price }}</span>
          <span class="text-xs text-gray-500 line-through">₦{{ originalPrice }}</span>
        </div>
      </div>
      <button 
        class="bg-green-100 text-primary px-4 py-1 rounded-full text-sm"
        :class="{ 'opacity-50': soldOut }"
        :disabled="soldOut"
      >
        {{ soldOut ? 'Sold out' : 'Get' }}
      </button>
    </div>
  </div>
</template>