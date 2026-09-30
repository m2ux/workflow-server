# Canon Audit — `requirements-refinement` (PR #998)

**Base ref:** `4662d88d` · **Coverage:** 212 of 212 units × 28 of 28 paths — **all unit-paths walked** · **Change surface:** 21 files (touched: 18 · closure: 3 · consumers: 0) · **Guards:** clean (236 of 236 at HEAD `6772e1ce`; the change is corpus-only)

**Verdict:** Live 2 · Contract 12 · Hygiene 20, at that coverage. Residual: **0 files `unread`** of 28, **0 criteria units `blocked`** of 212 (AP-04 partly: approval of the new redaction vocabulary is not readable from the tree). No prior pass on this workflow.

Units: 165 anti-pattern entries (+ Creation Rules family), 47 principles, 1 convention section, the schema construct inventory as one unit. Walks: [A](audit-walk-A.md) AP-01–70, [B](audit-walk-B.md) AP-71–165, [P](audit-walk-P.md) principles, conformance, inventory, issue fidelity.

| Band | Open | Known | Prior pass |
|------|-----:|------:|-----------:|
| Live | 2 | 0 | — |
| Contract | 12 | 0 | — |
| Hygiene | 20 | 0 | — |

## Change surface

| Path | How it joined |
|------|----------------|
| 18 files in [audit-surface.md](audit-surface.md#touched-18) | touched |
| `techniques/analyze-source.md`, `validate-specification.md`, `report-failure.md` | closure — inherit the new `TECHNIQUE.md` rule `artifact-paths-relative` |

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| F1 | Live | High | issue #994 item 1 | `techniques/store-sources.md` `meetings_dir`, `documents_dir` | "relative to `{host_repo_path}`", default `.engineering/artifacts/meetings/`. The server plans at `<project>/.engineering/artifacts/planning/` (`src/utils/session/scope.ts`), shared by every worktree of the project; a run opened from a worktree stores transcripts inside that worktree, so neither `../../meetings/` nor cross-run reuse holds | diff | Resolve both folders against the planning root (`{planning_folder_path}/../../meetings/`) |
| F2 | Live | High | issue #994 item 3 | `resources/validation-rubric.md` § Consistency | "Every transcript href is relative and resolves to a transcript in the meetings folder." checks every href; an augmented target's existing citations to transcripts this run was not given cannot be corrected, so the run reaches `report-failure` | diff | Scope the check to the run's sources, or store the transcripts the target's section 2.2 lists |
| F3 | Contract | High | `reference-without-provenance` | `resources/specification-protocol.md` § Source Reference Format | "The href is the relative path from the specification to the file…" — a run holds working and final copies in the planning folder and the canonical one at `{target_doc_path}`; links measured from the planning folder break when the target sits at another depth | diff | Name which specification the path is measured from |
| A1 | Contract | High | `hoist-shared-inputs` | `### classified_sources` on analyze-source, record-intake, redact-transcripts, store-sources | Four leaves, no ancestor declaration; redact-transcripts' wording drifts | diff | Declare once in `TECHNIQUE.md`; delete the leaf inputs |
| F4 | Contract | Medium | [Confirm Before Irreversible Changes](../../../../.worktrees/workflow/requirements-refinement-conventions/corpus/canon/resources/design-principles.md#8-confirm-before-irreversible-changes) | `store-sources.md` § 1; `redact-transcripts.md` § 1 | A reused copy "as it stands" is redacted again; a passage an earlier run kept is re-redacted in a file other specifications cite | diff | Redact only a newly stored copy; apply a correction to any copy |
| F5 | Contract | Medium | issue #994 item 2 | `01-intake.yaml` `revise`; `redact-transcripts.md` § 1 | `recordReply: intake_correction` overwrites the prior reply; a restored passage is re-redacted on the next revise | diff | Same fix as F4 |
| F6 | Contract | Medium | intake outcome | `intake-sources.md` § 2 | A classification correction survives only while it is the latest `{intake_correction}` | pre-existing | Carry settled classifications over re-inference |
| F7 | Contract | Medium | `artifact-paths-relative` (rule) | `report-failure.md` § 3; `record-intake.md` § 2 | "filling the template's path slot from `{validation_report_path}`" (absolute); record-intake captures absolute `{classified_sources}` and `{target_doc_path}` | diff | Record each path relative to the artifact at the write step |
| F8 | Contract | Medium | [Non-Destructive Updates](../../../../.worktrees/workflow/requirements-refinement-conventions/corpus/canon/resources/design-principles.md#10-non-destructive-updates) | rubric § Structure, § Content; `finalize-specification.md` § 2 | On augment, correction passes strip existing priority tags, rewrite quoted rationales and scope paragraphs; the change summary is built from the analysis alone and records none of it | diff | Record convention conformance edits in the change summary, or scope the checks to the run's entries |
| P1 | Contract | Medium | [Single Source of Truth](../../../../.worktrees/workflow/requirements-refinement-conventions/corpus/canon/resources/design-principles.md#14-single-source-of-truth) | `TECHNIQUE.md` `source_paths`; activities 03–06 reads; `techniques/README.md` | After intake `source_paths` names the originals, `classified_sources` the stored copies | diff | Drop `source_paths` from the post-intake contract; read `classified_sources` |
| P2 | Contract | Medium | [A Technique Names Only What Its Reader Holds](../../../../.worktrees/workflow/requirements-refinement-conventions/corpus/canon/resources/design-principles.md#36-a-technique-names-only-what-its-reader-holds) | rubric § Consistency via validate-specification | "the meetings folder" — its location lives only in store-sources' default | diff | State the folder's location in the protocol (follows F1) |
| P3 | Contract | Medium | [Encode Constraints as Structure](../../../../.worktrees/workflow/requirements-refinement-conventions/corpus/canon/resources/design-principles.md#9-encode-constraints-as-structure) | `TECHNIQUE.md` `artifact-paths-relative` | Only the specification's transcript hrefs are checked; other artifacts rely on rule text | diff | Back the rule in each guide's Rules, which verify-artifact-conforms checks |
| B2 | Contract | Medium | `overlapping-rule-scopes` | `transcript-redaction.md` `personal` vs Rules | A health or whereabouts aside inside on-topic discussion meets both "redact" and "kept whole" | diff | Order them: name which wins |
| B3 | Contract | Medium | `no-technique-resource-dual-home` | `update-specification.md` § 1 bullet 2 | Restates the rationale and note rules Requirement Entry Format owns | diff | Keep the cite and "whatever wording `{requirements_analysis}` carries"; drop the rest |
| A2 | Hygiene | Low | `no-rationale-in-description` | store-sources `meetings_dir`, `documents_dir` | "…that specifications cite" | diff | Delete the consumer clause |
| A3 | Hygiene | Low | `grouped-rule-keys` | `TECHNIQUE.md` two artifact rules | `artifacts-write-under-planning-folder`, `artifact-paths-relative` | diff | Group under one key |
| B8 | Hygiene | Low | `instruction-narrates-an-actor` / [State Contract Contribution](../../../../.worktrees/workflow/requirements-refinement-conventions/corpus/canon/resources/design-principles.md#27-state-contract-contribution) | `TECHNIQUE.md` `artifacts-write-under-planning-folder`; README "Every intermediate and final artifact lives in the run's planning folder" | Reaches store-sources and redact-transcripts, which write elsewhere | diff | Scope the rule to declared artifacts |
| B4 | Hygiene | Low | `stale-restatement-after-change` | `intake-sources.md` `intake-captures-only` | "…do not analyze or modify the specification during intake." — stage locus, and intake now writes files | diff | Drop "during intake" |
| B5 | Hygiene | Low | `stale-restatement-after-change` | `techniques/README.md` closing paragraph | Completeness measured over `{source_paths}` | diff | Measure over `{classified_sources}` (follows P1) |
| B6 | Hygiene | Low | `whole-resource-for-one-section` | redact-transcripts `transcript_redactions` | "the kind [transcript-redaction] gives it" reads one section | diff | Anchor to `#redacted-conversation` |
| B7 | Hygiene | Low | `one-invariant-per-rule` | `intake-record.md` redaction rule | No quoted words, row shape, omission — three constraints | diff | Split into entries |
| P5 | Hygiene | Low | [One Authoritative Home](../../../../.worktrees/workflow/requirements-refinement-conventions/corpus/canon/resources/design-principles.md#6-one-authoritative-home) | protocol § Final Specification Form | The key line restates the Status Conventions icons | diff | State the key as the table's icons and values in order |
| P6 | Hygiene | Low | [Cite Resource Policy; Do Not Restate It](../../../../.worktrees/workflow/requirements-refinement-conventions/corpus/canon/resources/design-principles.md#29-cite-resource-policy-do-not-restate-it) | rubric § Content, two new bullets | Restate Requirement Entry Format without citing it | diff | Cite the section |
| P8 | Hygiene | Low | [Edit the Owner](../../../../.worktrees/workflow/requirements-refinement-conventions/corpus/canon/resources/design-principles.md#34-edit-the-owner) | `intake_correction` in four files | The enumeration was edited in each only to agree | diff | Describe it as "the user's correction to the intake" |
| A4 | Hygiene | Low | `no-rationale-in-description` | `intake-sources.md` § 2 | "…rather than as a whole." | pre-existing | Delete |
| A5 | Hygiene | Low | `constraint-as-blockquote` | `analyze-source.md` § 1 | "; when `{target_doc_exists}`, also read…" | pre-existing | Move to a `>` note |
| A6 | Hygiene | Low | `constraint-as-blockquote` | `resolve-inputs.md` § 2 | "When `{intake_correction}` is bound, apply it…" | pre-existing | Move to a `>` note |
| A7 | Hygiene | Low | `readme-orients-not-transcribes` | `techniques/README.md` | Lists `TECHNIQUE.md`'s inputs | pre-existing | Link without the list |
| A8 | Hygiene | Low | `no-resource-caller-backlink` | `failure-report.md` intro | "Written when the run stops…" | pre-existing | Delete the gate narration |
| P9 | Hygiene | Low | [Creation Guide for Generated Documents](../../../../.worktrees/workflow/requirements-refinement-conventions/corpus/canon/resources/design-principles.md#28-creation-guide-for-generated-documents) | resources README guide map | Specs map to a protocol with no `## Template` | pre-existing | Add a skeleton Template |
| B9 | Hygiene | Low | `link-named-artifacts` | `sources-confirmed.message` | `{target_doc_path}` bare | pre-existing | `[target specification]({target_doc_path})` |
| B10 | Hygiene | Low | `omit-null-sections` | change-summary, analysis-report Templates | Headed sections with no omit mark | pre-existing | Mark `[Omit if none]` |
| B11 | Hygiene | Low | `one-invariant-per-rule` | analysis-report Line budget rule | Budget plus narrative home | pre-existing | Split |
| B12 | Hygiene | Low | `variable-description-one-line` | `workflow.yaml` `source_paths` | Two sentences | pre-existing | One line |

Highs re-derived: F1 (confirmed against `scope.ts` and `resource-tools.ts`), F2 (the check reads every href of the working specification), F3 (three specifications, one unnamed base), A1 (four leaf declarations, carve-out stops at three). None withdrawn or downgraded.

## Disposition

Fixed on PR #998 at `0193e9bb`. Guards 236 of 236; engine suite 2200 pass.

| Findings | Outcome |
|---|---|
| F1 | `meetings_dir` and `documents_dir` resolve against `{planning_folder_path}` (`../../meetings/`, `../../documents/`) |
| F3 | Decision: a specification's paths are relative to the folder of `{target_doc_path}`; protocol, rule and examples say so |
| F2, F8 | Decision: the rubric's href, entry and section checks cover what the run adds or changes |
| F4, F5 | store-sources emits `copied_transcripts`; only those are redacted, and a correction applies to any stored copy |
| A1, P1, B5 | `classified_sources` hoisted to `TECHNIQUE.md`; activities read it in place of `source_paths`, now a leaf input of the three intake techniques that read it |
| F7, P3 | record-intake and report-failure record paths per `artifact-paths-relative`; the specification's hrefs are checked by the rubric. Other artifacts rest on the rule |
| P2 | The protocol names the folder: the engineering artifacts' `meetings`, beside `planning` |
| B2 | The on-topic rule redacts a personal aside within it |
| B3, P6 | update-specification and the rubric cite Requirement Entry Format |
| A2, B4, B6, B7, B8, P5, P8 | Fixed as each row states |
| A3 | Withdrawn: the two rules are distinct invariants (`grouped-rule-keys` Do not flag, unrelated rules) |
| F6, A4–A8, P9, B9–B12 | Pre-existing; left for a separate change |

## Coverage

| Home | Unit | Status |
|------|------|--------|
| Anti-Patterns | Creation Rules | `not-applicable` — the change does not edit `anti-patterns.md` |
| Anti-Patterns | `no-partial-implementation`, `no-assumption-execution`, `scope-reverify-completion` | `not-applicable` — Detect names authoring-session conduct |
| Anti-Patterns | `no-invented-naming` | walked; approval of the redaction marker and kinds is not readable from the tree (approved in session for the technique names) |

## File coverage

read 28 · unread 0.
