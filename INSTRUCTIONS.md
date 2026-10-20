# INSTRUCTIONS.md

This is the human's brief for the DailyAgent. Write what you want done, in
plain prose, below the line. Each daily run reads this whole file.

**How to use it**

- Write jobs as ordinary sentences or bullet points. There is no required
  syntax.
- Anything inside a fenced code block is an **example**, and the agent is told
  to ignore it. There are none in this file on purpose — every line below the
  heading is a real instruction.
- Prose that is not a job (explanations, notes to self) is harmless but costs
  attention — the shorter this file is, the better the run goes.
- Recurring jobs belong here. One-offs are fine too; the agent can tell from
  the reports what is already finished, but delete things you no longer want.
- Anything not written here does not happen. The agent will not invent work.

---

## Standing jobs

### Who I am, for the purpose of these jobs

I am an engineering student in France. My interests are programming, AI and
machine learning, and a bit of embedded systems, robotics, drones and other
autonomous things. I read French and English equally well. I care about things
I can actually enter or attend, not about lists of things that already happened.

### 1. Engineering events in France

Find upcoming events **in France** that I could take part in, in person, as a
student. They should be organised by a company, an engineering school, or a
research lab, and be about programming, AI, embedded systems, robotics or
autonomy.

An event qualifies when it is **in person in France** and either has a **cash
prize** or is a **real meeting worth travelling for** (hackathon, challenge,
workshop, summer school, conference with a student track, recruitment-style
technical competition).

Two conditions matter most:

- **It has not happened yet**, and I can still get in, or there is a known date
  for entries opening.
- **It is aimed at people like me**, not at startups, PhD-only audiences, or
  professionals with a company behind them. Student and mixed student/industry
  events are both fine.

Write **at most 8 events**, each in two lines at most: a bolded name, then what
it is, who runs it, where, when, the deadline, what you can win, one clause on
why it fits me, and a link. If an entry fee or a team requirement exists, say
so. If you found more than 8, list the extras as bare links on a single "Also
seen" line at the end of the section — do not describe them.

Skip: generic careers fairs, purely online webinars, consulting and finance
case competitions, and anything already past its deadline.

### 2. Game jams with cash prizes

Find game jams I could enter that have **cash prizes**. itch.io is the obvious
place to start, but do not stop there. Programming-heavy jams, AI or
generative-gameplay jams, and jams run by studios or tool makers all count.

**At most 6 jams, one line each**, carrying: name, dates, solo or team, online
or venue, the actual prize, and a link. Flag it clearly when a "prize" is only
software licences or store credit rather than money — that distinction is the
whole point of this job. Also flag any jam where AI-assisted work is banned
from the prize pool, since that cuts against my interests.

If a jam has a strong reputation and no cash prize, mention it once in passing
at most. It is not what I asked for.

### 3. AI roundup

A short, current summary of what actually changed in AI. **3 to 5 bullets, and
under about 200 words for the whole section.** Use bullets, not paragraphs.

New models, notable capability jumps, and genuinely new use cases. For LLMs,
give benchmarks when they exist: what was measured, on which benchmark, and the
number. Mark vendor-reported figures as vendor-reported rather than presenting
them as fact. Note when a release is open weights versus API-only, and when a
claim is unverified or contested.

Weight this towards things from roughly the last week. If an older release is
still the reference point everything is compared to, say so in half a line
instead of re-explaining it.

Prefer concrete over hype: "released X, scores Y on Z" beats "continues to push
boundaries". One benchmark number per bullet is plenty — do not dump a model
card.

If you have real benchmark numbers for several models, a chart is welcome.

### 4. Geopolitics

**Keep this short: 3 to 5 bullets, under about 150 words for the whole
section.** For each, one sentence on what happened and one clause on why it
matters. Use bullets, not paragraphs.

Skip horse-race political coverage and personality drama. I want structural
developments — energy, trade, chips, defence, alliances, elections with real
consequences — with a line of analysis rather than a headline.

### 5. Everything else

Anything else I ask for on a given day goes here as a one-off, and you can
delete it from this file afterwards.

### 6. The Still open tracker

Everything I can still enter lives on a dashboard list backed by
`site/src/data/still-open.json`. GitHub Pages can't write or save server-side
data, so the list is simply a file in this repo: refresh it every run, carry
items forward, and drop them the day their deadline passes — no zombies. To
remove something yourself, write it here, e.g. "tracker: remove Micro Jam
068": that counts as done or declined, and the item must not come back.

### 7. One small site improvement per run

Every run, try to add one small new feature to the website — a new
integration, a small widget, a new page or tab, some navigation or dashboard
polish. Conditions: it must stay small enough not to crowd the site, it must
not damage or change anything already published, all existing reports keep
working as before, and `npm --prefix site run build` must still pass. Name
the improvement explicitly in the report under a `## Site changes` heading.
Skipping a day is fine — say so honestly — but padding the section with a
fake or overreaching change is not.

### 8. The weekly Outlook (Outlooks tab)

Once per calendar week — the first run that finds no entry for the current
week yet — add a piece to the Outlooks space in `site/src/content/outlooks/`:
a reflection on where AI is taking the world in the short, mid and long term,
what it means for a software engineer, and the genuinely different futures
humanity could get. This is the one place where I want you to think on the
page, so make it your own thinking, not a news recap. Each entry opens by
revisiting the previous one: what stands, what you revise or drop, and why.
Speculation is welcome but must be labelled as scenario, not fact. The
detailed rules live in AGENTS.md section 6; mention the new entry in that
day's report under `## Site changes`.

### 9. A project idea in the daily brief

Each day, close the brief with a short `## Project ideas` section: one to
three original project ideas — technical, games, tools, anything one student
can actually build — each in two or three lines: what it is, why now (tied to
something that surfaced in the log or the news), and the smallest first
step. Only include ideas that would genuinely be worth starting; an idea
from a previous day returns only if something new sharpened it. Skip the
section outright when nothing good surfaced — filler ideas are worse than
none.

---

## How long this should be

The whole report should be readable in about five minutes: **roughly 800 to
1,200 words of body text.** If you are at 2,000 words you have written too much
and should cut, not apologise. Length is not a measure of effort here — a tight
report that I actually read is worth more than a thorough one I skim.

## How to write it up

One report, four sections, in the order above. Use the section headings
`Events`, `Game jams`, `AI`, `Geopolitics`, then `## Project ideas` (job 9),
then `## Site changes` (job 7), and leave out a section entirely on a day
when it has nothing worth saying. A short honest section beats a padded one.
When the day built a site feature or wrote the weekly Outlook (job 8), name
it under `## Site changes`, placed before `## Open threads`.

**Do not repeat yourself day after day.** I read these in sequence. Anything I
can still enter goes into the Still open tracker (job 6), not into the report —
the report only needs a short line when something on the list is new, changed
or has just expired. Only describe something in full the first time you find
it, or when something about it changed. This is the main way the report stays
short, and the tracker is now where the carried-forward list lives.

**If a deadline is close** — within about two weeks — say so at the top of the
report, in one line, before anything else.

**Use the tags** `events`, `jams`, `ai` and `geopolitics`, and only include the
ones that have content. Keep the vocabulary stable; do not invent new tags for
these four jobs.

**Sources**: put every link you relied on in the report's `sources` list, and
link inline where it helps. If a claim came from a vendor's own blog, say so.

**Be honest about coverage.** French student events are often announced on
school intranets, Instagram and Discord, which you cannot read. If a week turns
up little, say that the sweep was thin rather than padding the list. Never
invent an event, a date, a prize, or a benchmark number.
