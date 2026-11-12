import { fileURLToPath } from 'node:url';
import { readArchive } from '../src/lib/content-source.ts';
import { validateGraph, validateLinks } from '../src/lib/content-validation.ts';
import { collectionNames } from '../src/schemas/common.ts';
import { isPublished } from '../src/lib/content-policy.ts';

try {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const records = await readArchive(root);
  const graphErrors = validateGraph(records);
  const links = await validateLinks(records, root);
  const errors = [...graphErrors, ...links.errors];
  if (errors.length) throw new Error(errors.join('\n'));
  for (const collection of collectionNames) console.log(`${collection}: ${records.filter((record) => record.collection === collection).length} entries`);
  console.log(`Content OK: ${records.length} entries; ${links.links} body links; ${links.media} local media files.`);
  console.log(`Production-eligible entries: ${records.filter((record) => isPublished(record.data)).length}; DEMO: ${records.filter((record) => record.data.demo).length}.`);
  console.log(`External URLs: ${links.externalURLs.length} (syntax only; no network requests).`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
