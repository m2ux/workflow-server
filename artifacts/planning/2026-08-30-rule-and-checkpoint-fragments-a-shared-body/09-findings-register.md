# Findings Register — `work-package`, `remediate-vuln`

**Date:** 2026-08-31 · **Mode:** Update · **Remediation round:** 1
**Base ref:** [`bc52c69`](https://github.com/m2ux/workflow-server/tree/bc52c6968eb3f603d77adb03474b6bde48f2aaff) · **Targets:** `work-package` v4.0.0, `remediate-vuln` v3.0.0
**Change surface:** 3 files (touched: 3 whole files · I/O-contract closure: 0 · consumers: 0)

## Summary

| Severity | Open | Known |
|----------|-----:|------:|
| Critical | 0 | 0 |
| High     | 0 | 0 |
| Medium   | 0 | 0 |
| Low      | 1 | 0 |

**Coverage:** walked 9 · not-applicable 114 · blocked 2 · evidence rows 12

Round 1 resolved the High and the Medium. One Low stays open: its remedy is in the server
repository, outside this run's edit surface.

## Change surface

| Path | How it joined |
|------|----------------|
| `meta/techniques/agent-conduct.md` | touched (whole file) |
| `meta/techniques/verify-artifact-conforms.md` | touched (whole file) |
| `workflow-design/resources/schema-construct-inventory.md` | touched (whole file) |

All three sit outside both targets. `work-package` and `remediate-vuln` each measure an empty
change surface, because the two defects the walk found live in the shared canon both targets
read rather than in either target's own files.

## Findings

| ID | Severity | Entry | Location | Evidence | Origin | Known | Fix |
|----|----------|-------|----------|----------|--------|-------|-----|
| F1 | High | `anchored-protocol-references` | `meta/techniques/agent-conduct.md` rule `communication-artifact-writing-register`; `meta/techniques/verify-artifact-conforms.md` protocol step 2 | Both cited the register by a path correct on disk that projected to the bare id `writing-register`, which resolves only under `meta`. `get_resource { writing-register }` returned *Resource not found … in workflow workflow-authoring*. 15 activity files across 15 workflows bind `verify-artifact-conforms`; the `agent-conduct` rule reaches every workflow's activity rule block. | pre-existing | — | **Resolved (round 1)** — both citations respelled `../../meta/resources/writing-register.md`; each now projects to `meta/writing-register` in the rendered link and in `resource_refs`. |
| F2 | Medium | `schema-construct-inventory` | `workflow-design/resources/schema-construct-inventory.md` § Workflow-Level Constructs | The section mapped six constructs and the file carried no occurrence of `fragments`, while `schemas/workflow.schema.json` declares it at workflow scope with eight `$ref` sites resolving through `fragments.checkpoints`. | pre-existing | — | **Resolved (round 1)** — one row added mapping the shared-gate pattern to `fragments.checkpoints` and the `ref` step form. |
| F3 | Low | `stale-triage-entry` | `scripts/binding-fidelity-triage.json`, entry for `prism-update/workflow.yaml:15` | `check-binding-fidelity` reports the triaged `read-resolution` finding no longer occurs, so the entry matches nothing and the guard stays red on it. The path is outside both targets and outside round 1's three files. | pre-existing | — | **Open** — delete the stale entry. The file is in the server repository, outside this run's edit surface, so this run does not fix it. |

### Round 1 record

| Finding | Files | Change | Post-edit validation |
|---------|-------|--------|----------------------|
| F1 | `meta/techniques/agent-conduct.md`, `meta/techniques/verify-artifact-conforms.md` | Citation respelled, `+1 / −1` each | Projection yields `meta/writing-register`; `resource-anchors` OK; `no unanchored protocol references` PASS |
| F2 | `workflow-design/resources/schema-construct-inventory.md` | One table row, `+1 / −0` | `workflow-yaml` OK for `workflow-design` |

No collateral change, and no reduction — the round is additive, so the [removals inventory](01-impact-analysis.md) stays at zero.

The respelling matches established convention rather than introducing one: every other meta
technique citing a meta resource already uses the qualified form, 32 citations across nine
files under `meta/techniques/workflow-engine/`. After round 1 no `../resources/` citation
remains anywhere in `meta/techniques/`.

## Coverage

### Divergences

| Home | Unit | Status |
|------|------|--------|
| All four homes (`work-package`) | Full-surface sweep of 171 files | `blocked` — not walked; the target's own change surface is empty, and the round's edits lie outside it |
| All four homes (`remediate-vuln`) | Full-surface sweep of 14 files | `blocked` — same |
| Design Principles | 34 units × 2 targets | `not-applicable` — a principle is applied to authored content, and neither target's files are authored by this run |
| Anti-Patterns, Schema Construct Inventory, Convention Conformance | 21 units × 2 targets | `not-applicable` — no file under either target is created, modified or removed |
| Anti-Patterns (round surface) | `creation-rules`, `interaction-`, `tool-technique-doc-consistency-`, `execution-` | `not-applicable` — no file created, and no gate, tool surface or activity construct on the three files |

### Coverage evidence

Nine units walked against the round's three whole files, 12 evidence rows.

| Unit | File | Field | Disposition | Quote |
|------|------|-------|-------------|-------|
| `coupling-anti-patterns` | `agent-conduct.md` | rule `communication-artifact-writing-register` | `anchored-protocol-references` → fixed | `](../../meta/resources/writing-register.md)` |
| `coupling-anti-patterns` | `verify-artifact-conforms.md` | protocol step 2, bullet 3 | `anchored-protocol-references` → fixed | `](../../meta/resources/writing-register.md)` |
| `rule-hygiene-anti-patterns` | `agent-conduct.md` | 14 `### rule-name` bodies | clean | rules cite homes rather than restating them |
| `description-hygiene-anti-patterns` | `agent-conduct.md` | `## Capability` | clean | "Cross-cutting behavioral boundaries every agent in a run is held to" |
| `description-hygiene-anti-patterns` | `verify-artifact-conforms.md` | `## Capability` | clean | "Conformance of a folder's persisted artifacts to the guide each filename maps to" |
| `description-hygiene-anti-patterns` | `schema-construct-inventory.md` | purpose paragraph | clean | "Maps informal patterns … to their formal schema equivalents" |
| `technique-protocol-anti-patterns` | `verify-artifact-conforms.md` | `## Protocol` steps 1–4 | clean | atomic produce path, no `::` invocation for work |
| `output-economy-anti-patterns` | `verify-artifact-conforms.md` | `artifact_conformance` + 3 components | clean | `conforms` / `violations` / `unmeasured` |
| `structural-anti-patterns` | all three | section structure | clean | template-conformant per `check-technique-template` |
| `canon-hygiene-anti-patterns` | `schema-construct-inventory.md` | § Workflow-Level Constructs | clean | new row cites the construct, restates no criteria |
| `schema-expressiveness-anti-patterns` | `schema-construct-inventory.md` | new row, 3 cells | clean | `fragments.checkpoints.<name>` … `ref: [workflow::]name` |
| `reference-conventions` | `agent-conduct.md`, `verify-artifact-conforms.md` | citation form | clean | matches 32 sibling citations under `meta/techniques/workflow-engine/` |

**Caveat on the baselined exclusions.** 42 class-keyed exclusions fall inside the walk's
scope (`work-package` 7, `remediate-vuln` 0, `meta` 34, `workflow-design` 1), every one
verdict `harmless`, and none suppressed a finding this run raised. All rest on triage against
corpus `3569e937`, which the guard itself reports as 287 commits behind the `bc52c696`
checkout. An exclusion triaged 287 commits ago is a judgement about a corpus that has moved,
so it is carried rather than relied on.

**A property of the sweep, not of this change.** The per-target walk scopes touched files to
`{target_path}/{target_workflow_id}`, so a remediation round whose edits land outside every
named target cannot be reached by it. Both targets therefore report an empty change surface
while the run changes three files. The evidence above exists because the round's own change
surface was walked as its own section.

## Sources

| Label | Path |
|-------|------|
| Change brief | [`01-change-brief.md`](01-change-brief.md) |
| Impact analysis | [`01-impact-analysis.md`](01-impact-analysis.md) |
| Scope manifest | [`06-scope-manifest.md`](06-scope-manifest.md) |
| Binding-fidelity triage baseline | `scripts/binding-fidelity-triage.json` |
