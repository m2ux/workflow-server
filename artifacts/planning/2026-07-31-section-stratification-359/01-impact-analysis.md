# Impact Analysis — Section stratification / framing (#359)

**Workflow:** `workflow-design` (canon) + corpus-wide resource surface under `workflows/`
**Mode:** Update
**Date:** 2026-07-31
**Change source:** [01-change-brief.md](01-change-brief.md)
**Baseline:** library `workflows/` file inventory (edit surface `{target_path}` after provision)
**Prior art:** [prior impact](../2026-07-31-section-resource-grain-358-359/01-impact-analysis.md) PR2 rows only

---

## Summary

Corpus-wide **resource structure/canon** updates for #359 as PR2. No activity graph, transition, variable, or checkpoint topology changes. Integrity risk is **content self-sufficiency** under section fetch and **anchor resolution** for the three cross-section sites — not transition reachability. Material body deletions (duplicate framing) are **deferred** until the classify pass names sites; none are inventoried as approved removals at intake.

**removal_count:** 0

**PR blast radius:**

| PR | Touches | Integrity focus |
|----|---------|-----------------|
| 2 · #359 | Resource framing/`##` structure; design-principles; anti-patterns sibling; 3 cross-section link fixes; optional `src/` only for C | Section spans self-sufficient; no duplicate framing cemented by C |

---

## 1. Impact classification

### Directly modified

| File / class | Why |
|--------------|-----|
| `workflows/workflow-design/resources/design-principles.md` | Clause on section-scoped reader dependencies (principle 30 and/or 32) |
| `workflows/workflow-design/resources/anti-patterns.md` | AP-134 sibling `framing-outside-any-section` (mechanical detect) — not body-size work |
| `workflows/meta/resources/planning-readme.md` | Cross-section fix at `#progress-status-call-sites` → `#status` (or equivalent) |
| `workflows/work-package/resources/architecture-summary.md` | `#diagram-selection` → artifact template section |
| `workflows/work-package/resources/pr-description.md` | Glyph key available to `#link-row-forms` consumers |
| ~69 resources with framing outside any `##` | Delete / name section / leave per classification |

### Possibly touched (draft-time)

| File / class | Why |
|--------------|-----|
| Technique prose that restates framing | May absorb unique operative framing moved out of resources |
| `src/utils/resource-delivery.ts` and delivery tests | **Only** if classification supports variant C — separate commit/PR slice |
| Corpus snapshots / `corpus-sha` | If C changes section payload bytes |
| Meta / work-package techniques citing renamed sections | Citation updates after framing/section renames |

### Unaffected (summary)

- All `workflow.yaml` / `activities/*.yaml` topology
- Variables, checkpoints, transitions, `initialActivity`
- Server `src/` and `schemas/` under the default path (unless post-classify C)
- #358 citation tail / top-20 pairs / anti-patterns eager-bundle size work
- PR1 surface already landed on [#370](https://github.com/m2ux/workflow-server/pull/370)

---

## 2. Integrity checks

| Check | Verdict |
|-------|---------|
| Transitions / `initialActivity` / reachability | **Pass** — no activity or transition edits planned |
| Technique / resource references | **Pass (pending draft verification)** — new sections minted before citers point at them; cross-section anchors must resolve |
| Variables / `setVariable` / step conditions | **Pass** — no variable or checkpoint schema changes |

---

## 3. Removals inventory

None at intake. Planned **candidate** reductions (not approved rows):

| Candidate class | When inventoried | Notes |
|-----------------|------------------|-------|
| Duplicate framing prose | After classify of all ~69 | Delete only when technique already states the same obligation |
| Framing left as orientation | N/A | No removal |

A later scope or impact refresh must add removed-versus-preserved rows before any framing body is deleted.

---

## Change constraints

**Co-change sets**

1. **Framing site:** resource body + every technique that cited the old whole-file or old anchor + canon/AP text if the site motivated the rule.
2. **Cross-section triad + canon rows:** design-principles, anti-patterns sibling, and the three named resources can ship together without waiting on full framing classify, but must not be the sole #359 done signal.
3. **Variant C (if chosen):** `loadResourceDelivery` / ledger keying + `resource-section-or-whole` prose + corpus hash restamp — **never** mixed into pure-corpus commits.

**Identifier collisions**

- New `##` slugs must not collide with existing anchors in the same resource.
- AP id `framing-outside-any-section` must not collide with an existing AP slug.
- Principle clause numbering stays on 30/32 (extend in place).

---

## Decision ask

Confirm impact scope: **zero inventoried removals at intake**; framing + canon + three anchors; topology intact; `src/` only behind post-classify C as a separate slice. Framing deletions require a fresh removals inventory before draft deletes land.
