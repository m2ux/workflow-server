# Portfolio Lens: Pedagogy — `README.md`

**Lens:** pedagogy (06)
**Target:** `/home/mike1/projects/main/workflow-server/README.md`
**Date:** 2026-06-29
**Operation:** Identify each explicit choice the README makes; name the alternative it invisibly rejects; imagine a writer who internalized this README's patterns and wrote a *new, simplified* README under this work package — which rejected alternatives do they unconsciously resurrect, and which transferred constraint fails first?

---

## 1. Explicit choices and their invisibly-rejected alternatives

| # | Explicit choice the current README makes | Alternative it invisibly rejects |
|---|------------------------------------------|----------------------------------|
| C1 | Front-load precise mechanics in "How It Works" (exact tool names + dotted field paths `techniques.workflow`, `techniques[]`) | A two-tier explanation: a plain-language "what happens" first, mechanics deferred to the API reference it already links |
| C2 | One long sentence per How-It-Works step (step 2 and 3 each pack 3–4 facts) | One idea per sentence; let the numbered list carry the sequencing |
| C3 | Use the term before glossing it ("fidelity-enforced" in the tagline; "techniques" in the diagram before they're defined two lines later) | Introduce-then-name: a plain phrase first, the term in parentheses |
| C4 | State a count in prose AND enumerate it in a table ("16 MCP tools across five concerns" + 6-row table) | Let the table be the source of truth; prose says "grouped by concern" without a brittle number |
| C5 | Mix audiences in one document — newcomer onboarding AND insider quick-reference share the Overview | Separate "for newcomers" narrative from "for reference" tables/anchors |
| C6 | Carry the precise term `session_index` everywhere in the docs, but the README says "session token" in step 2 | Use the exact term, or a single deliberately-plain synonym, consistently |

## 2. The simplification writer who internalized these patterns

A writer asked to "simplify the prose" while told to keep structure fixed has internalized C1–C6 from the surrounding docs. Predicted unconscious resurrections:

- **Resurrects C2 (density) under a new guise.** "Simplify" gets read as "use shorter words," so the writer trims adjectives but keeps three facts per sentence. The sentence reads smoother yet stays dense — the *idea count* per sentence, the real density driver, is untouched.
- **Resurrects C3 (term-before-gloss).** Because the diagram and bullets already name Workflow/Activity/Technique/Tools, the writer assumes the reader meets the terms there and keeps using them unglossed in the tagline and Overview paragraph — the exact ordering that created the density cliff.
- **Resurrects C1 (mechanics front-loaded).** Holding structure fixed, the writer keeps the dotted field paths in step 2–3 "because they're already there and removing them feels like dropping coverage," conflating *wording simplification* with *fact removal* and so leaving the hardest jargon in place.
- **Resurrects C4 (brittle count).** Reluctant to touch a number, the writer simplifies the sentence around "five concerns" but leaves the 5-vs-6 mismatch, propagating the inaccuracy into cleaner-looking prose (which makes it look *more* authoritative).

## 3. Which transferred patterns create silent vs. visible problems

| Transferred pattern | Silent problem | Visible problem |
|---------------------|----------------|-----------------|
| C2 density-as-word-length | Reader still bounces off step 2–3; "we simplified it" masks that the cliff remains — discovered only via user feedback much later | None immediately; prose *looks* improved in review |
| C3 term-before-gloss | Newcomer silently fails to build the model; quietly closes the tab | None in a render/diff check |
| C1 keep-the-jargon | The single densest fragment survives a "simplification" pass | A reviewer comparing before/after sees little real change in the hardest sentences |
| C4 keep "five" | Inaccuracy now wears cleaner prose — looks more trustworthy, is not | A counting reader sees five-vs-six and distrusts the whole table |

## 4. The pedagogy law

**The constraint that transfers as an assumption: "preserve structure and coverage" silently becomes "preserve sentence-level information density."** The work-package rule fixes *sections and facts*; the writer over-extends it to *also* fix how many ideas ride in each sentence and where terms are introduced. Density and term-ordering are precisely the levers the task wants moved — but they get frozen by association with the genuinely-frozen structure. The freeze leaks from "structure" to "phrasing."

## 5. Prediction: which transferred decision fails first, slowest to discover

**Fails first / slowest to discover: C3 (term-before-gloss) carried into the tagline + Overview.** A render check and a diff review both pass (structure intact, words shorter), so it ships looking successful. The failure is invisible at review time and surfaces only as the very symptom the work package set out to cure — a newcomer who still can't get oriented — which is the slowest signal of all to attribute back to phrasing, since nothing is "broken."

**Mitigation for the implementation activity:** treat "simplify" as *reduce ideas-per-sentence and introduce each term in plain words before naming it*, not "use shorter words." For the dotted-field jargon in How-It-Works steps 2–3, soften to plain prose and lean on the already-linked API reference for the exact field paths. Keep tool names and the count table verbatim; flag "five concerns" to planning rather than silently rewording around it.

---
*Portfolio analysis — pedagogy lens. Companion: `14-portfolio-rejected-paths.md`, synthesis in `14-portfolio-synthesis.md`.*
