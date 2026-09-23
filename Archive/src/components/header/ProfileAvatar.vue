<script setup>
defineProps({
  imageUrl: {
    type: String,
    default: null,
  },
});
import userIcon from "../../assets/images/profile-big.40164a24.svg";
</script>

<template>
  <div class="w-8 h-8 rounded-full overflow-hidden">
    <img
      v-if="userIcon"
      :src="userIcon"
      alt="Profile"
      class="w-full h-full object-cover"
    />
    <div
      v-else
      class="w-full h-full bg-gray-200 flex items-center justify-center"
    >
      <span class="text-gray-500 text-sm">?</span>
    </div>
  </div>
</template>
