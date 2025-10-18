<template>
  <pre ref="matrixRef" :class="className">{{ renderedContent }}</pre>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { Frame } from '../types/matrix';
import { renderFrame, textToBitmap, noise2D } from '@/utils/MatrixRenderer';

interface Props {
  rows: number;
  cols: number;
  pattern?: Frame;
  text?: string;
  chars?: string[];
  charSpacing?: number;
  lineHeight?: number;
  padding?: number;
  animate?: boolean;
  animateChanges?: boolean;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  chars: () => ['.', '·', '•', '●', '◉'],
  charSpacing: 1,
  lineHeight: 1,
  padding: 0,
  animate: true,
  animateChanges: false,
  className: '',
});

const matrixRef = ref<HTMLPreElement | null>(null);
const animationProgress = ref(1); // Start at 1 (no animation) until mounted
const previousPattern = ref<Frame | undefined>(undefined);

let animationId: number | null = null;

const computedPattern = computed(() => {
  // If text prop is provided, convert it to pattern
  if (props.text) {
    return textToBitmap(props.text, undefined, {
      charSpacing: props.charSpacing,
      lineHeight: props.lineHeight,
      padding: props.padding,
    });
  }
  return props.pattern;
});

// Detect pattern changes
watch(computedPattern, (newPattern, oldPattern) => {
  if (props.animateChanges && oldPattern && newPattern !== oldPattern) {
    previousPattern.value = oldPattern;
    animationProgress.value = 0;
    animate();
  }
});

const animatedPattern = computed(() => {
  const pattern = computedPattern.value;
  if (!pattern || !props.animate || animationProgress.value >= 1) {
    return pattern;
  }
  
  // Apply dither animation
  const frame: Frame = pattern.map(row => [...row]);
  
  for (let y = 0; y < frame.length; y++) {
    for (let x = 0; x < frame[y].length; x++) {
      const noiseValue = noise2D(x * 0.2, y * 0.2);
      const threshold = noiseValue * 0.6 + 0.25;
      
      if (animationProgress.value < threshold) {
        const ditherProgress = animationProgress.value / threshold;
        frame[y][x] = frame[y][x] * ditherProgress;
      }
    }
  }
  
  return frame;
});

const renderedContent = computed(() => {
  const pattern = animatedPattern.value;
  
  if (!pattern) {
    // Empty matrix
    return Array(props.rows).fill(props.chars[0].repeat(props.cols)).join('\n');
  }
  
  return renderFrame(pattern, props.chars);
});

function animate() {
  if (animationProgress.value < 1) {
    animationProgress.value = Math.min(1, animationProgress.value + 0.02);
    animationId = requestAnimationFrame(animate);
  }
}

onMounted(() => {
  if (props.animate) {
    animationProgress.value = 0;
    animate();
  }
});

onUnmounted(() => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
  }
});

defineExpose({
  getElement: () => matrixRef.value,
});
</script>

<style scoped>
pre {
  margin: 0;
  padding: 0;
  line-height: 1.2;
  font-family: monospace;
  white-space: pre;
}
</style>

