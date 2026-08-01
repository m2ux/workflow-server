# Impact Analysis — Bind gitnexus graph operations into workflow-authoring

**Workflow:** `workflow-authoring` v1.1.0
**Mode:** Update
**Date:** 2026-08-01
**Change source:** [Change brief](01-change-brief.md)
**Baseline:** `workflow-authoring` on branch `workflow/310-workflow-authoring-gitnexus` @ 703817ef (see the brief's Baseline line for the inventory)

---

## Summary

Additive change: four activity files gain graph-op-bound steps and activity/technique-surface directives, `workflow.yaml` takes a minor version bump, and the README gains a tooling note. No activity is added, removed or reordered, so the transition topology is intact; no content is removed.

**Removals inventoried:** 0

---

## 1. Impact classification

### Directly modified

| File | Why |
|------|-----|
| `workflow.yaml` | Minor version bump 1.1.0 → 1.2.0; new variable declarations if bound ops land outputs in the bag |
| `activities/01-intake-and-context.yaml` | Gains query/context-style op binding for prior-art and context loading |
| `activities/06-scope-and-draft.yaml` | Gains `gitnexus-operations::scope-discipline-check` binding for scope-manifest verification |
| `activities/08-quality-review.yaml` | Gains impact / orphan-scan style op bindings for the audit passes |
| `activities/09-validate-and-commit.yaml` | Gains change-detection binding ahead of commit |
| `README.md` | Updated where it lists tooling (currently carries no gitnexus mention) |

### Possibly touched at draft time

| File | Why |
|------|-----|
| `techniques/workflow-definition/intake-classification.md` | Candidate technique surface for a graph-first context-loading directive |
| `techniques/workflow-definition/scope-verification.md` | Candidate surface if the scope-discipline directive lands on the technique rather than the activity |
| `techniques/workflow-definition/audit-canon.md` | Quality-review pass that hand-traverses rule/step/technique relationships today |
| `techniques/workflow-definition/verify-high-findings.md` | Quality-review verification pass; may cite graph ops for re-derivation |
| `techniques/workflow-definition/commit-verification.md` | Candidate surface for the pre-commit change-detection directive |
| `techniques/README.md` | May need its technique catalog notes touched if group usage is listed |

### Unaffected

30 files: all 9 `resources/*.md` plus `resources/README.md`, `activities/README.md`, `techniques/TECHNIQUE.md`, `techniques/workflow-definition/TECHNIQUE.md`, and the 16 `workflow-definition` operations not named above. `meta/techniques/gitnexus-operations/` is out of scope by the brief.

---

## 2. Integrity checks

| Check | Verdict |
|-------|---------|
| Transitions, entry activity, reachability | Pass — no activity added/removed/reordered; all `transitions[].to` targets (`scope-and-draft`, `quality-review`, `validate-and-commit`, `__terminal__`) resolve; `initialActivity: intake-and-context` valid; every activity has an incoming edge or is initial |
| Technique and resource references | Pass — all 22 `workflow-definition::*` step refs plus `workflow-definition::apply-audit-fixes` (structured form, 08-quality-review), `workflow-engine::create-readme` and `work-package::manage-artifacts::write-artifact` resolve to existing files; new cross-group refs must be written qualified (`gitnexus-operations::<op>`) |
| Variables, checkpoint effects, step gates | Pass — every `condition.variable`, `when` reference and `setVariable` key resolves to a declared variable; no orphans (`headless_mode` is read by the workflow rules block; `pr_url`/`pr_number` land from compose-publication outputs) |

---

## 3. Removals inventory

Omitted — the change is additive; nothing is removed. The README tooling update amends text in place without dropping sections.

---

## Change constraints

Co-change sets (must move together for coherence):

1. Activity step additions ↔ `workflow.yaml` version bump ↔ README tooling note — one delivery.
2. Any bound-op output landed in the bag ↔ its `variables[]` declaration in `workflow.yaml`.
3. Any worker-facing graph directive ↔ its receiving surface (activity `rules.activity` or technique `## Rules`) — never a `workflow.yaml` rule (AP-23).

Identifier-collision set (names already taken in the target):

- Step ids within each of the four activities (e.g. `classify-intake`, `derive-target-path`, `persist-change-brief` in 01).
- The 40 declared variable names in `workflow.yaml`.
- The 23 `workflow-definition` op ids — a new local op must not collide, and a bare op id sharing an activity's name resolves activity-group-first.

---

## Decision ask

Confirm the impact scope — removals inventory is empty, so no removal approval is required.
