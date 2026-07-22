# 변경 이력 (Changelog)

이 파일은 **스키마·정책·구조**의 변경을 기록합니다.
개별 데이터 항목의 변경 이력은 Git 커밋 히스토리로 보존됩니다.

형식은 [Keep a Changelog](https://keepachangelog.com/), 버전은 데이터 스냅샷 기준 `YYYY.MM`을 사용합니다.

## [2026.07]

### Added
- **`papers` 컬렉션 신설** (7번째 컬렉션): 한국 기관 주도 논문. `title`, `authors_org`, `venue`, `year`, `arxiv_id`, `related_ids`(조직/모델 참조) 등. arXiv 실존 검증 기반.
- **models 스키마 확장**: `base_model`(파생 관계), `benchmark_results[]`(`{benchmark, score, metric?, source?}`).
- **웹 기능**: 홈 통합검색, 다차원 필터·정렬, 4개 항목 비교, 검증 상태 배지 툴팁, 최근 업데이트 일시 표기.
- **조직 페이지**: 상세에 개발 모델·제품·오픈소스·관련 논문 섹션. 목록에 모델/오픈소스/논문 보유 필터 + 연결 개수 칩.
- **SEO**: 사이트맵, JSON-LD, OG/Twitter, canonical, robots.txt, llms.txt.
- **데이터 확충**: 조직 133 · 모델 119 · 제품 56 · 오픈소스 47 · 데이터셋 41 · 벤치마크 12 · 논문 227 (합계 635).

### Changed
- `models.organization_id`를 필수로 강제 (org 없는 모델은 개발사 조직을 먼저 등재).
- 생태계 지도·타임라인 페이지 제거 (실효성 낮음).

### Fixed
- Astro glob 로더의 id 점(`.`) 제거로 인한 파일명/URL/참조 불일치 → 모델 id에서 점 제거로 통일.
- 필터가 카드를 숨기지 못하던 문제 → 전역 `[hidden]{display:none!important}`.
- 전역 ID 충돌 해소 규칙(컬렉션 간 유일성) 적용: `ko-reranker-bge`, `klue-project`.

## [Phase 0]

### Added
- Phase 0 리포 뼈대: 디렉터리 구조, zod 스키마 6종, 검증/빌드 스크립트, Issue Form, 자동화 워크플로우
- 문서: README, METHODOLOGY, CONTRIBUTING, GOVERNANCE, DATA_LICENSE, CODE_OF_CONDUCT
- 샘플 데이터: 조직 1건, 모델 1건
