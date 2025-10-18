<template>
  <Matrix
    ref="matrixRef"
    :rows="height"
    :cols="width"
    :pattern="currentFrame"
    :chars="chars"
    :className="`intro-dither-${position}`"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import Matrix from './Matrix.vue';
import type { Frame } from '../types/matrix';
import { noise2D } from '../utils/MatrixRenderer';

interface Ripple {
  x: number;
  y: number;
  time: number;
  maxTime: number;
  strength?: number;
}

interface Props {
  width: number;
  height: number;
  position: 'left' | 'right';
  chars?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  chars: () => ['.', '·', '•', '●', '◉'],
});

const matrixRef = ref<InstanceType<typeof Matrix> | null>(null);
const currentFrame = ref<Frame>([]);

let mouseX = -1000;
let mouseY = -1000;
let ripples: Ripple[] = [];
let animationFrameId: number | null = null;

function generateFrame(
  mouseX: number,
  mouseY: number,
  elementRect: DOMRect,
  ripples: Ripple[]
): Frame {
  const frame: Frame = [];
  const currentWidth = props.width;
  
  for (let y = 0; y < props.height; y++) {
    frame[y] = [];
    for (let x = 0; x < currentWidth; x++) {
      const charWidth = elementRect.width / currentWidth;
      const charHeight = elementRect.height / props.height;
      const pixelX = elementRect.left + x * charWidth;
      const pixelY = elementRect.top + y * charHeight;
      
      // Base pattern
      const noise = noise2D(x * 0.15, y * 0.15) * 0.3;
      
      let disturbance = 0;
      
      // Animated ripples effect
      for (const ripple of ripples) {
        const rdx = pixelX - ripple.x;
        const rdy = pixelY - ripple.y;
        const rippleDistance = Math.sqrt(rdx * rdx + rdy * rdy);
        
        const rippleMultiplier = ripple.strength || 1.0;
        const rippleRadius = (ripple.time / ripple.maxTime) * 350 * rippleMultiplier;
        const rippleWidth = 80 * rippleMultiplier;
        
        if (Math.abs(rippleDistance - rippleRadius) < rippleWidth) {
          const rippleStrength = (1 - (ripple.time / ripple.maxTime)) * rippleMultiplier;
          const edgeDist = Math.abs(rippleDistance - rippleRadius) / rippleWidth;
          const wave = Math.sin(edgeDist * Math.PI) * rippleStrength;
          disturbance = Math.max(disturbance, wave * 0.6);
        }
      }
      
      // Apply disturbance to base pattern
      const finalValue = Math.max(0, Math.min(1, noise + disturbance));
      frame[y][x] = finalValue;
    }
  }
  
  return frame;
}

function render(mx: number, my: number, allRipples: Ripple[]): void {
  const element = matrixRef.value?.getElement();
  if (!element) return;
  
  const rect = element.getBoundingClientRect();
  currentFrame.value = generateFrame(mx, my, rect, allRipples);
}

function updateAnimation(currentRipples: Ripple[], currentMouseX: number, currentMouseY: number) {
  ripples = currentRipples;
  mouseX = currentMouseX;
  mouseY = currentMouseY;
  render(mouseX, mouseY, ripples);
}

defineExpose({
  render,
  updateAnimation,
  getElement: () => matrixRef.value?.getElement(),
});

// Watch for width changes and update pattern
watch(() => props.width, () => {
  const element = matrixRef.value?.getElement();
  if (element) {
    const rect = element.getBoundingClientRect();
    currentFrame.value = generateFrame(mouseX, mouseY, rect, ripples);
  }
});

onMounted(() => {
  // Initial render with empty state
  const element = matrixRef.value?.getElement();
  if (element) {
    const rect = element.getBoundingClientRect();
    currentFrame.value = generateFrame(-1000, -1000, rect, []);
  }
});

onUnmounted(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<style scoped>
/* Styles are in parent component (IntroSection.vue) using :deep() */
</style>

