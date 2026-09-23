<template>
  <Teleport to="body">
    <Transition
      name="modal"
      enter-active-class="modal-enter-active"
      enter-from-class="modal-enter-from"
      leave-active-class="modal-leave-active"
      leave-to-class="modal-leave-to"
    >
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center md:justify-center z-50"
        @click.self="closeModal"
      >
        <div
          class="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-3xl p-6 space-y-6 relative"
        >
          <!-- Close Button -->
          <button
            @click="closeModal"
            class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              class="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>

          <div class="text-center space-y-2">
            <slot></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
/*eslint-disable*/
import { ref } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  showModal: Boolean,
  message: {
    type: String,
  },
  isRegistration: {
    type: Boolean,
  },
  accountId: {
    type: String,
    default: "0.0.120214",
  },
  duration: {
    type: String,
    default: "1h",
  },
});

const emit = defineEmits(["close"]);

const router = useRouter();
const confettiColors = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-indigo-500",
];

const closeModal = () => {
  emit("close");
};
</script>

<style scoped>
@keyframes confetti-1 {
  0% {
    transform: translate(0, 0) rotate(45deg);
  }
  100% {
    transform: translate(-20px, -20px) rotate(225deg);
    opacity: 0;
  }
}
@keyframes confetti-2 {
  0% {
    transform: translate(0, 0) rotate(45deg);
  }
  100% {
    transform: translate(20px, -20px) rotate(225deg);
    opacity: 0;
  }
}
@keyframes confetti-3 {
  0% {
    transform: translate(0, 0) rotate(45deg);
  }
  100% {
    transform: translate(-20px, 20px) rotate(225deg);
    opacity: 0;
  }
}
@keyframes confetti-4 {
  0% {
    transform: translate(0, 0) rotate(45deg);
  }
  100% {
    transform: translate(20px, 20px) rotate(225deg);
    opacity: 0;
  }
}
@keyframes confetti-5 {
  0% {
    transform: translate(0, 0) rotate(45deg);
  }
  100% {
    transform: translate(0, -30px) rotate(225deg);
    opacity: 0;
  }
}
@keyframes confetti-6 {
  0% {
    transform: translate(0, 0) rotate(45deg);
  }
  100% {
    transform: translate(-30px, 0) rotate(225deg);
    opacity: 0;
  }
}
@keyframes confetti-7 {
  0% {
    transform: translate(0, 0) rotate(45deg);
  }
  100% {
    transform: translate(30px, 0) rotate(225deg);
    opacity: 0;
  }
}
@keyframes confetti-8 {
  0% {
    transform: translate(0, 0) rotate(45deg);
  }
  100% {
    transform: translate(0, 30px) rotate(225deg);
    opacity: 0;
  }
}

.animate-confetti-1 {
  animation: confetti-1 1s ease-out forwards;
}
.animate-confetti-2 {
  animation: confetti-2 1s ease-out forwards;
}
.animate-confetti-3 {
  animation: confetti-3 1s ease-out forwards;
}
.animate-confetti-4 {
  animation: confetti-4 1s ease-out forwards;
}
.animate-confetti-5 {
  animation: confetti-5 1s ease-out forwards;
}
.animate-confetti-6 {
  animation: confetti-6 1s ease-out forwards;
}
.animate-confetti-7 {
  animation: confetti-7 1s ease-out forwards;
}
.animate-confetti-8 {
  animation: confetti-8 1s ease-out forwards;
}
</style>