<template>
  <div class="matrix-demo">
    <div class="demo-section">
      <h3>Static Pattern (Smiley)</h3>
      <Matrix
        :rows="5"
        :cols="5"
        :pattern="smiley"
      />
    </div>

    <div class="demo-section">
      <h3>WCLI Logo</h3>
      <Matrix
        :rows="logoFrame.length"
        :cols="logoFrame[0]?.length || 0"
        :pattern="logoFrame"
        :chars="['░', '▒', '▓', '█']"
        :padding="4"
        :charSpacing="4"
      />
    </div>

    <div class="demo-section">
      <h3>Noise Pattern</h3>
      <Matrix
        :rows="8"
        :cols="20"
        :pattern="noisePattern"
      />
    </div>

    <div class="demo-section">
      <h3>Animated Ripple (Simple)</h3>
      <Matrix
        :rows="10"
        :cols="20"
        :pattern="rippleFrame"
      />
    </div>

    <div class="demo-section">
      <h3>Text to Bitmap (7x5 font)</h3>
      <Matrix
        :rows="helloFrame.length"
        :cols="helloFrame[0]?.length || 0"
        :pattern="helloFrame"
      />
    </div>

    <div class="demo-section">
      <h3>Text with spacing (charSpacing=2)</h3>
      <Matrix
        :rows="7"
        :cols="50"
        text="HELLO"
        :charSpacing="2"
      />
    </div>

    <div class="demo-section">
      <h3>Text with padding</h3>
      <Matrix
        :rows="15"
        :cols="40"
        text="HI"
        :padding="2"
      />
    </div>

    <div class="demo-section">
      <h3>Animated changes (toggle)</h3>
      <Matrix
        :rows="7"
        :cols="30"
        :text="toggleText"
        :animateChanges="true"
      />
      <div>
        <button @click="toggleText = toggleText === 'ON' ? 'OFF' : 'ON'" style="margin-top: 0.5rem;">Toggle</button>
      </div>
    </div>

    <div class="demo-section">
      <h3>Digital Clock</h3>
      <MatrixClock />
    </div>

    <div class="demo-section">
      <h3>Digital Clock (with seconds)</h3>
      <MatrixClock :showSeconds="true" />
    </div>

    <div class="demo-section full-width">
      <h3>Interactive Ripple (recreates DitherPanel - move your mouse!)</h3>
      <MatrixRipple :rows="15" :cols="60" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import Matrix from '../Matrix.vue';
import MatrixRipple from './MatrixRipple.vue';
import MatrixClock from './MatrixClock.vue';
import { textToMatrix, textToBitmap, createNoiseFrame, createEmptyFrame, applyRipple } from '../../utils/MatrixRenderer';

// Static smiley pattern
const smiley = ref([
  [0, 1, 1, 1, 0],
  [1, 0, 0, 0, 1],
  [1, 1, 0, 1, 1],
  [1, 0, 0, 0, 1],
  [0, 1, 1, 1, 0],
]);

// WCLI logo from text
const wcliText = `
██╗    ██╗  ██████╗ ██╗      ██╗
██║    ██║ ██╔════╝ ██║      ██║
██║ █╗ ██║ ██║      ██║      ██║
██║███╗██║ ██║      ██║      ██║
╚███╔███╔╝ ╚██████╗ ███████╗ ██║
 ╚══╝╚══╝   ╚═════╝ ╚══════╝ ╚═╝
`.trim();

const logoFrame = ref(textToMatrix(wcliText));

// Text to bitmap with 7x5 font
const helloFrame = ref(textToBitmap('HELLO'));

// Toggle text for animated changes demo
const toggleText = ref('ON');

// Noise pattern
const noisePattern = ref(createNoiseFrame(8, 20, 0.2, 0.7));

// Animated ripple
const rippleFrame = ref(createEmptyFrame(10, 20));
let rippleProgress = 0;
let animationId: number | null = null;

function animateRipple() {
  rippleProgress += 0.02;
  if (rippleProgress > 1) rippleProgress = 0;
  
  const baseFrame = createNoiseFrame(10, 20, 0.15, 0.3);
  rippleFrame.value = applyRipple(baseFrame, 10, 5, rippleProgress, 1, 15);
  
  animationId = requestAnimationFrame(animateRipple);
}

onMounted(() => {
  animateRipple();
});

onUnmounted(() => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
  }
});
</script>

<style scoped>
.matrix-demo {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
  color: #39bae6;
}

.demo-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.demo-section h3 {
  margin: 0;
  font-size: 0.9rem;
  color: #5ccfe6;
  opacity: 0.8;
}

.demo-section pre {
  font-size: 0.8rem;
}

.demo-section.full-width {
  grid-column: 1 / -1;
}
</style>

