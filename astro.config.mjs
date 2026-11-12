import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { defaultLocale, locales } from './src/i18n/config.ts';

export default defineConfig({
  integrations: [mdx()],
  i18n: {
    defaultLocale,
    locales: [...locales],
    routing: { prefixDefaultLocale: false },
  },
  site: 'https://naitmorr.github.io',
  base: '/NAITMOR-ARCHIVE-2.0',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'never',
  },
});
