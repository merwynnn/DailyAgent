import { getCollection } from 'astro:content';
import { publishedReports, reportUrl, SITE_DESCRIPTION, SITE_TITLE, withBase } from '../lib/site';

/**
 * JSON Feed 1.1 twin of the RSS 2.0 feed — same scope (published reports,
 * summaries plus a plain-text body), same midnight-UTC date convention, so a
 * reader subscribed to either gets the same picture. Hand-rolled like its
 * sibling for the same reason: the shape is fixed and packages are off the
 * table for this project.
 */

const MAX_BODY_CHARS = 8_000;

/** Reduces markdown source to plain text, as the search index does. */
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
  const reports = publishedReports(await getCollection('reports'));

  const site = context.site ?? new URL('https://example.com');
  const absolute = (path) => new URL(path, site).href;

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: SITE_TITLE,
    home_page_url: absolute(withBase('')),
    feed_url: absolute(withBase('feed.json')),
    description: SITE_DESCRIPTION,
    language: 'en',
    items: reports.map((report) => {
      const url = absolute(reportUrl(report));
      return {
        id: url,
        url,
        title: report.data.title,
        content_text: stripMarkdown(report.body),
        summary: report.data.summary,
        date_published: `${report.data.date}T00:00:00Z`,
        tags: report.data.tags ?? [],
      };
    }),
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: { 'Content-Type': 'application/feed+json; charset=utf-8' },
  });
}
