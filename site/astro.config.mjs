// @ts-check
import { unified } from '@astrojs/markdown-remark';
import { defineConfig } from 'astro/config';

import rehypeFigures from './rehype-figures.mjs';
import remarkBaseImages from './remark-base-images.mjs';

/**
 * Where the site is published.
 *
 * GitHub Pages serves this project from a sub-path, so the default base is
 * `/DailyAgent`. When self-hosting at the root of a domain, build with:
 *
 *   BASE_PATH=/ SITE_URL=https://example.com npm --prefix site run build
 *
 * Everything in the site links through `import.meta.env.BASE_URL`, so that one
 * variable moves the whole thing.
 */
const base = process.env.BASE_PATH || '/DailyAgent';
const site = process.env.SITE_URL || 'https://merwynnn.github.io';

export default defineConfig({
  site,
  base,
  // The built site is committed and served straight from docs/ by GitHub Pages.
  // It is a plain folder of static files, so it can be dropped behind any
  // static host later without changes.
  outDir: '../docs',
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },
  markdown: {
    processor: unified({
      remarkPlugins: [[remarkBaseImages, { base }]],
      rehypePlugins: [rehypeFigures],
    }),
    shikiConfig: {
      theme: 'vitesse-light',
      wrap: true,
    },
  },
});
