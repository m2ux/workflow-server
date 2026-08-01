# Scope Manifest — Section stratification / framing (#359)

**Target:** `workflow-design` (canon) · corpus-wide resource surface · **Mode:** update
**Basis:** [change brief](01-change-brief.md) · [impact analysis](01-impact-analysis.md) · [framing classification](06-framing-classification.md)
**Worktree:** `/home/mike1/projects/dev/workflow-server/.worktrees/2026-07-31-section-stratification-359/` on `workflow/workflow-design-section-stratification-359` · folder layout **unchanged**
**Base tip:** `8c12d0f5` (#358 wave 1b on PR1 branch) — **no #358 redo**

PR2 for [#359](https://github.com/m2ux/workflow-server/issues/359) only. Framing path-pins from full classify arithmetic (87 framed / 94 anchored-cited).

`file_count` = **11** definition paths (5 fixed + 6 framing path-pins). Orientation leave-set is verdict-only (no file rows).

---

## PR partition

| PR | Issue | Rows | Surface | Must not |
|----|-------|------|---------|----------|
| **PR 2** | [#359](https://github.com/m2ux/workflow-server/issues/359) | 1–11 | Canon (principles 30/32 + AP-134 sibling); three cross-section anchor fixes; framing classify + path-pins | Ship delivery variant **C** (orientation-dominated arithmetic); mix C into pure-corpus commits; re-do #358 |

---

## File manifest

### Fixed + canon (rows 1–5) — done

| # | Path (under worktree root) | Type | Action | One-line change |
|---|----------------------------|------|--------|-----------------|
| 1 | `workflow-design/resources/design-principles.md` | resource | modify | Extend principle 30 and 32: section-scoped reader dependencies live in a section |
| 2 | `workflow-design/resources/anti-patterns.md` | resource | modify | Add AP-134 sibling `framing-outside-any-section` (mechanical detect) |
| 3 | `meta/resources/planning-readme.md` | resource | modify | `#progress-status-call-sites` deixis → anchored `#status-vocabulary` |
| 4 | `work-package/resources/architecture-summary.md` | resource | modify | `#diagram-selection` → anchored artifact-template section |
| 5 | `work-package/resources/pr-description.md` | resource | modify | Glyph key inside `#link-row-forms` for section consumers |

### Framing path-pins (rows 6–11)

| # | Path (under worktree root) | Type | Action | Class | One-line change |
|---|----------------------------|------|--------|-------|-----------------|
| 6 | `work-package/resources/complete-wp-guide.md` | resource | modify | duplicate | Delete framing that restates `create-complete-doc` Protocol + in-body Rules |
| 7 | `workflow-design/resources/schema-construct-inventory.md` | resource | modify | operative-unique | Mint `## Universal obligation` for inventory check + schema table |
| 8 | `meta/resources/planning-readme.md` | resource | modify | operative-unique | Mint `## Index role` (same file as row 3; framing after cross-section fix) |
| 9 | `work-package/resources/workflow-retrospective.md` | resource | modify | operative-unique | Mint `## Host nesting` for close-out section constraint |
| 10 | `prism/resources/definitive-findings-template.md` | resource | modify | pre-heading | Mint H1 + `## Artifact contract` for pre-heading prose |
| 11 | `prism/resources/final-output-template.md` | resource | modify | pre-heading | Mint H1 + `## Artifact contract` for pre-heading prose |

### Orientation leave-set (verdict only)

**81** resources — purpose/role framing; operative detail already under cited `##` sections. Full table: [06-framing-classification.md](06-framing-classification.md). No file edits.

**Variant C** (`src/utils/resource-delivery.ts` + tests + corpus-sha): **not taken** — orientation dominates (81/87). Recommendation recorded in framing classification; no `src/` slice.

**Out of scope this pass:**

- #358 citation tail / top-20 pairs
- Anti-patterns body size / eager-bundle exclusion (AP-139 sibling only)
- All `workflow.yaml` / `activities/*.yaml` topology
- `src/` delivery variant C

---

## Structural design

```
.worktrees/2026-07-31-section-stratification-359/   # workflows worktree — layout unchanged
├── workflow-design/resources/
│   ├── design-principles.md          # principle 30/32 clause
│   ├── anti-patterns.md              # AP-134 sibling only
│   └── schema-construct-inventory.md # ## Universal obligation
├── meta/resources/planning-readme.md # cross-section + ## Index role
├── work-package/resources/
│   ├── architecture-summary.md
│   ├── pr-description.md
│   ├── complete-wp-guide.md          # framing deleted
│   └── workflow-retrospective.md     # ## Host nesting
└── prism/resources/
    ├── definitive-findings-template.md
    └── final-output-template.md
```

**Flow:** Topology unchanged on every workflow.

| Pattern | This change |
|---------|-------------|
| Section-scoped reads are self-sufficient | Framing classify + principle clause + AP sibling + path-pins |
| Cross-section deps use anchors | Three named resources in rows 3–5 |
| Classify before delivery-layer C | Arithmetic: orientation-heavy → **no C** |

---

## Drafting order

1. **Rows 1–5** — canon + three cross-section fixes — **done** (`b7afc864`).
2. **Framing classify → path-pinned edits** — rows 6–11 — **this wave**.
3. **Variant C** — **skipped** (orientation-dominated).

**Rationale:** Fixed anchors and canon ship without waiting on full framing; classify before C so delivery never cements duplicates; C deferred when orientation dominates.
