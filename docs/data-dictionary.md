# 데이터 사전 (Data Dictionary)

각 컬렉션의 필드 의미와 허용값을 설명합니다.
**기계적 정의(단일 소스)는 [`web/src/content/schemas.ts`](../web/src/content/schemas.ts)의 zod 스키마**이며,
이 문서는 사람을 위한 설명입니다. 값이 어긋나면 zod 정의가 우선합니다.

## 공통 규칙

| 필드 | 규칙 |
|---|---|
| `id` | **파일명**이 곧 id. 소문자-케밥, 전역 유일. 예: `exaone-3.5` |
| `sources[]` | `{ type, url }`. **최소 1개 필수.** (PRD 3.2) |
| `verification_status` | METHODOLOGY 3.2의 8개 enum 중 하나 |
| `last_verified` | `"YYYY-MM-DD"` — **YAML에서 반드시 따옴표로 감쌀 것** (Date로 자동 변환 방지) |
| 추정값 | 사실값과 구분해 `disclosure`/`confidence`(`confident`/`likely`/`speculative`/`undisclosed`/`not-applicable`) 부여 |

## organizations
`name_ko`, `name_en`, `organization_type`, `country`(기본 KR), `ai_core_level`(PRD 6.4),
`status`(active/acquired/merged/dormant/closed), `models[]`·`products[]`(id 참조), `open_source_links[]`.

## models
`name`, `organization_id`(참조), `status`(active/announced/deprecated/archived),
`modalities[]`, `tasks[]`, `parameter_count{value,disclosure}`, `context_length{value,confidence}`,
`availability{api,weights,demo}`, `license{name,commercial_use}`, `deployment{cloud,on_premise}`,
`languages[]`, `links{official,model_card,huggingface,github,paper}`,
`base_model`(파생·파인튜닝의 기반 모델, 선택), `benchmark_results[]`(`{benchmark, score, metric?, source?}`, 선택).

## products
`name_ko`, `name_en`, `organization_id`, `target_users[]`, `delivery_type[]`,
`models_used[]`(id 참조), `model_ownership`(own-model/external-model/hybrid/unknown), `pricing_public`.

## open-source
`name`, `repo_type`(github-repo/huggingface-model/framework/eval-tool/inference-tool/agent-mcp),
`url`, `language`, `license`, `stars`.

## datasets
`name`, `category`(korean-corpus/qa/multimodal/speech/safety/domain-specific), `languages[]`, `license`, `url`.

## benchmarks
`name`, `category`(korean-understanding/math-reasoning/safety/bias/hallucination/multimodal/coding/domain-specific), `url`.

## papers
`title`, `authors_org`(주도 기관 문자열), `venue`(학회/저널), `year`, `arxiv_id`(있으면), `url`, `doi`,
`abstract_ko`(국문 요약), `related_ids[]`(관련 조직·모델 id 참조 — 조직 상세의 "관련 논문"이 이 참조로 연결됨).
등재 시 **arXiv abs 페이지 등 1차 출처로 실존을 확인**한다(arxiv_id 임의 생성 금지).
