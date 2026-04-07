import { defineConfig } from 'vite';
import { resolve } from 'path';

const label = 'maplibre-properlabels';

export default defineConfig({
  base: './',
  worker: { format: 'es', inline: true },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'ProperLabels',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => {
        if (format === 'umd') return `${label}.js`;
        return `${label}.${format}.js`;
      },
    },
    assetsInlineLimit: 0,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      },
      format: {
        comments: false
      }
    }
  },
});
