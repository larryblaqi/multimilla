<script setup>
import { ref } from "vue";
import {
  BellIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon,
} from "@heroicons/vue/24/outline";
const props = defineProps({
  count: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["click"]);

const handleClick = () => {
  emit("click");
};
</script>

<template>
  <button @click="handleClick" class="relative p-2">
    <BellIcon />
    <span
      v-if="count > 0"
      class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
    >
      {{ count }}
    </span>
  </button>
</template>
