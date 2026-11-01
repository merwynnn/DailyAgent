import { getCollection } from 'astro:content';
import { publishedReports, sortOutlooks, tagCounts, withBase } from '../lib/site';

/**
 * The site's sitemap, generated from the same collections the pages render,
 * so a new report or outlook is listed the moment it is published. Excludes
 * feeds and JSON: sitemaps list pages, not files.
 */
export async function GET() {
  const reports = publishedReports(await getCollection('reports'));
  const outlooks = sortOutlooks(await getCollection('outlooks'));
  const tags = tagCounts(reports);

  const today = new Date().toISOString().slice(0, 10);
  const entries: { path: string; lastmod?: string }[] = [
    { path: '' },
    { path: 'archive/' },
    { path: 'outlooks/' },
    { path: 'numbers/' },
    { path: 'deadlines/' },
    { path: 'ideas/' },
    { path: 'search/' },
    { path: 'about/' },
    ...reports.map((report) => ({ path: `reports/${report.id}/`, lastmod: report.data.date })),
    ...outlooks.map((outlook) => ({ path: `outlooks/${outlook.id}/`, lastmod: outlook.data.date })),
    ...tags.map((tag) => ({ path: `tags/${tag.slug}/` })),
  ];

  const site = import.meta.env.SITE;
  const urlFor = (path: string) =>
    new URL(withBase(path).replace(/^\/+/, ''), `${site}/`).href.replace(/\/$/, '/');
  const escape = (text: string) =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(({ path, lastmod = today }) =>
      [
        '  <url>',
        `    <loc>${escape(urlFor(path))}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        '  </url>',
      ].join('\n'),
    ),
    '</urlset>',
  ].join('\n');

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
