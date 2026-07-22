// @ts-check
import { defineConfig } from 'astro/config';

// 정적 사이트 출력 (GitHub Pages / Cloudflare Pages 배포)
// 배포처 확정 후 site / base 를 채운다.
export default defineConfig({
  output: 'static',
  // GitHub Pages 프로젝트 사이트 기준. 커스텀 도메인(예: koreaaimap.org) 연결 시 base 를 제거한다.
  site: 'https://korea-ai-map.github.io',
  base: '/korea-ai-map',
  build: {
    // data/ 는 web 밖의 리포 루트에 있으므로 content config 의 glob loader 로 참조한다.
  },
});
