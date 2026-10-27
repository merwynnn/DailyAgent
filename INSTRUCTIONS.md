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

Name what you did under `## Site changes`, in enough detail that I can see the
change without opening the code. Taking a day off is allowed — say so honestly.
A fake or overreaching change is worse than none.

### 2. Quick sweep: events and game jams

A fast daily check, not a deep dive. The tracker carries the list; the report
only needs to say what is new or changed.

Look for new **events in France** I could enter in person as a student —
hackathons, challenges, workshops, summer schools, competitions, run by a
company, a school or a lab, in programming, AI, embedded, robotics or autonomy
— and new **game jams with cash prizes** (itch.io is the start, not the end).

Anything that qualifies goes into the tracker (job 3). The report gets one line
each: what it is, when, what you can win, a link. Things already on the tracker
that have not changed do not need repeating.

This is worth ten or fifteen minutes, not the morning.

### 3. Refresh the Still open tracker

One file, `site/src/data/still-open.json`, drives the dashboard list, the month
calendar and the `.ics` feed. Refresh it every run: add what you found, carry
open items forward, delete anything whose deadline has passed. The field rules
are in `AGENTS.md` section 5 — read them, the file's shape matters.

To remove something yourself, write it here, e.g. "tracker: remove Micro Jam
068". That counts as done or declined, and the item must not come back.

### 4. AI, briefly

**One paragraph, or three or four bullets, under about 100 words.** What
actually changed this week that a working engineer would care about: a model
worth trying, a capability that got cheap, a tool that now exists.

**No benchmarks.** I do not want a scoreboard — the numbers are unverifiable
from here and they age badly. Say what something can now do, or what it costs,
and move on.

### 5. Project ideas

Close with **one to three original project ideas** — things one student could
actually build, technical or playful.

- **Free-standing.** Do not derive them from today's news, from the events you
  found, or from anything else in the report. They are not commentary on the
  day; they are ideas.
- **New each day.** An idea may return from a previous day only if something
  genuinely sharpened it.
- **Worth starting.** A tool worth having, a game concept with a hook, a
  coursework spin-off, a recurring annoyance worth automating.

Two or three lines each: what it is, why now, and the smallest first step.
Skip the section when nothing good surfaced — filler ideas are worse than none.

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

## How long this should be

The report is now a short log, not the product: **roughly 400 to 700 words of
body text.** The tracker holds the lists, the site holds the work. If you are
writing more than that, you are writing report instead of building.

## How to write it up

Sections, in this order, and leave one out entirely when it has nothing worth
saying: `Events`, `Game jams`, `AI`, `Project ideas`, `Site changes`.

`Events` and `Game jams` are now one line per new find, because the tracker is
the list. `Site changes` is where the substance goes — it is the record of the
actual work of the day.

**Don't repeat yourself.** Anywhere I can still enter lives in the tracker, not
in the report. Mention something on the tracker only when it is new, has
changed, or has just expired.

**If a deadline is inside a week**, say so in one line at the top, before
anything else.

**Tags**: `events`, `jams`, `ai`, `project` — only the ones with content. Do not
invent new ones.

**Sources**: every link you relied on goes in the report's `sources` list. If a
claim came from a vendor's own blog, say so.

**Be honest about coverage.** French student events are often announced on
school intranets, Instagram and Discord, which you cannot read. If a sweep
turns up little, say it was thin rather than padding the list. Never invent an
event, a date, a prize, or a number.
