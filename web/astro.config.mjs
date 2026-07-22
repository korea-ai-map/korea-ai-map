// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 정적 사이트 출력 (GitHub Pages / Cloudflare Pages 배포)
export default defineConfig({
  output: 'static',
  // GitHub Pages 프로젝트 사이트 기준. 커스텀 도메인 연결 시 base 를 제거한다.
  site: 'https://korea-ai-map.github.io',
  base: '/korea-ai-map',
  integrations: [sitemap()],
});
