import fs from 'fs';
import path from 'path';

const app = fs.readFileSync('src/App.jsx', 'utf8');
const imps = [...app.matchAll(/import\s+(\w+)\s+from\s+['"]\.\/pages\/(\w+)['"]/g)];
let ok = 0;
const bad = [];

for (const [, comp, file] of imps) {
  const p = path.join('src/pages', `${file}.jsx`);
  if (!fs.existsSync(p)) {
    bad.push(`${comp}: missing file`);
    continue;
  }
  const t = fs.readFileSync(p, 'utf8');
  if (!/export\s+default/.test(t)) {
    bad.push(`${comp}: no default export`);
    continue;
  }
  ok += 1;
  console.log(`OK  ${comp}`);
}

const pages = fs.readdirSync('src/pages').filter((f) => f.endsWith('.jsx'));
const used = new Set(imps.map((i) => `${i[2]}.jsx`));
const unused = pages.filter((f) => !used.has(f));

console.log(`\nimports=${imps.length} ok=${ok} bad=${bad.length}`);
if (bad.length) console.log(bad);
console.log('unused pages:', unused);
process.exit(bad.length ? 1 : 0);
