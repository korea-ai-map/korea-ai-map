/**
 * 정적 JSON API 빌드 (PRD 14.1)
 * data/**\/*.yaml → web/public/data/{collection}.json + all.json
 *
 * 이 산출물이 /data/organizations.json 등 정적 엔드포인트가 된다.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { COLLECTIONS, loadCollection } from './lib';

const OUT = join(process.cwd(), 'web', 'public', 'data');
mkdirSync(OUT, { recursive: true });

const generated_at = process.env.BUILD_DATE ?? 'unset'; // 재현성: CI에서 날짜 주입
const schema_version = '0.0.0';

const all: Record<string, any[]> = {};

for (const c of COLLECTIONS) {
  const items = loadCollection(c).map((e) => ({ id: e.id, ...e.data }));
  all[c] = items;
  writeFileSync(
    join(OUT, `${c}.json`),
    JSON.stringify({ schema_version, generated_at, count: items.length, items }, null, 2),
  );
  console.log(`  ${c}.json (${items.length})`);
}

writeFileSync(
  join(OUT, 'all.json'),
  JSON.stringify({ schema_version, generated_at, collections: all }, null, 2),
);
console.log(`build-data-json 완료 → ${OUT}`);
