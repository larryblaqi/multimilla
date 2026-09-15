<template>
  <div class="relative w-full h-[180px] overflow-hidden rounded-xl group">
    <template v-for="(slide, index) in slides" :key="index">
      <div
        class="absolute inset-0 transition-opacity duration-700 ease-in-out"
        :class="currentSlide === index ? 'opacity-100' : 'opacity-0'"
      >
        <!-- Background Image -->
        <div
          class="absolute inset-0 bg-cover bg-center"
          :style="{ backgroundImage: `url(${slide.image})` }"
        >
          <!-- Dark Overlay -->
          <div class="absolute inset-0 bg-black opacity-50"></div>
        </div>

        <!-- Content Container -->
        <div
          class="relative z-10 flex flex-col justify-center h-full p-6 text-center"
        >
          <h3
            class="text-white text-lg md:text-2xl font-semibold mb-4 max-w-xl mx-auto"
          >
            {{ slide.title }}
          </h3>
          <button
            class="mx-auto bg-white text-red-700 px-6 py-2 rounded-full w-fit text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            {{ slide.buttonText }}
          </button>
        </div>
      </div>
    </template>

    <!-- Navigation Buttons -->
    <button
      @click="prevSlide"
      class="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/50 hover:bg-white/75 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </button>
    <button
      @click="nextSlide"
      class="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/50 hover:bg-white/75 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>

    <!-- Slide Indicators -->
    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
      <div
        v-for="(_, index) in slides"
        :key="index"
        class="h-2 transition-all rounded-full"
        :class="[currentSlide === index ? 'bg-white w-6' : 'bg-white/50 w-2']"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

// Import local images
import tv1 from "../../assets/images/tv.avif";
import tv2 from "../../assets/images/tv2.avif";
import tv3 from "../../assets/images/tv3.avif";

// Slides configuration
const slides = [
  {
    image: tv1,
    title: "Catch the thrills, romance and action with your TV Subscription",
    buttonText: "Click Here Now",
  },
  {
    image: tv2,
    title: "Discover Endless Entertainment",
    buttonText: "Explore Packages",
  },
  {
    image: tv3,
    title: "Premium Content at Your Fingertips",
    buttonText: "Get Started",
  },
];

// Current slide state
const currentSlide = ref(0);

// Slide navigation functions
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length;
};

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length;
};

// Auto-slide functionality
let slideInterval;

onMounted(() => {
  slideInterval = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % slides.length;
  }, 5000);
});

onUnmounted(() => {
  clearInterval(slideInterval);
});
</script>

<style scoped>
button,
h3 {
  font-family: "Work Sans", sans-serif;
}
</style>
