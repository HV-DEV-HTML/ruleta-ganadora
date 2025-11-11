// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

const isProduction = process.env.NODE_ENV === 'production';
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

// https://astro.build/config
export default defineConfig({
  // Solo aplicar site y base en GitHub Pages
  site: isGitHubPages ? 'https://havas-media.github.io' : undefined,
  base: isGitHubPages ? '/ruleta-ganadora' : undefined,
  compressHTML: false,
  build: {
    assets: '_assets',
    // assetsPrefix: 'https://www.claro.com.pe/assets/havas/prepago'
  },
  vite: {
    plugins: [tailwindcss()]
  }
});