// @ts-check

/**
 * Rewrites image and link URLs that start with `~/` so they resolve against the
 * site's base path.
 *
 * Reports are told to write `![alt](~/img/2026-10-19/photo.jpg "Caption")`.
 * A bare relative path would resolve against the *page* URL, and a bare
 * absolute path would break whenever the site is hosted under a sub-path
 * (GitHub Pages serves this project from `/DailyAgent/`). Prefixing with `~/`
 * gives one form that works in both cases, and keeps the whole site portable:
 * change BASE_PATH and every image follows.
 *
 * @param {{ base?: string }} [options]
 */
export default function remarkBaseImages(options = {}) {
  const base = options.base ?? '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;

  /** @param {any} node */
  function walk(node) {
    if (!node || typeof node !== 'object') return;

    if (
      (node.type === 'image' || node.type === 'link' || node.type === 'definition') &&
      typeof node.url === 'string' &&
      node.url.startsWith('~/')
    ) {
      node.url = `${prefix}${node.url.slice(2)}`;
    }

    if (Array.isArray(node.children)) {
      for (const child of node.children) walk(child);
    }
  }

  /** @param {any} tree */
  return (tree) => {
    walk(tree);
  };
}
