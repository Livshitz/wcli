import type { Theme } from '@/types/theme';

export const defaultTheme: Theme = {
  name: 'default',
  colors: {
    background: '#000000',
    foreground: '#00ff00',
    prompt: '#00ff00',
    error: '#ff0000',
    success: '#00ff00',
    info: '#00ffff',
    warning: '#ffff00',
    selection: '#ffffff33',
    cursor: '#00ff00',
  },
  font: {
    family: "'Courier New', Courier, monospace",
    size: 14,
    lineHeight: 1.5,
  },
};

