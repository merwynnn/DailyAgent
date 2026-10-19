import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * A day's report is one markdown file. The schema is the contract between the
 * agent that writes reports (see AGENTS.md) and this site: anything that does
 * not validate fails the build, which stops a malformed report from being
 * published.
 */

/**
 * Accepts `date: 2026-10-19` (YAML turns that into a Date), `date: "2026-10-19"`
 * and anything else date-like, and normalises it to a plain `YYYY-MM-DD`
 * string. Storing the date as a string sidesteps every timezone question:
 * the day of a report is a label, not an instant.
 */
const isoDate = z.preprocess((value) => {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'string') {
    const match = value.trim().match(/^\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
  }
  return value;
}, z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must look like 2026-10-19'));

const chart = z.object({
  title: z.string(),
  type: z.enum(['bar', 'line']).default('bar'),
  unit: z.string().default(''),
  data: z
    .array(
      z.object({
        label: z.string(),
        value: z.number(),
      }),
    )
    .min(1)
    .max(24),
});

const source = z.object({
  label: z.string(),
  url: z.string().url(),
});

const reports = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/reports' }),
  schema: z.object({
    title: z.string().min(1),
    date: isoDate,
    summary: z.string().min(1).max(400),
    tags: z.array(z.string().min(1)).default([]),
    hero: z.string().optional(),
    heroAlt: z.string().optional(),
    pinned: z.boolean().default(false),
    draft: z.boolean().default(false),
    charts: z.array(chart).default([]),
    sources: z.array(source).default([]),
  }),
});

export const collections = { reports };
