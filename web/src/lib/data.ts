import { getCollection } from 'astro:content';

export interface SearchEntry {
  type: string;
  typeLabel: string;
  id: string;
  name: string;
  name_en: string;
  desc: string;
  tags: string[];
}

/** 모든 컬렉션을 검색용 평탄 배열로 만든다 (빌드타임). */
export async function buildSearchIndex(): Promise<SearchEntry[]> {
  const [orgs, models, products, os, datasets, benchmarks] = await Promise.all([
    getCollection('organizations'), getCollection('models'), getCollection('products'),
    getCollection('open-source'), getCollection('datasets'), getCollection('benchmarks'),
  ]);
  const out: SearchEntry[] = [];
  const push = (type: string, typeLabel: string, id: string, name: string, name_en: string, desc: string, tags: string[]) =>
    out.push({ type, typeLabel, id, name, name_en, desc: desc ?? '', tags: tags ?? [] });

  for (const o of orgs) push('organizations', '조직', o.id, o.data.name_ko, o.data.name_en, o.data.description_ko ?? '', o.data.categories);
  for (const m of models) push('models', '모델', m.id, m.data.name, m.data.name, '', [...(m.data.modalities ?? []), ...(m.data.tasks ?? [])]);
  for (const p of products) push('products', '제품', p.id, p.data.name_ko ?? p.data.name_en, p.data.name_en ?? '', '', p.data.categories);
  for (const x of os) push('open-source', '오픈소스', x.id, x.data.name, x.data.name, x.data.description_ko ?? '', [x.data.repo_type]);
  for (const x of datasets) push('datasets', '데이터셋', x.id, x.data.name, x.data.name, x.data.description_ko ?? '', [x.data.category]);
  for (const x of benchmarks) push('benchmarks', '벤치마크', x.id, x.data.name, x.data.name, x.data.description_ko ?? '', [x.data.category]);
  return out;
}
