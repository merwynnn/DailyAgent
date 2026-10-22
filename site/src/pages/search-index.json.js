import { getCollection } from 'astro:content';
import { outlookUrl, publishedReports, reportUrl, sortOutlooks } from '../lib/site';

/**
 * Full-text search index for `/search`, fetched once by the browser and scored
 * client-side. Generated at build time so GitHub Pages only ever serves static
 * JSON.
 *
 * Each entry carries the report's body with markdown stripped to plain text —
 * headings markers, links, images, code fences and emphasis are removed, so
 * what is indexed is what a reader would see. Bodies are capped to keep the
 * whole index a sensible download.
 */

const MAX_BODY_CHARS = 8_000;

/** Reduces markdown source to plain, indexable text. */
function stripMarkdown(markdown) {
  return (markdown ?? '')
    .replace(/```[\s\S]*?```/g, ' ') // fenced code blocks
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // images and links -> their text
    .replace(/^#{1,6}\s+/gm, ' ') // heading markers
    .replace(/<[^>]+>/g, ' ') // inline HTML
    .replace(/[*_`~]/g, '') // emphasis, code and strike markers
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_BODY_CHARS);
}

export async function GET(context) {
  const reports = publishedReports(await getCollection('reports')).map((report) => ({
    kind: 'report',
    id: report.id,
    url: reportUrl(report),
    title: report.data.title,
    date: report.data.date,
    tags: report.data.tags,
    summary: report.data.summary,
    text: stripMarkdown(report.body),
  }));

  const outlooks = sortOutlooks(await getCollection('outlooks'))
    .filter((entry) => !entry.data.draft)
    .map((entry) => ({
      kind: 'outlook',
      id: entry.id,
      url: outlookUrl(entry),
      title: entry.data.title,
      date: entry.data.date,
      tags: ['outlook'],
      summary: entry.data.summary,
      text: stripMarkdown(entry.body),
    }));

  const index = { entries: [...reports, ...outlooks] };

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
