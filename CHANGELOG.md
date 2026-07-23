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
- **데이터 확충**: 조직 138 · 모델 127 · 제품 71 · 오픈소스 48 · 데이터셋 110 · 벤치마크 17 · 논문 234 (합계 745).
- **AI Hub 세분화**: 한국어 카탈로그의 공식 상세 항목 68건을 `dataSetSn`별 데이터셋으로 추가하고, KsponSpeech를 상세 페이지와 연결.
- **신규 생태계 항목**: K-EXAONE·Solar Pro 3·Solar Open 2·KRAFTON Raon 모델군, KoBALT·KRETA·KVoiceBench 계열, Nota AI·Liner와 제품·논문을 공식 출처로 추가.

### Changed
- `models.organization_id`를 필수로 강제 (org 없는 모델은 개발사 조직을 먼저 등재).
- 출처 유형을 enum으로 제한하고, 조직의 모델·제품 역참조를 자식 `organization_id` 기준으로 동기화.
- 링크 점검을 URL 단위로 중복 제거하고 병렬화해 전체 검증 시간을 단축.
- 생태계 지도·타임라인 페이지 제거 (실효성 낮음).

### Fixed
- Astro glob 로더의 id 점(`.`) 제거로 인한 파일명/URL/참조 불일치 → 모델 id에서 점 제거로 통일.
- 내부 `id`보다 파일명을 정규 ID로 사용하고, AI Hub `dataSetSn` 중복과 조직 역참조 불일치를 자동 검출.
- 빈 모델 라이선스명과 잘못 분류된 출처 유형·신뢰도 표기를 교정.
- 이전·합병·경로 변경으로 끊긴 N.THING·SAPEON·Vrew·Bllossom·KcBERT 링크를 현재 공식 출처로 교체.
- 필터가 카드를 숨기지 못하던 문제 → 전역 `[hidden]{display:none!important}`.
- 전역 ID 충돌 해소 규칙(컬렉션 간 유일성) 적용: `ko-reranker-bge`, `klue-project`.

## [Phase 0]

### Added
- Phase 0 리포 뼈대: 디렉터리 구조, zod 스키마 6종, 검증/빌드 스크립트, Issue Form, 자동화 워크플로우
- 문서: README, METHODOLOGY, CONTRIBUTING, GOVERNANCE, DATA_LICENSE, CODE_OF_CONDUCT
- 샘플 데이터: 조직 1건, 모델 1건
