import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PixiLive2DStreamingTTS',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: [
        'pixi.js',
        'pixi-live2d-display'
      ],
      output: {
        globals: {
          'pixi.js': 'PIXI',
          'pixi-live2d-display': 'Live2D'
        }
      }
    },
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src')
    }
  }
});