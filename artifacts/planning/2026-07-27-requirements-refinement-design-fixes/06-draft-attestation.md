# Draft Attestation — Requirements-Refinement Canon Conformance

**Mode:** update · **Files:** 16 · **Attestation:** ready for batch review

Blocks are marked against the committed `requirements-refinement` at `d9b3023`. Both repo validators pass on the drafted tree: `validate-workflow-yaml.ts` (workflow + 5 activities + 8 technique files) and `validate-activities.ts` (5 passed, 0 failed).

## Reviewed blocks

| Block | File | Status | Rationale |
|-------|------|--------|-----------|
| `variables[]` | `workflow.yaml` | modified | The cap's shadow declaration goes; the literal in `04` becomes its only home |
| `version` (×8) | `workflow.yaml`, 5 activities, 2 technique files | modified | Each changed file's semantic version advances (G7) |
| `intake-sources` step `actions` | `activities/01` | modified | Announces the classified sources and links the produced record instead of a hand-typed bare filename |
| `sources-confirmed` `message` | `activities/01` | modified | Declarative statement of the captured sources with the record linked; decision stays in `options[]` |
| `analyze-source` step `actions` | `activities/01` | modified | Announces what the parse produced and links the analysis report |
| `analysis-confirmed` `message` | `activities/01` | modified | States the analysis is ready to apply and links it |
| `transitions[]` | `activities/01` | unchanged | Deliberate — the both-`condition`-and-`isDefault` arm is impact row 13, a Gate 2 row; the shape is A-7's to set (F-3) |
| gate `options[]` and effects | `activities/01` | unchanged | Deliberate — `confirmed` keeps its effect; `revise` awaits A-7 (F-5) |
| step `actions` | `activities/03` | modified | Names the pass and links the working specification |
| step `actions` | `activities/04` | added | The one artifact previously produced silently is now announced (G4) |
| `transitions[]` cap literal | `activities/04` | unchanged | `correction_iteration < 3` is now the cap's sole authoritative home (G1, A-1) |
| step `actions` | `activities/05` | modified | Links both staged artifacts rather than naming them in prose |
| `finalization-confirmed` `message` | `activities/05` | modified | States what is staged for promotion, with both artifacts linked |
| gate `options[]` | `activities/05` | unchanged | Deliberate — `accepted` keeps its effect; `revise` awaits A-7 (F-5) |
| step `actions` | `activities/06` | modified | States what the failure report records and links it |
| `failure-acknowledged` `message` | `activities/06` | modified | Declarative statement that refinement stops and nothing is staged |
| `failure-acknowledged` `options[]` | `activities/06` | unchanged | Deliberate — the single-option shape is A-5's to settle (F-5) |
| `## Inputs` | `techniques/TECHNIQUE.md` | modified | Shared input set drops the removed variable; `correction_iteration` and its default stay |
| `## Outputs`, Protocol 6 | `techniques/intake-sources.md` | modified | `intake_record_path` declared and captured so the activity has a link target |
| `## Outputs`, Protocol 5 | `techniques/analyze-source.md` | modified | `requirements_analysis_path` declared and captured |
| `## Outputs` | `techniques/update-specification.md` | modified | `correction_iteration` becomes a declared output — the increment's sanctioned home — alongside the artifact path |
| `## Protocol` | `techniques/update-specification.md` | modified | The prose increment phase goes; four work phases remain, the last emitting both values |
| `## Rules` | `techniques/update-specification.md` | added | States the one-advance-per-pass invariant that no Protocol phase now carries (A-9) |
| `## Outputs` | `techniques/validate-specification.md` | modified | Four verdict descriptions state what each value is; the report path is declared |
| Protocol 4 | `techniques/validate-specification.md` | modified | Captures the written location alongside the compile step |
| `## Outputs`, Protocol 1–2 | `techniques/finalize-specification.md` | modified | Both staged artifacts expose paths; captures fold into the phases that write them |
| Protocol 3 | `techniques/finalize-specification.md` | removed | Presentation belongs to `05`'s gate; the `promotion-is-the-users-action` rule keeps the invariant |
| `## Outputs`, Protocol 3 | `techniques/report-failure.md` | modified | `failure_report_path` declared and captured |
| Protocol 1, Protocol 4 | `techniques/report-failure.md` | modified, removed | The removed variable leaves the attempt record; presentation belongs to `06` |
| Overview, Flow, Structure | `README.md` | modified | Cap stated as its literal, artifact-location claim dropped, banner advanced |
| Inherited-input sentence | `techniques/README.md` | modified | Names the four surviving shared inputs |
| Produces column | `activities/README.md` | modified | Artifacts named by identifier, so no unprefixed literal contradicts the linked server-computed name |

## Binding fidelity

Artifact writes in this workflow are technique-owned: each producing technique declares its file under `#### artifact` and writes it in Protocol, so no `manage-artifacts::write-artifact` binding applies. Every newly declared path output is produced by an ungated step that precedes each of its readers in the same activity — `intake_record_path` and `requirements_analysis_path` in `01`, and the remaining five in the activity that writes them — so no reader is reachable on a path where its producer is skipped.

**draft_attestation:** All 32 blocks are understood and intentional; none is flagged for revision. Four blocks are deliberately unchanged pending Gate 2 (A-5, A-7) and are recorded as [follow-ups](03-follow-ups.md) F-3 and F-5, with two drafting judgements at F-2 and F-4.
