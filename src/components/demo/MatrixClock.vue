<template>
  <div class="matrix-clock" @mousemove="handleMouseMove">
    <Matrix
      ref="matrixRef"
      :rows="7"
      :cols="totalCols"
      :pattern="displayFrame"
      :chars="chars"
      className="clock-display"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Matrix from '../Matrix.vue';
import type { Frame } from '../../types/matrix';
import { noise2D } from '../../utils/MatrixRenderer';
import { textToBitmap, measureText, FONT_7x5 } from '../../utils/BitmapFont';

interface Ripple {
  x: number;
  y: number;
  time: number;
  maxTime: number;
}

interface Props {
  showSeconds?: boolean;
  chars?: string[];
  animate?: boolean;
  charSpacing?: number;
}

const props = withDefaults(defineProps<Props>(), {
  showSeconds: false,
  chars: () => ['·', '•', '●', '◉'],
  animate: true,
  charSpacing: 1,
});

const matrixRef = ref<InstanceType<typeof Matrix> | null>(null);
const currentTime = ref('');
const previousTime = ref('');
const animationProgress = ref(0);
const ripples = ref<Ripple[]>([]);

let intervalId: number | null = null;
let animationId: number | null = null;
let lastTime = performance.now();
let mouseX = -1000;
let mouseY = -1000;

const totalCols = computed(() => {
  const dimensions = measureText(currentTime.value, undefined, {
    charSpacing: props.charSpacing,
  });
  return dimensions.width;
});

const baseClockFrame = computed(() => {
  return textToBitmap(currentTime.value, undefined, {
    charSpacing: props.charSpacing,
  });
});

// Track which columns changed for selective animation
const changedColumns = computed(() => {
  if (!previousTime.value) return new Set<number>();
  
  const changed = new Set<number>();
  const currentChars = currentTime.value.split('');
  const previousChars = previousTime.value.split('');
  
  let colOffset = 0;
  for (let i = 0; i < Math.max(currentChars.length, previousChars.length); i++) {
    const currentChar = currentChars[i];
    const previousChar = previousChars[i];
    
    // Get glyph width from font
    const glyph = FONT_7x5[currentChar] || FONT_7x5[currentChar?.toUpperCase()] || FONT_7x5[' '];
    const width = glyph[0]?.length || 3;
    
    if (currentChar !== previousChar) {
      // Mark all columns for this character as changed
      for (let c = 0; c < width; c++) {
        changed.add(colOffset + c);
      }
    }
    
    // Calculate column offset for next character
    colOffset += width + props.charSpacing;
  }
  
  return changed;
});

const displayFrame = computed(() => {
  const frame = baseClockFrame.value.map(row => [...row]);
  const element = matrixRef.value?.getElement();
  if (!element) return frame;
  
  const rect = element.getBoundingClientRect();
  const cols = changedColumns.value;
  
  for (let y = 0; y < frame.length; y++) {
    for (let x = 0; x < frame[y].length; x++) {
      const charWidth = rect.width / totalCols.value;
      const charHeight = rect.height / 7;
      const pixelX = rect.left + x * charWidth;
      const pixelY = rect.top + y * charHeight;
      
      let value = frame[y][x];
      
      // Dither animation only on changed columns
      if (props.animate && animationProgress.value < 1 && cols.has(x)) {
        const noiseValue = noise2D(x * 0.2, y * 0.2);
        const threshold = noiseValue * 0.6 + 0.25;
        
        if (animationProgress.value < threshold) {
          const ditherProgress = animationProgress.value / threshold;
          value = value * ditherProgress;
        }
      }
      
      // Ripple effects
      for (const ripple of ripples.value) {
        const rdx = pixelX - ripple.x;
        const rdy = pixelY - ripple.y;
        const distance = Math.sqrt(rdx * rdx + rdy * rdy);
        
        const rippleRadius = (ripple.time / ripple.maxTime) * 200;
        const rippleWidth = 50;
        
        if (Math.abs(distance - rippleRadius) < rippleWidth) {
          const strength = (1 - (ripple.time / ripple.maxTime)) * 0.4;
          const edgeDist = Math.abs(distance - rippleRadius) / rippleWidth;
          const wave = Math.sin(edgeDist * Math.PI) * strength;
          value = Math.max(0, Math.min(1, value + wave));
        }
      }
      
      frame[y][x] = value;
    }
  }
  
  return frame;
});

function handleMouseMove(e: MouseEvent) {
  mouseX = e.clientX;
  mouseY = e.clientY;
  
  // Create subtle ripples on mouse movement
  if (Math.random() > 0.97) {
    ripples.value.push({
      x: mouseX,
      y: mouseY,
      time: 0,
      maxTime: 1200,
    });
  }
}

function updateTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  const newTime = props.showSeconds 
    ? `${hours}:${minutes}:${seconds}`
    : `${hours}:${minutes}`;
  
  // Reset animation when time changes
  if (newTime !== currentTime.value && currentTime.value !== '') {
    previousTime.value = currentTime.value;
    animationProgress.value = 0;
  }
  
  currentTime.value = newTime;
}

function animate() {
  const now = performance.now();
  const deltaTime = now - lastTime;
  lastTime = now;
  
  // Animate dither effect (faster on updates, slower on initial)
  if (animationProgress.value < 1) {
    const speed = previousTime.value === '' ? 0.015 : 0.03; // Faster for updates
    animationProgress.value = Math.min(1, animationProgress.value + speed);
  }
  
  // Update ripples
  for (let i = ripples.value.length - 1; i >= 0; i--) {
    ripples.value[i].time += deltaTime;
    if (ripples.value[i].time >= ripples.value[i].maxTime) {
      ripples.value.splice(i, 1);
    }
  }
  
  animationId = requestAnimationFrame(animate);
}

onMounted(() => {
  updateTime();
  intervalId = window.setInterval(updateTime, 1000);
  
  if (props.animate) {
    animate();
  } else {
    animationProgress.value = 1;
  }
});

onUnmounted(() => {
  if (intervalId !== null) {
    clearInterval(intervalId);
  }
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
  }
});
</script>

<style scoped>
.matrix-clock {
  display: inline-block;
  cursor: crosshair;
  user-select: none;
}

.clock-display {
  color: #39bae6;
  font-size: 0.85rem;
  line-height: 1.1;
}
</style>

