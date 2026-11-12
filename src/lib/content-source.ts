import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseDocument } from 'yaml';
import { archiveSchemas, type ArchiveRecord } from '../schemas/index.ts';
import { collectionNames } from '../schemas/common.ts';

export function parseSource(source: string, extension: string): { data: unknown; body: string } {
  const input = source.replace(/^\uFEFF/, '');
  let header = input;
  let body = '';
  if (extension === '.md' || extension === '.mdx') {
    const match = input.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!match) throw new Error('Markdown and MDX require YAML frontmatter.');
    header = match[1]!;
    body = input.slice(match[0].length);
    if (!body.trim()) throw new Error('Markdown and MDX require nonempty text.');
  }
  if (extension === '.json') JSON.parse(header);
  const document = parseDocument(header, { uniqueKeys: true });
  if (document.errors.length) throw new Error(document.errors.map((error) => error.message).join('\n'));
  return { data: document.toJS(), body };
}

async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await sourceFiles(file));
    else if (/\.(md|mdx|json|ya?ml)$/.test(entry.name)) files.push(file);
  }
  return files.sort();
}

export async function readArchive(root: string): Promise<ArchiveRecord[]> {
  const records: ArchiveRecord[] = [];
  // Earlier scaffold directories are retained, but never silently accept content there.
  for (const legacy of ['events', 'releases', 'tracks', 'artworks']) {
    const directory = path.join(root, 'src/content', legacy);
    const files = await sourceFiles(directory).catch((error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return [];
      throw error;
    });
    if (files.length) throw new Error(`Use timeline/music/gallery instead of the legacy directory: ${legacy}`);
  }
  for (const collection of collectionNames) {
    const base = path.join(root, 'src/content', collection);
    for (const file of await sourceFiles(base)) {
      const filePath = path.relative(root, file).split(path.sep).join('/');
      try {
        const { data: raw, body } = parseSource(await readFile(file, 'utf8'), path.extname(file));
        const data = archiveSchemas[collection].parse(raw);
        const id = path.relative(base, file).split(path.sep).join('/').replace(/\.(md|mdx|json|ya?ml)$/, '');
        if (id !== `${data.locale}/${data.entryKey}`) throw new Error('Expected path <locale>/<entryKey>.<extension>.');
        records.push({ collection, id, data, filePath, body } as ArchiveRecord);
      } catch (error) {
        throw new Error(`${filePath}: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
      }
    }
  }
  return records;
}
