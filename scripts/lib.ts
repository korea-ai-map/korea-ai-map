/** 스크립트 공용 유틸: data/ 아래 YAML 항목 로딩 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { load } from 'js-yaml';

export const DATA_DIR = join(process.cwd(), 'data');

export const COLLECTIONS = [
  'organizations',
  'models',
  'products',
  'open-source',
  'datasets',
  'benchmarks',
] as const;

export type Collection = (typeof COLLECTIONS)[number];

export interface Entry {
  collection: Collection;
  id: string; // 파일명 (확장자 제외)
  file: string; // 리포 상대경로
  data: Record<string, any>;
}

/** 한 컬렉션의 모든 YAML 항목을 읽는다. */
export function loadCollection(collection: Collection): Entry[] {
  const dir = join(DATA_DIR, collection);
  let files: string[];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));
  } catch {
    return []; // 아직 항목이 없는 컬렉션
  }
  return files.map((f) => {
    const id = basename(f).replace(/\.ya?ml$/, '');
    const raw = readFileSync(join(dir, f), 'utf8');
    const data = (load(raw) as Record<string, any>) ?? {};
    return { collection, id, file: `data/${collection}/${f}`, data };
  });
}

/** 전체 항목을 읽는다. */
export function loadAll(): Entry[] {
  return COLLECTIONS.flatMap(loadCollection);
}
