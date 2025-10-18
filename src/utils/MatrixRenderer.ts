import type { Frame } from '../types/matrix';

// Re-export bitmap font utilities
export { textToBitmap, measureText, FONT_7x5 } from './BitmapFont';

/**
 * Renders a frame to text using character set
 */
export function renderFrame(frame: Frame, chars: string[] = ['.', '·', '•', '●', '◉']): string {
  return frame.map(row => 
    row.map(value => {
      const index = Math.floor(value * (chars.length - 0.01));
      return chars[Math.max(0, Math.min(index, chars.length - 1))];
    }).join('')
  ).join('\n');
}

/**
 * Converts text to a matrix frame
 */
export function textToMatrix(text: string, sourceChars?: string[]): Frame {
  const lines = text.split('\n');
  const height = lines.length;
  const width = Math.max(...lines.map(line => line.length));
  
  // Default character intensity mapping
  const charIntensity = sourceChars 
    ? createCharIntensityMap(sourceChars)
    : createDefaultCharIntensityMap();
  
  const frame: Frame = [];
  
  for (let y = 0; y < height; y++) {
    frame[y] = [];
    const line = lines[y] || '';
    
    for (let x = 0; x < width; x++) {
      const char = line[x] || ' ';
      frame[y][x] = charIntensity.get(char) ?? (char === ' ' ? 0 : 0.5);
    }
  }
  
  return frame;
}

/**
 * Creates character intensity map from provided chars (assuming ordered from light to dark)
 */
function createCharIntensityMap(chars: string[]): Map<string, number> {
  const map = new Map<string, number>();
  chars.forEach((char, i) => {
    map.set(char, i / (chars.length - 1));
  });
  return map;
}

/**
 * Default character intensity for common Unicode box-drawing and block chars
 */
function createDefaultCharIntensityMap(): Map<string, number> {
  const map = new Map<string, number>();
  
  // Spaces and light
  map.set(' ', 0);
  map.set('.', 0.1);
  map.set('·', 0.2);
  map.set('░', 0.25);
  
  // Medium
  map.set('•', 0.4);
  map.set('▒', 0.5);
  
  // Dark
  map.set('●', 0.7);
  map.set('▓', 0.75);
  map.set('◉', 0.85);
  
  // Full blocks and box drawing
  map.set('█', 1);
  map.set('▀', 0.9);
  map.set('▄', 0.9);
  map.set('▌', 0.9);
  map.set('▐', 0.9);
  map.set('║', 0.95);
  map.set('═', 0.95);
  map.set('╔', 0.95);
  map.set('╗', 0.95);
  map.set('╚', 0.95);
  map.set('╝', 0.95);
  map.set('╠', 0.95);
  map.set('╣', 0.95);
  map.set('╦', 0.95);
  map.set('╩', 0.95);
  map.set('╬', 0.95);
  
  return map;
}

/**
 * Creates an empty frame
 */
export function createEmptyFrame(rows: number, cols: number): Frame {
  return Array(rows).fill(0).map(() => Array(cols).fill(0));
}

/**
 * Simple 2D noise function
 */
export function noise2D(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * Creates a noise-based frame
 */
export function createNoiseFrame(rows: number, cols: number, scale: number = 0.15, intensity: number = 1): Frame {
  const frame: Frame = [];
  
  for (let y = 0; y < rows; y++) {
    frame[y] = [];
    for (let x = 0; x < cols; x++) {
      const value = noise2D(x * scale, y * scale) * intensity;
      frame[y][x] = Math.max(0, Math.min(1, value));
    }
  }
  
  return frame;
}

/**
 * Applies a ripple effect to a frame
 */
export function applyRipple(
  frame: Frame,
  rippleX: number,
  rippleY: number,
  progress: number,
  strength: number = 1,
  radius: number = 10
): Frame {
  const rows = frame.length;
  const cols = frame[0]?.length || 0;
  const newFrame: Frame = frame.map(row => [...row]);
  
  const rippleRadius = progress * radius;
  const rippleWidth = radius * 0.3;
  
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const dx = x - rippleX;
      const dy = y - rippleY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (Math.abs(distance - rippleRadius) < rippleWidth) {
        const rippleStrength = (1 - progress) * strength;
        const edgeDist = Math.abs(distance - rippleRadius) / rippleWidth;
        const wave = Math.sin(edgeDist * Math.PI) * rippleStrength;
        newFrame[y][x] = Math.max(0, Math.min(1, newFrame[y][x] + wave * 0.6));
      }
    }
  }
  
  return newFrame;
}

