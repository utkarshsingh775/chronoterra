# Plan: living data, narrated events, and sourced facts

Status: **draft for later**. Nothing here is built yet. Written after verifying that every data
source below actually works and is openly licensed.

---

## Overview

### What is the problem?

The globe currently answers one question well: *where were the borders?* It cannot answer the two
questions people ask straight afterwards.

1. **What was life actually like here?** How many people, how long did they live, how rich were
   they, could they read? Today the app has none of this.
2. **What happened?** Dragging from 1900 to 1914 changes some colours. It does not tell you that a
   war started. Borders are the *result* of history; the app never shows the history itself.

There is also a quieter problem. The 207 "did you know" facts are hand-written and carry **no
sources**. They are, as far as a reader can tell, assertions by an anonymous website. For a project
about history, that is the weakest thing in it.

### What are we trying to achieve?

- Every era can answer "what was life like?" with **real long-run numbers**, not vibes.
- Moving through time **narrates what happened**, so the timeline reads as a story rather than a
  slideshow of coloured shapes.
- **Every claim is traceable.** Each fact carries a source and a link, and the app is honest about
  where the data is weak or contested.

### What are the possible approaches?

**A. Fetch from OWID and Wikidata at runtime.** Always current, adds nothing to the repository.
But a Wikidata query for events took over a minute and returned a 504 when I made it too broad, and
the app's whole point is that data is ready *before* you drag. It would also break offline support.
Rejected.

**B. Bake everything at build time** into `public/data`, exactly like borders are today
(*recommended*). Fast, offline, no runtime dependency, and the slow flaky queries happen once on my
machine where a retry costs nothing. The cost is that data is only as fresh as the last
`npm run data`, which for 10,000-year-old population estimates does not matter.

**C. Hybrid.** Bake the small aggregated slices, fetch detail on demand. Adds a second code path
for very little gain at this size. Reserve it for later if the event set grows past a few MB.

**Recommendation: B.** It matches the architecture already there. The existing pipeline is the
right shape for this; it just needs two more sources.

### What exactly should be built?

Three layers, independent of each other, in this order of value:

| Layer | What it adds | Rough size |
|---|---|---|
| 1. Indicators | Population, income, life expectancy, literacy per era | ~300 KB |
| 2. Events | Located, dated, notable events per era, with narration | ~1–2 MB |
| 3. Provenance | A source behind every fact and every number | negligible |

---

## What I verified

Everything below was tested before writing this plan, so none of it is an assumption.

**Our World in Data** serves plain CSV with no key:

```
https://ourworldindata.org/grapher/<slug>.csv?csvType=full&useColumnShortNames=true
```

| Slug | Coverage | Rows |
|---|---|---|
| `population` | **10,000 BC to 2023**, 269 entities | 58,824 |
| `gdp-per-capita-maddison` | AD 1 to 2022, 178 entities | 21,586 |
| `life-expectancy` | 1543 to 2023 | — |
| `cross-country-literacy-rates` | 1475 onward | — |
| `child-mortality` | 1751 onward | — |

Population reaching **10,000 BC per country** is the find that makes this worth doing; it lines up
with our timeline almost exactly. A matching `.metadata.json` endpoint returns the citation and a
plain-English description of each column, so attribution can be generated rather than hand-typed.
Some slugs answer `301`, so the fetcher must follow redirects. Licence: **CC BY**.

**Wikidata** answers SPARQL over HTTPS with no key, returning events with a date, coordinates and a
notability signal (how many Wikipedias have the article):

```
Battle of Hastings   | 1066-10-20 | 0.49 E,  50.91 N | 81 wikis
Battle of Tours      |  732-10-14 | 0.53 E,  46.99 N | 68 wikis
Battle of Manzikert  | 1071-09-01 | 42.59 E, 39.10 N | 64 wikis
```

This is the histography.io idea, but better for us, because coordinates mean events can be **pinned
on the globe** rather than just dotted on a line. Licence: **CC0**.

**The constraint to design around:** a narrow query returns in about two seconds, but a broad one
(all "occurrences" with coordinates, pre-2000) **timed out with a 504 after a minute**. Queries must
be chunked and cached, which is fine at build time and would be unacceptable at runtime.

---

## Layer 1: Indicators

### The hard part, stated honestly

OWID entities are **modern countries**. Our realms are **historical polities**. There is no honest
mapping from "Mauryan Empire" to any row in a modern dataset, and inventing one would be exactly
the kind of false precision this project should avoid.

So the plan deliberately does two different things depending on the era:

- **Before 1800:** show **world and continental aggregates only.** "In 1500 the world held about
  460 million people" is defensible. "The Mughal Empire's GDP per capita was X" is not, and we will
  not print it.
- **From 1800 onward,** where our realms increasingly *are* modern states, map realm to OWID entity
  through an explicit table in `src/geo.js` (the `SAME_REALM` map already does this job for
  Wikipedia and can be extended), and show per-realm numbers **only for realms in that table**.
  Everything unmapped simply shows nothing rather than a guess.

### Build step

New `scripts/build-owid.mjs`:

1. Download each indicator CSV, following redirects.
2. Download its `.metadata.json` and keep the citation string.
3. **Resample onto our 69 era years.** For each entity and era, take the nearest observation at or
   before that year, but only if it is within a max gap (say 150 years for the ancient eras,
   10 years for the modern ones). Beyond the gap, record nothing. This is the rule that stops the
   app from implying we know Egypt's literacy rate in 3000 BC.
4. Write one compact file per indicator, plus a shared manifest holding titles, units, citations
   and licences.

```
public/data/owid/
  manifest.json          indicator ids, titles, units, citations, source urls
  population.json        { "World": { "-10000": 4400000, ... }, "India": { ... } }
  gdp-per-capita.json
  life-expectancy.json
  literacy.json
  child-mortality.json
```

Keys are era years, so the runtime lookup is a plain object access with no scanning.

### UI

- **"The world in numbers"** strip under the era caption: three or four figures for the current
  era, each with a tooltip naming the source. Shows only what exists for that year.
- **Realm numbers in the info card**, for mapped realms only, with the same sourcing.
- **A data mode on the globe.** The Realms / Empires toggle gains a third option that colours the
  world by an indicator instead of by realm, so you can watch literacy or life expectancy spread.
  This reuses the existing polygon colouring path; only the colour function changes.
- **A sparkline in the chronicle** next to the existing territory chart, so a realm's size sits
  beside how its people actually lived.

---

## Layer 2: Events, and narration

### Build step

New `scripts/build-events.mjs`:

1. Query Wikidata **in narrow chunks** to stay under the timeout: one query per event class per
   century. Roughly 8 classes × 40 centuries, cached to `data-cache/events/` so a rerun is free and
   a failed chunk retries alone.
2. Classes worth including: battles, sieges, treaties, city foundings, coronations, eruptions and
   earthquakes, epidemics, voyages and expeditions.
3. Keep: label, date, coordinates, Wikipedia title, class, and sitelink count as a notability score.
4. **Assign each event to the era window it falls in** (era *i* covers up to era *i+1*).
5. Rank within each era and keep the top N, so a dense century does not bury the globe in pins.

```
public/data/events/
  1400.json   [{ t: "Fall of Constantinople", y: 1453, ll: [28.98, 41.01],
                 k: "siege", n: 94, w: "Fall_of_Constantinople" }, ...]
```

Short keys, because this is the layer most likely to get large.

### The bias problem, which is a historiography problem

Ranking by "number of Wikipedias" will produce a map where Europe is where history happened. That
is a fact about Wikipedia, not about the past, and shipping it unexamined would make the app
quietly wrong in a way no test would catch.

Mitigation, to be treated as a real requirement rather than a footnote:

- Apply the notability threshold **per region**, so each populated continent contributes events in
  every era rather than competing on a global ranking.
- Count sitelinks **excluding English**, which slightly reduces anglophone weighting.
- Track the regional balance in the build output and print it, so the skew is visible every time
  the data is rebuilt.
- Say so in the UI. A line explaining that coverage reflects what has been written down, not what
  happened, is more honest than a silently lopsided map.

### Narration

Events become a **story rail** along the bottom: as an era loads, its events appear in order, and
pressing play walks through them, flying the globe to each one.

The narration is **generated from structured fields, never invented**:

> *1453 · Constantinople falls to the Ottomans, ending the Roman Empire after 1,480 years.*

The date, place and name come from Wikidata; the one clause of context comes from the first sentence
of the Wikipedia summary the app already fetches. **No sentence is written by a language model and
presented as history.** If there is no sourced clause, the event shows as a bare dated headline.
That constraint is what keeps this trustworthy.

---

## Layer 3: Sourcing what is already there

The smallest layer and arguably the most important.

**Facts become objects.** Today:

```js
facts: ['The Mongol Empire was the largest contiguous land empire in history.']
```

Instead:

```js
facts: [{
  text: 'The Mongol Empire was the largest contiguous land empire in history.',
  source: 'Encyclopaedia Britannica, "Mongol empire"',
  url: 'https://www.britannica.com/place/Mongol-empire',
}]
```

Rendered as a small superscript link, the way a printed history book does it.

**A check script enforces it.** Extend the pattern already established by `scripts/check-borders.mjs`
with `scripts/check-facts.mjs`, which fails the build if any fact lacks a source, and separately
(networked, run occasionally) reports any URL that no longer resolves.

**Numbers stop being hand-typed.** Facts like "world population was nearing one billion" get
replaced at build time by the OWID figure for that year, so the text cannot drift from the data.

**The app admits what it does not know.** A short "how we know this" panel covering: borders before
1500 are interpretations and were often zones rather than lines; deep-time reconstructions carry
real uncertainty that grows with age; and event coverage follows the written record. This is the
difference between a history site and a history *graphic*.

---

## Structure

```
scripts/
  build-data.mjs          existing: borders
  build-owid.mjs          new: indicators, resampled onto era years
  build-events.mjs        new: Wikidata events, chunked and cached
  check-borders.mjs       existing
  check-facts.mjs         new: every fact has a source
src/
  indicators.js           new: lookup + formatting + citation
  events.js               new: load, rank, narrate
  components/
    numbers-strip.js      new
    story-rail.js         new
public/data/
  owid/                   new
  events/                 new
```

Two new build scripts, two new runtime modules, two new UI pieces. No change to how borders work,
and every new piece is independently skippable if its data file is absent.

---

## Phasing

| Phase | Scope | Why this order |
|---|---|---|
| 1 | Sourced facts + check script | Smallest, fixes the weakest part, no new data |
| 2 | OWID indicators: world aggregates + numbers strip | Immediate payoff, avoids the mapping problem |
| 3 | Per-realm indicators + data colouring mode | Needs the realm-to-entity table |
| 4 | Events + story rail | Largest and most bias-sensitive; do it last, carefully |

Each phase is shippable on its own.

---

## Open questions for when we pick this up

1. **How far do we take the realm-to-entity table?** Twenty major modern states is an afternoon;
   every realm since 1800 is a long slog. Start with twenty and see if it feels thin.
2. **Should the story rail autoplay** with the existing era playback, or stay manual? Autoplay is
   more impressive and much easier to make feel rushed.
3. **How many events per era?** Enough to feel alive, few enough to read. Probably 8 to 12.
4. **Is a data-coloured globe a third mode, or a separate view?** Realm colours and indicator
   colours fight each other; they may not belong on screen together.
5. **What is the size budget?** `public/data` is 13 MB today. Events could plausibly double it.
   Worth deciding a ceiling before building, not after.

---

## Licences

| Source | Licence | Obligation |
|---|---|---|
| Our World in Data | CC BY | Credit OWID **and** the underlying source, which the metadata endpoint provides |
| Wikidata | CC0 | None, but credit anyway |
| Wikipedia summaries | CC BY-SA | Already credited in the chronicle footer |

No keys, no accounts, no paid tiers anywhere in this plan.
