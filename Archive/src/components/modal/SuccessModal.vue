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
        v-if="showSuccessModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center md:justify-center z-50"
        @click.self="closeModal"
      >
        <div
          class="transform bg-white w-full md:max-w-md rounded-t-3xl md:rounded-3xl p-6 space-y-6"
        >
          <!-- Success Icon and Animation -->
          <div class="flex justify-center">
            <div class="relative">
              <!-- Circle -->
              <div
                class="w-24 h-24 rounded-full bg-green-600 flex items-center justify-center"
              >
                <!-- Checkmark -->
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- Success Text -->
          <div class="text-center space-y-2">
            <h2 class="text-2xl font-semibold text-gray-800">Successful !</h2>
            <p class="text-gray-500">
              {{ message }}
            </p>
            <p class="text-gray-500" v-if="extraInfo">{{ getDataLabel() }}: {{ extraInfo }}</p>
          </div>

          <!-- Buttons -->
          <div class="flex justify-center items-center">
            <button
              @click="closeModal"
              class="py-3 px-4 bg-green-600 text-white rounded-lg font-medium transition-colors"
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
  showSuccessModal: Boolean,
  message: {
    type: String,
  },
  extraInfo: {
    Type: String,
    default: "",
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
  type: {
    type: String,
    default: "",
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

const getDataLabel = () => {
  if (props.type === 'eletricity') {
    return 'Token';
  } else if  (props.type === 'showmax') {
    return 'Voucher';
  } 
};

const closeModal = () => {
  emit("close");
};

const copyAccountId = async () => {
  try {
    await navigator.clipboard.writeText(props.accountId);
    // Optional: Show a toast notification for successful copy
  } catch (err) {
    console.error("Failed to copy:", err);
  }
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
/* Existing confetti animations remain unchanged */
@keyframes confetti-1 {
  0% {
    transform: translate(0, 0) rotate(45deg);
  }
  100% {
    transform: translate(-20px, -20px) rotate(225deg);
    opacity: 0;
  }
}
/* ... (rest of the original confetti animations) ... */

.animate-confetti-1 {
  animation: confetti-1 1s ease-out forwards;
}
h2,
button,
p {
  font-family: "Work Sans", sans-serif;
}
</style>