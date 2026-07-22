/**
 * 참조 무결성 검사 (PRD 11.1)
 * - ID 전역 중복 (파일명 = id)
 * - organization_id / models / products / models_used 등 참조가 실재하는 항목을 가리키는지
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
}
// 컬렉션 무관 전역 유일성도 권장 (id 가 URL/참조에 쓰임)
const globalIds = new Map<string, string>();
for (const e of all) {
  if (globalIds.has(e.id)) err(`전역 ID 충돌: '${e.id}' (${e.file} ↔ ${globalIds.get(e.id)})`);
  globalIds.set(e.id, e.file);
}

// 2) 참조 무결성
const orgIds = new Set(loadCollection('organizations').map((e) => e.id));
const modelIds = new Set(loadCollection('models').map((e) => e.id));
const productIds = new Set(loadCollection('products').map((e) => e.id));

const checkRef = (ok: boolean, e: { file: string }, field: string, val: string) => {
  if (!ok) err(`${e.file}: ${field} → 존재하지 않는 참조 '${val}'`);
};

for (const e of all) {
  const d = e.data;
  if (d.organization_id && !orgIds.has(d.organization_id))
    checkRef(false, e, 'organization_id', d.organization_id);

  for (const m of d.models ?? []) checkRef(modelIds.has(m), e, 'models', m);
  for (const p of d.products ?? []) checkRef(productIds.has(p), e, 'products', p);
  for (const m of d.models_used ?? []) checkRef(modelIds.has(m), e, 'models_used', m);
}

console.log(`check-refs: 항목 ${all.length}개 검사`);
if (errors) {
  console.error(`\ncheck-refs 실패: ${errors}건`);
  process.exit(1);
}
console.log('check-refs 통과 ✓');
