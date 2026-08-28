import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const repoRoot = join(root, '..');

function read(rel) {
  return readFileSync(join(root, rel), 'utf8');
}

function readRepo(rel) {
  return readFileSync(join(repoRoot, rel), 'utf8');
}

test('whats-new API routes are wired on backend and frontend', () => {
  const server = readRepo('backend/server.py');
  assert.match(server, /whats_new_router/);
  assert.match(server, /include_router\(whats_new_router\)/);

  const route = readRepo('backend/routes/whats_new.py');
  assert.match(route, /@router\.get\("\/whats-new"\)/);
  assert.match(route, /@router\.post\("\/admin\/whats-new"\)/);
  assert.match(route, /VISIBILITY_DAYS = 14/);

  const api = read('src/utils/api.jsx');
  assert.match(api, /whatsNew:\s*\{/);
  assert.match(api, /getPublic: \(\) => axios\.get\(`\$\{API\(\)\}\/whats-new`\)/);
  assert.match(api, /getWhatsNew:/);
  assert.match(api, /upsertWhatsNew:/);
});

test('NewsBubble uses dynamic whats_new_last_read localStorage key', () => {
  const bubble = read('src/components/home/NewsBubble.jsx');
  assert.match(bubble, /WHATS_NEW_LAST_READ_KEY = 'whats_new_last_read'/);
  assert.match(bubble, /api\.whatsNew\.getPublic/);
  assert.match(bubble, /localStorage\.setItem\(WHATS_NEW_LAST_READ_KEY/);
  assert.match(bubble, /data-testid="news-bubble-unread-dot"/);
  assert.doesNotMatch(bubble, /appUpdates/);
});

test('Cockpit page exposes whats-new admin section', () => {
  const app = read('src/App.jsx');
  assert.match(app, /path="\/cockpit"/);
  assert.match(app, /CockpitPage/);

  const cockpit = read('src/pages/CockpitPage.jsx');
  assert.match(cockpit, /WhatsNewAdminSection/);
  assert.match(cockpit, /data-testid="cockpit-page"/);

  const admin = read('src/components/admin/WhatsNewAdminSection.jsx');
  assert.match(admin, /upsertWhatsNew/);
  assert.match(admin, /Rafraîchir \(14 jours\)/);
});
