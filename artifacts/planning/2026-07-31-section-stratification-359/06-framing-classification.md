# Framing classification — #359

**Status:** in progress (seed + known sites)
**Method:** For each resource with ≥1 anchored citer: measure framing outside any `##` span; check whether citing technique(s) already state the obligation; classify **duplicate** / **operative-unique** / **orientation**.

## Arithmetic (running)

| Class | Count | Notes |
|-------|------:|-------|
| duplicate | 1 | `complete-wp-guide` (issue sample) |
| operative-unique | 3 | `schema-construct-inventory`, `planning-readme`, `workflow-retrospective` (issue sample) |
| orientation | 0 | — |
| pre-heading prose | 2 | `prism/definitive-findings-template`, `prism/final-output-template` |
| cross-section (not framing) | 3 | Fixed in rows 3–5 of scope manifest |
| **remaining to classify** | ~63 | Full corpus pass still open |

**C gate:** Prefer variant C only when **operative-unique** dominates the ~69. Sample of 4 is biased and **does not** unlock C.

## Known dispositions (from #359 body)

| Resource | Class | Treatment |
|----------|-------|-----------|
| `work-package/complete-wp-guide` | duplicate | Delete framing that restates `create-complete-doc` Protocol |
| `workflow-design/schema-construct-inventory` | operative-unique | Mint `##` for universal obligation + schema table (or move to technique) |
| `meta/planning-readme` | operative-unique | Framing constraints must live in a section citers can request |
| `work-package/workflow-retrospective` | operative-unique | Structural nesting constraint under a named `##` |
| `prism/definitive-findings-template` | pre-heading | Move prose under a heading |
| `prism/final-output-template` | pre-heading | Move prose under a heading |
| `meta/planning-readme#progress-status-call-sites` | cross-section | **Done** — anchored `#status-vocabulary` |
| `work-package/architecture-summary#diagram-selection` | cross-section | **Done** — anchored artifact template |
| `work-package/pr-description#link-row-forms` | cross-section | **Done** — glyph key in section |

## Next

1. Enumerate all resources with anchored citers (exclude anti-patterns body-size work).
2. Script or batch-read: framing char count before first `##`.
3. For each: technique cross-check → classify → path-pin edit rows into scope manifest.
4. Refresh impact removals inventory before any delete commits.
