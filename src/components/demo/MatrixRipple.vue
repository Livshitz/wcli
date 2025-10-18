<template>
  <div class="matrix-ripple-container" @mousemove="handleMouseMove">
    <Matrix
      ref="matrixRef"
      :rows="rows"
      :cols="cols"
      :pattern="currentFrame"
      :chars="chars"
      className="ripple-matrix"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import Matrix from '../Matrix.vue';
import type { Frame } from '../../types/matrix';
import { noise2D, createEmptyFrame } from '../../utils/MatrixRenderer';

interface Ripple {
  x: number;
  y: number;
  time: number;
  maxTime: number;
  strength?: number;
}

interface Props {
  rows?: number;
  cols?: number;
  chars?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  rows: 20,
  cols: 40,
  chars: () => ['.', '·', '•', '●', '◉'],
});

const matrixRef = ref<InstanceType<typeof Matrix> | null>(null);
const currentFrame = ref<Frame>(createEmptyFrame(props.rows, props.cols));

let mouseX = -1000;
let mouseY = -1000;
let ripples: Ripple[] = [];
let animationId: number | null = null;
let lastTime = performance.now();

function handleMouseMove(e: MouseEvent) {
  const rect = matrixRef.value?.getElement()?.getBoundingClientRect();
  if (!rect) return;
  
  mouseX = e.clientX;
  mouseY = e.clientY;
  
  // Create ripple on mouse move (with velocity threshold)
  if (Math.random() > 0.95) {
    ripples.push({
      x: mouseX,
      y: mouseY,
      time: 0,
      maxTime: 1500,
      strength: 0.8,
    });
  }
}

function generateFrame(): Frame {
  const frame: Frame = [];
  const element = matrixRef.value?.getElement();
  if (!element) return createEmptyFrame(props.rows, props.cols);
  
  const rect = element.getBoundingClientRect();
  
  for (let y = 0; y < props.rows; y++) {
    frame[y] = [];
    for (let x = 0; x < props.cols; x++) {
      const charWidth = rect.width / props.cols;
      const charHeight = rect.height / props.rows;
      const pixelX = rect.left + x * charWidth;
      const pixelY = rect.top + y * charHeight;
      
      // Base noise pattern
      const noise = noise2D(x * 0.15, y * 0.15) * 0.3;
      
      let disturbance = 0;
      
      // Apply ripple effects
      for (const ripple of ripples) {
        const rdx = pixelX - ripple.x;
        const rdy = pixelY - ripple.y;
        const distance = Math.sqrt(rdx * rdx + rdy * rdy);
        
        const mult = ripple.strength || 1.0;
        const rippleRadius = (ripple.time / ripple.maxTime) * 350 * mult;
        const rippleWidth = 80 * mult;
        
        if (Math.abs(distance - rippleRadius) < rippleWidth) {
          const strength = (1 - (ripple.time / ripple.maxTime)) * mult;
          const edgeDist = Math.abs(distance - rippleRadius) / rippleWidth;
          const wave = Math.sin(edgeDist * Math.PI) * strength;
          disturbance = Math.max(disturbance, wave * 0.6);
        }
      }
      
      frame[y][x] = Math.max(0, Math.min(1, noise + disturbance));
    }
  }
  
  return frame;
}

function animate() {
  const currentTime = performance.now();
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  
  // Update ripples
  for (let i = ripples.length - 1; i >= 0; i--) {
    ripples[i].time += deltaTime;
    if (ripples[i].time >= ripples[i].maxTime) {
      ripples.splice(i, 1);
    }
  }
  
  // Add random ripples occasionally
  if (Math.random() > 0.995) {
    const element = matrixRef.value?.getElement();
    if (element) {
      const rect = element.getBoundingClientRect();
      ripples.push({
        x: rect.left + Math.random() * rect.width,
        y: rect.top + Math.random() * rect.height,
        time: 0,
        maxTime: 2000,
      });
    }
  }
  
  currentFrame.value = generateFrame();
  animationId = requestAnimationFrame(animate);
}

onMounted(() => {
  currentFrame.value = generateFrame();
  animate();
});

onUnmounted(() => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
  }
});
</script>

<style scoped>
.matrix-ripple-container {
  display: inline-block;
  cursor: crosshair;
  user-select: none;
}

.ripple-matrix {
  color: #39bae6;
  /* font-size: 0.7rem; */
  line-height: 1;
}
</style>

