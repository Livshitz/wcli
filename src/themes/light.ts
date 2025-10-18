import type { Theme } from '@/types/theme';

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: '#ffffff',
    foreground: '#000000',
    prompt: '#0070c0',
    error: '#cd3131',
    success: '#008000',
    info: '#0070c0',
    warning: '#bf8803',
    selection: '#add6ff',
    cursor: '#000000',
  },
  font: {
    family: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
    size: 14,
    lineHeight: 1.5,
  },
};

