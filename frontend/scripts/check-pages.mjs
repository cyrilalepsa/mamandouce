import fs from 'fs';
import path from 'path';

const root = path.resolve('src');

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (/\.(jsx?|tsx?)$/.test(name)) out.push(p);
  }
  return out;
}

const files = walk(root);
const bad = [];

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  if (/^<<<<<<<|^=======|^>>>>>>>/m.test(text)) bad.push(`${file}: git conflict markers`);
  if (/emergent\.ai|emergentintegrations|@emergentbase/i.test(text)) bad.push(`${file}: emergent remnant`);
  if (/<\/div>\s*export\s+function/.test(text) || /return\s*\(\s*export\s+function/.test(text)) {
    bad.push(`${file}: corrupted JSX/export nest`);
  }
  const exports = [...text.matchAll(/export\s+(?:default\s+)?function\s+(\w+)/g)].map((m) => m[1]);
  const counts = {};
  for (const e of exports) counts[e] = (counts[e] || 0) + 1;
  for (const [k, v] of Object.entries(counts)) {
    if (v > 1) bad.push(`${file}: duplicate function ${k} x${v}`);
  }
}

const app = fs.readFileSync(path.join(root, 'App.jsx'), 'utf8');
const imports = [...app.matchAll(/import\s+(\w+)\s+from\s+['"]\.\/pages\/(\w+)['"]/g)];

// Extract path + innermost page component from each <Route ... />
const routeBlocks = [];
const routeRe = /<Route\b([^>]*)\/>|<Route\b([^>]*)>([\s\S]*?)<\/Route>/g;
let m;
while ((m = routeRe.exec(app)) !== null) {
  const attrs = m[1] || m[2] || '';
  const pathMatch = attrs.match(/path="([^"]+)"/);
  if (!pathMatch) continue;
  const elementMatch = attrs.match(/element=\{([\s\S]*)\}/);
  // For self-closing routes, element may contain nested braces — take from element={ to last }
  let elementSrc = '';
  if (attrs.includes('element={')) {
    const start = attrs.indexOf('element={') + 'element={'.length;
    // balance braces
    let depth = 1;
    let i = start;
    while (i < attrs.length && depth > 0) {
      const ch = attrs[i++];
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
    }
    elementSrc = attrs.slice(start, i - 1);
  }
  const tags = [...elementSrc.matchAll(/<(\w+)[\s/>]/g)].map((x) => x[1]);
  const skip = new Set(['ProtectedRoute', 'Navigate']);
  const comp = [...tags].reverse().find((t) => !skip.has(t)) || tags[tags.length - 1] || 'Unknown';
  routeBlocks.push({ path: pathMatch[1], comp });
}

console.log(`ROUTES: ${routeBlocks.length}`);
const routeIssues = [];
for (const { path: p, comp } of routeBlocks) {
  if (comp === 'Navigate') {
    console.log(`OK  ${p.padEnd(42)} -> Navigate`);
    continue;
  }
  const imp = imports.find((i) => i[1] === comp);
  if (!imp) {
    routeIssues.push(`NO IMPORT for ${comp} (${p})`);
    console.log(`!!  ${p.padEnd(42)} -> ${comp} (no import)`);
    continue;
  }
  const fileJsx = path.join(root, 'pages', `${imp[2]}.jsx`);
  const fileJs = path.join(root, 'pages', `${imp[2]}.js`);
  const file = fs.existsSync(fileJsx) ? fileJsx : fs.existsSync(fileJs) ? fileJs : null;
  if (!file) {
    routeIssues.push(`MISSING FILE ${imp[2]} for ${p}`);
    console.log(`!!  ${p.padEnd(42)} -> ${comp} (missing file)`);
    continue;
  }
  const text = fs.readFileSync(file, 'utf8');
  if (!/export\s+default\s+/.test(text)) {
    routeIssues.push(`NO DEFAULT EXPORT ${file} (${p})`);
    console.log(`!!  ${p.padEnd(42)} -> ${comp} (no default export)`);
    continue;
  }
  console.log(`OK  ${p.padEnd(42)} -> ${comp}`);
}

const pageFiles = fs.readdirSync(path.join(root, 'pages')).filter((f) => /\.jsx?$/.test(f));
const imported = new Set(imports.map((i) => `${i[2]}.jsx`));
const orphans = pageFiles.filter((f) => !imported.has(f));
console.log('\nORPHAN PAGES (not imported in App.jsx):');
orphans.forEach((o) => console.log(' -', o));

console.log('\nCORRUPTION SCAN:');
if (bad.length) bad.forEach((b) => console.log(' -', b));
else console.log(' OK none');

console.log('\nROUTE ISSUES:', routeIssues.length ? routeIssues : 'none');
process.exit(bad.length || routeIssues.length ? 1 : 0);
