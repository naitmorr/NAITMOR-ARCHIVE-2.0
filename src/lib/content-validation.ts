import { stat } from 'node:fs/promises';
import path from 'node:path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import GithubSlugger from 'github-slugger';
import { collectionNames, type ArchiveCollection } from '../schemas/common.ts';
import type { ArchiveRecord } from '../schemas/index.ts';
import type { Locale } from '../i18n/config.ts';
import { isPublished } from './content-policy.ts';

type Reference = { collection: ArchiveCollection; id: string };
type Node = { type: string; value?: string; url?: string; identifier?: string; name?: string; attributes?: { type: string; name?: string; value?: unknown }[]; children?: Node[] };
type EntryLink = { record: ArchiveRecord; url: string; media?: boolean };

function isReference(value: unknown): value is Reference {
  return typeof value === 'object' && value !== null && 'collection' in value && 'id' in value
    && collectionNames.some((name) => name === value.collection) && typeof value.id === 'string';
}

function visit(value: unknown, callback: (value: unknown, key: string) => void, key = ''): void {
  callback(value, key);
  if (Array.isArray(value)) value.forEach((item) => visit(item, callback, key));
  else if (value && typeof value === 'object') {
    for (const [childKey, child] of Object.entries(value)) visit(child, callback, childKey);
  }
}

const localizedFields = new Set(['title', 'summary', 'titles', 'species', 'affiliations', 'description', 'birthLabel', 'deathLabel', 'dateLabel', 'alt', 'credit', 'version', 'genres', 'role', 'medium', 'unlockHint', 'lyrics', 'label']);
export function checkLanguage(text: string, locale: Locale): boolean {
  // Script guard, not a semantic language detector. Names, identifiers and code are handled separately.
  const prose = text.replace(/\b(?:DEMO|NAITMOR|CLASSIFIED|EP|ISRC)\b/g, '');
  return locale === 'en' ? !/[А-Яа-яЁё]/.test(prose) : !/[A-Za-z]/.test(prose);
}

export function validateGraph(records: ArchiveRecord[]): string[] {
  const errors: string[] = [];
  const entries = new Map<string, ArchiveRecord>();
  const translations = new Map<string, ArchiveRecord>();
  const codes = new Set<string>();
  for (const record of records) {
    const key = `${record.collection}/${record.id}`;
    if (entries.has(key)) errors.push(`${key}: duplicate entry ID.`);
    entries.set(key, record);
    const translation = `${record.collection}/${record.data.translationKey}/${record.data.locale}`;
    if (translations.has(translation)) errors.push(`${key}: duplicate translationKey for this locale.`);
    translations.set(translation, record);
    if (record.id !== `${record.data.locale}/${record.data.entryKey}`) errors.push(`${key}: locale/key does not match the entry ID.`);
    if (record.collection === 'dossiers') {
      const code = `${record.data.locale}/${record.data.archiveCode}`;
      if (codes.has(code)) errors.push(`${key}: duplicate archiveCode.`);
      codes.add(code);
    }
    visit(record.data, (value, field) => {
      if (typeof value === 'string' && localizedFields.has(field) && !checkLanguage(value, record.data.locale)) {
        errors.push(`${key}: ${field} contains text from another language.`);
      }
      if (Array.isArray(value)) {
        const references = value.filter(isReference).map((reference) => `${reference.collection}/${reference.id}`);
        if (new Set(references).size !== references.length) errors.push(`${key}: duplicate references in ${field}.`);
      }
    });
  }
  const checkTarget = (source: ArchiveRecord, reference: Reference): ArchiveRecord | undefined => {
    const label = `${source.collection}/${source.id}`;
    const key = `${reference.collection}/${reference.id}`;
    const target = entries.get(key);
    if (!target) { errors.push(`${label}: missing reference ${key}.`); return; }
    if (source === target) errors.push(`${label}: self-reference.`);
    if (source.data.locale !== target.data.locale) errors.push(`${label}: cross-locale reference ${key}.`);
    if (!source.data.demo && target.data.demo) errors.push(`${label}: canonical content references DEMO ${key}.`);
    if (isPublished(source.data) && !isPublished(target.data)) errors.push(`${label}: published content references an unpublished entry ${key}.`);
    return target;
  };
  for (const record of records) {
    visit(record.data, (value) => { if (isReference(value)) checkTarget(record, value); });
    const translated = records.find((other) => other.collection === record.collection
      && other.data.translationKey === record.data.translationKey && other.data.locale !== record.data.locale);
    if (translated) {
      if (translated.data.demo !== record.data.demo) errors.push(`${record.filePath}: translation DEMO flags differ.`);
      if (record.collection === 'music' && translated.collection === 'music' && translated.data.kind !== record.data.kind) {
        errors.push(`${record.filePath}: translations use different music kinds.`);
      }
    }
    if (record.collection === 'music' && record.data.kind === 'release') {
      for (const item of record.data.tracklist) {
        const target = entries.get(`music/${item.track.id}`);
        if (target && (target.collection !== 'music' || target.data.kind !== 'track')) errors.push(`${record.filePath}: tracklist must reference tracks, not releases.`);
      }
    }
    if (record.collection === 'timeline' && record.data.era) {
      const era = entries.get(`lore/${record.data.era.id}`);
      if (era && (era.collection !== 'lore' || era.data.kind !== 'era')) errors.push(`${record.filePath}: era must reference lore with kind: era.`);
    }
    if (record.collection === 'lore') {
      const visited = new Set([record.id]);
      let parent = record.data.parent;
      while (parent) {
        if (visited.has(parent.id)) { errors.push(`${record.filePath}: cyclic lore hierarchy.`); break; }
        visited.add(parent.id);
        const target = entries.get(`lore/${parent.id}`);
        parent = target?.collection === 'lore' ? target.data.parent : undefined;
      }
    }
  }
  return errors;
}

function markdownTree(record: ArchiveRecord): Node {
  const processor = unified().use(remarkParse);
  if (record.filePath.endsWith('.mdx')) processor.use(remarkMdx);
  return processor.parse(record.body) as Node;
}

function nodes(root: Node): Node[] {
  return [root, ...(root.children ?? []).flatMap(nodes)];
}

function headingIds(tree: Node): Set<string> {
  const used = new Set<string>();
  const slugger = new GithubSlugger();
  for (const heading of nodes(tree).filter((node) => node.type === 'heading')) {
    const value = nodes(heading).filter((node) => node.type === 'text' || node.type === 'inlineCode').map((node) => node.value ?? '').join('');
    used.add(slugger.slug(value));
  }
  return used;
}

export async function validateLinks(records: ArchiveRecord[], root: string): Promise<{ errors: string[]; links: number; media: number; externalURLs: string[] }> {
  const errors: string[] = [];
  const links: EntryLink[] = [];
  const byKey = new Map(records.map((record) => [`${record.collection}/${record.id}`, record]));
  const byFile = new Map(records.map((record) => [record.filePath, record]));
  const headings = new Map<string, Set<string>>();
  const externalURLs = new Set<string>();
  let media = 0;
  for (const record of records) {
    let tree: Node;
    try { tree = markdownTree(record); }
    catch (error) { errors.push(`${record.filePath}: invalid Markdown/MDX: ${String(error)}`); continue; }
    headings.set(record.filePath, headingIds(tree));
    const all = nodes(tree);
    const definitions = new Map(all.filter((node) => node.type === 'definition').map((node) => [node.identifier?.toLowerCase(), node.url]));
    for (const node of all) {
      if (node.type === 'text' && node.value && !checkLanguage(node.value, record.data.locale)) errors.push(`${record.filePath}: body contains text from another language.`);
      if (node.type === 'html') errors.push(`${record.filePath}: raw HTML is not supported in Markdown; use validated static MDX.`);
      if (['mdxjsEsm', 'mdxFlowExpression', 'mdxTextExpression'].includes(node.type)) errors.push(`${record.filePath}: executable expressions/imports are not allowed in editorial MDX.`);
      if (node.type === 'link' || node.type === 'image') links.push({ record, url: node.url ?? '', media: node.type === 'image' });
      if (node.type === 'linkReference' || node.type === 'imageReference') {
        const url = definitions.get(node.identifier?.toLowerCase());
        if (!url) errors.push(`${record.filePath}: undefined Markdown reference ${node.identifier}.`);
        else links.push({ record, url, media: node.type === 'imageReference' });
      }
      if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
        if (node.name && !['aside', 'span', 'em', 'strong', 'p', 'section', 'div', 'blockquote', 'br', 'a', 'img'].includes(node.name)) errors.push(`${record.filePath}: unsupported MDX element ${node.name}.`);
        for (const attribute of node.attributes ?? []) {
          if (attribute.type !== 'mdxJsxAttribute' || attribute.name?.startsWith('on') || (attribute.value !== null && typeof attribute.value !== 'string')) errors.push(`${record.filePath}: only static MDX attributes are allowed.`);
          if ((attribute.name === 'alt' || attribute.name === 'title') && typeof attribute.value === 'string' && !checkLanguage(attribute.value, record.data.locale)) errors.push(`${record.filePath}: MDX attribute contains text from another language.`);
          if ((attribute.name === 'href' || attribute.name === 'src') && typeof attribute.value === 'string') links.push({ record, url: attribute.value, media: attribute.name === 'src' });
        }
      }
    }
    const mediaPaths: string[] = [];
    visit(record.data, (value, field) => {
      if (field === 'src' && typeof value === 'string') {
        if (value.startsWith('https://')) externalURLs.add(value);
        else mediaPaths.push(value);
      }
      if (field === 'url' && typeof value === 'string' && value.startsWith('https://')) externalURLs.add(value);
    });
    for (const mediaPath of mediaPaths) {
      try { if (!(await stat(path.join(root, mediaPath))).isFile()) throw new Error('not a file'); media += 1; }
      catch { errors.push(`${record.filePath}: missing media ${mediaPath}.`); }
    }
  }
  for (const { record, url, media: isMedia } of links) {
    let target: ArchiveRecord | undefined;
    let fragment = '';
    if (/^https:\/\//.test(url)) { try { new URL(url); externalURLs.add(url); } catch { errors.push(`${record.filePath}: invalid HTTPS URL ${url}.`); } continue; }
    if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url)) continue;
    if (isMedia) {
      const file = url.startsWith('src/assets/images/') ? url : path.posix.normalize(path.posix.join(path.posix.dirname(record.filePath), url));
      if (!file.startsWith('src/assets/images/') || file.split('/').includes('..')) errors.push(`${record.filePath}: inline images must resolve to src/assets/images: ${url}.`);
      else {
        try { if (!(await stat(path.join(root, file))).isFile()) throw new Error('not a file'); media += 1; }
        catch { errors.push(`${record.filePath}: missing inline image ${url}.`); }
      }
      continue;
    }
    const contentMatch = url.match(/^content:(characters|lore|timeline|music|gallery|news|dossiers)\/((?:ru|en)\/[a-z0-9-]+)(?:#(.+))?$/);
    if (contentMatch) {
      target = byKey.get(`${contentMatch[1]}/${contentMatch[2]}`);
      fragment = contentMatch[3] ?? '';
    } else if (url.startsWith('#')) { target = record; fragment = url.slice(1); }
    else if (!/^(?:[a-z]+:|\/)/i.test(url)) {
      const [relative = '', hash = ''] = url.split('#');
      const file = path.posix.normalize(path.posix.join(path.posix.dirname(record.filePath), relative));
      target = byFile.get(file);
      fragment = hash;
    }
    if (!target) { errors.push(`${record.filePath}: unresolved or unsupported link ${url}.`); continue; }
    if (target.data.locale !== record.data.locale) errors.push(`${record.filePath}: cross-locale body link ${url}.`);
    if (!record.data.demo && target.data.demo) errors.push(`${record.filePath}: canonical body links to DEMO ${url}.`);
    if (isPublished(record.data) && !isPublished(target.data)) errors.push(`${record.filePath}: published body links to unpublished content ${url}.`);
    if (fragment) {
      try { if (!headings.get(target.filePath)?.has(decodeURIComponent(fragment))) errors.push(`${record.filePath}: missing heading in ${url}.`); }
      catch { errors.push(`${record.filePath}: invalid fragment encoding ${url}.`); }
    }
  }
  return { errors, links: links.length, media, externalURLs: [...externalURLs] };
}
