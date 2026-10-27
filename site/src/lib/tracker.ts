import { parseDate } from './site';

/**
 * The tracker's vocabulary.
 *
 * Every row in `src/data/still-open.json` carries exactly one `type`, so it can
 * be recognised at a glance before the name is read. Keep this list small and
 * stable — the daily agent has to choose between these values every run, and a
 * vocabulary that keeps growing stops being a glanceable cue.
 */
export const TYPE_META = {
  hackathon: { emoji: '🛠️', label: 'hackathon' },
  jam: { emoji: '🎮', label: 'game jam' },
  competition: { emoji: '🏆', label: 'competition' },
  workshop: { emoji: '🔧', label: 'workshop' },
  school: { emoji: '🎓', label: 'school' },
  conference: { emoji: '🎤', label: 'conference' },
  other: { emoji: '❓', label: 'other' },
} as const;

export type TrackerType = keyof typeof TYPE_META;

/**
 * One row of `src/data/still-open.json`.
 *
 * `deadline` is the last day an entry can be made — the registration close, not
 * the event. `start`/`end` are the event's own running dates and are what the
 * duration is computed from. Either may be missing when the organiser has not
 * published them; a row without both simply shows no duration.
 */
export interface TrackedItem {
  id: string;
  name: string;
  type: TrackerType;
  url: string;
  /** Last day to enter, `YYYY-MM-DD`. */
  deadline: string;
  /**
   * True when no registration date is published and the event start has been
   * used as a conservative cutoff. Rendered as `closes ~31 Oct (est.)` so an
   * inferred date is never mistaken for a published one.
   */
  deadlineEstimated?: boolean;
  /** First day of the event, `YYYY-MM-DD`, when published. */
  start?: string;
  /** Last day of the event, `YYYY-MM-DD`, inclusive. */
  end?: string;
  note?: string;
  added?: string;
}

/** Falls back to the `other` row so an unknown type can never break a build. */
export function typeMeta(type: string) {
  return TYPE_META[type as TrackerType] ?? TYPE_META.other;
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const isIsoDay = (iso?: string): iso is string => !!iso && /^\d{4}-\d{2}-\d{2}$/.test(iso);

/** `2026-12-02` -> `2 Dec`, with the year appended when it is not the current one. */
export function dayMonth(iso: string, currentYear?: number): string {
  const date = parseDate(iso);
  const label = `${date.getUTCDate()} ${MONTHS_SHORT[date.getUTCMonth()]}`;
  return currentYear !== undefined && date.getUTCFullYear() !== currentYear
    ? `${label} ${date.getUTCFullYear()}`
    : label;
}

/**
 * The event's own run, as a short human label:
 * `2–4 Dec`, `28 Nov – 8 Dec`, `from 15 Oct`, `ends 3 Jun 2027`.
 * Returns null when neither date is known, so callers can skip the whole slot.
 */
export function spanLabel(start?: string, end?: string, currentYear?: number): string | null {
  if (isIsoDay(start) && isIsoDay(end)) {
    const a = parseDate(start);
    const b = parseDate(end);
    if (a.getTime() === b.getTime()) return dayMonth(start, currentYear);
    const sameMonth = a.getUTCMonth() === b.getUTCMonth() && a.getUTCFullYear() === b.getUTCFullYear();
    return sameMonth
      ? `${a.getUTCDate()}–${dayMonth(end, currentYear)}`
      : `${dayMonth(start, currentYear)} – ${dayMonth(end, currentYear)}`;
  }
  if (isIsoDay(start)) return `from ${dayMonth(start, currentYear)}`;
  if (isIsoDay(end)) return `ends ${dayMonth(end, currentYear)}`;
  return null;
}

/** Inclusive number of days the event runs, or null when either end is unknown. */
export function spanDays(start?: string, end?: string): number | null {
  if (!isIsoDay(start) || !isIsoDay(end)) return null;
  const days = Math.round((parseDate(end).getTime() - parseDate(start).getTime()) / 86_400_000) + 1;
  return days >= 1 ? days : null;
}

/** `1 day`, `3 days`, `4 weeks`, `3 months` — coarse on purpose, never precise-looking. */
export function durationLabel(days: number): string {
  if (days <= 1) return '1 day';
  if (days < 14) return `${days} days`;
  if (days < 60) return `${Math.round(days / 7)} weeks`;
  return `${Math.round(days / 30)} months`;
}
