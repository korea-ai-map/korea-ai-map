# Korea AI Map

한국에서 실제로 개발·운영되는 AI 기술과 조직을, **검증 가능한 근거**를 바탕으로 연결한 오픈 데이터베이스입니다.

> 본 프로젝트는 한국 AI 생태계를 객관적으로 기록하기 위한 독립 오픈 데이터 프로젝트입니다.
> 등재는 추천·인증 또는 투자 의견을 의미하지 않습니다. 모든 정보는 공개된 출처를 기준으로 작성되며,
> 오류 수정과 이의제기를 환영합니다.

## 무엇을 담나

AI **모델 · 조직 · 제품/서비스 · 오픈소스 · 데이터셋 · 벤치마크**를 구조화된 데이터로 관리하고,
각 항목에 **출처(sources)** 와 **검증 상태(verification_status)**, **최종 검증일(last_verified)** 을 부착합니다.

## 리포 구조

```
data/        원본 데이터 (source of truth, 한 항목 = 한 YAML 파일)
web/         Astro 프레젠테이션 계층 (정적 사이트 + 검색/필터/비교 아일랜드)
scripts/     참조 무결성·링크 점검·JSON 빌드·스키마 생성
schemas/     zod에서 생성된 JSON Schema (다운로드/문서용, 손으로 편집하지 않음)
docs/        스키마 가이드·데이터 사전
```

- **데이터 계층** = Git의 YAML. 이것이 유일한 원본입니다.
- **프레젠테이션 계층** = Astro. 같은 `data/`를 읽어 화면을 생성하므로 데이터와 화면이 어긋나지 않습니다.
- 스키마 단일 소스는 [`web/src/content/schemas.ts`](web/src/content/schemas.ts)의 **zod** 정의이며,
  이것이 ① 빌드 타임 검증 ② 렌더링 타입 ③ 다운로드용 JSON Schema를 모두 겸합니다.

## 기여하기

신규 등재 제보·수정 제안·서비스 상태 변경 신고는 [Issue](../../issues/new/choose) 또는 Pull Request로 받습니다.
자세한 규칙은 [CONTRIBUTING.md](CONTRIBUTING.md), 등재·검증 기준은 [METHODOLOGY.md](METHODOLOGY.md)를 참고하세요.

## 라이선스

- 코드: [MIT](LICENSE)
- 데이터: [CC BY 4.0](DATA_LICENSE.md)

재사용 시 프로젝트명과 버전을 표시해 주세요.

## 로드맵

- **Phase 0** 기준 수립 (스키마·문서·자동화 뼈대) ← *현재*
- **Phase 1** GitHub 데이터베이스 MVP + 정적 조회 (항목 100+)
- **Phase 2** 통합 검색 · 다차원 필터 · 비교
- **Phase 3** 생태계 지도 · 타임라인 시각화
- **Phase 4** 월간 변경 보고서 · 공개 API

자세한 계획은 [PLAN.md](PLAN.md) 참고.
