// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';
const isDevelopmentMode = process.argv.includes('--mode') && process.argv[process.argv.indexOf('--mode') + 1] === 'development';

const apiUrlRuleta = isDevelopmentMode ? 'https://api-ruleta.dev-limprod.com/api' : 'https://api_ruleta.claromarketingcloud.pe/api';
console.log(isDevelopmentMode);

export default defineConfig({
  // Solo aplicar site y base en GitHub Pages
  site: isGitHubPages ? 'https://havas-media.github.io' : undefined,
  base: isGitHubPages ? '/ruleta-ganadora' : undefined,
  compressHTML: false,
  build: {
    assets: '_assets',
    assetsPrefix: isDevelopmentMode ? 'https://www.claro.com.pe/assets/havas/ruleta-test' : 'https://www.claro.com.pe/assets/havas/ruleta'
  },
  vite: {
    plugins: [tailwindcss()],
    define: {
      'import.meta.env.API_URL_RULETA': JSON.stringify(apiUrlRuleta)
    }
  }
});