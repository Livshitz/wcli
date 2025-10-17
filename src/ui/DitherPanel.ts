export interface DitherPanelConfig {
  width: number;
  height: number;
  position: 'left' | 'right';
  chars?: string[];
}

export interface Ripple {
  x: number;
  y: number;
  time: number;
  maxTime: number;
}

const DEFAULT_CHARS = [
  '.',
  '·',
  '•',
  '●',
  '◉',
];

export class DitherPanel {
  private element: HTMLPreElement;
  private config: Required<DitherPanelConfig>;
  private ripples: Ripple[] = [];

  constructor(config: DitherPanelConfig) {
    this.config = {
      ...config,
      chars: config.chars ?? DEFAULT_CHARS,
    };

    this.element = document.createElement('pre');
    this.element.className = `intro-dither-${this.config.position}`;
  }

  getElement(): HTMLPreElement {
    return this.element;
  }

  getRipples(): Ripple[] {
    return this.ripples;
  }

  addRipple(ripple: Ripple): void {
    this.ripples.push(ripple);
  }

  updateRipples(deltaTime: number): void {
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      this.ripples[i].time += deltaTime;
      if (this.ripples[i].time >= this.ripples[i].maxTime) {
        this.ripples.splice(i, 1);
      }
    }
  }

  render(mouseX: number, mouseY: number, allRipples: Ripple[]): void {
    const rect = this.element.getBoundingClientRect();
    const pattern = this.generatePattern(mouseX, mouseY, rect, allRipples);
    this.element.textContent = pattern;
  }

  private generatePattern(
    mouseX: number,
    mouseY: number,
    elementRect: DOMRect,
    ripples: Ripple[]
  ): string {
    const lines: string[] = [];
    
    for (let y = 0; y < this.config.height; y++) {
      let line = '';
      for (let x = 0; x < this.config.width; x++) {
        const charWidth = elementRect.width / this.config.width;
        const charHeight = elementRect.height / this.config.height;
        const pixelX = elementRect.left + x * charWidth;
        const pixelY = elementRect.top + y * charHeight;
        
        // Base pattern - start with dots (lower noise values)
        const noise = this.noise2D(x * 0.15, y * 0.15) * 0.3;
        
        let disturbance = 0;
        
        // Animated ripples effect
        for (const ripple of ripples) {
          const rdx = pixelX - ripple.x;
          const rdy = pixelY - ripple.y;
          const rippleDistance = Math.sqrt(rdx * rdx + rdy * rdy);
          
          // Expanding ripple based on time
          const rippleRadius = (ripple.time / ripple.maxTime) * 350;
          const rippleWidth = 80;
          
          if (Math.abs(rippleDistance - rippleRadius) < rippleWidth) {
            const rippleStrength = 1 - (ripple.time / ripple.maxTime);
            const edgeDist = Math.abs(rippleDistance - rippleRadius) / rippleWidth;
            const wave = Math.sin(edgeDist * Math.PI) * rippleStrength;
            disturbance = Math.max(disturbance, wave * 0.6);
          }
        }
        
        // Apply disturbance to base pattern
        const finalValue = Math.max(0, Math.min(1, noise + disturbance * 0.7));
        
        // Map to character set
        const charIndex = Math.floor(finalValue * this.config.chars.length);
        const clampedIndex = Math.max(0, Math.min(charIndex, this.config.chars.length - 1));
        
        line += this.config.chars[clampedIndex];
      }
      lines.push(line);
    }
    
    return lines.join('\n');
  }

  private noise2D(x: number, y: number): number {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }
}

