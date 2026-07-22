// GitHub Pages 프로젝트 사이트(base=/korea-ai-map)에서도 링크가 동작하도록 base 를 붙인다.
const base = import.meta.env.BASE_URL;

/** 내부 경로에 base 를 붙이고 중복 슬래시를 정리한다. */
export const url = (p: string) => (base + '/' + p).replace(/\/{2,}/g, '/');

/** 수정 제안 이슈 링크 (CONTRIBUTING / correction 템플릿) */
export const correctionUrl = (entry: string) =>
  `https://github.com/korea-ai-map/korea-ai-map/issues/new?template=correction.yml&title=${encodeURIComponent('[수정] ' + entry)}`;
