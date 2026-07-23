// Astro의 배포 base를 반영한다. 현재 조직 루트 Pages에서는 `/`이다.
const base = import.meta.env.BASE_URL;

/** 내부 경로에 base 를 붙이고 중복 슬래시를 정리한다. */
export const url = (p: string) => (base + '/' + p).replace(/\/{2,}/g, '/');

/** 수정 제안 이슈 링크 (CONTRIBUTING / correction 템플릿) */
export const correctionUrl = (entry: string) =>
  `https://github.com/korea-ai-map/korea-ai-map.github.io/issues/new?template=correction.yml&title=${encodeURIComponent('[수정] ' + entry)}`;
