<template>
  <pre ref="panelRef" :class="`intro-dither-${position}`">{{ pattern }}</pre>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';

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

const panelRef = ref<HTMLPreElement | null>(null);
const pattern = ref<string>('');

const DEFAULT_CHARS = ['.', '·', '•', '●', '◉'];
const chars = props.chars || DEFAULT_CHARS;

let mouseX = -1000;
let mouseY = -1000;
let ripples: Ripple[] = [];
let animationFrameId: number | null = null;

function noise2D(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function generatePattern(
  mouseX: number,
  mouseY: number,
  elementRect: DOMRect,
  ripples: Ripple[]
): string {
  const lines: string[] = [];
  const currentWidth = props.width;
  
  for (let y = 0; y < props.height; y++) {
    let line = '';
    for (let x = 0; x < currentWidth; x++) {
      const charWidth = elementRect.width / currentWidth;
      const charHeight = elementRect.height / props.height;
      const pixelX = elementRect.left + x * charWidth;
      const pixelY = elementRect.top + y * charHeight;
      
      // Base pattern - start with dots (lower noise values)
      const noise = noise2D(x * 0.15, y * 0.15) * 0.3;
      
      let disturbance = 0;
      
      // Animated ripples effect
      for (const ripple of ripples) {
        const rdx = pixelX - ripple.x;
        const rdy = pixelY - ripple.y;
        const rippleDistance = Math.sqrt(rdx * rdx + rdy * rdy);
        
        // Expanding ripple based on time
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
      
      // Map to character set
      const charIndex = Math.floor(finalValue * chars.length);
      const clampedIndex = Math.max(0, Math.min(charIndex, chars.length - 1));
      
      line += chars[clampedIndex];
    }
    lines.push(line);
  }
  
  return lines.join('\n');
}

function render(mx: number, my: number, allRipples: Ripple[]): void {
  if (!panelRef.value) return;
  
  const rect = panelRef.value.getBoundingClientRect();
  pattern.value = generatePattern(mx, my, rect, allRipples);
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
  getElement: () => panelRef.value,
});

// Watch for width changes and update pattern
watch(() => props.width, () => {
  if (panelRef.value) {
    const rect = panelRef.value.getBoundingClientRect();
    pattern.value = generatePattern(mouseX, mouseY, rect, ripples);
  }
});

onMounted(() => {
  // Initial render with empty state
  if (panelRef.value) {
    const rect = panelRef.value.getBoundingClientRect();
    pattern.value = generatePattern(-1000, -1000, rect, []);
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

