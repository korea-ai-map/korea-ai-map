/**
 * Astro 콘텐츠 컬렉션 설정.
 *
 * 원본 데이터는 web/ 밖의 리포 루트 `data/` 에 있으므로 glob loader 의 base 로 참조한다.
 * (base 는 Astro 프로젝트 루트 = web/ 기준 상대경로)
 *
 * 스키마는 schemas.ts(zod)를 그대로 재사용한다 → 검증·타입·JSON Schema 단일 소스.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import {
  organizationSchema,
  modelSchema,
  productSchema,
  openSourceSchema,
  datasetSchema,
  benchmarkSchema,
} from './schemas';

const yaml = (dir: string) => glob({ pattern: '**/*.yaml', base: `../data/${dir}` });

const organizations = defineCollection({ loader: yaml('organizations'), schema: organizationSchema });
const models = defineCollection({ loader: yaml('models'), schema: modelSchema });
const products = defineCollection({ loader: yaml('products'), schema: productSchema });
const openSource = defineCollection({ loader: yaml('open-source'), schema: openSourceSchema });
const datasets = defineCollection({ loader: yaml('datasets'), schema: datasetSchema });
const benchmarks = defineCollection({ loader: yaml('benchmarks'), schema: benchmarkSchema });

export const collections = {
  organizations,
  models,
  products,
  'open-source': openSource,
  datasets,
  benchmarks,
};
