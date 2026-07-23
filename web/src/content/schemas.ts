/**
 * 스키마 단일 소스 (Single Source of Truth)
 *
 * 순수 zod 정의만 두고 `astro:content`에 의존하지 않는다.
 * 그래야 ① Astro 빌드(content collections) ② scripts/gen-json-schema.ts(JSON Schema 생성)
 * 세 곳이 동일한 스키마를 공유할 수 있다.
 *
 * 근거: PRD 6·7·8 (등재 기준 / 검증 체계 / 데이터 모델)
 */
import { z } from 'zod';

/* ---------- 공통 (PRD 7) ---------- */

/** YYYY-MM-DD. YAML에서는 반드시 따옴표로 감싼다: last_verified: "2026-07-20" */
export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 형식이어야 합니다 (따옴표 필수)');

/** 출처 (PRD 7.1). 모든 항목은 최소 1개 필요 (PRD 3.2) */
export const sourceType = z.enum([
  'api-docs',
  'github',
  'gov',
  'huggingface',
  'model-card',
  'official-blog',
  'official-docs',
  'official-website',
  'paper',
  'press',
  'reference',
  'submission',
]);

export const sourceSchema = z.object({
  type: sourceType,
  url: z.string().url(),
});

/** 검증 상태 (PRD 7.2) */
export const verificationStatus = z.enum([
  'verified',
  'official-source',
  'community-reviewed',
  'submitted',
  'needs-review',
  'outdated',
  'disputed',
  'archived',
]);

/** 필드 신뢰도 (PRD 7.3). 추정값은 사실값과 다르게 표기 */
export const confidence = z.enum([
  'confident',
  'likely',
  'speculative',
  'undisclosed',
  'not-applicable',
]);

/** AI 핵심도 (PRD 6.4) */
export const aiCoreLevel = z.enum([
  'foundation_model',
  'model_builder',
  'ai_native',
  'ai_infrastructure',
  'ai_enabled',
  'research_only',
  'unverified',
]);

export const commercialUse = z.enum(['allowed', 'restricted', 'prohibited', 'unknown']);

/* ---------- 조직 (PRD 8.1) ---------- */

export const organizationSchema = z.object({
  name_ko: z.string(),
  name_en: z.string(),
  organization_type: z.enum([
    'corporate',
    'corporate-research-lab',
    'startup',
    'university-lab',
    'government-research',
    'public-institution',
    'non-profit',
    'open-source-community',
  ]),
  country: z.string().default('KR'),
  headquarters: z.string().optional(),
  website: z.string().url().optional(),
  founded_year: z.number().int().optional(),
  ai_core_level: aiCoreLevel,
  categories: z.array(z.string()).default([]),
  status: z.enum(['active', 'acquired', 'merged', 'dormant', 'closed']),
  description_ko: z.string().optional(),
  models: z.array(z.string()).default([]), // model id 참조
  products: z.array(z.string()).default([]), // product id 참조
  open_source_links: z.array(z.string().url()).default([]),
  sources: z.array(sourceSchema).min(1),
  last_verified: isoDate,
  verification_status: verificationStatus,
});

/* ---------- 모델 (PRD 8.2) ---------- */

export const modelSchema = z.object({
  name: z.string(),
  organization_id: z.string(), // 조직 id 참조 (check-refs.ts 가 무결성 검사)
  model_family: z.string().optional(),
  release_date: isoDate.optional(),
  status: z.enum(['active', 'announced', 'deprecated', 'archived']),
  modalities: z.array(z.string()).default([]), // text, image, audio, video ...
  tasks: z.array(z.string()).default([]), // chat, reasoning, coding ...
  parameter_count: z
    .object({
      value: z.number().nullable(),
      disclosure: confidence,
    })
    .optional(),
  context_length: z
    .object({
      value: z.number().nullable(),
      confidence: confidence,
    })
    .optional(),
  availability: z.object({
    api: z.boolean(),
    weights: z.boolean(),
    demo: z.boolean(),
  }),
  license: z.object({
    name: z.string().min(1),
    commercial_use: commercialUse,
  }),
  deployment: z
    .object({
      cloud: z.boolean(),
      on_premise: z.boolean(),
    })
    .optional(),
  languages: z.array(z.string()).default([]),
  // 파생/기반 모델 (모델 계보, PRD 24). 처음부터 사전학습한 모델은 생략하거나 "from-scratch".
  base_model: z.string().optional(),
  // 벤치마크 결과 (PRD 9.4 모델 상세). benchmark 는 benchmarks 컬렉션 id 또는 표기명.
  benchmark_results: z
    .array(
      z.object({
        benchmark: z.string(),
        score: z.number(),
        metric: z.string().optional(), // accuracy, exact-match, pass@1 등
        source: z.string().url().optional(),
      }),
    )
    .default([]),
  links: z
    .object({
      official: z.string().url().nullable().optional(),
      model_card: z.string().url().nullable().optional(),
      huggingface: z.string().url().nullable().optional(),
      github: z.string().url().nullable().optional(),
      paper: z.string().url().nullable().optional(),
    })
    .optional(),
  sources: z.array(sourceSchema).min(1),
  last_verified: isoDate,
  verification_status: verificationStatus,
});

/* ---------- 제품 및 서비스 (PRD 8.3) ---------- */

export const productSchema = z.object({
  name_ko: z.string(),
  name_en: z.string(),
  organization_id: z.string(),
  description_ko: z.string().optional(),
  categories: z.array(z.string()).default([]),
  target_users: z.array(z.string()).default([]),
  delivery_type: z.array(z.string()).default([]), // api, saas, on-premise, agent ...
  models_used: z.array(z.string()).default([]),
  model_ownership: z.enum(['own-model', 'external-model', 'hybrid', 'unknown']),
  pricing_public: z.boolean().optional(),
  status: z.enum(['active', 'beta', 'deprecated', 'archived']),
  website: z.string().url().optional(),
  sources: z.array(sourceSchema).min(1),
  last_verified: isoDate,
  verification_status: verificationStatus,
});

/* ---------- 오픈소스 (PRD 5.1 D) ---------- */

export const openSourceSchema = z.object({
  name: z.string(),
  organization_id: z.string().optional(),
  repo_type: z.enum([
    'github-repo',
    'huggingface-model',
    'framework',
    'eval-tool',
    'inference-tool',
    'agent-mcp',
  ]),
  url: z.string().url(),
  description_ko: z.string().optional(),
  language: z.string().optional(),
  license: z.string().optional(),
  stars: z.number().int().nullable().optional(),
  sources: z.array(sourceSchema).min(1),
  last_verified: isoDate,
  verification_status: verificationStatus,
});

/* ---------- 데이터셋 (PRD 5.1 E) ---------- */

export const datasetSchema = z.object({
  name: z.string(),
  organization_id: z.string().optional(),
  category: z.enum([
    'korean-corpus',
    'qa',
    'multimodal',
    'speech',
    'safety',
    'domain-specific',
  ]),
  description_ko: z.string().optional(),
  languages: z.array(z.string()).default([]),
  license: z.string().optional(),
  url: z.string().url().optional(),
  sources: z.array(sourceSchema).min(1),
  last_verified: isoDate,
  verification_status: verificationStatus,
});

/* ---------- 벤치마크 (PRD 5.1 F) ---------- */

export const benchmarkSchema = z.object({
  name: z.string(),
  organization_id: z.string().optional(),
  category: z.enum([
    'korean-understanding',
    'math-reasoning',
    'safety',
    'bias',
    'hallucination',
    'multimodal',
    'coding',
    'domain-specific',
  ]),
  description_ko: z.string().optional(),
  url: z.string().url().optional(),
  sources: z.array(sourceSchema).min(1),
  last_verified: isoDate,
  verification_status: verificationStatus,
});

/* ---------- 논문 (PRD 7.1 최우선 출처) ---------- */

export const paperSchema = z.object({
  title: z.string(),
  authors_org: z.string().optional(), // 주도 기관/저자 소속
  venue: z.string().optional(), // arXiv, ACL, EMNLP, NeurIPS ...
  year: z.number().int().optional(),
  arxiv_id: z.string().optional(),
  url: z.string().url(),
  doi: z.string().optional(),
  abstract_ko: z.string().optional(),
  // 연결되는 카탈로그 id (모델/조직/벤치마크/데이터셋). check-refs 가 존재 검사.
  related_ids: z.array(z.string()).default([]),
  sources: z.array(sourceSchema).min(1),
  last_verified: isoDate,
  verification_status: verificationStatus,
});

/** 컬렉션 이름 → 스키마. gen-json-schema.ts 가 그대로 순회한다. */
export const schemaMap = {
  organizations: organizationSchema,
  models: modelSchema,
  products: productSchema,
  'open-source': openSourceSchema,
  datasets: datasetSchema,
  benchmarks: benchmarkSchema,
  papers: paperSchema,
} as const;

export type SchemaMap = typeof schemaMap;
