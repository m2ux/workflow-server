# Portfolio Lens: Rejected Paths — `README.md`

**Lens:** rejected-paths (09)
**Target:** `/home/mike1/projects/main/workflow-server/README.md`
**Date:** 2026-06-29
**Operation:** Identify each concrete problem in the README; trace the decision that enabled it; name the rejected path that would have prevented it (and the new invisible danger that path creates); imagine the README rewritten taking all rejected paths; name the law about which problems migrate between visible and hidden, and predict which migration the simplifier hits first under pressure.

---

## 1. Concrete problems → enabling decision → preventing (rejected) path → new invisible danger

| # | Concrete problem (today) | Decision that enabled it | Rejected path that would prevent it | New invisible danger that path creates |
|---|--------------------------|--------------------------|-------------------------------------|----------------------------------------|
| P1 | Density cliff: Overview is plain, then How-It-Works step 2–3 dump dotted field paths | Putting exact bundle mechanics in the onboarding narrative | Move mechanics to API reference; keep narrative plain | Reader must follow a link to get specifics; some never do, so the README feels under-specified to insiders |
| P2 | "five concerns" contradicts the 6-row table | Hand-writing a category count in prose next to an enumerated table | Drop the number; say "grouped by concern" | Loses a quick at-a-glance scale cue ("how big is this surface?") |
| P3 | "session token" (step 2) ≠ canonical `session_index` | Reaching for a friendlier-sounding synonym | Use `session_index` everywhere | Slightly less approachable wording; a newcomer meets an opaque identifier name sooner |
| P4 | Terms used before defined ("fidelity-enforced", "techniques") | Tagline/diagram optimized for brevity | Gloss each term on first use | Tagline grows longer; the punchy one-liner softens |
| P5 | Dual audience (newcomer + insider reference) compressed into one Overview | Single-document economy | Split narrative vs. reference sections | Structure change — explicitly forbidden by this work package |
| P6 | README ↔ `docs/api-reference.md` disagree on tool inventory (16 incl. `dispatch_child` vs. 15 omitting it) | Two hand-maintained tool lists drifting | Single generated source of truth for the tool roster | Tooling/build complexity; generation pipeline to maintain |

## 2. The README rewritten taking ALL rejected paths (concretely)

Imagine a maximally-"corrected" README: mechanics fully pushed to the API reference (P1), no counts in prose (P2), `session_index` everywhere (P3), every term glossed inline (P4), narrative split from reference (P5), tool table generated (P6).

Concretely it would read like: a short plain Overview with zero tool names; a separate "Reference" half; a generated tool table; a longer, gloss-laden tagline; and `session_index` in the first sentence a newcomer reads.

## 3. Which visible problems vanish — which invisible dangers emerge

**Vanish (visible):** the density cliff (P1), the 5-vs-6 contradiction (P2), the term/synonym imprecision (P3), term-before-gloss (P4).

**Emerge (invisible):**
- **Coverage-loss illusion → real coverage loss.** Pushing mechanics to the API reference (P1) edges toward *dropping facts* — which the work package forbids. The danger is invisible at diff time (prose looks cleaner) but violates "coverage preserved."
- **Structure drift (P5).** The single most dangerous rejected path: splitting audiences *is* restructuring, the one thing explicitly out of scope. It would break the nav-bar anchor (`#-quick-start`) and external deep-links — a hidden contract failure that a prose reviewer wouldn't think to check.
- **Scope creep into other files (P6).** A generated tool roster touches `src/`/build — far outside a prose-only, single-file work package.
- **Approachability regression (P3, P4).** Maximal precision/glossing makes the very newcomer the task targets meet jargon *sooner* and read a blander tagline — trading the stated goal away.

## 4. The law

**Problem class that migrates: completeness ↔ accessibility, and they trade across the visible/hidden boundary via the structure constraint.** When the README is made more *accessible* by relocating or trimming detail, the lost completeness is *invisible* (no broken render, no failing link) until an insider or an agent needs the exact field name — so accessibility wins are visible and the completeness cost is hidden. The structure-freeze is the wall that keeps the trade honest: it forbids the cheapest "fix" (restructure), forcing simplification to happen *within* each section's prose, where any over-correction (dropping a fact, breaking an anchor) becomes a visible regression instead of a hidden one.

## 5. Prediction: which migration the practitioner hits first under pressure

**First migration under pressure: P1 — pushing the dense step 2–3 mechanics "to the API reference" and quietly dropping the dotted field names from the README.** Under the pressure of "make it simpler," deleting the hardest fragment is the path of least resistance and *looks* like the biggest win. It silently migrates *completeness* from visible (present in the README) to hidden (only the linked reference has it), tripping the "coverage preserved" success criterion without tripping any render/link check.

**Mitigation for implementation:** simplify the *wording* of the dense fragments in place — keep the tool names and a plain gloss of what each step produces — rather than relocating or deleting the facts. The structure-freeze should be read as protecting *coverage* too: reword, do not relocate. Treat P2 (the count) and P6 (api-reference drift) as flag-to-planning / out-of-scope, never as silent edits.

---
*Portfolio analysis — rejected-paths lens. Companion: `14-portfolio-pedagogy.md`, synthesis in `14-portfolio-synthesis.md`.*
