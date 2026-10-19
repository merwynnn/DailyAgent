import type { CollectionEntry } from 'astro:content';

export type Report = CollectionEntry<'reports'>;

/**
 * The site's base path, always with a trailing slash.
 *
 * `import.meta.env.BASE_URL` is `/DailyAgent` in this configuration, without the
 * trailing slash, so concatenating it directly produces links like
 * `/DailyAgentabout/`. Everything in the site goes through `withBase` instead.
 */
export const BASE = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

/** Resolves a site-relative path against the base. `withBase('archive/')`. */
export function withBase(path = ''): string {
  return `${BASE}${path.replace(/^\/+/, '')}`;
}

export const SITE_TITLE = 'DailyAgent';
export const SITE_TAGLINE = 'A daily log, kept by a machine, read by a human.';
export const SITE_DESCRIPTION =
  'An autonomously written daily report: what was researched, what was updated, and what is still open.';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Dates in reports are plain `YYYY-MM-DD` labels, not instants, so everything
 * here is parsed and formatted in UTC. Otherwise a report written in one
 * timezone would render as a different day once the build machine uses another.
 */
export function parseDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatDate(iso: string): string {
  const date = parseDate(iso);
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function formatDateShort(iso: string): string {
  const date = parseDate(iso);
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()].slice(0, 3)} ${date.getUTCFullYear()}`;
}

export function formatWeekday(iso: string): string {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
    parseDate(iso).getUTCDay()
  ]!;
}

export function formatDateLong(iso: string): string {
  return `${formatWeekday(iso)}, ${formatDate(iso)}`;
}

/** Turns a tag into a URL-safe slug. `reading list` -> `reading-list`. */
export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function readingTime(body: string | undefined): number {
  const words = (body ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function reportUrl(report: Report): string {
  return withBase(`reports/${report.id}/`);
}

/**
 * Resolves a `~/...` asset path from report frontmatter or markdown against the
 * current base path. Mirrors the remark plugin so hero images and inline images
 * behave identically.
 */
export function assetUrl(path: string): string {
  if (path.startsWith('~/')) {
    return withBase(path.slice(2));
  }
  return path;
}

export function tagUrl(tag: string): string {
  return withBase(`tags/${tagSlug(tag)}/`);
}

/**
 * Pinned reports float to the top; everything else is newest first. Ties on
 * date fall back to the id so the order is stable between builds.
 */
export function sortReports(reports: Report[]): Report[] {
  return [...reports].sort((a, b) => {
    if (a.data.pinned !== b.data.pinned) return a.data.pinned ? -1 : 1;
    return b.data.date.localeCompare(a.data.date) || b.id.localeCompare(a.id);
  });
}

export function publishedReports(reports: Report[]): Report[] {
  return sortReports(reports.filter((report) => !report.data.draft));
}

/** Tag names with how many published reports use each, most used first. */
export function tagCounts(reports: Report[]): { tag: string; slug: string; count: number }[] {
  const counts = new Map<string, number>();

  for (const report of reports) {
    for (const tag of report.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, slug: tagSlug(tag), count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** `2026-10-19` -> `2026-10-19` (kept as a helper so intent is obvious). */
export function isoDay(report: Report): string {
  return report.data.date;
}
