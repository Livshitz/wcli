import type { ThemeConfig, Theme } from '../types/theme';
import { defaultTheme } from '../themes/default';

/**
 * Apply theme to the DOM using CSS custom properties
 */
export function applyTheme(theme: ThemeConfig | Theme, target: HTMLElement = document.documentElement): void {
  // Merge with defaults
  const fullTheme: Theme = {
    name: theme.name || 'custom',
    colors: {
      ...defaultTheme.colors,
      ...theme.colors,
    },
    font: {
      ...defaultTheme.font,
      ...theme.font,
    },
  };

  // Apply colors
  if (fullTheme.colors) {
    if (fullTheme.colors.background) {
      target.style.setProperty('--terminal-bg', fullTheme.colors.background);
      target.style.setProperty('--bg-color', fullTheme.colors.background);
    }
    if (fullTheme.colors.foreground) {
      target.style.setProperty('--terminal-fg', fullTheme.colors.foreground);
      target.style.setProperty('--text-color', fullTheme.colors.foreground);
      target.style.setProperty('--input-color', fullTheme.colors.foreground);
    }
    if (fullTheme.colors.prompt) {
      target.style.setProperty('--terminal-prompt', fullTheme.colors.prompt);
      target.style.setProperty('--prompt-color', fullTheme.colors.prompt);
    }
    if (fullTheme.colors.error) {
      target.style.setProperty('--terminal-error', fullTheme.colors.error);
      target.style.setProperty('--error-color', fullTheme.colors.error);
    }
    if (fullTheme.colors.success) {
      target.style.setProperty('--terminal-success', fullTheme.colors.success);
      target.style.setProperty('--success-color', fullTheme.colors.success);
    }
    if (fullTheme.colors.info) {
      target.style.setProperty('--terminal-info', fullTheme.colors.info);
    }
    if (fullTheme.colors.warning) {
      target.style.setProperty('--terminal-warning', fullTheme.colors.warning);
      target.style.setProperty('--warning-color', fullTheme.colors.warning);
    }
    if (fullTheme.colors.selection) {
      target.style.setProperty('--terminal-selection', fullTheme.colors.selection);
    }
    if (fullTheme.colors.cursor) {
      target.style.setProperty('--terminal-cursor', fullTheme.colors.cursor);
    }
  }

  // Apply font
  if (fullTheme.font) {
    if (fullTheme.font.family) {
      target.style.setProperty('--terminal-font-family', fullTheme.font.family);
    }
    if (fullTheme.font.size) {
      target.style.setProperty('--terminal-font-size', `${fullTheme.font.size}px`);
    }
    if (fullTheme.font.lineHeight) {
      target.style.setProperty('--terminal-line-height', fullTheme.font.lineHeight.toString());
    }
  }
}

/**
 * Get current theme from DOM
 */
export function getCurrentTheme(target: HTMLElement = document.documentElement): ThemeConfig {
  const computedStyle = getComputedStyle(target);
  
  const bg = computedStyle.getPropertyValue('--terminal-bg');
  const fg = computedStyle.getPropertyValue('--terminal-fg');
  const prompt = computedStyle.getPropertyValue('--terminal-prompt');
  const error = computedStyle.getPropertyValue('--terminal-error');
  const success = computedStyle.getPropertyValue('--terminal-success');
  const info = computedStyle.getPropertyValue('--terminal-info');
  const warning = computedStyle.getPropertyValue('--terminal-warning');
  const selection = computedStyle.getPropertyValue('--terminal-selection');
  const cursor = computedStyle.getPropertyValue('--terminal-cursor');
  const fontFamily = computedStyle.getPropertyValue('--terminal-font-family');
  const fontSize = computedStyle.getPropertyValue('--terminal-font-size');
  const lineHeight = computedStyle.getPropertyValue('--terminal-line-height');
  
  const colors: Partial<Theme['colors']> = {};
  const font: Partial<Theme['font']> = {};
  
  if (bg) colors.background = bg;
  if (fg) colors.foreground = fg;
  if (prompt) colors.prompt = prompt;
  if (error) colors.error = error;
  if (success) colors.success = success;
  if (info) colors.info = info;
  if (warning) colors.warning = warning;
  if (selection) colors.selection = selection;
  if (cursor) colors.cursor = cursor;
  
  if (fontFamily) font.family = fontFamily;
  if (fontSize) font.size = parseInt(fontSize);
  if (lineHeight) font.lineHeight = parseFloat(lineHeight);
  
  return { colors, font };
}

