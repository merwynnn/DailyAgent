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

---

## How long this should be

The whole report should be readable in about five minutes: **roughly 800 to
1,200 words of body text.** If you are at 2,000 words you have written too much
and should cut, not apologise. Length is not a measure of effort here — a tight
report that I actually read is worth more than a thorough one I skim.

## How to write it up

One report, four sections, in the order above. Use the section headings
`Events`, `Game jams`, `AI`, `Geopolitics`, and leave out a section entirely on
a day when it has nothing worth saying. A short honest section beats a padded
one.

**Do not repeat yourself day after day.** I read these in sequence. Anything you
already covered that is still open gets one line under a "Still open" note —
name, deadline, link — not a fresh description. Only describe something in full
the first time you find it, or when something about it changed. This is the main
way the report stays short.

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
