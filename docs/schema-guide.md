# 스키마 가이드

## 단일 소스

스키마의 원본은 **[`web/src/content/schemas.ts`](../web/src/content/schemas.ts)의 zod 정의**입니다.
이 하나가 세 가지를 겸합니다.

1. **빌드 타임 검증** — Astro 콘텐츠 컬렉션이 로드 시 필수필드·enum·형식을 검사 (`cd web && npm run build`)
2. **렌더링 타입** — 페이지/컴포넌트에서 타입 안전하게 사용
3. **JSON Schema** — `npm run gen:schema` 로 `schemas/*.schema.json` 생성 (다운로드/문서용)

## 스키마 변경 절차

1. `web/src/content/schemas.ts` 수정
2. `npm run gen:schema` 로 `schemas/*.json` 재생성
3. 필요 시 `docs/data-dictionary.md` 업데이트
4. `CHANGELOG.md`에 스키마 변경 기록
5. 기존 데이터가 새 스키마를 통과하는지 `cd web && npm run build`로 확인

## 검증 계층

| 검사 대상 | 도구 | 실행 |
|---|---|---|
| 필수필드·enum·날짜/URL 형식 | zod (Astro build) | `cd web && npm run build` |
| ID 중복·참조 무결성 | `scripts/check-refs.ts` | `npm run check:refs` |
| 외부 링크 생존 | `scripts/check-links.ts` | `npm run check:links` |

PR을 열면 `validate` 워크플로우가 위 검사를 자동 수행합니다.
