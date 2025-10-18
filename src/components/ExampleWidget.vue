<template>
  <div class="example-widget">
    <h3>{{ title }}</h3>
    <p>{{ message }}</p>
    <div class="widget-content">
      <button @click="increment" class="widget-button">
        Clicked {{ count }} times
      </button>
    </div>
    <div v-if="showDetails" class="widget-details">
      <p>Additional details shown!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  title?: string;
  message?: string;
  initialCount?: number;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Example Widget',
  message: 'This is a demo component that can be rendered in the terminal',
  initialCount: 0,
});

const count = ref(props.initialCount);
const showDetails = ref(false);

function increment() {
  count.value++;
  if (count.value >= 5) {
    showDetails.value = true;
  }
}
</script>

<style scoped>
.example-widget {
  padding: 1rem;
  border: 1px solid #333;
  border-radius: 4px;
  background: rgba(0, 20, 0, 0.5);
  margin: 0.5rem 0;
  font-family: monospace;
}

.example-widget h3 {
  margin: 0 0 0.5rem 0;
  color: #0f0;
  font-size: 1.2rem;
}

.example-widget p {
  margin: 0.5rem 0;
  color: #0f0;
}

.widget-content {
  margin: 1rem 0;
}

.widget-button {
  padding: 0.5rem 1rem;
  background: #0f0;
  color: #000;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-family: monospace;
  font-weight: bold;
  transition: all 0.2s;
}

.widget-button:hover {
  background: #0d0;
  transform: scale(1.05);
}

.widget-button:active {
  transform: scale(0.95);
}

.widget-details {
  margin-top: 1rem;
  padding: 0.5rem;
  border-top: 1px solid #0f0;
  color: #0f0;
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

