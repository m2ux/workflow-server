# Findings Register — `work-package`, `remediate-vuln`

**Date:** 2026-08-30 · **Mode:** Update
**Base ref:** [`bc52c69`](https://github.com/m2ux/workflow-server/tree/bc52c6968eb3f603d77adb03474b6bde48f2aaff) · **Targets:** `work-package` v4.0.0, `remediate-vuln`
**Change surface:** 0 files (touched: 0 whole files · I/O-contract closure: 0 · consumers: 0)

## Summary

| Severity | Open | Known |
|----------|-----:|------:|
| Critical | 0 | 0 |
| High     | 1 | 0 |
| Medium   | 1 | 0 |
| Low      | 0 | 0 |

**Coverage:** walked 2 · not-applicable 53 · blocked 1 · evidence rows 0

The change surface is empty, so the Change surface section is omitted and no walked unit
carries an evidence obligation. Both findings sit in shared canon reached from the targets,
neither in a target's own files; both are pre-existing at the base ref and off the change
surface, so neither bears on what this run commits.

## Findings

| ID | Severity | Entry | Location | Evidence | Origin | Known | Fix |
|----|----------|-------|----------|----------|--------|-------|-----|
| F1 | High | `anchored-protocol-references` | `meta/techniques/agent-conduct.md`, rule `communication-artifact-writing-register`; `meta/techniques/verify-artifact-conforms.md`, protocol step at line 58 | Both write `[Artifact Writing Register](../resources/writing-register.md)`, which is correct on disk — `meta/resources/writing-register.md` is the corpus's only copy. Projected into a non-meta workflow the link collapses to the bare id `writing-register`: this run's own `get_activity` bundle for `workflow-authoring` renders the rule as `](writing-register)`, and `get_resource { writing-register }` under that session returns `Resource not found: writing-register in workflow workflow-authoring`. 15 activity files across 15 workflows bind `verify-artifact-conforms`; the `agent-conduct` rule reaches every workflow's activity rule block. | pre-existing | — | Spell both citations `../../meta/resources/writing-register.md`. The path is correct on disk, and both projections then emit the qualified id `meta/writing-register`. |
| F2 | Medium | `schema-construct-inventory` | `workflow-design/resources/schema-construct-inventory.md`, § Workflow-Level Constructs (workflow.schema.json) | The section's rows map `variables[]`, the activation variable, `rules`, `techniques`, `initialActivity` and `graph`; the file carries no occurrence of `fragments` at all, while `schemas/workflow.schema.json` declares `fragments` at workflow scope and eight `$ref` sites in that schema resolve through `fragments.checkpoints`. | pre-existing | — | Add a Workflow-Level Constructs row mapping the informal pattern — one gate body several activities present — to `fragments.checkpoints` and the `{ ref }` checkpoint-step form that reaches it. |

### Remediation routing

Round 1 was selected at the disposition gate. Both fixes land in the corpus, in the
existing worktree on `workflow/work-package-borrowed-gate-variables`. Neither needs a
server-source branch.

| ID | Component | Path | Edit |
|----|-----------|------|------|
| F1 | corpus (`meta`) | `meta/techniques/agent-conduct.md`, `meta/techniques/verify-artifact-conforms.md` | Two citations respelled `../../meta/resources/writing-register.md` |
| F2 | corpus (`workflow-design`) | `workflow-design/resources/schema-construct-inventory.md` | One row added to § Workflow-Level Constructs |

F1 was expected to need a change to server source under `src/`, on a branch cut from
`main`, on the reasoning that a `meta/`-qualified relative path would be wrong on disk.
Measurement refutes that. `meta/techniques/../../meta/resources/writing-register.md`
resolves to the file that exists, and both projection paths already handle the qualifier:
`rewriteResourceLinks` captures an optional `<workflow>/` segment before `resources/`, and
`extractResourceIds` reads the same segment as the id's owner. Run against both spellings,
the current one yields the bare `writing-register` for the rendered link and for
`resource_refs`, and the proposed one yields `meta/writing-register` for both.
`get_resource { meta/writing-register }` resolves from this `workflow-authoring` session.
The form is already used in the corpus — `workflow-authoring/techniques/TECHNIQUE.md`
cites `../../workflow-design/resources/anti-patterns.md` and projects qualified.

Leaving the server's same-workflow behaviour alone is deliberate, not an omission. A bare
id is the correct projection for a technique that is only ever delivered under its own
workflow; the defect is specific to techniques bundled into other workflows, which is what
`meta` techniques are, and the citation is where that fact is known.

## Coverage

### Divergences

| Home | Unit | Status |
|------|------|--------|
| All four homes | Full-surface sweep of `{surface_files}` | `blocked` — with the change surface empty, the sweep that keeps pre-existing defects attributable spans both targets whole (`work-package`: 15 activity files, 115 technique files, 37 resource files, a 223-line `workflow.yaml`, a README; plus `remediate-vuln`). It was not walked. The two findings above come from partial inspection, so the corpus is not evidenced clean beyond them. |
| Design Principles | 34 units, all remaining | `not-applicable` — a principle is applied to authored content, and this run authors none |
| Anti-Patterns | 12 of 13 units | `not-applicable` — no file is created, modified or removed, so no entry's Detect has a construct on the change surface to key on |
| Schema Construct Inventory | 6 of 7 units | `not-applicable` — same reason |
| Convention Conformance | 1 unit | `not-applicable` — no file is created, so no name, field order or version is minted to compare against sibling convention |

Walked: `coupling-anti-patterns` (yielding F1) and Schema Construct Inventory
§ Workflow-Level Constructs (yielding F2). Coverage evidence is omitted because neither
reaches a change-surface file — there are none.

**Caveat on the baselined exclusions.** The binding-fidelity exclusions this run rests on
were triaged against corpus `3569e937`, which `git rev-list --count` puts exactly 287
commits behind the `bc52c696` checkout; `scripts/binding-fidelity-triage.json` carries that
sha in its own `corpusSha` field. The file holds 70 entries, all verdict `harmless`, of
which 7 sit on this run's two targets. An exclusion triaged 287 commits ago is a judgement
about a corpus that has since moved, so it is carried rather than relied on.

## Sources

| Label | Path |
|-------|------|
| Change brief | [`01-change-brief.md`](01-change-brief.md) |
| Impact analysis | [`01-impact-analysis.md`](01-impact-analysis.md) |
| Scope manifest | [`06-scope-manifest.md`](06-scope-manifest.md) |
| Binding-fidelity triage baseline | `scripts/binding-fidelity-triage.json` |
