// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 정적 사이트 출력 (GitHub Pages / Cloudflare Pages 배포)
export default defineConfig({
  output: 'static',
  // GitHub Pages 조직 루트 사이트 (korea-ai-map.github.io).
  site: 'https://korea-ai-map.github.io',
  integrations: [sitemap()],
});
