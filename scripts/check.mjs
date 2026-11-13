import { readFile, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
for (const file of ['scripts/main.js','scripts/choices.js','scripts/data.js','scripts/glass.js','scripts/motion.js','scripts/arrival.js','scripts/serve.mjs']) {
  const result = spawnSync(process.execPath,['--check',fileURLToPath(new URL(file,root))],{encoding:'utf8'});
  if(result.status!==0)throw new Error(result.stderr);
}
const pages = new Map();
for (const file of ['index.html', 'listings.html', 'property.html', 'sell.html', 'contact.html']) {
  const html = await readFile(new URL(file, root), 'utf8');
  if (/<select\b/i.test(html)) throw new Error(`Native select found in ${file}`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  if (new Set(ids).size !== ids.length) throw new Error(`Duplicate HTML IDs in ${file}`);
  pages.set(file, {html, ids});
}
for (const [file, {html}] of pages) {
  for (const match of html.matchAll(/(?:src|data-mobile-src|href|poster)="([^"]+)"/g)) {
    const target = match[1].replaceAll('&amp;', '&');
    if (/^(https?:|mailto:)/.test(target)) continue;
    const [path, anchor] = target.split('#', 2);
    const destination = path.split('?')[0] || file;
    if (anchor && !pages.get(destination)?.ids.includes(anchor)) throw new Error(`Missing anchor ${target} in ${file}`);
    if (destination !== './') await access(new URL(destination, root));
  }
}
const css=(await Promise.all(['styles/main.css','styles/reference.css','styles/glass.css','styles/listings.css','styles/motion.css'].map(file=>readFile(new URL(file,root),'utf8')))).join('\n');
if(/#[0-9a-f]{3,8}\b/i.test(css))throw new Error('Raw color outside token layer');
if(/(?:padding|margin|gap)(?:-[a-z]+)?\s*:[^;}]*\d+(?:px|rem)/.test(css))throw new Error('Hardcoded component spacing');
console.log('Passed: JavaScript syntax, unique IDs, local asset/anchor references, and component color/spacing token checks.');
