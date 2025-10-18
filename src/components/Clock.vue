<template>
  <div class="clock-widget">
    <div class="clock-time">{{ currentTime }}</div>
    <div v-if="showDate" class="clock-date">{{ currentDate }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Props {
  format?: '12h' | '24h';
  showDate?: boolean;
  showSeconds?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  format: '24h',
  showDate: true,
  showSeconds: true,
});

const currentTime = ref('');
const currentDate = ref('');
let intervalId: number | null = null;

function updateTime() {
  const now = new Date();
  
  // Format time
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  
  if (props.format === '12h') {
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    currentTime.value = props.showSeconds 
      ? `${hours}:${minutes}:${seconds} ${ampm}`
      : `${hours}:${minutes} ${ampm}`;
  } else {
    const hoursStr = hours.toString().padStart(2, '0');
    currentTime.value = props.showSeconds 
      ? `${hoursStr}:${minutes}:${seconds}`
      : `${hoursStr}:${minutes}`;
  }
  
  // Format date
  if (props.showDate) {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    currentDate.value = now.toLocaleDateString('en-US', options);
  }
}

onMounted(() => {
  updateTime();
  intervalId = window.setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (intervalId !== null) {
    clearInterval(intervalId);
  }
});
</script>

<style scoped>
.clock-widget {
  padding: 1rem;
  text-align: center;
  font-family: monospace;
}

.clock-time {
  font-size: 2rem;
  font-weight: bold;
  color: #00ff00;
  text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
  margin-bottom: 0.5rem;
}

.clock-date {
  font-size: 1rem;
  color: #00aa00;
  opacity: 0.8;
}
</style>

