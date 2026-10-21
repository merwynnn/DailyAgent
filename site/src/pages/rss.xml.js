import { getCollection } from 'astro:content';
import { publishedReports, reportUrl, SITE_DESCRIPTION, SITE_TITLE, withBase } from '../lib/site';

/**
 * RSS 2.0 feed for the daily log. Hand-rolled rather than pulled from a
 * package: the feed is a fixed shape, and `npm install` is off the table for
 * this project (see AGENTS.md).
 *
 * Dates are calendar labels, so each item's `pubDate` is midnight UTC of its
 * day — the same convention the rest of the site parses with.
 */

/** Escapes text for element content and attribute values. */
const escapeXml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

export async function GET(context) {
  const reports = publishedReports(await getCollection('reports'));

  // `context.site` is the configured origin (`https://merwynnn.github.io`);
  // links are root-absolute already (base included), so joining is enough.
  const site = context.site ?? new URL('https://example.com');
  const absolute = (path) => new URL(path, site).href;

  const home = absolute(withBase(''));
  const self = absolute(withBase('rss.xml'));

  const items = reports
    .map((report) => {
      const url = absolute(reportUrl(report));
      const pubDate = new Date(`${report.data.date}T00:00:00Z`).toUTCString();
      return `    <item>
      <title>${escapeXml(report.data.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(report.data.summary)}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${escapeXml(home)}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
