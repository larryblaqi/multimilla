<script setup>
import { BellIcon, QuestionMarkCircleIcon, UserCircleIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <header class="flex justify-between items-center p-4 bg-white">
    <div class="flex items-center gap-2">
      <UserCircleIcon class="w-8 h-8 text-gray-600" />
      <div>
        <p class="text-sm text-gray-500">Hi,</p>
        <p class="font-semibold">Uchechukwu</p>
      </div>
    </div>
    <div class="flex items-center gap-4">
      <QuestionMarkCircleIcon class="w-6 h-6 text-gray-600" />
      <div class="relative">
        <BellIcon class="w-6 h-6 text-gray-600" />
        <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
          HELP
        </span>
      </div>
    </div>
  </header>
</template>