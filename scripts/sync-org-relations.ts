/**
 * models/products 의 organization_id 를 기준으로 조직의 역방향 목록을 동기화한다.
 * 자식 항목이 단일 소스이며, YAML의 나머지 서식과 필드는 보존한다.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { loadCollection } from './lib';

function groupedIds(collection: 'models' | 'products'): Map<string, string[]> {
  const grouped = new Map<string, string[]>();
  for (const entry of loadCollection(collection)) {
    const organizationId = entry.data.organization_id;
    if (typeof organizationId !== 'string') continue;
    const ids = grouped.get(organizationId) ?? [];
    ids.push(entry.id);
    grouped.set(organizationId, ids);
  }
  for (const ids of grouped.values()) ids.sort();
  return grouped;
}

function replaceList(raw: string, key: 'models' | 'products', ids: string[]): string {
  const pattern = new RegExp(`^${key}:(?: \\[\\])?\\n(?:  - [^\\n]+\\n)*`, 'm');
  if (!pattern.test(raw)) throw new Error(`${key} 필드를 찾지 못했습니다`);
  const replacement = ids.length
    ? `${key}:\n${ids.map((id) => `  - ${id}`).join('\n')}\n`
    : `${key}: []\n`;
  return raw.replace(pattern, replacement);
}

const modelsByOrg = groupedIds('models');
const productsByOrg = groupedIds('products');
let changed = 0;

for (const org of loadCollection('organizations')) {
  const before = readFileSync(org.file, 'utf8');
  let after = replaceList(before, 'models', modelsByOrg.get(org.id) ?? []);
  after = replaceList(after, 'products', productsByOrg.get(org.id) ?? []);
  if (after === before) continue;
  writeFileSync(org.file, after);
  changed++;
}

console.log(`sync-org-relations: 조직 ${changed}개 갱신`);
