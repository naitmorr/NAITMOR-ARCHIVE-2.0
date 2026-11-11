import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from '../astro.config.mjs';

const expectedSite = 'https://naitmorr.github.io';
const expectedBase = '/NAITMOR-ARCHIVE-2.0';
const outputDirectory = path.resolve(fileURLToPath(new URL('../dist/', import.meta.url)));

assert.equal(config.site, expectedSite, 'Unexpected GitHub Pages site origin.');
assert.equal(config.base, expectedBase, 'Unexpected GitHub Pages base path.');
assert.equal(config.output, 'static', 'GitHub Pages requires static output.');
assert.equal(config.trailingSlash, 'always', 'Directory URLs must end in a slash.');

async function collectHTML(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectHTML(entryPath));
    else if (entry.name.endsWith('.html')) files.push(entryPath);
  }

  return files;
}

await stat(path.join(outputDirectory, 'index.html'));
await stat(path.join(outputDirectory, '404.html'));
const files = await collectHTML(outputDirectory);
let checkedReferences = 0;

for (const file of files) {
  const html = await readFile(file, 'utf8');

  for (const match of html.matchAll(/\b(?:href|src|poster)=["']([^"']+)["']/g)) {
    const url = match[1];
    if (!url.startsWith('/') || url.startsWith('//')) continue;

    assert.ok(
      url.startsWith(`${expectedBase}/`),
      `${path.relative(outputDirectory, file)} contains a URL without the base: ${url}`,
    );

    const resourcePath = decodeURIComponent(url.split(/[?#]/)[0].slice(expectedBase.length + 1));
    const targetPath = path.resolve(outputDirectory, resourcePath);
    assert.ok(
      targetPath.startsWith(`${outputDirectory}${path.sep}`) || targetPath === outputDirectory,
      `Resource escapes the output directory: ${url}`,
    );
    const target = await stat(targetPath);
    if (target.isDirectory()) await stat(path.join(targetPath, 'index.html'));
    checkedReferences += 1;
  }
}

const home = await readFile(path.join(outputDirectory, 'index.html'), 'utf8');
assert.ok(
  home.includes(`href="${expectedSite}${expectedBase}/"`),
  'The home page must contain the canonical GitHub Pages URL.',
);
assert.ok(checkedReferences > 0, 'No internal URLs were checked.');
console.log(`GitHub Pages URLs OK: ${expectedSite}${expectedBase}/`);
console.log(`Checked ${files.length} HTML files and ${checkedReferences} internal references.`);
