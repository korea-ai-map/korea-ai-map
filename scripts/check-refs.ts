/**
 * 참조 무결성 검사 (PRD 11.1)
 * - ID 전역 중복 (파일명 = id)
 * - organization_id / models / products / models_used 등 참조가 실재하는 항목을 가리키는지
 * - 조직 역참조 일치 및 AI Hub dataSetSn 중복
 *
 * 필수필드·enum·형식 검증은 zod(=astro build)가 담당한다. 여기서는 "파일 간 관계"만 본다.
 */
import { loadAll, loadCollection } from './lib';

let errors = 0;
const err = (msg: string) => {
  console.error(`  ✗ ${msg}`);
  errors++;
};

const all = loadAll();

// 1) ID 전역 중복
const seen = new Map<string, string>();
for (const e of all) {
  const key = `${e.collection}:${e.id}`;
  if (seen.has(key)) err(`중복 ID: ${e.file} ↔ ${seen.get(key)}`);
  seen.set(key, e.file);
  if (e.data.id !== undefined && e.data.id !== e.id)
    err(`${e.file}: 내부 id '${e.data.id}'가 파일명 id '${e.id}'와 다름`);
}
// 컬렉션 무관 전역 유일성도 권장 (id 가 URL/참조에 쓰임)
const globalIds = new Map<string, string>();
for (const e of all) {
  if (globalIds.has(e.id)) err(`전역 ID 충돌: '${e.id}' (${e.file} ↔ ${globalIds.get(e.id)})`);
  globalIds.set(e.id, e.file);
}

// 2) 참조 무결성
const organizations = loadCollection('organizations');
const models = loadCollection('models');
const products = loadCollection('products');
const datasets = loadCollection('datasets');
const orgIds = new Set(organizations.map((e) => e.id));
const modelIds = new Set(models.map((e) => e.id));
const productIds = new Set(products.map((e) => e.id));
const orgById = new Map(organizations.map((e) => [e.id, e]));
const modelById = new Map(models.map((e) => [e.id, e]));
const productById = new Map(products.map((e) => [e.id, e]));

const checkRef = (ok: boolean, e: { file: string }, field: string, val: string) => {
  if (!ok) err(`${e.file}: ${field} → 존재하지 않는 참조 '${val}'`);
};

// 논문 related_ids 는 모든 컬렉션의 id 를 가리킬 수 있음
const anyId = new Set(all.map((e) => e.id));

for (const e of all) {
  const d = e.data;
  if (d.organization_id && !orgIds.has(d.organization_id))
    checkRef(false, e, 'organization_id', d.organization_id);

  for (const m of d.models ?? []) checkRef(modelIds.has(m), e, 'models', m);
  for (const p of d.products ?? []) checkRef(productIds.has(p), e, 'products', p);
  for (const m of d.models_used ?? []) checkRef(modelIds.has(m), e, 'models_used', m);
  for (const r of d.related_ids ?? []) checkRef(anyId.has(r), e, 'related_ids', r);
}

// 3) AI Hub 상세 URL의 dataSetSn은 데이터셋의 안정적인 외부 식별자다.
// 서로 다른 파일이 같은 상세 항목을 가리키면 대량 수집 중 생긴 중복으로 본다.
const aiHubIds = new Map<string, { file: string; name?: string }>();
for (const dataset of datasets) {
  const urls = [dataset.data.url, ...(dataset.data.sources ?? []).map((source: any) => source?.url)];
  const ids = new Set<string>();
  for (const value of urls) {
    if (typeof value !== 'string' || !/https?:\/\/(?:www\.)?aihub\.or\.kr\//i.test(value)) continue;
    try {
      const id = new URL(value).searchParams.get('dataSetSn');
      if (id) ids.add(id);
    } catch {
      // URL 형식 자체는 zod 스키마 검증에서 보고한다.
    }
  }
  for (const id of ids) {
    const previous = aiHubIds.get(id);
    if (previous && previous.file !== dataset.file)
      err(
        `AI Hub dataSetSn 중복: '${id}' (${dataset.file} ↔ ${previous.file})`,
      );
    else aiHubIds.set(id, { file: dataset.file, name: dataset.data.name });
  }
}

// 4) 조직의 역방향 목록과 자식 항목의 organization_id 일치
for (const model of models) {
  const org = orgById.get(model.data.organization_id);
  if (org && !(org.data.models ?? []).includes(model.id))
    err(`${org.file}: models 에 '${model.id}' 누락 (${model.file}의 organization_id)`);
}

for (const product of products) {
  const org = orgById.get(product.data.organization_id);
  if (org && !(org.data.products ?? []).includes(product.id))
    err(`${org.file}: products 에 '${product.id}' 누락 (${product.file}의 organization_id)`);
}

for (const org of organizations) {
  for (const id of org.data.models ?? []) {
    const model = modelById.get(id);
    if (model && model.data.organization_id !== org.id)
      err(`${org.file}: models '${id}'의 실제 organization_id는 '${model.data.organization_id}'`);
  }
  for (const id of org.data.products ?? []) {
    const product = productById.get(id);
    if (product && product.data.organization_id !== org.id)
      err(`${org.file}: products '${id}'의 실제 organization_id는 '${product.data.organization_id}'`);
  }
}

console.log(`check-refs: 항목 ${all.length}개 검사`);
if (errors) {
  console.error(`\ncheck-refs 실패: ${errors}건`);
  process.exit(1);
}
console.log('check-refs 통과 ✓');
