import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createDemoRecords } from './src/sample.mjs';
import { validJob, alerts } from './src/logic.mjs';
test('Demoen starter med gyldige fiktive ansøgninger og en aktivitet', () => {
  const rows = createDemoRecords(new Date('2026-10-29T12:00:00'));
  assert.equal(rows.length, 5);
  assert.ok(rows.every(validJob));
  assert.equal(rows.filter((r) => r.kind === 'activity').length, 1);
  assert.equal(
    rows.flatMap((r) => alerts(r, '2026-10-29')).filter((a) => a.action === 'followup').length,
    2,
  );
  assert.ok(rows.every((r) => r.url === ''));
  assert.equal(rows.filter((r) => r.status === 'interview').length, 0);
});
test('Start forfra laver nye datoer og er uafhængig af tidligere ændringer', () => {
  const first = createDemoRecords(new Date('2026-10-29T12:00:00'));
  first[0].notes = 'Ændret';
  const fresh = createDemoRecords(new Date('2026-10-30T12:00:00'));
  assert.notEqual(fresh[0].notes, 'Ændret');
  assert.equal(fresh[3].activityDate, '2026-10-30');
});
test('Demoen har ingen private adresser, udvidelse eller filimport', () => {
  const files = readdirSync(new URL('./src/', import.meta.url));
  const app = readFileSync(new URL('./src/app.js', import.meta.url), 'utf8');
  const all = files
    .filter((f) => /\.(js|mjs|html|json|webmanifest)$/.test(f))
    .map((f) => readFileSync(new URL('./src/' + f, import.meta.url), 'utf8'))
    .join('\n');
  assert.ok(!all.includes('liban-farah142.chatgpt.site'));
  assert.ok(!all.includes('127.0.0.1'));
  assert.ok(!app.includes('localStorage'));
  assert.ok(!all.includes('type="file"'));
  assert.ok(!all.includes('fetch('));
});
test('Alle lokale modulafhængigheder findes i demoen', () => {
  const files = readdirSync(new URL('./src/', import.meta.url));
  for (const name of files.filter((f) => /\.(js|mjs)$/.test(f))) {
    const content = readFileSync(new URL('./src/' + name, import.meta.url), 'utf8');
    for (const match of content.matchAll(/from\s*['"]\.\/([^'"?]+)(?:\?[^'"]*)?['"]/g))
      assert.ok(files.includes(match[1]), name + ' mangler ' + match[1]);
  }
});

import { getVisibleRecords } from './src/visible-records.mjs';
import { renderRecordCard } from './src/record-card.js';

test('Visninger holder aktiviteter, afsluttede og opfølgninger adskilt', () => {
  const records = createDemoRecords(new Date('2026-10-29T12:00:00'));
  records.push({ ...records[0], id: 'closed-record', status: 'closed' });
  const options = { today: '2026-10-29' };
  assert.equal(getVisibleRecords(records, { ...options, view: 'all' }).length, 5);
  assert.deepEqual(
    getVisibleRecords(records, { ...options, view: 'closed' }).map((record) => record.id),
    ['closed-record'],
  );
  assert.deepEqual(
    getVisibleRecords(records, { ...options, view: 'activities' }).map((record) => record.id),
    ['demo-fair'],
  );
  assert.deepEqual(
    getVisibleRecords(records, { ...options, view: 'followup' }).map((record) => record.id),
    ['demo-office', 'demo-it'],
  );
  assert.equal(getVisibleRecords(records, { ...options, view: 'action' }).length, 4);
});

test('Søgning og status virker sammen; sortering ændrer ikke de gemte poster', () => {
  const records = createDemoRecords(new Date('2026-10-29T12:00:00'));
  const originalIds = records.map((record) => record.id);
  assert.deepEqual(
    getVisibleRecords(records, { view: 'all', query: 'fIKTIV', status: 'sent' }).map(
      (record) => record.id,
    ),
    ['demo-it'],
  );
  const noDate = { ...records[0], id: 'no-date', deadline: '' };
  assert.equal(getVisibleRecords([noDate, ...records], { view: 'all' }).at(-1).id, 'no-date');
  getVisibleRecords(records, { view: 'all', sort: 'new' });
  assert.deepEqual(
    records.map((record) => record.id),
    originalIds,
  );
});

test('Jobkort behandler brugerindtastet HTML som tekst og viser afsluttet uden opfølgningsknap', () => {
  const record = {
    ...createDemoRecords()[0],
    title: '<img src=x onerror=alert(1)>',
    notes: '<script>bad()</script>',
    company: 'A & B',
  };
  const html = renderRecordCard(record, '2026-10-29');
  assert.ok(!html.includes('<img'));
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;img'));
  assert.ok(html.includes('A &amp; B'));
  assert.ok(
    !renderRecordCard({ ...record, status: 'closed' }, '2026-10-29').includes('data-followup='),
  );
});
