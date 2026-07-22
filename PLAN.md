# Korea AI Map — GitHub 배치 및 자료 정리 계획

> 근거 문서: `Korea AI Map PRD.pdf` (26p)
> 작성일: 2026-07-22 · 개정: Phase 0~2 완료 반영, papers 컬렉션·확정사항 갱신 (2026-07)
> 목적: PRD를 실제 GitHub 리포지토리로 어떻게 배치하고, 데이터/문서/자동화 자료를 어떻게 정리·운영할지 정의한다.

---

## 0. 근본 판단: 이것은 "블로그"가 아니라 "데이터 카탈로그"다

PRD가 요구하는 화면(통합검색·다차원 필터·4개 비교·생태계 지도·타임라인·다운로드)은 전부 **구조화 데이터 조작**이지 시간순 글이 아니다. 따라서 블로그 SSG(Jekyll/Hugo)는 성격이 어긋난다.

대신 **2계층으로 분리**한다.

- **데이터 계층 (source of truth)** = Git의 `data/**/*.yaml`. 블로그의 "마크다운 포스트" 자리에 해당하는, CMS를 대체하는 원본.
- **프레젠테이션 계층** = **Astro**. `data/`를 콘텐츠 컬렉션으로 읽어, 상세 페이지는 정적 HTML로 굽고 검색·필터·비교만 "아일랜드(부분 hydration)"로 처리.

### Astro를 쓰는 실질 이점 (계획을 단순하게 만든다)
1. **스키마가 하나로 통합된다.** Astro 콘텐츠 컬렉션의 `zod` 스키마가 곧 ① 빌드 타임 데이터 검증 ② 상세페이지 렌더링 타입 ③ (생성 시) 다운로드용 JSON Schema. → PRD 11.1의 필수필드·enum·형식 검증이 **별도 validate 스크립트 없이 빌드가 겸한다.**
2. **상세페이지·정적 조회가 사실상 공짜.** 데이터를 넣으면 상세 페이지가 자동 생성되므로 Phase 1(데이터)과 Phase 2(웹)의 경계가 낮아진다.
3. **정적 산출물 → GitHub Pages / Cloudflare Pages 무료 배포.** 별도 서버 불필요(PRD 13.3 "별도 DB 없이 운영").
4. 아주 복잡한 인터랙션이 필요해지면 그때 해당 아일랜드만 React 등으로 교체 가능(점진적).

---

## 1. 핵심 설계 원칙 (PRD 반영)

1. **Git이 곧 데이터베이스다.** MVP는 별도 DB 없이 `data/`의 YAML이 원본. Astro 빌드가 정적 사이트 + 통합 JSON을 생성. (PRD 13.3)
2. **모든 항목에 출처·검증 상태가 붙는다.** `sources`, `verification_status`, `last_verified` 필수. (PRD 7, 8)
3. **웹 화면과 구조화 데이터가 동일 원본을 쓴다.** Astro가 같은 `data/`를 소비하므로 불일치가 구조적으로 불가능. (PRD 3.1-5, 9.6)
4. **기여·검증·거버넌스가 Git 위에서 돈다.** Issue Form 제보 → PR → 빌드 검증 게이트 → 리뷰 → 머지. 변경 이력 = Git 커밋. (PRD 9.9, 9.10, 10)
5. **중립성이 경쟁력이다.** 유료 등재 금지·이해관계 공개·출처 없는 홍보 표현 삭제를 문서(CONTRIBUTING/GOVERNANCE)로 강제. (PRD 12)

---

## 2. 리포지토리 전략

### 2.1 단일 리포(모노레포) 권장
데이터·스키마·검증·웹을 한곳에 두어 "데이터 변경 → 검증 → 웹 반영"이 하나의 PR에서 원자적으로 일어나게 한다.
- 리포명(예): `korea-ai-map`
- 가시성: **public** (오픈 데이터 프로젝트)
- 기본 브랜치 `main` + 보호 규칙(리뷰 1인 이상 승인 필수 → PRD 10.3)

### 2.2 리포 분리는 확장 단계로 미룸
공개 API 서버(PRD 14.2, P2)가 생기면 그때 분리 검토. MVP에서는 분리하지 않는다(위험 1: 범위 비대화 방지).

---

## 3. 디렉터리 구조 (Astro 반영)

```
korea-ai-map/
├── README.md                    # 소개 + 공개 원칙 문구(PRD 22) + 데이터 통계 배지
├── CONTRIBUTING.md              # 제출 방식·필수입력 8종(PRD 9.9) + 이해관계 공개(PRD 12.3)
├── METHODOLOGY.md               # 등재 기준(6)·검증 체계(7)·한국 AI 판정 기준
├── GOVERNANCE.md                # 운영 구조·원칙·이해충돌·후원 정책(PRD 12)
├── DATA_LICENSE.md              # 데이터 라이선스(CC BY 4.0 / ODC-BY, PRD 20)
├── LICENSE                      # 코드 라이선스(MIT 또는 Apache-2.0)
├── CHANGELOG.md                 # 스키마/정책 변경 이력(항목별 변경은 Git 이력)
├── CODE_OF_CONDUCT.md
│
├── data/                        # ★ 원본 데이터 (source of truth, YAML)
│   ├── organizations/           # {id}.yaml — 한 항목 = 한 파일
│   ├── models/
│   ├── products/
│   ├── open-source/
│   ├── datasets/
│   ├── benchmarks/
│   └── papers/                  # 논문 (arXiv 실존 검증, related_ids로 조직·모델 연결)
│
├── web/                         # ★ Astro 프로젝트 (프레젠테이션 계층)
│   ├── src/
│   │   ├── content/
│   │   │   ├── config.ts        # ★ zod 스키마 = 검증+타입+렌더링 단일 소스
│   │   │   └── (data/ 를 심볼릭/glob 로 참조)
│   │   ├── pages/               # 라우팅: 홈, 상세, 검색, 다운로드
│   │   ├── components/          # 카드, 상태 배지, 필터, 비교표
│   │   └── islands/             # 검색·필터·비교 등 JS 필요한 위젯만
│   ├── astro.config.mjs
│   └── package.json
│
├── scripts/                     # 빌드가 못 잡는 "관계·외부" 검증만
│   ├── check-refs.ts            # organization_id 등 참조 무결성·ID 중복(PRD 11.1)
│   ├── check-links.ts           # 링크 상태 점검, 실패 시 needs-review(PRD 11.2)
│   ├── gen-json-schema.ts       # zod → schemas/*.json 생성(다운로드·문서용)
│   ├── build-data-json.ts       # data/ → public/data/*.json (정적 API, PRD 14.1)
│   ├── detect-changes.ts        # GitHub/HF/블로그 변경 후보(PRD 11.3)
│   ├── detect-outdated.ts       # last_verified 만료 라벨(PRD 11.4, 7.4)
│   └── generate-report.ts       # 월간/분기 변경 보고서(PRD 3.1-7)
│
├── schemas/                     # zod에서 자동 생성된 JSON Schema (커밋 산출물)
│   ├── organization.schema.json
│   ├── model.schema.json
│   └── ...                      # gen-json-schema.ts 결과, 손으로 안 씀
│
├── docs/                        # 보조 문서
│   ├── schema-guide.md
│   └── data-dictionary.md
│
└── .github/
    ├── ISSUE_TEMPLATE/
    │   ├── new-entry.yml         # 신규 등재 제보(PRD 9.9)
    │   ├── correction.yml        # 수정 제안
    │   └── status-change.yml     # 서비스 종료/변경 신고
    ├── PULL_REQUEST_TEMPLATE.md  # 출처·이해관계 체크리스트
    └── workflows/
        ├── validate.yml          # PR: astro build(스키마) + check-refs + check-links
        ├── deploy.yml            # main 머지: 빌드 → Pages/CF Pages 배포
        ├── scheduled-checks.yml  # cron: 링크·만료·변경 탐지
        └── report.yml            # cron(월간): 보고서 초안 PR
```

### 설계 결정 메모
- **스키마는 `web/src/content/config.ts`의 zod가 단일 소스.** JSON Schema(`schemas/`)는 다운로드/문서용으로 zod에서 **생성**만 하고 손으로 편집하지 않는다 → PRD 11.1 검증을 이중 관리하지 않음.
- **한 항목 = 한 YAML 파일**: PR diff가 명확하고 항목별 변경 이력이 Git 커밋으로 남아 PRD 9.10(변경 이력)을 코드 없이 충족.
- **`scripts/`는 "빌드가 못 잡는 것"만** 담당: 파일 간 참조 무결성, ID 전역 중복, 외부 링크 살아있음, 변경 탐지. 필수필드·enum·형식은 zod(빌드)가 처리.

---

## 4. 데이터 파일 규칙

### 4.1 네이밍·참조
- ID = 파일명(확장자 제외), 소문자-케밥, **전역 유일**(컬렉션 간에도 중복 불가). 예: `lg-ai-research.yaml`, `exaone-35.yaml`
  - ⚠️ 파일명에 **점(`.`)을 쓰지 말 것**: Astro glob 로더가 id에서 점을 제거해 파일명/URL/참조가 어긋난다. 버전은 `exaone-3.5` → `exaone-35`처럼 점 없이 표기.
- 조직↔모델↔제품↔논문은 ID 참조(`organization_id`, `models_used`, `related_ids`)로 연결. `check-refs.ts`가 참조 무결성·전역 ID 중복을 검사(PRD 11.1).

### 4.2 공통 필수 필드 (PRD 7, 8) — zod로 강제
- `sources[]` (type + url) 최소 1개 (PRD 3.2 "모든 공개 항목 최소 1개 출처")
- `verification_status` enum (`verified`/`official-source`/`community-reviewed`/`submitted`/`needs-review`/`outdated`/`disputed`/`archived`)
- `last_verified` = YYYY-MM-DD
- 추정값은 사실값과 다른 형태(`disclosure`/`confidence` 필드, PRD 7.3)

### 4.3 zod가 강제할 규칙
- enum 고정(`ai_core_level`, `verification_status`, `license.commercial_use` 등)
- 날짜 형식·URL 형식 검증
- `announced` 상태 모델은 배포 링크 없이 허용(PRD 6.2)

---

## 5. 문서(자료) 정리 방침

| 문서 | 담는 내용 | PRD 근거 |
|---|---|---|
| README.md | 정체성, 공개 원칙 문구, 빠른 시작, 통계 배지 | 22, 25 |
| METHODOLOGY.md | 등재/제외 기준, 한국 AI 판정, AI 핵심도 분류, 검증 체계·주기 | 6, 7 |
| CONTRIBUTING.md | 제출 방식 3종, 필수입력 8종, 처리 상태, 이해관계 공개 의무 | 9.9, 12.3 |
| GOVERNANCE.md | 운영 구조, 관리자 역할 5종, 편집 원칙, 이해충돌·후원 정책 | 10, 12 |
| DATA_LICENSE.md | 데이터 CC BY 4.0/ODC-BY, 재사용 시 프로젝트명·버전 표시 | 20 |
| docs/data-dictionary.md | 각 필드 의미·허용값·예시 (zod 스키마의 사람용 설명) | 8 |

**원칙**: 정책·기준은 문서에, 그 기준을 기계적으로 강제하는 규칙은 `zod 스키마` + `scripts/`에 둔다. 문서만 있으면 안 지켜지고, 코드만 있으면 근거가 불투명하다.

---

## 6. 자동화 (GitHub Actions)

| 워크플로우 | 트리거 | 하는 일 | PRD |
|---|---|---|---|
| validate.yml | PR / push | `astro build`(=스키마·필수필드·enum·형식) + `check-refs`(ID중복·참조) + `check-links` | 11.1, 11.2 |
| deploy.yml | main 머지 | 정적 빌드 → GitHub Pages / Cloudflare Pages, PR 미리보기 | 13.4 |
| scheduled-checks.yml | cron(매일) | 링크 상태·`last_verified` 만료→`needs-review`·변경 후보 탐지 | 11.2-11.4 |
| report.yml | cron(월간) | 변경 보고서 초안 → PR | 3.1-7 |

**중요 원칙(PRD 11.3)**: 자동 탐지는 **후보만 생성**, 최종 반영은 사람이 검토. 링크 실패 시 즉시 삭제 금지 → `needs-review`로만 변경.

---

## 7. 기여·검증 워크플로우

```
제보(Issue Form / 웹 폼)          PR 직접 편집
        │                            │
        ▼                            ▼
   submitted 라벨  ───────────────► PR 생성
                                     │
              validate.yml (astro build + check-refs + check-links) 게이트
                                     │
              Reviewer 검토 (출처·이해관계·기술 근거)
                                     │
        ┌────────────────────────────┼────────────────────────────┐
     승인(머지)                 추가 자료 요청                    반려
        │
   deploy → 웹/JSON 자동 반영, 커밋이 곧 변경 이력
```
- 기업 관계자 제출은 **자동 승인 금지**, 독립 리뷰어 승인 필요(PRD 10.3, 12.3).
- PR 템플릿에 "이해관계 있음/없음" 체크 필수.

---

## 8. 단계별 실행 로드맵 (PRD 17 매핑, Astro 반영)

Astro에서는 데이터를 넣으면 상세페이지가 자동 생성되므로, **Phase 1에 정적 조회 웹이 거의 딸려 나온다.** Phase 2는 검색·필터·비교 "아일랜드" 구현이 실제 작업.

> **현황 (2026-07)**: Phase 0~2 완료. 데이터 규모는 조직 133·모델 119·제품 56·오픈소스 47·데이터셋 41·벤치마크 12·논문 227 = **635건**으로 MVP 목표(100+)를 크게 상회. GitHub Pages 배포 운영 중.

### Phase 0 — 기준 수립 — ✅ 완료
- [x] 리포 생성, 브랜치 보호, 라이선스 2종
- [x] `web/` Astro 스캐폴딩 + `content/schemas.ts`에 **zod 스키마 확정** (초기 6종 → papers 추가로 **7종**)
- [x] `gen-json-schema.ts`로 `schemas/*.json` 생성 파이프라인
- [x] METHODOLOGY / CONTRIBUTING / GOVERNANCE / DATA_LICENSE 초안
- **완료**: 스키마 확정, 등재·검증 기준 문서화

### Phase 1 — GitHub 데이터베이스 MVP + 정적 조회 — ✅ 완료
- [x] `data/` 데이터 입력 (목표 대비 대폭 초과, 현재 635건)
- [x] Astro 상세페이지 자동 생성 + 상태 배지 컴포넌트(+툴팁)
- [x] `check-refs` + `check-links` + `build-data-json`(정적 JSON)
- [x] validate.yml + Issue Form 3종
- **완료(PRD 3.2, 23)**: 항목 100개+, 전 항목 출처, 검증 통과 100%, 중복 ID 없음

### Phase 2 — 검색·필터·비교 아일랜드 — ✅ 완료
- [x] 홈(통계+통합검색) / 다차원 필터·정렬 / 4개 비교 / 다운로드 / 최근 업데이트 일시
- [x] 조직 페이지: 개발 모델·제품·오픈소스·관련 논문 표시 + 보유 필터
- [x] GitHub Pages 배포 + PR 미리보기
- **완료**: PRD 9.1~9.3, 9.5·9.8·9.10

### Phase 3 — 커뮤니티 및 보고서 (예정)
- [ ] 월간 변경 보고서, 분기 Landscape, 공개 API

> 생태계 지도·타임라인 시각화는 실효성이 낮다고 판단해 **로드맵에서 제외**했다.

---

## 9. MVP 출시 판단 체크리스트 (PRD 23)

- [x] 핵심 데이터 100개 이상 (현재 635건)
- [x] 모든 항목에 출처 존재
- [x] 스키마 검증 통과 / 중복 ID 없음 (check-refs 통과)
- [x] 주요 링크 점검 완료
- [x] 등재 기준·수정 요청 절차 공개
- [x] 개인정보·민감정보 미포함
- [ ] 최소 2인 이상이 핵심 데이터 샘플 검수 (진행 필요)
- [x] 주요 모델·기업 누락 여부 검토 완료 (반복 확충)

---

## 10. 확정 필요 사항

| 항목 | 선택지 | 상태 |
|---|---|---|
| 웹 아키텍처 | ~~Next.js~~ / **Astro 콘텐츠 컬렉션** | ✅ 확정: Astro |
| 프로젝트명 | **Korea AI Map** | ✅ 확정 (org `korea-ai-map`) |
| 코드 라이선스 | **MIT** | ✅ 확정 |
| 데이터 라이선스 | **CC BY 4.0** | ✅ 확정 |
| 배포처 | **GitHub Pages** | ✅ 확정 (korea-ai-map.github.io/korea-ai-map/) |
| 아일랜드 프레임워크 | **Vanilla JS** | ✅ 확정 (검색·필터·비교 모두 프레임워크 없이 구현) |

---

## 다음 액션 제안 (Phase 3)

Phase 0~2 완료. 다음 후보:
- 데이터 2인 이상 샘플 교차검수(MVP 체크리스트 잔여 항목)
- 월간 변경 보고서 자동화(`report.yml`) 및 공개 JSON API 정식화
- `last_verified` 만료 항목의 주기적 `needs-review` 라벨링 운영
