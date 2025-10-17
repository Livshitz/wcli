import { DitherPanel, type Ripple } from './DitherPanel';

export interface AnimationConfig {
  duration?: number;
  ditherSteps?: number;
  colors?: string[];
  showSideDither?: boolean;
}

const WCLI_LOGO = `
██╗    ██╗ ██████╗██╗     ██╗
██║    ██║██╔════╝██║     ██║
██║ █╗ ██║██║     ██║     ██║
██║███╗██║██║     ██║     ██║
╚███╔███╔╝╚██████╗███████╗██║
 ╚══╝╚══╝  ╚═════╝╚══════╝╚═╝
`.trim();

const DITHER_CHARS = [
  ' ',
  '░',
  '▒',
  '▓',
  '█',
];


export class IntroAnimation {
  private config: Required<AnimationConfig> & { showSideDither: boolean };
  private logoLines: string[];
  private width: number;
  private height: number;
  private sideDitherTime: number = 0;
  private ripples: Ripple[] = [];
  private rippleTriggerCallback?: () => void;
  private leftPanel?: DitherPanel;
  private rightPanel?: DitherPanel;

  constructor(config: AnimationConfig = {}) {
    this.config = {
      duration: config.duration ?? 2000,
      ditherSteps: config.ditherSteps ?? 8,
      colors: config.colors ?? ['#39bae6', '#5ccfe6', '#59c2ff', '#d4bfff'],
      showSideDither: config.showSideDither ?? true,
    };

    this.logoLines = WCLI_LOGO.split('\n');
    this.height = this.logoLines.length;
    this.width = Math.max(...this.logoLines.map(line => line.length));
  }

  /**
   * Renders the animation frame by frame
   */
  async animate(
    renderFrame: (content: string, progress: number) => void,
    onComplete?: () => void
  ): Promise<void> {
    const { duration, ditherSteps } = this.config;
    const frameDelay = duration / ditherSteps;
    
    // Generate noise map for dithering effect
    const noiseMap = this.generateNoiseMap();

    for (let step = 0; step <= ditherSteps; step++) {
      const progress = step / ditherSteps;
      const frame = this.generateFrame(progress, noiseMap);
      renderFrame(frame, progress);
      
      if (step < ditherSteps) {
        await this.delay(frameDelay);
      }
    }

    if (onComplete) {
      onComplete();
    }
  }

  /**
   * Generates a noise map for the dithering effect
   */
  private generateNoiseMap(): number[][] {
    const map: number[][] = [];
    
    for (let y = 0; y < this.height; y++) {
      map[y] = [];
      for (let x = 0; x < this.width; x++) {
        // Create a noise value between 0 and 1
        // Using a pseudo-random based on position for consistent animation
        const noise = this.noise2D(x * 0.15, y * 0.15);
        map[y][x] = noise;
      }
    }
    
    return map;
  }

  /**
   * Simple 2D noise function for dithering
   */
  private noise2D(x: number, y: number): number {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }

  /**
   * Generates a single frame of the animation
   */
  private generateFrame(progress: number, noiseMap: number[][]): string {
    const lines: string[] = [];
    const threshold = progress;
    
    // Add a scan-line effect that sweeps through
    const scanlineY = Math.floor(progress * this.height * 1.2);

    for (let y = 0; y < this.height; y++) {
      let line = '';
      const originalLine = this.logoLines[y] || '';
      
      // Calculate scan-line boost for this row
      const scanlineDistance = Math.abs(y - scanlineY);
      const scanlineBoost = Math.max(0, 1 - scanlineDistance / 3) * 0.3;
      
      for (let x = 0; x < this.width; x++) {
        const originalChar = originalLine[x] || ' ';
        const noise = noiseMap[y][x];
        
        // Determine if this pixel should be visible based on threshold
        const visibility = noise * 0.6 + 0.25 - scanlineBoost; // Bias towards showing earlier
        
        if (progress < visibility) {
          // Not yet visible - show dithering
          const ditherProgress = progress / visibility;
          const ditherLevel = Math.floor(ditherProgress * DITHER_CHARS.length);
          
          // Add some randomness to the dithering for more organic feel
          const jitter = (noise > 0.5) ? 0 : -1;
          const finalLevel = Math.max(0, Math.min(ditherLevel + jitter, DITHER_CHARS.length - 1));
          
          line += originalChar !== ' ' && originalChar !== '' 
            ? DITHER_CHARS[finalLevel]
            : ' ';
        } else {
          // Fully visible
          line += originalChar;
        }
      }
      
      lines.push(line);
    }

    return lines.join('\n');
  }

  /**
   * Returns the final logo with color
   */
  getFinalLogo(): string {
    return WCLI_LOGO;
  }

  /**
   * Wraps the logo in color HTML
   */
  getColoredLogo(color: string = '#39bae6'): string {
    return `<span style="color: ${color}; font-weight: bold;">${this.getFinalLogo()}</span>`;
  }

  /**
   * Gets a gradient colored version of the logo
   */
  getGradientLogo(): string {
    const colors = this.config.colors;
    const lines = this.logoLines;
    const gradientLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const colorIndex = Math.floor((i / lines.length) * colors.length);
      const color = colors[Math.min(colorIndex, colors.length - 1)];
      gradientLines.push(`<span style="color: ${color}">${lines[i]}</span>`);
    }

    return gradientLines.join('\n');
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  /**
   * Creates dither panels
   */
  createDitherPanels(): { left: DitherPanel; right: DitherPanel } {
    const isMobile = window.innerWidth <= 768;
    const ditherWidth = isMobile ? 15 : 30;
    
    this.leftPanel = new DitherPanel({
      width: ditherWidth,
      height: this.height,
      position: 'left',
    });
    
    this.rightPanel = new DitherPanel({
      width: ditherWidth,
      height: this.height,
      position: 'right',
    });
    
    return {
      left: this.leftPanel,
      right: this.rightPanel,
    };
  }

  /**
   * Starts interactive side dither with ripple effects
   */
  startSideDitherAnimation(
    leftPanel: DitherPanel,
    rightPanel: DitherPanel,
    stopSignal: { stopped: boolean },
    triggerInitialShock: boolean = false
  ): void {
    let lastTime = performance.now();
    let mouseX = -1000;
    let mouseY = -1000;
    let nextRandomRipple = performance.now() + 5000 + Math.random() * 8000;
    
    this.leftPanel = leftPanel;
    this.rightPanel = rightPanel;
    
    // Reset ripples
    this.ripples = [];
    
    // Set up callback for external ripple triggers
    this.rippleTriggerCallback = () => {
      const leftRect = leftPanel.getElement().getBoundingClientRect();
      const rightRect = rightPanel.getElement().getBoundingClientRect();
      
      // Center of the screen
      const centerX = (leftRect.right + rightRect.left) / 2;
      const centerY = (leftRect.top + leftRect.bottom) / 2;
      
      // Create a strong central ripple
      this.ripples.push({
        x: centerX,
        y: centerY,
        time: 0,
        maxTime: 3000
      });
    };
    
    // Trigger initial shock from center when logo appears
    if (triggerInitialShock) {
      setTimeout(() => {
        if (this.rippleTriggerCallback) {
          this.rippleTriggerCallback();
        }
      }, 100);
    }
    
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
          
          this.ripples.push({
            x: mouseX,
            y: mouseY,
            time: 0,
            maxTime: 1500 + strength * 1000 // Longer ripples for faster movement
          });
        }
      }
      
      lastMouseX = mouseX;
      lastMouseY = mouseY;
      lastMoveTime = currentTime;
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    const animate = () => {
      if (stopSignal.stopped) {
        document.removeEventListener('mousemove', handleMouseMove);
        return;
      }
      
      const currentTime = performance.now();
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      
      // Update ripples
      for (let i = this.ripples.length - 1; i >= 0; i--) {
        this.ripples[i].time += deltaTime * 1000;
        if (this.ripples[i].time >= this.ripples[i].maxTime) {
          this.ripples.splice(i, 1);
        }
      }
      
      // Add random ripple (less frequently)
      if (currentTime >= nextRandomRipple) {
        const leftRect = leftPanel.getElement().getBoundingClientRect();
        const rightRect = rightPanel.getElement().getBoundingClientRect();
        
        // Random position in one of the panels
        const useLeft = Math.random() < 0.5;
        const rect = useLeft ? leftRect : rightRect;
        
        this.ripples.push({
          x: rect.left + Math.random() * rect.width,
          y: rect.top + Math.random() * rect.height,
          time: 0,
          maxTime: 2500
        });
        
        nextRandomRipple = currentTime + 5000 + Math.random() * 8000;
      }
      
      // Render both panels
      leftPanel.render(mouseX, mouseY, this.ripples);
      rightPanel.render(mouseX, mouseY, this.ripples);
      
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }

  /**
   * Trigger a ripple effect from the center
   */
  triggerCenterRipple(): void {
    if (this.rippleTriggerCallback) {
      this.rippleTriggerCallback();
    }
  }
}


