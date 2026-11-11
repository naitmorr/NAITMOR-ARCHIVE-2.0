import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://naitmorr.github.io',
  base: '/NAITMOR-ARCHIVE-2.0',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'never',
  },
});
