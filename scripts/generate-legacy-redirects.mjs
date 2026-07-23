import { copyFile, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_ORIGIN = 'https://korea-ai-map.github.io';
const LEGACY_SEGMENT = 'korea-ai-map';
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(scriptDir, '../web/dist');
const legacyDir = path.join(distDir, LEGACY_SEGMENT);

const escapeHtml = (value) =>
  value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const redirectPage = (target) => `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>페이지 이동 — Korea AI Map</title>
    <link rel="canonical" href="${escapeHtml(target)}" />
    <meta http-equiv="refresh" content="0; url=${escapeHtml(target)}" />
    <script>location.replace(${JSON.stringify(target)} + location.search + location.hash);</script>
  </head>
  <body>
    <p>페이지가 이동했습니다. <a href="${escapeHtml(target)}">새 주소로 이동</a></p>
  </body>
</html>
`;

async function collectFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (absolute === legacyDir) continue;
    if (entry.isDirectory()) files.push(...await collectFiles(absolute));
    else if (entry.isFile()) files.push(absolute);
  }
  return files;
}

function publicPath(relativePath) {
  const normalized = relativePath.split(path.sep).join('/');
  if (normalized === 'index.html') return '/';
  if (normalized.endsWith('/index.html')) return `/${normalized.slice(0, -'index.html'.length)}`;
  return `/${normalized}`;
}

await copyFile(path.join(distDir, 'sitemap-0.xml'), path.join(distDir, 'sitemap.xml'));
await rm(legacyDir, { recursive: true, force: true });

const sourceFiles = await collectFiles(distDir);
let redirects = 0;
let mirroredAssets = 0;

for (const source of sourceFiles) {
  const relative = path.relative(distDir, source);
  const destination = path.join(legacyDir, relative);
  await mkdir(path.dirname(destination), { recursive: true });

  const isVerificationFile = /^(?:google|naver)[^/]*\.html$/i.test(relative);
  if (relative.endsWith('.html') && !isVerificationFile) {
    const target = new URL(publicPath(relative), ROOT_ORIGIN).href;
    await writeFile(destination, redirectPage(target), 'utf8');
    redirects += 1;
  } else {
    await copyFile(source, destination);
    mirroredAssets += 1;
  }
}

console.log(`legacy mirror: ${redirects} redirects, ${mirroredAssets} assets`);
