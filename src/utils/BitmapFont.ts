import type { Frame } from '../types/matrix';

/**
 * Simple 3x5 font - more compact and easier to extend
 * Falls back to rendering any unknown character as a simple pattern
 */
const FONT_3x5: Record<string, Frame> = {
  // Digits
  '0': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
  '1': [
    [0,0,1,0,0],
    [0,1,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [1,1,1,1,1],
  ],
  '2': [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  '3': [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ],
  '4': [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
  ],
  '5': [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ],
  '6': [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ],
  '7': [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
  ],
  '8': [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ],
  '9': [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ],
  ':': [
    [0, 0, 0],
    [0, 1, 0],
    [0, 1, 0],
    [0, 0, 0],
    [0, 1, 0],
    [0, 1, 0],
    [0, 0, 0],
  ],
  // Letters (uppercase)
  'A': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  'B': [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0]],
  'C': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,1],[0,1,1,1,0]],
  'D': [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0]],
  'E': [[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  'F': [[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0]],
  'G': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[1,0,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  'H': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  'I': [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[1,1,1,1,1]],
  'J': [[0,0,1,1,1],[0,0,0,1,0],[0,0,0,1,0],[0,0,0,1,0],[0,0,0,1,0],[1,0,0,1,0],[0,1,1,0,0]],
  'K': [[1,0,0,0,1],[1,0,0,1,0],[1,0,1,0,0],[1,1,0,0,0],[1,0,1,0,0],[1,0,0,1,0],[1,0,0,0,1]],
  'L': [[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  'M': [[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  'N': [[1,0,0,0,1],[1,1,0,0,1],[1,0,1,0,1],[1,0,0,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  'O': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  'P': [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0]],
  'Q': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,0,0,1,0],[0,1,1,0,1]],
  'R': [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,1,0,0],[1,0,0,1,0],[1,0,0,0,1]],
  'S': [[0,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[0,1,1,1,0],[0,0,0,0,1],[0,0,0,0,1],[1,1,1,1,0]],
  'T': [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  'U': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  'V': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0]],
  'W': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,1,0,1,1],[1,0,0,0,1]],
  'X': [[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1],[1,0,0,0,1]],
  'Y': [[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  'Z': [[1,1,1,1,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  // Symbols
  ' ': [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]],
  '-': [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[1,1,1,1,1],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
  '.': [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,1,0],[0,1,0]],
  '!': [[0,1,0],[0,1,0],[0,1,0],[0,1,0],[0,1,0],[0,0,0],[0,1,0]],
  '?': [[0,1,1,1,0],[1,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,1,0,0]],
};

// Map lowercase to uppercase
const FONT_7x5: Record<string, Frame> = {
  ...FONT_3x5,
};

export interface BitmapFontConfig {
  charSpacing?: number;
  lineHeight?: number;
  padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
}

/**
 * Get glyph for a character, with fallback for unknown chars
 */
function getGlyph(char: string, font: Record<string, Frame>): Frame {
  // Try direct lookup
  if (font[char]) return font[char];
  
  // Try uppercase
  const upper = char.toUpperCase();
  if (font[upper]) return font[upper];
  
  // Fallback to space
  return font[' '] || [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]];
}

/**
 * Converts text to a bitmap frame using a bitmap font
 */
export function textToBitmap(
  text: string,
  font: Record<string, Frame> = FONT_7x5,
  config: BitmapFontConfig = {}
): Frame {
  const { charSpacing = 1, lineHeight = 1, padding = 0 } = config;
  
  // Normalize padding
  const pad = typeof padding === 'number' 
    ? { top: padding, right: padding, bottom: padding, left: padding }
    : { top: padding.top || 0, right: padding.right || 0, bottom: padding.bottom || 0, left: padding.left || 0 };
  
  const lines = text.split('\n');
  const fontHeight = 7; // Standard height for our font
  
  // Calculate content dimensions (without padding)
  let contentWidth = 0;
  for (const line of lines) {
    let lineWidth = 0;
    for (const char of line) {
      const glyph = getGlyph(char, font);
      lineWidth += glyph[0].length + charSpacing;
    }
    if (lineWidth > 0) lineWidth -= charSpacing; // Remove last spacing
    contentWidth = Math.max(contentWidth, lineWidth);
  }
  
  const contentHeight = lines.length * (fontHeight + lineHeight) - lineHeight;
  
  // Total dimensions with padding
  const totalWidth = contentWidth + pad.left + pad.right;
  const totalHeight = contentHeight + pad.top + pad.bottom;
  
  // Create empty frame with padding
  const frame: Frame = Array(totalHeight)
    .fill(0)
    .map(() => Array(totalWidth).fill(0));
  
  // Render each line (starting after top and left padding)
  let yOffset = pad.top;
  for (const line of lines) {
    let xOffset = pad.left;
    
    for (const char of line) {
      const glyph = getGlyph(char, font);
      const glyphWidth = glyph[0].length;
      
      // Copy glyph to frame
      for (let y = 0; y < glyph.length && yOffset + y < totalHeight; y++) {
        for (let x = 0; x < glyphWidth && xOffset + x < totalWidth; x++) {
          frame[yOffset + y][xOffset + x] = glyph[y][x];
        }
      }
      
      xOffset += glyphWidth + charSpacing;
    }
    
    yOffset += fontHeight + lineHeight;
  }
  
  return frame;
}

/**
 * Get the dimensions that a text would occupy when rendered
 */
export function measureText(
  text: string,
  font: Record<string, Frame> = FONT_7x5,
  config: BitmapFontConfig = {}
): { width: number; height: number } {
  const { charSpacing = 1, lineHeight = 1, padding = 0 } = config;
  
  // Normalize padding
  const pad = typeof padding === 'number' 
    ? { top: padding, right: padding, bottom: padding, left: padding }
    : { top: padding.top || 0, right: padding.right || 0, bottom: padding.bottom || 0, left: padding.left || 0 };
  
  const lines = text.split('\n');
  const fontHeight = 7;
  
  let contentWidth = 0;
  for (const line of lines) {
    let lineWidth = 0;
    for (const char of line) {
      const glyph = getGlyph(char, font);
      lineWidth += glyph[0].length + charSpacing;
    }
    if (lineWidth > 0) lineWidth -= charSpacing;
    contentWidth = Math.max(contentWidth, lineWidth);
  }
  
  const contentHeight = lines.length * (fontHeight + lineHeight) - lineHeight;
  
  return { 
    width: contentWidth + pad.left + pad.right, 
    height: contentHeight + pad.top + pad.bottom 
  };
}

export { FONT_7x5 };

