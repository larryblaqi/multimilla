<!-- src/components/CustomDatePicker.vue -->
<template>
  <div class="custom-date-picker">
    <!-- Month and Year Selection -->
    <div class="flex justify-between items-center mb-4">
      <button @click="prevMonth" class="p-2 hover:bg-gray-100 rounded-full">
        &lt;
      </button>
      
      <!-- Month Dropdown -->
      <div class="flex items-center space-x-2">
        <select 
          v-model="currentMonth" 
          @change="updateCalendar"
          class="p-1 border rounded"
        >
          <option 
            v-for="(month, index) in monthNames" 
            :key="month" 
            :value="index"
          >
            {{ month }}
          </option>
        </select>
        
        <!-- Year Dropdown -->
        <select 
          v-model="currentYear" 
          @change="updateCalendar"
          class="p-1 border rounded"
        >
          <option 
            v-for="year in yearRange" 
            :key="year" 
            :value="year"
          >
            {{ year }}
          </option>
        </select>
      </div>
      
      <button @click="nextMonth" class="p-2 hover:bg-gray-100 rounded-full">
        &gt;
      </button>
    </div>
    
    <!-- Days of Week -->
    <div class="grid grid-cols-7 text-center mb-2 text-gray-500">
      <div
        v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
        :key="day"
        class="p-1"
      >
        {{ day }}
      </div>
    </div>
    
    <!-- Calendar Days -->
    <div class="grid grid-cols-7 text-center">
      <button
        v-for="day in calendarDays"
        :key="day ? day.toISOString() : 'empty'"
        :disabled="!day"
        @click="day && selectDate(day)"
        class="p-2 hover:bg-gray-100 disabled:text-gray-300"
        :class="{
          'bg-red-700 text-white': day && isSameDay(day, selectedDate),
          'bg-red-200': day && isSameDay(day, new Date()),
        }"
      >
        {{ day ? day.getDate() : "" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits, defineProps, onMounted } from "vue";

const props = defineProps({
  initialDate: {
    type: [Date, String, Number],
    default: () => new Date(),
  },
  // Optional prop to customize year range
  yearRangeStart: {
    type: Number,
    default: null
  },
  yearRangeEnd: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(["select"]);

// Normalize initialDate to a Date object
const normalizeDate = (date) => {
  if (date instanceof Date) return date;
  const parsedDate = new Date(date);
  return isNaN(parsedDate) ? new Date() : parsedDate;
};

// Current view state
const currentMonth = ref(0);
const currentYear = ref(0);
const selectedDate = ref(new Date());

// Initialize dates after component mount
onMounted(() => {
  const normalizedDate = normalizeDate(props.initialDate);
  currentMonth.value = normalizedDate.getMonth();
  currentYear.value = normalizedDate.getFullYear();
  selectedDate.value = normalizedDate;
});

// Month names for display
const monthNames = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

// Compute year range
const yearRange = computed(() => {
  const currentYear = new Date().getFullYear();
  const start = props.yearRangeStart || (currentYear - 50);
  const end = props.yearRangeEnd || (currentYear + 10);
  return Array.from(
    { length: end - start + 1 }, 
    (_, i) => start + i
  );
});

// Computed properties
const calendarDays = computed(() => {
  // Get the first day of the current month
  const firstDay = new Date(currentYear.value, currentMonth.value, 1);
  
  // Get the last day of the current month
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0);
  
  // Calculate days to show from previous month
  const startingDay = firstDay.getDay();
  
  // Create array of days to display
  const days = [];
  
  // Add empty slots for days before the first day of the month
  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }
  
  // Add days of the current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(currentYear.value, currentMonth.value, i));
  }
  
  return days;
});

// Methods
const selectDate = (date) => {
  selectedDate.value = date;
  emit("select", date);
};

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};

// Additional method to handle calendar updates
const updateCalendar = () => {
  // This method allows manual updates through dropdowns
};

const isSameDay = (date1, date2) => {
  return (
    date1 &&
    date2 &&
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};
</script>

<style scoped>
.custom-date-picker select {
  @apply appearance-none;
  @apply cursor-pointer;
}
</style>