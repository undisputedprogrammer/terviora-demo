import { mkdir, writeFile } from 'node:fs/promises';

const base = new URL('../assets/fonts/', import.meta.url);
await mkdir(base, { recursive: true });
const cssURL = 'https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap';
const response = await fetch(cssURL, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' } });
if (!response.ok) throw new Error(`Font CSS failed: ${response.status}`);
const css = await response.text();
for (const [family, slug] of [['Manrope', 'manrope']]) {
  const blocks = [...css.matchAll(/\/\* latin \*\/\s*(@font-face\s*\{[^}]+\})/g)].map(m => m[1]).filter(b => b.includes(`'${family}'`));
  if (!blocks.length) throw new Error(`No latin WOFF2 for ${family}: ${css.slice(0, 1200)}`);
  const url = blocks[0].match(/url\(([^)]+)\)/)[1];
  const font = await fetch(url);
  if (!font.ok) throw new Error(`Font file failed: ${font.status}`);
  await writeFile(new URL(`${slug}.woff2`, base), Buffer.from(await font.arrayBuffer()));
  const license = await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${slug.replaceAll('-', '')}/OFL.txt`);
  if (!license.ok) throw new Error(`Font license failed: ${license.status}`);
  await writeFile(new URL(`${slug}-OFL.txt`, base), await license.text());
  console.log(`Saved ${family} and OFL license`);
}
