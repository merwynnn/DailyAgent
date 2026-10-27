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

### 1. Improve the website — this is the main job

**Spend most of the run here.** The website is the point of this project, not a
container for the daily report. It should be worth visiting for its own sake.

Every run, add something. Several things if they are small — do not make
yourself choose one. The bar is simple: a returning visitor notices something
new, and it works.

Anything on this list counts, roughly from cheap to ambitious:

- a new page or section that answers a question the rest of the site raises
- a new interaction: filtering, sorting, keyboard control, a small
  visualisation, something that responds
- a better version of a page that already exists — faster to read, easier to
  navigate, better on a phone
- a view built from data the site already holds: reports, tags, dates, the
  tracker
- feeds, search, sharing, embeds, print styles, accessibility, performance
- something playful that earns its place — a toy, a game, a small delight
- **an interactive panel inside the day's report.** This one is not optional:
  every report carries a new one, and it should be a different thing to do each
  day — something to drag, rotate, play, solve or watch, in 2D, in 3D, on a
  canvas or in plain DOM. Read `AGENTS.md`, "Make it interactive".

**Do not confine yourself to features that make the daily report better.** The
site has been nothing but reporter furniture so far, which is why it feels
finished. Build things a reader would use on their own terms.

Constraints that keep it shippable:

- `npm --prefix site run build` must pass before you finish. That is the gate.
- Never break something already published: every existing report, page, tag,
  image and feed keeps working exactly as before.
- Match the existing design language — cream, serif, gold accents. Read
  `site/src/styles/global.css` before inventing a new one.
- No new dependencies. If you genuinely need one, say so in the report and
  leave the decision to me.
- Work in increments that leave the site whole. If an idea spans several runs,
  ship a working slice each day and say where it stands.

Say what you changed, in enough detail that I can see it without opening the
code — `## Site changes` is the usual heading, and it can sit wherever it fits.
Taking a day off from building is allowed if you say so honestly. A fake or
overreaching change is worse than none.

### 2. The daily sweep

Every day, quietly check for new **engineering events in France** I could enter
in person as a student — hackathons, challenges, workshops, summer schools,
competitions, run by a company, a school or a lab, in programming, AI, embedded,
robotics or autonomy — and new **game jams with cash prizes** (itch.io is the
start, not the end).

Anything that qualifies goes into the tracker (job 3). That is the list, and the
report does not need to restate it: tell me what is new, what changed, what just
expired, and what you could not verify. Skip the rest.

Ten or fifteen minutes, not the morning.

### 3. Refresh the Still open tracker

One file, `site/src/data/still-open.json`, drives the dashboard list, the month
calendar and the `.ics` feed. Refresh it every run: add what you found, carry
open items forward, delete anything whose deadline has passed. The field rules
are in `AGENTS.md` section 5 — read them, the file's shape matters.

To remove something yourself, write it here, e.g. "tracker: remove Micro Jam
068". That counts as done or declined, and the item must not come back.

### 4. What changed in AI

A little of what actually happened this week that a working engineer would care
about: a model worth trying, a capability that got cheap, a tool that now
exists.

No benchmarks. I do not want a scoreboard — the numbers are unverifiable from
here and they age badly. Say what something can now do, or what it costs.

This is the smallest thing in the report. Do not let it grow.

### 5. Project ideas

One to three original project ideas — things one student could actually build,
technical or playful.

Free-standing: not derived from the day's news, from the events you found, or
from anything else in the report. They are not commentary on the day; they are
ideas. New each day, unless something genuinely sharpened an older one.

What it is, why now, the smallest first step. Skip it when nothing good
surfaced — filler ideas are worse than none.

### 6. The weekly Outlook

Once per calendar week — the first run that finds no entry for the current
week — add a piece to the Outlooks space in `site/src/content/outlooks/`: where
AI is taking the world in the short, mid and long term, what it means for a
software engineer, and the genuinely different futures humanity could get. This
is the one place I want you thinking on the page rather than reporting.

Each entry opens by revisiting the previous one: what stands, what you revise
or drop, and why. Speculation is welcome but must be labelled as scenario, not
fact. The detailed rules live in `AGENTS.md` section 6.

### 7. Everything else

Anything else I ask for on a given day goes here as a one-off, and you can
delete it from this file afterwards.

---

## How the report should look

**This is yours.** The jobs above say what to find out, not what to write. There
is no required set of sections, no required order, no required length and no
required tone: choose the shape the day actually has. A day that is one story
deserves one story. A day with eight small things is a list. A day with nothing
is three honest lines.

The archive has journal entries, dossiers, notes and essays in it — keep that
true. Do not reach for last week's outline out of habit.

What the report still owes me, every time:

- **The truth**, including the parts you could not check. Say what you could not
  verify rather than smoothing it over.
- **Sources** for what you assert, in the frontmatter list and inline where it
  matters.
- **A reason to read it.** Five minutes is about right. Longer than that has to
  be earned by the day.
- **Something to look at or play with.** Not every day needs a picture, but the
  page should rarely be grey text from top to bottom.
- **The near deadlines first**, in whatever way fits the writing. If something
  expires within a week, I should not have to hunt for it.

You own the report's interface too, within the site's design: images, charts,
tables, collapsible detail, the interactive panels in `AGENTS.md`, and the page
shape itself (`layout:` in the frontmatter). If the page you want does not exist
yet — a different column, a different opening, a new kind of block — build it
and note it under the site work.

## Tags

The tag pages are navigation, so keep the vocabulary small: `events`, `jams`,
`ai` and `project` already exist and cover most days. Add a new one only if it
will recur, not as a one-off label.

**Be honest about coverage.** French student events are often announced on
school intranets, Instagram and Discord, which you cannot read. If a sweep turns
up little, say it was thin rather than padding the list. Never invent an event,
a date, a prize, or a number.
