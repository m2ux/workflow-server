# Scope Manifest — pattern_analysis Output + #template cites + quality-review auto-fix

**Target:** `workflow-design` v1.24.4 · **Mode:** update
**Basis:** [design specification](03-design-specification.md) · [impact](05-impact-analysis.md)
**Worktree:** `/home/mike1/projects/work/workflows/2026-07-17-workflow-design-slim-planning-artifacts/workflow-design` ✅ · folder layout unchanged

Nine files across two change blocks on the same PR branch: seven technique files (declare undeclared `{pattern_analysis}` Output; append `#template` on bare persist/compile guide cites), plus the quality-review auto-fix follow-on (`activities/08-quality-review.yaml` + `activities/README.md`). Intentional removals: **4** — the four per-pass disposition checkpoints ([impact §4](05-impact-analysis.md#4-follow-on-change--quality-review-auto-fix-2026-07-17-return-to-draft)).

`file_count` = **9**

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
| 8 | `activities/08-quality-review.yaml` | activity | modify | Remove `expressiveness-confirmed` / `conformance-confirmed` / `rule-hygiene-confirmed` / `enforcement-confirmed` checkpoints; add a non-checkpoint flagged-findings action per pass; rebase `classify-audit-findings`/`reassess-audit-fixes` on finding counts; bump 1.12.2 → 1.12.3 |
| 9 | `activities/README.md` | readme | modify | Update Quality Review blurb — no more per-pass confirmation checkpoints, findings are fixed automatically |

**Out of scope this pass:**
- All remaining activity YAML files (01, 03, 04, 05, 06, 09, 10, 11), remaining techniques, all 22 resources, workflow README, technique container

---

## Structural design

```
workflow-design/
├── workflow.yaml           # patch bump only (v1.24.4, prior pass)
├── README.md                # unchanged
├── activities/
│   ├── 08-quality-review.yaml  # modified — 4 checkpoints removed, findings-driven fix logic
│   └── README.md               # modified — Quality Review blurb
├── techniques/               # 7 leaves modified (prior pass, unchanged this pass)
└── resources/                 # untouched
```

**Flow:** Topology unchanged — no activity add/remove/reorder; `initialActivity` and transitions intact. `quality-review`'s internal step sequence loses four checkpoint steps but keeps every technique/action step and the `audit-fix-cycle` loop + `blocker-gate` decision.

| Pattern | This change |
|---------|-------------|
| Outputs declare products | `pattern_analysis` Output matches assembled bag product (prior pass) |
| Assemble vs persist cite parity | Persist/compile steps use same `#template` anchor as assemble steps (prior pass) |
| Findings drive fixes, not elections | `needs_audit_fixes` derives from finding counts, not from a user-chosen disposition option (this pass) |
| Additive where possible | Prior pass is additive-only; this pass's 4 removals are intentional per explicit user directive, not discovered drift |

---

## Drafting order

1. **Techniques (Output first)** — `pattern-analysis.md` (declare Output + cite + version) *(prior pass)*
2. **Techniques (cite-only)** — intake-classification → assemble-file-approach → review-drafted-file → review-draft-yaml → persist-design-specification → compile-report *(prior pass)*
3. **Activity (quality-review auto-fix)** — `activities/08-quality-review.yaml` (remove checkpoints, add flagged-findings actions, rebase classification logic, bump version)
4. **README (orientation)** — `activities/README.md` (Quality Review blurb, drafted last so it describes the activity's final shape)

**Rationale:** High binding-gap fix first; independent one-line cite + patch bumps next; the activity's structural edit before the README that describes it, so the orientation doc never describes stale behavior.
