import type { Report } from './site';

/**
 * Project ideas are written inside the daily reports, under the stable
 * heading `## Project ideas`. This extracts them for the /ideas/ index so
 * the ideas live as a browsable list instead of staying buried in old
 * reports. The section heading is a convention the reports have held to
 * since the first entry; a day without it contributes nothing.
 */

export type Idea = {
  /** Day the idea was written, `YYYY-MM-DD`. */
  date: string;
  /** Link to the entry that carried it (already base-prefixed). */
  href: string;
  /** Short display name, taken from the bullet's bold lead. */
  name: string;
  /** The rest of the bullet: what it is, why now, smallest step. */
  detail: string;
};

const HEADING = /^## Project ideas\s*$/m;
const NEXT_HEADING = /^## /m;

/** Splits the section into top-level bullets, folding continuation lines. */
function bulletsOf(section: string): string[] {
  const out: string[] = [];
  for (const rawLine of section.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith('### ')) break; // safety: an h3 ends the idea list
    if (line.startsWith('- ')) {
      out.push(line.slice(2));
    } else if (out.length > 0) {
      out[out.length - 1] += ` ${line}`; // markdown lazy continuation
    }
  }
  return out;
}

/** The bold lead is the name; whatever follows is the detail. */
function nameOf(text: string): { name: string; detail: string } {
  const match = text.match(/^\*\*([^*]+)\*\*:?\.?\s*/);
  if (!match) {
    const name = text.length > 80 ? `${text.slice(0, 80).trim()}…` : text;
    return { name: name.trim(), detail: '' };
  }
  let name = match[1].replace(/[.:—–-]+$/, '').trim();
  if (name.length > 100) {
    name = `${name.slice(0, 100).replace(/\s+\S*$/, '')}…`;
  }
  return { name, detail: text.slice(match[0].length).trim() };
}

export function ideasOf(reports: Report[]): Idea[] {
  const ideas: Idea[] = [];

  for (const report of reports) {
    const body = report.body ?? '';
    const sectionMatch = body.match(HEADING);
    if (!sectionMatch || sectionMatch.index === undefined) continue;

    const rest = body.slice(sectionMatch.index + sectionMatch[0].length);
    const endMatch = rest.match(NEXT_HEADING);
    const section = endMatch && endMatch.index !== undefined ? rest.slice(0, endMatch.index) : rest;

    for (const bullet of bulletsOf(section)) {
      if (!bullet.trim()) continue;
      const { name, detail } = nameOf(bullet);
      if (!name) continue;
      ideas.push({ date: report.data.date, href: `reports/${report.id}/`, name, detail });
    }
  }

  return ideas;
}
