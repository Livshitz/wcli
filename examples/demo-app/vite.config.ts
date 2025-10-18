import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Link to the parent wcli project
      'wcli/components': resolve(__dirname, '../../src/components'),
      'wcli/adapters': resolve(__dirname, '../../src/adapters'),
      'wcli/themes': resolve(__dirname, '../../src/themes'),
      'wcli': resolve(__dirname, '../../src'),
      '@': resolve(__dirname, '../../src'),
    },
  },
  server: {
    port: 3001,
  },
});

