<template>
  <div class="intro-section">
    <!-- Animation container -->
    <div ref="animationContainerRef" class="intro-animation" :class="{ 'intro-complete': animationComplete }">
      <DitherPanel 
        ref="leftPanelRef" 
        :width="ditherWidth" 
        :height="logoHeight" 
        position="left"
      />
      <div ref="logoContainerRef" class="intro-logo-container">
        <pre v-if="logoContent" class="intro-logo" :class="{ 'intro-logo-final': logoFinal }" v-html="logoContent"></pre>
        <div v-if="animationComplete" class="version-badge">v{{ version }}</div>
      </div>
      <DitherPanel 
        ref="rightPanelRef" 
        :width="ditherWidth" 
        :height="logoHeight" 
        position="right"
      />
    </div>

	<!-- <Matrix :text="matrixText" :rows="10" :cols="50" :padding="4" :animateChanges="true" /> -->

    <!-- Welcome message -->
    <div v-if="showWelcome" class="intro-welcome">
      <div v-for="(line, idx) in welcomeLines" :key="idx" class="intro-welcome-line">
        {{ line }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { IntroAnimation } from '@/ui/IntroAnimation';
import DitherPanel from './DitherPanel.vue';
import Matrix from './Matrix.vue';
import packageJson from '../../package.json';

interface Props {
  onComplete?: () => void;
}

const props = defineProps<Props>();
const version = packageJson.version;

const leftPanelRef = ref<InstanceType<typeof DitherPanel> | null>(null);
const rightPanelRef = ref<InstanceType<typeof DitherPanel> | null>(null);
const logoContainerRef = ref<HTMLDivElement | null>(null);
const animationContainerRef = ref<HTMLDivElement | null>(null);
const logoContent = ref<string>('');
const logoFinal = ref(false);
const animationComplete = ref(false);
const showWelcome = ref(false);
const ditherWidth = ref<number>(30);
const matrixText = ref('heyyy');

//@ts-ignore
window.x=matrixText;

const WCLI_LOGO = `
██╗    ██╗ ██████╗██╗     ██╗
██║    ██║██╔════╝██║     ██║
██║ █╗ ██║██║     ██║     ██║
██║███╗██║██║     ██║     ██║
╚███╔███╔╝╚██████╗███████╗██║
 ╚══╝╚══╝  ╚═════╝╚══════╝╚═╝
`.trim();

const logoHeight = WCLI_LOGO.split('\n').length;

// Calculate dither width based on available space
function calculateDitherWidth(): void {
  if (!logoContainerRef.value || !animationContainerRef.value) return;
  
  const containerWidth = animationContainerRef.value.getBoundingClientRect().width;
  const logoWidth = logoContainerRef.value.getBoundingClientRect().width;
  
  // Get gap width from computed styles
  const containerStyle = window.getComputedStyle(animationContainerRef.value);
  const gap = parseFloat(containerStyle.gap) || 30;
  
  // Calculate available width on each side (subtract logo and gaps)
  const totalAvailableWidth = containerWidth - logoWidth - (gap * 2);
  const singleSideWidth = totalAvailableWidth / 2;
  
  // Determine font size based on viewport (matching CSS media queries)
  let fontSize = '14px';
  const viewportWidth = window.innerWidth;
  if (viewportWidth <= 768) {
    fontSize = '6px';
  } else if (viewportWidth <= 1024) {
    fontSize = '11px';
  } else if (viewportWidth >= 1400) {
    fontSize = '16px';
  } else if (viewportWidth >= 1025) {
    fontSize = '15px';
  }
  
  // Estimate character width for the dither panels
  const tempEl = document.createElement('pre');
  tempEl.style.font = `${fontSize} Monaco, Menlo, monospace`;
  tempEl.style.position = 'absolute';
  tempEl.style.visibility = 'hidden';
  tempEl.style.whiteSpace = 'pre';
  tempEl.style.letterSpacing = 'normal';
  tempEl.textContent = '█';
  document.body.appendChild(tempEl);
  const charWidth = tempEl.getBoundingClientRect().width;
  document.body.removeChild(tempEl);
  
  // Calculate character count that fits in available width
  if (charWidth > 0 && singleSideWidth > 0) {
    const charsPerSide = Math.floor(singleSideWidth / charWidth);
    ditherWidth.value = Math.max(5, Math.min(charsPerSide, 80)); // Clamp between 5 and 80
  }
}

const welcomeLines = [
  '',
  'A modular terminal in your browser',
  '',
  'Keyboard Shortcuts:',
  '  Tab           - Autocomplete commands and file paths',
  '  ↑/↓           - Navigate command history',
  '  Ctrl+C        - Interrupt current input (Cmd+C copies on Mac when text is selected)',
  '  Ctrl+L        - Clear screen',
  '  Ctrl+A/E      - Jump to beginning/end of line',
  '  Ctrl+U/K      - Delete to beginning/end of line',
  '  Ctrl+W        - Delete word backward',
  '',
  'Type "help" to see available commands, or try "cat /home/README.txt"',
  '',
];

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function runIntroAnimation() {
  const animation = new IntroAnimation({
    duration: 1800,
    ditherSteps: Math.floor(1800 / 150),
    colors: ['#39bae6', '#5ccfe6', '#59c2ff', '#d4bfff'],
    showSideDither: true,
  });

  // Start dither animation
  let mouseX = -1000;
  let mouseY = -1000;
  let lastTime = performance.now();
  let nextRandomRipple = performance.now() + 5000 + Math.random() * 8000;
  const ripples: Array<{ x: number; y: number; time: number; maxTime: number; strength?: number }> = [];
  const stopSignal = { stopped: false };

  // Track mouse movement and create ripples based on velocity
  let lastMouseX = -1000;
  let lastMouseY = -1000;
  let lastMoveTime = performance.now();

  const handleMouseMove = (e: MouseEvent) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    const currentTime = performance.now();
    const deltaTime = currentTime - lastMoveTime;
    
    if (deltaTime > 0) {
      const dx = mouseX - lastMouseX;
      const dy = mouseY - lastMouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const velocity = distance / deltaTime; // pixels per ms
      
      // Create subtle ripples based on velocity (only if moving fast enough)
      if (velocity > 0.5 && distance > 15) {
        // Strength based on velocity, capped
        const strength = Math.min(velocity / 2, 1);
        
        ripples.push({
          x: mouseX,
          y: mouseY,
          time: 0,
          maxTime: 1500 + strength * 1000, // Longer ripples for faster movement
          strength: 0.5 + strength * 0.5 // Variable strength based on velocity
        });
      }
    }
    
    lastMouseX = mouseX;
    lastMouseY = mouseY;
    lastMoveTime = currentTime;
  };
  document.addEventListener('mousemove', handleMouseMove);

  // Animation loop for dither panels
  const animate = () => {
    if (stopSignal.stopped) {
      document.removeEventListener('mousemove', handleMouseMove);
      return;
    }

    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Update ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      ripples[i].time += deltaTime * 1000;
      if (ripples[i].time >= ripples[i].maxTime) {
        ripples.splice(i, 1);
      }
    }

    // Add random ripple (less frequently)
    if (currentTime >= nextRandomRipple) {
      const leftEl = leftPanelRef.value?.getElement();
      const rightEl = rightPanelRef.value?.getElement();
      
      if (leftEl && rightEl) {
        const leftRect = leftEl.getBoundingClientRect();
        const rightRect = rightEl.getBoundingClientRect();
        
        // Random position in one of the panels
        const useLeft = Math.random() < 0.5;
        const rect = useLeft ? leftRect : rightRect;
        
        ripples.push({
          x: rect.left + Math.random() * rect.width,
          y: rect.top + Math.random() * rect.height,
          time: 0,
          maxTime: 2500,
          strength: 0.6
        });
        
        nextRandomRipple = currentTime + 5000 + Math.random() * 8000;
      }
    }

    // Render both panels
    if (leftPanelRef.value && rightPanelRef.value) {
      leftPanelRef.value.updateAnimation(ripples, mouseX, mouseY);
      rightPanelRef.value.updateAnimation(ripples, mouseX, mouseY);
    }

    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);

  // Logo animation
  await animation.animate(
    (content: string, progress: number) => {
      logoContent.value = escapeHtml(content);
      logoFinal.value = false;
    },
    () => {
      logoContent.value = animation.getGradientLogo();
    //   logoFinal.value = true; // <--- this causes weird disappearance on mobile
      animationComplete.value = true;
      
      // Trigger powerful center ripple splash
      setTimeout(() => {
        const leftEl = leftPanelRef.value?.getElement();
        const rightEl = rightPanelRef.value?.getElement();
        if (leftEl && rightEl) {
          const leftRect = leftEl.getBoundingClientRect();
          const rightRect = rightEl.getBoundingClientRect();
          const centerX = (leftRect.right + rightRect.left) / 2;
          const centerY = (leftRect.top + leftRect.bottom) / 2;
          
          // Create multiple ripples for a powerful compound effect
          ripples.push({
            x: centerX,
            y: centerY,
            time: 0,
            maxTime: 6000,
            strength: 1.0  // More powerful primary ripple
          });
          
          // Add secondary ripple for depth
          setTimeout(() => {
            ripples.push({
              x: centerX,
              y: centerY,
              time: 0,
              maxTime: 3500,
              strength: 1.5
            });
          }, 150);
          
          // Add tertiary ripple for even more impact
          setTimeout(() => {
            ripples.push({
              x: centerX,
              y: centerY,
              time: 0,
              maxTime: 3000,
              strength: 1.2
            });
          }, 300);
        }
      }, 50);
    }
  );

  await new Promise(resolve => setTimeout(resolve, 400));
}

let resizeHandler: (() => void) | null = null;
let resizeTimeout: number | null = null;

onMounted(async () => {
  // Initial setup
  logoContent.value = escapeHtml(WCLI_LOGO);
  
  // Wait for DOM to be fully rendered
  await nextTick();
  
  // Calculate dither width based on available space
  calculateDitherWidth();
  
  // Add debounced resize listener
  resizeHandler = () => {
    if (resizeTimeout !== null) {
      clearTimeout(resizeTimeout);
    }
    resizeTimeout = window.setTimeout(() => {
      calculateDitherWidth();
    }, 150);
  };
  window.addEventListener('resize', resizeHandler);
  
  // Run intro animation
  await runIntroAnimation();
  showWelcome.value = true;
  
  if (props.onComplete) {
    props.onComplete();
  }
});

onUnmounted(() => {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
  }
  if (resizeTimeout !== null) {
    clearTimeout(resizeTimeout);
  }
});
</script>

<style scoped>
.intro-section {
  width: 100%;
}

.intro-welcome {
  color: var(--text-color);
  line-height: 1.5;
}

.intro-welcome-line {
  margin: 2px 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Intro Animation */
:deep(.intro-animation) {
  margin: 20px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  gap: 30px;
  width: 100%;
  padding: 0 20px;
}

:deep(.intro-logo-container) {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  position: relative;
}

.version-badge {
  position: absolute;
  bottom: -5px;
  right: 22px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'Courier New', monospace;
  font-size: 10px;
  color: var(--prompt-color);
  opacity: 0.7;
  padding: 2px 6px;
  border: 1px solid rgba(57, 186, 230, 0.3);
  border-radius: 3px;
  background: rgba(57, 186, 230, 0.05);
  animation: versionFadeIn 0.5s ease-out forwards;
  animation-delay: 0.3s;
  opacity: 0;
  white-space: nowrap;
  user-select: none;
}

@keyframes versionFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 0.7;
    transform: translateY(0);
  }
}

:deep(.intro-dither-left),
:deep(.intro-dither-right) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.2;
  color: var(--text-color);
  margin: 0;
  padding: 0;
  white-space: pre;
  flex-shrink: 0;
  opacity: 0;
  animation: ditherFadeIn 1.2s ease-out forwards;
  animation-delay: 0.8s;
  letter-spacing: normal;
  cursor: crosshair;
  user-select: none;
}

:deep(.intro-dither-left) {
  text-align: right;
}

:deep(.intro-dither-right) {
  text-align: left;
}

@keyframes ditherFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

:deep(.intro-logo) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'Courier New', monospace;
  font-size: 16px;
  line-height: 1.2;
  text-align: center;
  margin: 0;
  padding: 20px;
  color: var(--prompt-color);
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(57, 186, 230, 0.5);
  position: relative;
}

/* Subtle CRT scanline effect */
:deep(.intro-logo::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    transparent 50%,
    rgba(0, 0, 0, 0.1) 50%
  );
  background-size: 100% 4px;
  pointer-events: none;
  opacity: 0.3;
}

/* Glow effect overlay */
:deep(.intro-logo::after) {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: radial-gradient(
    ellipse at center,
    rgba(57, 186, 230, 0.1) 0%,
    transparent 70%
  );
  pointer-events: none;
  z-index: -1;
}

.intro-logo-final {
  animation: logoGlow 2s ease-in-out;
}

@keyframes logoGlow {
  0% {
    opacity: 0.7;
    text-shadow: 0 0 10px rgba(57, 186, 230, 0.5);
  }
  50% {
    opacity: 1;
    text-shadow: 
      0 0 20px rgba(57, 186, 230, 0.8),
      0 0 30px rgba(92, 207, 230, 0.6),
      0 0 40px rgba(89, 194, 255, 0.4);
  }
  100% {
    opacity: 1;
    text-shadow: 0 0 10px rgba(57, 186, 230, 0.5);
  }
}

/* Responsive intro */
@media (max-width: 768px) {
  :deep(.intro-logo) {
    font-size: 8px;
    letter-spacing: 0;
    padding: 5px;
    line-height: 1;
  }
  
  .version-badge {
    font-size: 8px;
    padding: 1px 3px;
    bottom: -10px;
    right: 5px;
  }
  
  :deep(.intro-animation) {
    margin: 10px 0;
    gap: 10px;
    padding: 0 10px;
    width: 100%;
  }
  
  /* Reduce glow effects on mobile for performance */
  :deep(.intro-logo::after) {
    display: none;
  }
  
  :deep(.intro-logo) {
    text-shadow: 0 0 5px rgba(57, 186, 230, 0.4);
  }
  
  :deep(.intro-dither-left),
  :deep(.intro-dither-right) {
    font-size: 6px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  :deep(.intro-dither-left),
  :deep(.intro-dither-right) {
    font-size: 11px;
  }
  
  :deep(.intro-animation) {
    gap: 20px;
  }
}

@media (min-width: 1025px) {
  :deep(.intro-animation) {
    gap: 40px;
    padding: 0 40px;
  }
  
  :deep(.intro-dither-left),
  :deep(.intro-dither-right) {
    font-size: 15px;
  }
}

@media (min-width: 1400px) {
  :deep(.intro-animation) {
    gap: 60px;
    padding: 0 60px;
  }
  
  :deep(.intro-dither-left),
  :deep(.intro-dither-right) {
    font-size: 16px;
  }
}
</style>

