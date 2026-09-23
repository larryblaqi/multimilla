<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useHttp } from "../../composables/useHttp";

const { httpRequest } = useHttp();

const advertisements = ref([]);
const currentSlide = ref(0);
const isLoading = ref(true);
const autoSlideInterval = ref(null);
const refreshInterval = ref(null);

const sampleAds = [
  {
    id: 1,
    image: "https://via.placeholder.com/400x200/FF6B6B/FFFFFF?text=Special+Offer",
    title: "Special Loan Offer",
    description: "Get up to ₦500,000 at 2% interest rate",
    link: "/wallet/loan",
  },
  {
    id: 2,
    image: "https://via.placeholder.com/400x200/4ECDC4/FFFFFF?text=Fixed+Deposit",
    title: "High Yield Investment",
    description: "Earn up to 18% on your fixed deposit",
    link: "/wallet/fixed-deposit",
  },
  {
    id: 3,
    image: "https://via.placeholder.com/400x200/45B7D1/FFFFFF?text=Virtual+Cards",
    title: "Virtual Cards Available",
    description: "Create virtual cards for online shopping",
    link: "/wallet/cards",
  },
];

const startAutoSlide = () => {
  stopAutoSlide();
  if (advertisements.value.length > 1) {
    autoSlideInterval.value = setInterval(() => {
      nextSlide();
    }, 4000);
  }
};

const stopAutoSlide = () => {
  if (autoSlideInterval.value) {
    clearInterval(autoSlideInterval.value);
    autoSlideInterval.value = null;
  }
};

const nextSlide = () => {
  if (advertisements.value.length === 0) {
    return;
  }
  currentSlide.value = (currentSlide.value + 1) % advertisements.value.length;
};

const fetchAdvertisements = async () => {
  try {
    isLoading.value = true;
    const response = await httpRequest("GET", "/customer/advertisements");
    const apiAds = response?.data?.data ?? [];
    advertisements.value = apiAds.length ? apiAds : sampleAds;
    currentSlide.value = 0;
    startAutoSlide();
  } catch (error) {
    console.error("Failed to fetch advertisements:", error);
    advertisements.value = sampleAds;
    currentSlide.value = 0;
    startAutoSlide();
  } finally {
    isLoading.value = false;
  }
};

const refreshAdvertisements = async () => {
  stopAutoSlide();
  await fetchAdvertisements();
};

defineExpose({
  refreshAdvertisements,
});

const handleVisibilityChange = () => {
  if (!document.hidden) {
    refreshAdvertisements();
  } else {
    stopAutoSlide();
  }
};

onMounted(() => {
  fetchAdvertisements();
  refreshInterval.value = setInterval(fetchAdvertisements, 30000);
  document.addEventListener("visibilitychange", handleVisibilityChange);
});

onUnmounted(() => {
  stopAutoSlide();
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
    refreshInterval.value = null;
  }
  document.removeEventListener("visibilitychange", handleVisibilityChange);
});
</script>

<template>
  <!-- Single wrapper always present — reserves space so siblings never shift -->
  <div class="w-full">
    <div class="relative bg-white rounded-2xl shadow-sm overflow-hidden" style="min-height: 110px;">

      <!-- Loading skeleton -->
      <div
        v-if="isLoading"
        class="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 flex items-center px-5 gap-4"
      >
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-300 rounded w-3/4"></div>
          <div class="h-3 bg-gray-300 rounded w-1/2"></div>
          <div class="h-8 bg-gray-300 rounded-full w-24 mt-3"></div>
        </div>
        <div class="w-16 h-16 bg-gray-300 rounded-full flex-shrink-0"></div>
      </div>

      <!-- Slider content -->
      <div
        v-else-if="advertisements.length > 0"
        class="absolute inset-0"
      >
        <!-- Slides track -->
        <div
          class="flex h-full"
          :style="{ transform: `translateX(-${currentSlide * 100}%)`, transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }"
        >
          <div
            v-for="(ad, index) in advertisements"
            :key="ad.id"
            class="w-full flex-shrink-0 h-full relative cursor-pointer"
            @click="ad.link && $router.push(ad.link)"
          >
            <!-- Full width Image -->
            <div class="relative h-full w-full flex items-center justify-center overflow-hidden">
              <img
                v-if="ad.image_url || ad.image"
                :src="ad.image_url || ad.image"
                :alt="ad.title || 'Advertisement ' + (index + 1)"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-gray-200">
                <span class="text-xl font-bold text-gray-400">Offer {{ index + 1 }}</span>
              </div>
              
              <!-- Title Overlay -->
              <div v-if="ad.title" class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pt-12 pb-6">
                <h3 class="text-white font-bold text-sm sm:text-base line-clamp-1 drop-shadow-md">{{ ad.title }}</h3>
              </div>
            </div>
          </div>
        </div>

        <!-- Dot indicators -->
        <div
          v-if="advertisements.length > 1"
          class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20"
        >
          <button
            v-for="(_, i) in advertisements"
            :key="i"
            @click="currentSlide = i"
            class="rounded-full transition-all duration-300"
            :class="i === currentSlide ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'"
          />
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-else
        class="absolute inset-0 flex items-center justify-center bg-gray-50"
      >
        <p class="text-gray-400 text-sm">No promotions right now</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
