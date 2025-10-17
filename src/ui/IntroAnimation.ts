export interface AnimationConfig {
  duration?: number;
  ditherSteps?: number;
  colors?: string[];
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
  private config: Required<AnimationConfig>;
  private logoLines: string[];
  private width: number;
  private height: number;

  constructor(config: AnimationConfig = {}) {
    this.config = {
      duration: config.duration ?? 2000,
      ditherSteps: config.ditherSteps ?? 8,
      colors: config.colors ?? ['#39bae6', '#5ccfe6', '#59c2ff', '#d4bfff'],
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
}

