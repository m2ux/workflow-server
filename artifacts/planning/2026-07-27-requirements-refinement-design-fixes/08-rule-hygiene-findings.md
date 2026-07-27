# Rule Hygiene Findings — `requirements-refinement`

**Mode:** update · **Date:** 2026-07-27
**Pass:** rule-hygiene
**Target:** `requirements-refinement` v1.2.0

Scope: `## Rule Hygiene Anti-Patterns` (AP-19 – AP-25) against `workflow.yaml` `rules[]`, activity `rules[]`, and technique `## Rules`.

## Findings

Every finding below is a **content removal that no [impact analysis](05-impact-analysis.md) row inventories**, so none is applied here — all five carry to Gate 2 as removals-inventory additions.

| ID | Severity | Finding | Location | Rule key | Fix |
|----|----------|---------|----------|----------|-----|
| H-1 | Medium | `single-rule-authority` (AP-22) — the protocol-preservation invariant is declared at two levels workers both receive, so the copies drift. Drift is already present: the `workflow.yaml` copy inlines four identifier schemes while `specification-protocol.md#identifier-schemes` defines seven | `workflow.yaml` `rules.activity[0]` ↔ `techniques/TECHNIQUE.md` | `specification-protocol-preserved` | Keep the container rule (every technique inherits it and every technique writes the spec); delete the `workflow.yaml` entry |
| H-2 | Medium | `single-rule-authority` (AP-22) — the planning-folder / no-git / never-edit-in-place invariant is declared at two levels. The `workflow.yaml` copy additionally enumerates the five artifacts, re-encoding the `#### artifact` declarations that are their single source of truth | `workflow.yaml` `rules.activity[2]` ↔ `techniques/TECHNIQUE.md` | `artifacts-confined-to-planning-folder` | Keep the container rule; delete the `workflow.yaml` entry |
| H-3 | Medium | `no-rule-protocol-restatement` (AP-19) — restates `intake-sources.md` Protocol 3 and `analyze-source.md` Protocol 3 near-verbatim, adding no invariant the steps do not convey | `workflow.yaml` `rules.activity[1]` | (source classification) | Delete; the two Protocols are the procedural source |
| H-4 | Medium | `no-rule-protocol-restatement` (AP-19) — restates `update-specification.md` Protocol 2 bullet 3 in substance, adding no invariant | `workflow.yaml` `rules.activity[3]` | (preserve vs instantiate structure) | Delete |
| H-5 | Medium | `no-rule-protocol-restatement` (AP-19) — restates four other homes: `validate-specification.md` Protocol 2, its `coverage-gaps-are-correctable` rule, `analyze-source.md`'s `every-normative-statement-is-mapped` rule, and `validation-rubric.md#source-coverage`. The trailing "routed through the correction loop" also restates `04`'s transition | `workflow.yaml` `rules.activity[4]` | (source-coverage check) | Delete |

**Finding count:** 5

## Notes

- **Why none is applied:** principle 10 Non-Destructive Updates ([specification](03-design-specification.md) Rules row) requires every removal to be listed for explicit approval, and the impact analysis's 15 removal rows cover none of these five. Applying them would silently invalidate the `has_unflagged_removals = false` attestation. They belong in the Gate 2 batch.
- **The end state is conventional, not radical.** Emptying `rules.activity` would leave requirements-refinement matching siblings that already carry no activity-bucket rules — `codebase-wiki` declares `activity: []` outright, and `work-package`, `work-packages`, and `meta` declare `rules.workflow` only.
- **`rules.universal[1]`** ("Confirm the requirements analysis with the user before applying any changes") is **not** flagged: it is backed by the `analysis-confirmed` checkpoint plus `01`'s `analysis_confirmed` transition condition, so it is a structurally-backed invariant rather than a bare restatement.
- **Audience buckets are correct** (AP-37, checked though it sits outside this pass): the five `rules.activity` entries are worker-directed content invariants and `rules.activity` is injected into `get_activity`. The two `rules.universal` entries would sit more precisely under `rules.activity` — they command the worker only, not the orchestrator — but this is subsumed by H-1 – H-5 and by [enforcement finding N-3](08-enforcement-findings.md).
- Clean against the rest of the pass: no `grouped-rule-keys` (AP-21) sprawl — the eight technique rules share no naming family; no `no-contradictory-rules` (AP-24) — `non-sequential-identifiers-accepted` and the Identifiers rubric check agree, as do the two promotion rules; no `worker-rule-reach` (AP-23) violation — nothing worker-directed is stranded under `rules.workflow`, which this workflow does not declare.
- `update-specification.md`'s `one-advance-per-correction-pass` restates its own `correction_iteration` Output description, a borderline `no-one-step-rules` (AP-25) case. **Not flagged here** — the [specification](03-design-specification.md) Technique-surface row explicitly directed this file to gain a `## Rules` section, and the rule carries the load-bearing termination invariant tracked as [enforcement finding N-2](08-enforcement-findings.md).
