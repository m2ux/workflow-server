# Impact Analysis — Section stratification / framing (#359)

**Workflow:** `workflow-design` (canon) + corpus-wide resource surface under `workflows/`
**Mode:** Update
**Date:** 2026-07-31
**Change source:** [01-change-brief.md](01-change-brief.md)
**Baseline:** library `workflows/` file inventory (edit surface `{target_path}` after provision)
**Prior art:** [prior impact](../2026-07-31-section-resource-grain-358-359/01-impact-analysis.md) PR2 rows only

---

## Summary

Corpus-wide **resource structure/canon** updates for #359 as PR2. No activity graph, transition, variable, or checkpoint topology changes. Integrity risk is **content self-sufficiency** under section fetch and **anchor resolution** for the three cross-section sites — not transition reachability. Classify arithmetic (87 framed sites) is **orientation-dominated**; delivery variant C is **not** taken. One approved framing deletion is inventoried below.

**removal_count:** 1

**PR blast radius:**

| PR | Touches | Integrity focus |
|----|---------|-----------------|
| 2 · #359 | Resource framing/`##` structure; design-principles; anti-patterns sibling; 3 cross-section link fixes; 6 framing path-pins; **no** `src/` C | Section spans self-sufficient; duplicate framing removed where technique already owns the obligation |

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
| `workflows/work-package/resources/complete-wp-guide.md` | Duplicate framing deleted |
| `workflows/workflow-design/resources/schema-construct-inventory.md` | `## Universal obligation` minted |
| `workflows/meta/resources/planning-readme.md` | Also `## Index role` (framing path-pin after cross-section fix) |
| `workflows/work-package/resources/workflow-retrospective.md` | `## Host nesting` minted |
| `workflows/prism/resources/definitive-findings-template.md` | H1 + `## Artifact contract` |
| `workflows/prism/resources/final-output-template.md` | H1 + `## Artifact contract` |
| 81 orientation resources | Verdict leave — no edit |

### Possibly touched (draft-time)

| File / class | Why |
|--------------|-----|
| Technique prose that restates framing | May absorb unique operative framing moved out of resources |
| `src/utils/resource-delivery.ts` and delivery tests | **Not this PR** — classify does not support C |
| Corpus snapshots / `corpus-sha` | Unchanged without C |
| Meta / work-package techniques citing renamed sections | New section slugs available; existing anchors on Template/Rules/construct tables unchanged |

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

**removal_count:** 1 (approved after classify)

| # | Removed | Preserved / replacement | Why safe |
|---|---------|-------------------------|----------|
| 1 | `complete-wp-guide.md` framing (canonical-home + review-mode header prose before `## Template`) | `create-complete-doc` Protocol steps 1–3; resource `## Template` and `## Rules` | Technique already requires template follow, known-limitations canonical home, and review-mode header behaviour; section-scoped citers use `#template` |

**Preserved (not removed):**

| Class | Count | Disposition |
|-------|------:|-------------|
| operative-unique framing | 3 | Moved under named `##` (Universal obligation, Index role, Host nesting) |
| pre-heading prose | 2 | Moved under H1 + `## Artifact contract` |
| orientation framing | 81 | Left in place |

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

Confirm impact scope: **one inventoried framing deletion** (`complete-wp-guide`); five mint-section path-pins; canon + three anchors; topology intact; **no `src/` C** (orientation-dominated classify).
