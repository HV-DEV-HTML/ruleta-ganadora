// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://havas-media.github.io', // Reemplaza con tu usuario de GitHub
  base: '/ruleta-ganadora', // Nombre de tu repositorio
  compressHTML: false,
  build: {
    assets: '_assets',
    // assetsPrefix: 'https://www.claro.com.pe/assets/havas/prepago'
  },
  vite: {
    plugins: [tailwindcss()]
  }
});