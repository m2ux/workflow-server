# Impact Analysis — Section resource grain (#358 / #359)

**Workflow:** `workflow-design` (canon) + corpus-wide definition surface under `workflows/`
**Mode:** Update
**Date:** 2026-07-31
**Change source:** [01-change-brief.md](01-change-brief.md)
**Baseline:** library `workflows/` file inventory (edit surface `{target_path}` after provision)

---

## Summary

Corpus-wide **technique citation** and **resource structure/canon** updates in two PRs. No activity graph, transition, variable, or checkpoint topology changes on any workflow. Integrity risk is **reference grain** (anchors must resolve) and **content self-sufficiency** under section fetch — not transition reachability. Material body deletions (duplicate framing) are **deferred** until the #359 classify pass names sites; none are inventoried as approved removals at intake.

**Removals inventoried:** 0

**PR blast radii (from brief):**

| PR | Touches | Integrity focus |
|----|---------|-----------------|
| 1 · #358 | Technique `.md` citations; optional `scripts/` guard; rare resource splits | Link targets resolve; whole-resource leave is a recorded verdict |
| 2 · #359 | Resource framing/`##` structure; design-principles; anti-patterns sibling; 3 cross-section link fixes; optional `src/` only for C | Section spans self-sufficient; no duplicate framing cemented by C |

---

## 1. Impact classification

### Directly modified

| File / class | Why |
|--------------|-----|
| `workflows/*/techniques/**/*.md` (tail sites) | PR1: retarget or record whole-resource citations under ~8k chars |
| `workflows/workflow-design/resources/design-principles.md` | PR2: clause on section-scoped reader dependencies (30 and/or 32) |
| `workflows/workflow-design/resources/anti-patterns.md` | PR2: AP-134 sibling `framing-outside-any-section` (detect mechanical) — **not** the #358 size-cap exclusion for eager bundling |
| `workflows/meta/resources/planning-readme.md` | PR2: cross-section fix at `#progress-status-call-sites` → `#status` (or equivalent anchor) |
| `workflows/work-package/resources/architecture-summary.md` | PR2: `#diagram-selection` → artifact template section |
| `workflows/work-package/resources/pr-description.md` | PR2: glyph key available to `#link-row-forms` consumers |
| ~69 resources with framing outside any `##` | PR2: delete / name section / leave per classification |
| `scripts/` (optional) | PR1: bare citation that also anchors same resource |

### Possibly touched at draft time

| File / class | Why |
|--------------|-----|
| Resources split under principle 30 (PR1 outcome 3) | Only where no section covers the need and the file is large |
| Technique prose that restates framing | May absorb unique operative framing moved out of resources |
| `src/utils/resource-delivery.ts` and delivery tests | **Only** if classification supports variant C — separate commit/PR slice |
| Corpus snapshots / `corpus-sha` | If C changes section payload bytes |
| `meta` techniques citing planning-readme sections | May need citation updates after framing/section renames |
| README seeds / format guides | Only if section titles they cite move |

### Unaffected

- All `workflow.yaml` / `activities/*.yaml` topology (no add/remove/reorder of activities).
- Variables, checkpoints, transitions, `initialActivity`.
- Server `src/` and `schemas/` under the default path (PR1 always; PR2 unless C is chosen post-classify).
- Anti-patterns **eager-bundle exclusion** for #358 measurement (file stays over cap; sibling AP is definition text, not a size-cap change).
- Top-20 citation pairs and the two whole-resource-economical sites named in #358.

---

## 2. Integrity checks

| Check | Verdict |
|-------|---------|
| Transitions, entry activity, reachability | **Pass** — no activity or transition edits planned |
| Technique and resource references | **Pass (pending draft verification)** — citation retargets must resolve to existing `#` anchors; new sections must be minted before citers point at them |
| Variables, checkpoint effects, step gates | **Pass** — no variable or checkpoint schema changes |

---

## 3. Removals inventory

None at intake. Planned **candidate** reductions (not approved rows):

| Candidate class | When inventoried | Notes |
|-----------------|------------------|-------|
| Duplicate framing prose | After #359 classify of all ~69 | Delete only when technique already states the same obligation |
| Dropped bare whole-resource link beside anchors | Per #358 site | Citation edit; resource body preserved |
| Framing left as orientation | N/A | No removal |

A later scope or impact refresh must add removed-versus-preserved rows before any framing body is deleted.

---

## Change constraints

**Co-change sets**

1. **PR1 citation site:** technique link text/target + any new section or split resource fragments the site depends on.
2. **PR2 framing site:** resource body + every technique that cited the old whole-file or old anchor + canon/AP text if the site motivated the rule.
3. **Cross-section triad:** the three named resources’ link fixes can ship together in PR2 without waiting on full framing classify, but must not be the only “done” signal for #359.
4. **Variant C (if chosen):** `loadResourceDelivery` / ledger keying + `resource-section-or-whole` prose + corpus hash restamp — **never** mixed into pure-corpus commits.

**Identifier collisions**

- New `##` slugs must not collide with existing anchors in the same resource.
- AP id `framing-outside-any-section` must not collide with an existing AP slug.
- Principle clause numbering stays on 30/32 (extend in place; do not mint a parallel principle number without brief update).

---

## Decision ask

Confirm impact scope: **zero inventoried removals at intake**; corpus citation + later framing work; topology intact; `src/` only behind post-classify C as a separate slice. Framing deletions require a fresh removals inventory before draft deletes land.
