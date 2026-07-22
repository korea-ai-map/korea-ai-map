/**
 * 링크 점검 (PRD 11.2)
 * 모든 항목의 sources[].url, website, url, links.* 를 모아 도달 가능성을 확인한다.
 *
 * 원칙(PRD 11.3): 실패해도 데이터를 삭제하지 않는다. 이 스크립트는 "보고"만 하고,
 * 실제 상태 변경(needs-review)은 사람이 검토 후 반영한다.
 *
 * 사용:
 *   npm run check:links            # 보고만 (기본)
 *   CHECK_LINKS_STRICT=1 ...        # 하나라도 죽으면 exit 1 (CI 게이트용, 선택)
 */
import { loadAll } from './lib';

const strict = process.env.CHECK_LINKS_STRICT === '1';

function collectUrls(data: Record<string, any>): string[] {
  const urls: string[] = [];
  const push = (u: unknown) => {
    if (typeof u === 'string' && /^https?:\/\//.test(u)) urls.push(u);
  };
  push(data.website);
  push(data.url);
  for (const s of data.sources ?? []) push(s?.url);
  for (const u of data.open_source_links ?? []) push(u);
  if (data.links) for (const v of Object.values(data.links)) push(v);
  return [...new Set(urls)];
}

async function alive(url: string): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10_000);
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal });
    if (res.status === 405 || res.status === 403) {
      res = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctrl.signal });
    }
    clearTimeout(t);
    return res.ok;
  } catch {
    return false;
  }
}

const all = loadAll();
const dead: { file: string; url: string }[] = [];
let checked = 0;

for (const e of all) {
  for (const url of collectUrls(e.data)) {
    checked++;
    if (!(await alive(url))) dead.push({ file: e.file, url });
  }
}

console.log(`check-links: URL ${checked}개 확인`);
if (dead.length) {
  console.warn(`\n도달 실패 ${dead.length}건 (삭제하지 말 것 → needs-review 검토 대상):`);
  for (const d of dead) console.warn(`  ! ${d.file}: ${d.url}`);
  if (strict) process.exit(1);
} else {
  console.log('모든 링크 정상 ✓');
}
