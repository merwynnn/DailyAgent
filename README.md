# DailyAgent

An agent that wakes up once a day, works through a short brief, and publishes a
report about it. The site you get is a quiet, self-contained daily log.

- **What to work on** — edit [`INSTRUCTIONS.md`](INSTRUCTIONS.md).
- **How the agent behaves** — [`AGENTS.md`](AGENTS.md).
- **The reports** — `site/src/content/reports/YYYY-MM-DD.md`.
- **The published site** — `docs/` (committed, served by GitHub Pages).

---

## How a day works

```
Windows logon
   └─ Startup shortcut          (scripts/install-autostart.ps1 adds this)
        └─ run-daily.vbs        (hidden launcher)
             └─ run-daily.cmd   (hands over to WSL)
                  └─ run-daily.sh
                       ├─ waits for 06:00 if it is earlier
                       ├─ skips if it already ran today
                       ├─ opencode run --agent daily --session <same session>
                       ├─ npm --prefix site run build      (a broken report fails here)
                       └─ publish.sh  →  commit + push  →  GitHub Pages
```

The site is built **on this machine** and the output is committed to `docs/`.
Nothing is built in the cloud, so the same folder can be dropped behind any
static host later without changing anything.

## Running it by hand

From Windows, in this folder:

```bat
scripts\run-daily.cmd                 :: run now, if it has not run today
scripts\run-daily.cmd --force         :: run right now regardless
scripts\run-daily.cmd --dry-run       :: say what would happen, change nothing
scripts\run-daily.cmd --no-publish    :: do the work and build, but do not commit
```

From WSL, the same thing without the `.cmd`:

```bash
./scripts/run-daily.sh --force
```

Both write to `logs/YYYY-MM-DD.log`.

## Editing what the agent does

Open `INSTRUCTIONS.md` and write, in plain prose, what you want done. Recurring
jobs live there permanently; the agent deletes nothing and can tell from the
reports what is already finished.

Fenced code blocks in that file are treated as examples and ignored, which is
what makes the commented template safe to leave in place.

## Working on the site

```bash
cd site
npm install          # first time only
npm run dev          # http://localhost:4321/DailyAgent/
npm run build        # writes ../docs
```

A report is markdown with frontmatter:

```yaml
---
title: "Short human title"
date: 2026-10-19
summary: "One or two sentences that stand alone."
tags: [research]
hero: ~/img/2026-10-19/hero.jpg     # optional
heroAlt: "What the image shows"
charts:                             # optional
  - title: "Where the time went"
    type: bar                       # bar | line
    unit: "h"
    data:
      - { label: "DailyAgent", value: 3.5 }
sources:                            # optional
  - label: "Article title"
    url: "https://example.com/article"
---
```

Images go in `site/public/img/<date>/` and are referenced with a leading `~/`,
so they keep working under any base path. A markdown image with a title becomes
a captioned figure:

```markdown
![Alt text](~/img/2026-10-19/bear.jpg "Photo: Jane Doe / Unsplash")
```

## Autostart

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-autostart.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\uninstall-autostart.ps1
```

The shortcut lives in your per-user Startup folder; no administrator rights are
required. Because Windows only fires it at logon, the runner waits until 06:00
rather than skipping the day if you log in early.

## Hosting elsewhere

`site/astro.config.mjs` reads two environment variables:

```bash
BASE_PATH=/ SITE_URL=https://example.com npm --prefix site run build
```

Everything in the site links through `import.meta.env.BASE_URL`, so that single
variable moves the whole thing from `https://user.github.io/DailyAgent/` to the
root of your own domain. The output in `docs/` is plain static files.
