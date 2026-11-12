import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { readArchive, parseSource } from '../src/lib/content-source.ts';
import { checkLanguage, validateGraph, validateLinks } from '../src/lib/content-validation.ts';
import { isPublished } from '../src/lib/content-policy.ts';
import { archiveSchemas } from '../src/schemas/index.ts';
import { translate } from '../src/i18n/messages.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const fixtureKeys = new Set(['demo-character-alpha', 'demo-character-beta', 'demo-era', 'demo-concept', 'demo-event', 'demo-album', 'demo-track', 'demo-artwork', 'demo-news', 'demo-dossier']);
const demo = (await readArchive(root)).filter((record) => record.data.demo && fixtureKeys.has(record.data.entryKey));
const common = {
  locale: 'ru', entryKey: 'test-entry', translationKey: 'test-entry',
  title: 'Тестовая запись', summary: 'Описание тестовой записи.',
};

test('all DEMO records and body links form a valid graph', async () => {
  assert.equal(demo.length, 20);
  assert.deepEqual(validateGraph(demo), []);
  const result = await validateLinks(demo, root);
  assert.deepEqual(result.errors, []);
  assert.equal(result.links, 8);
  assert.equal(result.media, 0);
});

test('unknown or bilingual fields fail strict schemas', () => {
  assert.equal(archiveSchemas.characters.safeParse({ ...common, title_en: 'Test' }).success, false);
  assert.equal(archiveSchemas.characters.safeParse({ ...common, title: { ru: 'Тест', en: 'Test' } }).success, false);
  assert.equal(archiveSchemas.characters.safeParse({ ...common, locale: 'fr' }).success, false);
});

test('DEMO markers are mandatory and cannot silently become canonical', () => {
  assert.equal(archiveSchemas.characters.safeParse({ ...common, demo: true }).success, false);
  assert.equal(archiveSchemas.characters.safeParse({ ...common, entryKey: 'demo-test' }).success, false);
});

test('music variants reject invalid dates, empty released tracklists and duplicate positions', () => {
  const release = { ...common, kind: 'release', format: 'album', artist: 'DEMO', releaseStatus: 'released', releaseDate: '2026-02-30', tracklist: [] };
  assert.equal(archiveSchemas.music.safeParse(release).success, false);
  const item = { track: 'ru/test-track', disc: 1, position: 1 };
  assert.equal(archiveSchemas.music.safeParse({ ...release, releaseDate: '2026-11-11', tracklist: [item, item] }).success, false);
  assert.equal(archiveSchemas.music.safeParse({ ...common, kind: 'track', artist: 'DEMO', format: 'album' }).success, false);
});

test('published tracks and art require duration and an actual image field', () => {
  assert.equal(archiveSchemas.music.safeParse({ ...common, draft: false, kind: 'track', artist: 'DEMO' }).success, false);
  assert.equal(archiveSchemas.gallery.safeParse({ ...common, draft: false, kind: 'concept', creators: [{ name: 'DEMO' }] }).success, false);
});

test('invalid event ranges, provider URLs and duplicate YAML keys fail', () => {
  assert.equal(archiveSchemas.timeline.safeParse({ ...common, dateLabel: 'Тестовая дата', orderKey: 10, endOrderKey: 1 }).success, false);
  assert.equal(archiveSchemas.music.safeParse({ ...common, kind: 'track', artist: 'DEMO', platformLinks: [{ platform: 'spotify', url: 'https://example.com/track' }] }).success, false);
  assert.throws(() => parseSource('title: one\ntitle: two\n', '.yaml'), /unique|same key/i);
});

test('missing and cross-locale references are rejected', () => {
  const records = structuredClone(demo);
  const character = records.find((record) => record.collection === 'characters' && record.id === 'ru/demo-character-alpha');
  assert.ok(character);
  character.data.related.characters.push({ collection: 'characters', id: 'ru/missing' });
  character.data.related.characters.push({ collection: 'characters', id: 'en/demo-character-alpha' });
  const errors = validateGraph(records).join('\n');
  assert.match(errors, /missing reference/);
  assert.match(errors, /cross-locale/);
});

test('release tracklists cannot contain releases and eras must be lore eras', () => {
  const records = structuredClone(demo);
  const album = records.find((record) => record.collection === 'music' && record.data.kind === 'release');
  const event = records.find((record) => record.collection === 'timeline');
  assert.ok(album?.collection === 'music' && album.data.kind === 'release');
  assert.ok(event?.collection === 'timeline');
  album.data.tracklist[0]!.track.id = album.id;
  event.data.era = { collection: 'lore', id: `${event.data.locale}/demo-concept` };
  const errors = validateGraph(records).join('\n');
  assert.match(errors, /tracklist must reference tracks/);
  assert.match(errors, /kind: era/);
});

test('published canonical records cannot depend on DEMO or drafts', () => {
  const records = structuredClone(demo);
  const character = records.find((record) => record.collection === 'characters');
  assert.ok(character);
  character.data.demo = false;
  character.data.draft = false;
  const errors = validateGraph(records).join('\n');
  assert.match(errors, /canonical content references DEMO/);
  assert.match(errors, /published content references an unpublished/);
});

test('duplicate IDs, duplicate translations and cyclic lore fail', () => {
  const records = structuredClone(demo);
  records.push(structuredClone(records[0]!));
  const era = records.find((record) => record.collection === 'lore' && record.id === 'ru/demo-era');
  assert.ok(era?.collection === 'lore');
  era.data.parent = { collection: 'lore', id: 'ru/demo-concept' };
  const errors = validateGraph(records).join('\n');
  assert.match(errors, /duplicate entry ID/);
  assert.match(errors, /duplicate translationKey/);
  assert.match(errors, /cyclic lore/);
});

test('missing body references, anchors and media fail without creating files', async () => {
  const records = structuredClone(demo);
  const character = records.find((record) => record.collection === 'characters');
  assert.ok(character?.collection === 'characters');
  character.body += '\n[DEMO](content:music/ru/missing)\n[DEMO](#missing)\n';
  character.data.portrait = { src: 'src/assets/images/characters/missing.webp', alt: 'Тестовое изображение' };
  const result = await validateLinks(records, root);
  assert.match(result.errors.join('\n'), /unresolved/);
  assert.match(result.errors.join('\n'), /missing heading/);
  assert.match(result.errors.join('\n'), /missing media/);
});

test('locale script guard rejects mixed prose in fields and bodies', async () => {
  assert.equal(checkLanguage('Тестовый текст', 'ru'), true);
  assert.equal(checkLanguage('Test prose', 'en'), true);
  assert.equal(checkLanguage('Тестовый English текст', 'ru'), false);
  assert.equal(checkLanguage('Test русский text', 'en'), false);
  const records = structuredClone(demo);
  const character = records.find((record) => record.collection === 'characters' && record.data.locale === 'ru');
  assert.ok(character);
  character.data.summary = 'Mixed English text';
  character.body += '\nMixed English text.\n';
  assert.match(validateGraph(records).join('\n'), /another language/);
  assert.match((await validateLinks(records, root)).errors.join('\n'), /another language/);
});

test('editorial MDX rejects executable expressions', async () => {
  const records = structuredClone(demo);
  const news = records.find((record) => record.filePath.endsWith('.mdx'));
  assert.ok(news);
  news.body = '<aside>{1 + 1}</aside>';
  assert.match((await validateLinks(records, root)).errors.join('\n'), /executable expressions/);
});

test('DEMO stays excluded even when its draft flag is disabled', () => {
  assert.equal(isPublished({ demo: true, draft: false }), false);
  assert.equal(isPublished({ demo: false, draft: true }), false);
  assert.equal(isPublished({ demo: false, draft: false }), true);
  assert.equal(demo.filter((record) => isPublished(record.data)).length, 0);
});

test('interface dictionaries have localized values without cross-language fallback', () => {
  assert.equal(translate('ru', 'characters'), 'Персонажи');
  assert.equal(translate('en', 'characters'), 'Characters');
});
