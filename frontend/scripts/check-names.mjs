import fs from 'fs';

const text = fs.readFileSync('src/data/namesByCountry.jsx', 'utf8');
const frMatch = text.match(/fr:\s*\{([\s\S]*?)\n  \},\n\n  \/\/ |fr:\s*\{([\s\S]*?)\n  \},\n\n  en:/);
const frBody = frMatch?.[1] || frMatch?.[2] || '';
const keys = [...frBody.matchAll(/"(\d+-\d+)":/g)].map((m) => m[1]);
const empty = [...frBody.matchAll(/"(\d+-\d+)":\s*\{\s*names:\s*\[\s*\]/g)].map((m) => m[1]);
const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const missing = [];
for (let m = 1; m <= 12; m++) {
  for (let d = 1; d <= daysInMonth[m - 1]; d++) {
    const k = `${m}-${d}`;
    if (!keys.includes(k)) missing.push(k);
  }
}
console.log({ keys: keys.length, missing: missing.length, missing, empty });
