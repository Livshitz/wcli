import type { Theme } from '@/types/theme';

export const draculaTheme: Theme = {
  name: 'dracula',
  colors: {
    background: '#282a36',
    foreground: '#f8f8f2',
    prompt: '#50fa7b',
    error: '#ff5555',
    success: '#50fa7b',
    info: '#8be9fd',
    warning: '#f1fa8c',
    selection: '#44475a',
    cursor: '#f8f8f2',
  },
  font: {
    family: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
    size: 14,
    lineHeight: 1.5,
  },
};

