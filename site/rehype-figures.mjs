// @ts-check

/**
 * Turns a markdown image that carries a title into a captioned figure:
 *
 *   ![Kodiak Island](~/img/2026-10-19/bear.jpg "Photo: Jane Doe / Unsplash")
 *
 * becomes
 *
 *   <figure class="figure">
 *     <img src="..." alt="Kodiak Island" />
 *     <figcaption>Photo: Jane Doe / Unsplash</figcaption>
 *   </figure>
 *
 * Images without a title are left exactly as they are, so the agent can choose
 * between a plain inline image and a captioned one.
 */
export default function rehypeFigures() {
  /**
   * @param {any} node
   * @returns {any}
   */
  function visit(node) {
    if (!node || typeof node !== 'object') return node;

    if (Array.isArray(node.children)) {
      /** @type {any[]} */
      const next = [];

      for (const child of node.children) {
        const isCaptionedImage =
          child &&
          child.type === 'element' &&
          child.tagName === 'img' &&
          child.properties &&
          typeof child.properties.title === 'string' &&
          child.properties.title.length > 0;

        if (isCaptionedImage) {
          const caption = child.properties.title;
          // The caption is rendered separately, so drop the redundant tooltip.
          delete child.properties.title;

          next.push({
            type: 'element',
            tagName: 'figure',
            properties: { className: ['figure'] },
            children: [
              child,
              {
                type: 'element',
                tagName: 'figcaption',
                properties: {},
                children: [{ type: 'text', value: String(caption) }],
              },
            ],
          });
        } else {
          next.push(visit(child));
        }
      }

      node.children = next;
    }

    return node;
  }

  /** @param {any} tree */
  return (tree) => visit(tree);
}
