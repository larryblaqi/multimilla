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
        v-if="showErrorModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center md:justify-center z-50"
        @click.self="closeModal"
      >
        <div
          class="transform bg-white w-full md:max-w-md rounded-t-3xl md:rounded-3xl p-6 space-y-6"
        >
          <!-- Error Icon and Animation -->
          <div class="flex justify-center">
            <div class="relative">
              <!-- Circle -->
              <div
                class="w-24 h-24 rounded-full bg-red-700 flex items-center justify-center"
              >
                <!-- Cross Icon -->
                <svg
                  class="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <!-- Confetti Animation -->
              <div class="absolute -inset-4">
                <div
                  v-for="n in 8"
                  :key="n"
                  :class="[
                    'absolute w-2 h-2 transform rotate-45',
                    `animate-confetti-${n}`,
                    confettiColors[n % confettiColors.length],
                  ]"
                ></div>
              </div>
            </div>
          </div>

          <!-- Error Text -->
          <div class="text-center space-y-2">
            <h2 class="text-2xl font-semibold text-gray-900">Error !</h2>
            <p class="text-gray-600">
              {{ errMessage }}
            </p>
          </div>

          <!-- Buttons -->
          <div class="flex justify-center items-center">
            <button
              @click="closeModal"
              class="py-3 px-4 bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Close
            </button>
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
  showErrorModal: Boolean,
  errMessage: {
    type: String,
    default: "There was an error running this operation",
  },
  duration: {
    type: String,
    default: "1h",
  },
});

const emit = defineEmits(["close", "continue"]);

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

const onContinue = () => {
  emit("continue");
};
</script>

<style>
/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .transform,
.modal-leave-active .transform {
  transition: transform 0.3s ease;
}

/* Mobile animation - slides from bottom */
@media (max-width: 767px) {
  .modal-enter-from .transform {
    transform: translateY(100%);
  }

  .modal-leave-to .transform {
    transform: translateY(100%);
  }
}

/* Desktop animation - fades in and scales up */
@media (min-width: 768px) {
  .modal-enter-from .transform {
    transform: scale(0.95);
  }

  .modal-leave-to .transform {
    transform: scale(0.95);
  }
}
</style>

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

h2,
button,
p {
  font-family: "Work Sans", sans-serif;
}
</style>
