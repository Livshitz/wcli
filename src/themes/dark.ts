import type { Theme } from '@/types/theme';

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    prompt: '#4ec9b0',
    error: '#f48771',
    success: '#89d185',
    info: '#569cd6',
    warning: '#dcdcaa',
    selection: '#264f78',
    cursor: '#aeafad',
  },
  font: {
    family: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
    size: 14,
    lineHeight: 1.5,
  },
};

