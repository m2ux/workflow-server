# Scope Manifest — Planning Retrospective Findings

**Target:** `workflow-design` v1.28.0 (primary) · `work-package` v3.33.0 (secondary) · **Mode:** update
**Basis:** [design specification](03-design-specification.md) · [impact](05-impact-analysis.md)
**Worktree:** `/home/mike1/projects/work/workflows/2026-07-21-planning-retrospective-findings/` ✅ · folder layout unchanged

Modify both catalogs in place (no activity add/remove/reorder). Intentional removals: **7** ([impact §3](05-impact-analysis.md)); Gate 2 open on rows 1–3 (A-3, A-4).

`file_count` = **48**

---

## File manifest

| # | Path (under worktree root) | Type | Action | One-line change |
|---|-------------------------------|------|--------|-----------------|
| 1 | `workflow-design/workflow.yaml` | workflow | modify | Version bump 1.28.0→1.29.0; optional bag key if A-11 needs `assumption_decisions` |
| 2 | `workflow-design/activities/01-intake-and-context.yaml` | activity | modify | Bind `manage-artifacts::write-artifact` for inventory/format persists; MCP resource-read fallback note on format-literacy path |
| 3 | `workflow-design/activities/03-requirements-refinement.yaml` | activity | modify | Bind `write-artifact` for design-spec persist; A-11 producer/binding for `assumption_decisions` |
| 4 | `workflow-design/activities/04-pattern-analysis.yaml` | activity | modify | Bind `write-artifact` for pattern-analysis persist |
| 5 | `workflow-design/activities/05-impact-analysis.yaml` | activity | modify | Bind `write-artifact` for impact-analysis persist |
| 6 | `workflow-design/activities/06-scope-and-draft.yaml` | activity | modify | Bind `write-artifact` for scope/draft/attestation persists; earlier binding-fidelity checks in draft-attestation path |
| 7 | `workflow-design/activities/08-quality-review.yaml` | activity | modify | Bind `write-artifact` for findings-satellite persists |
| 8 | `workflow-design/activities/09-validate-and-commit.yaml` | activity | modify | Completed-steps manifest includes all executed steps; earlier binding-fidelity handoff |
| 9 | `workflow-design/activities/10-post-update-review.yaml` | activity | modify | Bind `write-artifact` where audit persists run |
| 10 | `workflow-design/activities/11-retrospective.yaml` | activity | modify | Bind `write-artifact` for completion/retrospective persists |
| 11 | `workflow-design/techniques/TECHNIQUE.md` | technique | modify | Canonical-home map: add `follow-ups.md` (in-task) vs `deferred-items.md` (out-of-scope) |
| 12 | `workflow-design/techniques/intake-classification.md` | technique | modify | Drop protocol-only `write-artifact` invoke; persist via bound activity step; plain-technical-language trim |
| 13 | `workflow-design/techniques/context-loading.md` | technique | modify | Same write-artifact step handoff; MCP `get_resource` fallback codified |
| 14 | `workflow-design/techniques/persist-design-specification.md` | technique | modify | write-artifact → bound step; protocol tail trim |
| 15 | `workflow-design/techniques/pattern-analysis.md` | technique | modify | write-artifact → bound step; protocol tail trim |
| 16 | `workflow-design/techniques/impact-analysis.md` | technique | modify | write-artifact → bound step; protocol tail trim |
| 17 | `workflow-design/techniques/scope-definition.md` | technique | modify | write-artifact → bound step; protocol tail trim |
| 18 | `workflow-design/techniques/assemble-file-approach.md` | technique | modify | write-artifact → bound step; protocol tail trim |
| 19 | `workflow-design/techniques/review-drafted-file.md` | technique | modify | write-artifact → bound step; protocol tail trim |
| 20 | `workflow-design/techniques/review-draft-yaml.md` | technique | modify | write-artifact → bound step; add binding-fidelity checks at attestation |
| 21 | `workflow-design/techniques/audit-anti-patterns.md` | technique | modify | write-artifact → bound step; protocol tail trim |
| 22 | `workflow-design/techniques/audit-principles.md` | technique | modify | write-artifact → bound step; protocol tail trim |
| 23 | `workflow-design/techniques/audit-expressiveness.md` | technique | modify | write-artifact → bound step; protocol tail trim |
| 24 | `workflow-design/techniques/audit-rule-enforcement.md` | technique | modify | write-artifact → bound step; protocol tail trim |
| 25 | `workflow-design/techniques/audit-rule-hygiene.md` | technique | modify | write-artifact → bound step; protocol tail trim |
| 26 | `workflow-design/techniques/audit-conformance.md` | technique | modify | write-artifact → bound step; protocol tail trim |
| 27 | `workflow-design/techniques/verify-high-findings.md` | technique | modify | write-artifact → bound step; protocol tail trim |
| 28 | `workflow-design/techniques/persist-report.md` | technique | modify | write-artifact → bound step; protocol tail trim |
| 29 | `workflow-design/techniques/create-completion-doc.md` | technique | modify | write-artifact → bound step; protocol tail trim |
| 30 | `workflow-design/techniques/conduct-retrospective.md` | technique | modify | write-artifact → bound step; protocol tail trim |
| 31 | `workflow-design/resources/anti-patterns.md` | resource | modify | Add MR-1..MR-4 authoring-guidance entries |
| 32 | `workflow-design/resources/format-conventions.md` | resource | modify | Transition-condition quoting / `isDefault` guidance; plain-technical-language note |
| 33 | `workflow-design/resources/follow-ups.md` | resource | create | In-task follow-ups template (pair with deferred-items split) |
| 34 | `work-package/workflow.yaml` | workflow | modify | Version bump 3.33.0→3.34.0; loop/bag vars for block-interview `forEach` if new ids needed |
| 35 | `work-package/activities/01-start-work-package.yaml` | activity | modify | A-7: ensure `detect-project-type` lands `project_type` in session bag (binding/default clarity) |
| 36 | `work-package/activities/05-implementation-analysis.yaml` | activity | modify | Remove `analysis-confirmed`; autonomous gap-fill then auto-proceed (A-4, Gate 2) |
| 37 | `work-package/activities/08-implement.yaml` | activity | modify | Remove `switch-model-pre-impl` / `switch-model-post-impl` (A-3, Gate 2) |
| 38 | `work-package/activities/10-post-impl-review.yaml` | activity | modify | Wrap `block-interview` in `forEach` + confirm-before-exit; manual-edit detection |
| 39 | `work-package/activities/14-complete.yaml` | activity | modify | Retrospective interview one-item-at-a-time / confirm-before-continuing shape |
| 40 | `work-package/activities/README.md` | readme | modify | Diagram nodes for removed/restructured checkpoints |
| 41 | `work-package/resources/manual-diff-review.md` | resource | modify | Block titles → `file:line` hyperlinks; drop Instructions + file index table |
| 42 | `work-package/techniques/review-diff.md` | technique | modify | Protocol aligned to new index form (no Instructions/table) |
| 43 | `work-package/resources/deferred-items.md` | resource | modify | Out-of-scope-only; drop in-task / post-completion follow-ups claim |
| 44 | `work-package/resources/follow-ups.md` | resource | create | In-task follow-ups template |
| 45 | `work-package/techniques/manage-artifacts/TECHNIQUE.md` | technique | modify | Canonical-home: in-task `follow-ups.md` vs out-of-scope `deferred-items.md` |
| 46 | `work-package/techniques/project-type-detection.md` | technique | modify | Output/default clarity for A-7 bag seeding contract |
| 47 | `work-package/techniques/conduct-retrospective/retrospective.md` | technique | modify | Dedicated-session interview: one item, confirm before continue |
| 48 | `work-package/resources/workflow-retrospective.md` | resource | modify | Format aligned to one-item interview |

**Out of scope this pass:**
- MCP server source (`src/`, `schemas/`)
- Activity add/remove/reorder in either workflow
- Dimension-confirmation checkpoint consolidation in `requirements-refinement` (flagged only; self-referential AP-81/82)
- `path_gating_complexity` vs `problem_complexity` rename (D-1 deferred)
- Soften-in-place alternatives for A-3/A-4 if Gate 2 picks keep — draft assumes full removal per design brief

---

## Structural design

```
{worktree}/                    # unchanged top-level layout
├── workflow-design/
│   ├── workflow.yaml          # version bump
│   ├── activities/            # 9 activities: bind write-artifact; A-11; completed-steps
│   ├── techniques/            # TECHNIQUE.md map + 19 write-artifact leaves
│   └── resources/             # anti-patterns MR-1..4; format-conventions; +follow-ups.md
└── work-package/
    ├── workflow.yaml          # version bump + loop vars
    ├── activities/            # 01/05/08/10/14 + README diagrams
    ├── techniques/            # review-diff; manage-artifacts map; project-type; retrospective
    └── resources/             # manual-diff-review; deferred-items; +follow-ups; retrospective guide
```

**Flow:** Topology unchanged — in-place step/technique/resource edits only. Soft checkpoints A-3/A-4 removed (pending Gate 2); `block-interview` gains a `forEach` wrapper mirroring existing `review-fix-cycle` loop discipline.

| Pattern | This change |
|---------|-------------|
| Bound `write-artifact` step | **Primary** — activity `steps[]` bind `manage-artifacts::write-artifact` (as in `15-codebase-comprehension.yaml`); technique protocol stops being the only invoke path |
| Loop-bound block-interview | `forEach` over flagged blocks + confirm-before-exit |
| Soft-gate removal | Drop `switch-model-*` and `analysis-confirmed` (Gate 2) |
| Canonical-home split | `follow-ups.md` (in-task) vs `deferred-items.md` (out-of-scope) |
| Change-block index | Hyperlink Block titles to `file:line`; no Instructions / file-index table |
| Authoring canon | MR-1..MR-4 in `anti-patterns.md` |

---

## Drafting order

1. **Resources / canon** — `follow-ups.md` (both), `deferred-items.md`, `anti-patterns.md`, `format-conventions.md`, `manual-diff-review.md`, `workflow-retrospective.md` (templates before callers)
2. **Technique leaves** — write-artifact handoff + `review-diff` / `project-type-detection` / `conduct-retrospective` / manage-artifacts + WD `TECHNIQUE.md` maps
3. **Activities** — bind steps and structural YAML (WD 01–11; WP 01/05/08/10/14) after technique contracts exist
4. **workflow.yaml + READMEs** — version bumps, bag vars, diagram nodes last

**Rationale:** Templates and technique contracts first so activity bindings reference stable operations; version/README orientation closes after shape is known.
