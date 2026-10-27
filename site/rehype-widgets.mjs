// @ts-check

import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Turns a markdown link with a `widget:` scheme into a live, sandboxed panel:
 *
 *   [Drag the range](widget:widgets/2026-10-27/compute.html?h=520 "Committed compute")
 *
 * becomes
 *
 *   <figure class="widget">
 *     <div class="widget__frame"><iframe src="…/widgets/2026-10-27/compute.html" …></iframe></div>
 *     <figcaption>Committed compute <span class="widget__tag">interactive</span></figcaption>
 *   </figure>
 *
 * The link text is the accessible name, the quoted title is the caption, and
 * the link must sit alone on its line. Query flags:
 *
 *   ?h=520      starting frame height in px (widgets may grow with DAKit.fit())
 *   ?w=wide     let the frame break out of the prose column
 *
 * Widgets are plain files under `site/public/widgets/`, so they are served as
 * static assets and can be written without touching the Astro build. They run
 * in an iframe: their CSS and JavaScript cannot reach the page around them, so
 * a broken widget can never break a report, an old entry or the site chrome.
 *
 * A missing file is a build error rather than a dead iframe, because a report
 * that links a widget which does not exist is a mistake worth catching before
 * publishing.
 */

/** `site/public/`, the root the widget paths are resolved against. */
const PUBLIC_DIR = fileURLToPath(new URL('./public/', import.meta.url));

/**
 * Scripts and popups only, plus same-origin so a widget can read the shared
 * `dailyagent-theme` key and size its own iframe. It still gets its own
 * document, so no widget style can leak into the site.
 */
const SANDBOX = [
  'allow-scripts',
  'allow-same-origin',
  'allow-popups',
  'allow-popups-to-escape-sandbox',
  'allow-downloads',
  'allow-forms',
].join(' ');

/**
 * @typedef {{ path: string, height: number, wide: boolean }} WidgetRef
 */

/**
 * @param {string} href
 * @returns {WidgetRef}
 */
function parseRef(href) {
  const [rawPath, query = ''] = href.slice('widget:'.length).split('?');
  const clean = rawPath.replace(/^~\//, '').replace(/^\/+/, '');
  const params = new URLSearchParams(query);
  const height = Number.parseInt(params.get('h') ?? '', 10);
  return {
    path: clean,
    height: Number.isFinite(height) ? Math.min(Math.max(height, 160), 1400) : 460,
    wide: params.get('w') === 'wide',
  };
}

/**
 * @param {any} node
 * @returns {node is any}
 */
function isWidgetAnchor(node) {
  return (
    node &&
    node.type === 'element' &&
    node.tagName === 'a' &&
    node.properties &&
    typeof node.properties.href === 'string' &&
    node.properties.href.startsWith('widget:')
  );
}

/** Flattens an mdast/hast child list into its text content. */
function textOf(node) {
  if (!node) return '';
  if (node.type === 'text') return String(node.value ?? '');
  return (node.children ?? []).map(textOf).join('');
}

export default function rehypeWidgets({ base = '/' } = {}) {
  const prefix = base.endsWith('/') ? base : `${base}/`;

  /**
   * @param {string} href
   * @param {string} label
   * @param {string} caption
   */
  function makeFigure(href, label, caption) {
    const ref = parseRef(href);
    const onDisk = path.join(PUBLIC_DIR, ref.path);

    if (!existsSync(onDisk)) {
      throw new Error(
        [
          '',
          `[rehype-widgets] No widget file at src/public/${ref.path}`,
          '',
          `  Linked as: widget:${href.slice('widget:'.length)}`,
          '',
          '  Widgets live in site/public/widgets/<date>/<name>.html and are linked',
          '  on a line of their own, like:',
          '',
          `    [${label || 'Drag to explore'}](widget:widgets/2026-10-27/example.html "What it shows")`,
          '',
        ].join('\n'),
      );
    }

    return {
      type: 'element',
      tagName: 'figure',
      properties: {
        className: ref.wide ? ['widget', 'widget--wide'] : ['widget'],
      },
      children: [
        {
          type: 'element',
          tagName: 'div',
          properties: {
            className: ['widget__frame'],
            style: `--widget-h:${ref.height}px`,
          },
          children: [
            {
              type: 'element',
              tagName: 'iframe',
              properties: {
                src: `${prefix}${ref.path}`,
                title: label || caption || 'Interactive panel',
                loading: 'lazy',
                sandbox: SANDBOX,
                'data-widget-frame': '1',
              },
              children: [],
            },
          ],
        },
        caption && {
          type: 'element',
          tagName: 'figcaption',
          properties: {},
          children: [
            { type: 'text', value: caption },
            {
              type: 'element',
              tagName: 'span',
              properties: { className: ['widget__tag'] },
              children: [{ type: 'text', value: 'interactive' }],
            },
          ],
        },
      ].filter(Boolean),
    };
  }

  /** @param {any} node */
  function liftFigures(node) {
    if (!node || typeof node !== 'object') return node;
    if (!Array.isArray(node.children)) return node;

    /** @type {any[]} */
    const next = [];

    for (const child of node.children) {
      if (child && child.type === 'element' && child.tagName === 'p') {
        const meaningful = (child.children ?? []).filter(
          (kid) => !(kid.type === 'text' && String(kid.value ?? '').trim() === ''),
        );

        if (meaningful.length === 1 && isWidgetAnchor(meaningful[0])) {
          const anchor = meaningful[0];
          next.push(makeFigure(anchor.properties.href, textOf(anchor).trim(), anchor.properties.title ?? ''));
          continue;
        }
      }

      next.push(liftFigures(child));
    }

    node.children = next;
    return node;
  }

  /**
   * A `widget:` link that ended up inline (mid-sentence, or in a list) is not
   * dropped and not turned into an invalid nested figure: it becomes a normal
   * link to the widget file, so it still opens. The caption convention is what
   * makes the panel.
   *
   * @param {any} node
   */
  function rewriteStrayLinks(node) {
    if (!node || typeof node !== 'object') return node;

    if (isWidgetAnchor(node)) {
      const ref = parseRef(node.properties.href);
      node.properties.href = `${prefix}${ref.path}`;
      node.properties.className = ['widget-link'];
      node.properties.target = '_blank';
      node.properties.rel = ['noopener', 'noreferrer'];
      return node;
    }

    for (const child of node.children ?? []) rewriteStrayLinks(child);
    return node;
  }

  /** @param {any} tree */
  return (tree) => rewriteStrayLinks(liftFigures(tree));
}
