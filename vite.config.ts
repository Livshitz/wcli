import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

const isLibraryBuild = process.env.BUILD_MODE === 'lib' || process.argv.includes('--config');

export default defineConfig({
  plugins: [
    vue(),
  ],
  server: {
    port: 3000,
    open: true,
    host: '0.0.0.0',
    allowedHosts: ['.local'],
  },
  build: isLibraryBuild ? {
    // Library build configuration
    outDir: 'dist',
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'WCLI',
      fileName: (format) => `wcli.${format}.js`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      // Externalize dependencies that shouldn't be bundled
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
        // Preserve directory structure for subpath exports
        preserveModules: false,
      },
    },
  } : {
    // Demo/dev build configuration
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.ts',
        '**/types/**',
        '**/*.d.ts',
      ],
    },
  },
});

