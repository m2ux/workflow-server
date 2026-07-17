# Scope Manifest — pattern_analysis Output + #template cites

**Target:** `workflow-design` v1.24.3 · **Mode:** update
**Basis:** [design specification](03-design-specification.md) · [impact](05-impact-analysis.md)
**Worktree:** `/home/mike1/projects/work/workflows/2026-07-17-workflow-design-slim-planning-artifacts/workflow-design` ✅ · folder layout unchanged

Seven technique files: declare undeclared `{pattern_analysis}` Output; append `#template` on bare persist/compile guide cites. Intentional removals: **0** ([impact §3](05-impact-analysis.md)).

`file_count` = **7**

---

## File manifest

| # | Path (under `workflow-design/`) | Type | Action | One-line change |
|---|-------------------------------|------|--------|-----------------|
| 1 | `techniques/pattern-analysis.md` | technique | modify | Add `### pattern_analysis` Output; persist cite → `#template`; bump 1.2.2 → 1.2.3 |
| 2 | `techniques/intake-classification.md` | technique | modify | Persist cite → `structural-inventory.md#template`; bump 2.4.0 → 2.4.1 |
| 3 | `techniques/assemble-file-approach.md` | technique | modify | Persist cite → `drafting-plan.md#template`; bump 1.2.2 → 1.2.3 |
| 4 | `techniques/review-drafted-file.md` | technique | modify | Persist cite → `file-review-note.md#template`; bump 1.2.1 → 1.2.2 |
| 5 | `techniques/review-draft-yaml.md` | technique | modify | Persist cite → `draft-attestation.md#template`; bump 1.1.2 → 1.1.3 |
| 6 | `techniques/persist-design-specification.md` | technique | modify | Persist cite → `design-specification.md#template`; bump 1.1.3 → 1.1.4 |
| 7 | `techniques/compile-report.md` | technique | modify | Guide/compile cites → `compliance-report.md#template`; bump 1.2.3 → 1.2.4 |

**Out of scope this pass:**
- `workflow.yaml` patch 1.24.3 → 1.24.4 (defer to validate-and-commit)
- All 9 activity YAML files, remaining techniques, all 22 resources, README, technique container

---

## Structural design

```
workflow-design/   # unchanged
├── workflow.yaml
├── README.md
├── activities/     # untouched
├── techniques/     # 7 leaves modified
└── resources/      # untouched
```

**Flow:** Topology unchanged — no activity add/remove/reorder; `initialActivity` and transitions intact.

| Pattern | This change |
|---------|-------------|
| Outputs declare products | `pattern_analysis` Output matches assembled bag product |
| Assemble vs persist cite parity | Persist/compile steps use same `#template` anchor as assemble steps |
| Additive-only | Zero removals; no resource/activity edits |

---

## Drafting order

1. **Techniques (Output first)** — `pattern-analysis.md` (declare Output + cite + version)
2. **Techniques (cite-only)** — intake-classification → assemble-file-approach → review-drafted-file → review-draft-yaml → persist-design-specification → compile-report

**Rationale:** High binding-gap fix first; remaining files are independent one-line cite + patch bumps.
