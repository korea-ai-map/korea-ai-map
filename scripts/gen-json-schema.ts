/**
 * zod → JSON Schema 생성 (다운로드/문서용, PRD 9.8 "스키마 버전 포함")
 * schemas.ts 의 zod 정의를 단일 소스로 하여 schemas/*.schema.json 을 생성한다.
 * 이 파일들은 손으로 편집하지 않는다.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { schemaMap } from '../web/src/content/schemas';

const OUT = join(process.cwd(), 'schemas');
mkdirSync(OUT, { recursive: true });

for (const [name, schema] of Object.entries(schemaMap)) {
  const json = zodToJsonSchema(schema, { name, $refStrategy: 'none' });
  const file = join(OUT, `${name}.schema.json`);
  writeFileSync(file, JSON.stringify(json, null, 2));
  console.log(`  ${name}.schema.json`);
}
console.log(`gen-json-schema 완료 → ${OUT}`);
