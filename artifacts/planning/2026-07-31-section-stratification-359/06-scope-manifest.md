# Scope Manifest — Section stratification / framing (#359)

**Target:** `workflow-design` (canon) · corpus-wide resource surface · **Mode:** update
**Basis:** [change brief](01-change-brief.md) · [impact analysis](01-impact-analysis.md)
**Worktree:** `/home/mike1/projects/dev/workflow-server/.worktrees/2026-07-31-section-stratification-359/` on `workflow/workflow-design-section-stratification-359` · folder layout **unchanged**
**Base tip:** `8c12d0f5` (#358 wave 1b on PR1 branch) — **no #358 redo**

PR2 for [#359](https://github.com/m2ux/workflow-server/issues/359) only. Intentional removals at intake: **0** ([impact §3](01-impact-analysis.md#3-removals-inventory)). Framing path-pins expand after classify.

`file_count` = **5** named definition paths this pass (fixed rows) · framing classify set expands ~69 further resource rows after arithmetic (not yet fully path-pinned).

---

## PR partition

| PR | Issue | Rows | Surface | Must not |
|----|-------|------|---------|----------|
| **PR 2** | [#359](https://github.com/m2ux/workflow-server/issues/359) | 1–5 + framing set | Canon (principles 30/32 + AP-134 sibling); three cross-section anchor fixes; ~69 framing dispositions | Ship delivery variant **C** before classify; mix C into pure-corpus commits; re-do #358 |

---

## File manifest

### Fixed + canon (rows 1–5)

| # | Path (under worktree root) | Type | Action | One-line change |
|---|----------------------------|------|--------|-----------------|
| 1 | `workflow-design/resources/design-principles.md` | resource | modify | Extend principle 30 and 32: section-scoped reader dependencies live in a section |
| 2 | `workflow-design/resources/anti-patterns.md` | resource | modify | Add AP-134 sibling `framing-outside-any-section` (mechanical detect) |
| 3 | `meta/resources/planning-readme.md` | resource | modify | `#progress-status-call-sites` deixis → anchored `#status-vocabulary` |
| 4 | `work-package/resources/architecture-summary.md` | resource | modify | `#diagram-selection` → anchored artifact-template section |
| 5 | `work-package/resources/pr-description.md` | resource | modify | Glyph key inside `#link-row-forms` for section consumers |

### Framing classify set (path-pin after classify)

Not fully path-enumerated until the read-and-decide pass names each of the ~69 resources. Per site: delete duplicate / mint `##` for operative unique / leave orientation. **Removals inventory must refresh before any framing body is deleted.**

Seed classification log: [06-framing-classification.md](06-framing-classification.md).

**Variant C** (`src/utils/resource-delivery.ts` + tests + corpus-sha): **only** if classify arithmetic is mostly operative-and-unique — separate commit; never mixed into rows 1–5 pure-corpus commits.

**Out of scope this pass:**

- #358 citation tail / top-20 pairs
- Anti-patterns body size / eager-bundle exclusion
- All `workflow.yaml` / `activities/*.yaml` topology
- `src/` under default path (unless post-classify C)

---

## Structural design

```
.worktrees/2026-07-31-section-stratification-359/   # workflows worktree — layout unchanged
├── workflow-design/resources/
│   ├── design-principles.md          # principle 30/32 clause
│   └── anti-patterns.md              # AP-134 sibling only
├── meta/resources/planning-readme.md
├── work-package/resources/
│   ├── architecture-summary.md
│   └── pr-description.md
└── …                                 # framing path-pins after classify
```

**Flow:** Topology unchanged on every workflow.

| Pattern | This change |
|---------|-------------|
| Section-scoped reads are self-sufficient | Framing classify + principle clause + AP sibling |
| Cross-section deps use anchors | Three named resources in rows 3–5 |
| Classify before delivery-layer C | Open judgement 1; C never in pure-corpus commits |

---

## Drafting order

1. **Rows 1–5** — canon + three cross-section fixes (this wave).
2. **Framing classify → path-pinned edits** — delete / section / leave per resource; refresh removals inventory before deletes.
3. **Variant C only if arithmetic supports** — separate `src/` slice after classify.

**Rationale:** Fixed anchors and canon ship without waiting on full framing; classify before C so delivery never cements duplicates.
