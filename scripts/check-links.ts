/**
 * 링크 점검 (PRD 11.2)
 * 모든 항목의 sources[].url, website, url, links.* 를 모아 도달 가능성을 확인한다.
 *
 * 원칙(PRD 11.3): 실패해도 데이터를 삭제하지 않는다. 이 스크립트는 "보고"만 하고,
 * 실제 상태 변경(needs-review)은 사람이 검토 후 반영한다.
 *
 * 사용:
 *   npm run check:links            # 보고만 (기본)
 *   CHECK_LINKS_HOST=huggingface.co npm run check:links  # 특정 호스트만 재검사
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

type LinkResult =
  | { kind: 'ok'; status: number }
  | { kind: 'blocked'; status: number }
  | { kind: 'failed'; status?: number };

async function checkHuggingFaceFallback(
  url: string,
  headers: Record<string, string>,
  signal: AbortSignal,
): Promise<LinkResult | undefined> {
  if (!process.env.HF_TOKEN?.trim()) return undefined;
  const parsed = new URL(url);
  if (parsed.hostname !== 'huggingface.co') return undefined;

  const parts = parsed.pathname.split('/').filter(Boolean);
  let probe: URL | undefined;
  if (parts[0] === 'datasets' && parts.length >= 3) {
    probe =
      parts[3] === 'blob' && parts.length >= 6
        ? new URL(`/datasets/${parts[1]}/${parts[2]}/resolve/${parts.slice(4).join('/')}`, parsed)
        : new URL(`/api/datasets/${parts[1]}/${parts[2]}`, parsed);
  } else if (parts[0] === 'spaces' && parts.length >= 3) {
    probe = new URL(`/api/spaces/${parts[1]}/${parts[2]}`, parsed);
  } else {
    const reserved = new Set(['api', 'blog', 'collections', 'docs', 'papers']);
    if (parts.length >= 2 && !reserved.has(parts[0])) {
      probe =
        parts[2] === 'blob' && parts.length >= 5
          ? new URL(`/${parts[0]}/${parts[1]}/resolve/${parts.slice(3).join('/')}`, parsed)
          : new URL(`/api/models/${parts[0]}/${parts[1]}`, parsed);
    }
  }
  if (!probe) return undefined;

  try {
    const res = await fetch(probe, { method: 'GET', redirect: 'follow', signal, headers });
    await res.body?.cancel();
    if (res.ok) return { kind: 'ok', status: res.status };
    if ([401, 403, 429].includes(res.status)) return { kind: 'blocked', status: res.status };
    return { kind: 'failed', status: res.status };
  } catch {
    return { kind: 'failed' };
  }
}

async function checkUrl(url: string): Promise<LinkResult> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10_000);
  const headers: Record<string, string> = {
    accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
    'user-agent': 'Korea-AI-Map-Link-Checker/1.0 (+https://github.com/korea-ai-map/korea-ai-map.github.io)',
  };
  const hfToken = process.env.HF_TOKEN?.trim();
  if (hfToken && new URL(url).hostname === 'huggingface.co') {
    headers.authorization = `Bearer ${hfToken}`;
  }
  try {
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal, headers });
    if (res.ok) return { kind: 'ok', status: res.status };
    if (res.status === 429) {
      const fallback = await checkHuggingFaceFallback(url, headers, ctrl.signal);
      return fallback ?? { kind: 'blocked', status: res.status };
    }
    // 일부 사이트는 HEAD를 막거나 잘못 구현한다. 실패 시 실제 GET으로 한 번 더 확인한다.
    res = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctrl.signal, headers });
    if (res.ok) return { kind: 'ok', status: res.status };
    if ([401, 403, 429].includes(res.status)) {
      const fallback = await checkHuggingFaceFallback(url, headers, ctrl.signal);
      return fallback ?? { kind: 'blocked', status: res.status };
    }
    return { kind: 'failed', status: res.status };
  } catch {
    return { kind: 'failed' };
  } finally {
    clearTimeout(t);
  }
}

const all = loadAll();
const refsByUrl = new Map<string, Set<string>>();

for (const e of all) {
  for (const url of collectUrls(e.data)) {
    const files = refsByUrl.get(url) ?? new Set<string>();
    files.add(e.file);
    refsByUrl.set(url, files);
  }
}

const requestedHost = process.env.CHECK_LINKS_HOST?.trim().toLowerCase();
const urls = [...refsByUrl.keys()].filter(
  (url) => !requestedHost || new URL(url).hostname.toLowerCase() === requestedHost,
);
const requestedConcurrency = Number(process.env.CHECK_LINKS_CONCURRENCY ?? 6);
const concurrency = Math.max(1, Math.min(32, Number.isFinite(requestedConcurrency) ? requestedConcurrency : 6));
const results = new Map<string, LinkResult>();
let cursor = 0;

async function worker(): Promise<void> {
  while (cursor < urls.length) {
    const url = urls[cursor++];
    results.set(url, await checkUrl(url));
  }
}

await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, () => worker()));

type Finding = { url: string; files: string[]; status?: number };
const blocked: Finding[] = [];
const dead: Finding[] = [];
for (const url of urls) {
  const result = results.get(url);
  if (!result || result.kind === 'ok') continue;
  const finding = { url, files: [...(refsByUrl.get(url) ?? [])], status: result.status };
  (result.kind === 'blocked' ? blocked : dead).push(finding);
}

console.log(`check-links: 고유 URL ${urls.length}개 확인 (동시 요청 ${concurrency})`);
const refs = (files: string[]) => {
  const shown = files.slice(0, 3).join(', ');
  return files.length > 3 ? `${shown} 외 ${files.length - 3}개` : shown;
};

if (blocked.length) {
  console.warn(`\n접근 제한 ${blocked.length}건 (401/403/429; 존재 여부 자동 판정 보류):`);
  const groups = new Map<string, Finding[]>();
  for (const item of blocked) {
    const host = new URL(item.url).hostname;
    const key = `${item.status}:${host}`;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  for (const [key, items] of groups) {
    const [status, host] = key.split(':');
    const example = items.length === 1 ? ` — ${items[0].url}` : '';
    console.warn(`  ? HTTP ${status} ${host}: URL ${items.length}개${example}`);
  }
}

if (dead.length) {
  console.warn(`\n도달 실패 ${dead.length}건 (삭제하지 말 것 → needs-review 검토 대상):`);
  for (const item of dead)
    console.warn(`  ! ${item.status ? `HTTP ${item.status}` : 'timeout/network'}: ${item.url} (${refs(item.files)})`);
  if (strict) process.exit(1);
} else if (!blocked.length) {
  console.log('모든 링크 정상 ✓');
}
