<script setup>
defineProps({
  amount: String,
  data: String,
  duration: String,
  selected: Boolean,
});

defineEmits(["select"]);
</script>

<template>
  <button
    @click.prevent="$emit('select')"
    class="w-full p-6 rounded-xl text-left transition-all duration-200"
    :class="selected ? 'bg-primary text-white' : 'bg-white hover:bg-gray-50'"
  >
    <h3 class="text-2xl font-bold">₦{{ amount }}</h3>
    <p
      class="mt-2 text-sm"
      :class="selected ? 'text-white/80' : 'text-gray-600'"
    >
      {{ data }} for {{ duration }}
    </p>
  </button>
</template>
