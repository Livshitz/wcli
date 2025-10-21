import type { Theme } from '../types/theme';

export const nordTheme: Theme = {
  name: 'nord',
  colors: {
    background: '#2e3440',
    foreground: '#d8dee9',
    prompt: '#88c0d0',
    error: '#bf616a',
    success: '#a3be8c',
    info: '#81a1c1',
    warning: '#ebcb8b',
    selection: '#434c5e',
    cursor: '#d8dee9',
  },
  font: {
    family: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
    size: 14,
    lineHeight: 1.5,
  },
};

