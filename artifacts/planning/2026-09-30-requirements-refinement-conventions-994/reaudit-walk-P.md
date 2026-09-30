# Re-audit Walk P — principles, conformance, inventory, fix fidelity

**Base ref:** `0193e9bb` · **Tree:** `.worktrees/workflow/requirements-refinement-hygiene` at `34067ffc` · **Surface:** 13 files (touched 10 · closure 3 · consumers 0), per [reaudit-surface.md](reaudit-surface.md) · **Coverage:** 49 of 49 units (47 principles, § Reference Conventions, the schema construct inventory as one unit) × 13 of 13 paths · **Blocked:** 0

**Verdict (this slice):** Live 0 · Contract 5 · Hygiene 3. No High. Fix fidelity: 8 of 10 hold as stated; F6 holds, with one hazard (R-P4); P9 closes the prior finding but opens R-P1 and R-P2; B10 holds for its cited evidence but leaves two optional sections unmarked (R-P7).

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| R-P1 | Contract | Medium | [One Authoritative Home](../../../../.worktrees/workflow/requirements-refinement-hygiene/corpus/canon/resources/design-principles.md#6-one-authoritative-home) / [Edit the Owner](../../../../.worktrees/workflow/requirements-refinement-hygiene/corpus/canon/resources/design-principles.md#34-edit-the-owner) | `resources/specification-protocol.md` § Section Structure (items 1–7, sub-bullets 2.1–2.5) and § Template (headings `## 1.`–`## 7.`, `### 2.1`–`### 2.5`) | Each section name, number and order is stated twice in one file. Renaming, adding or reordering a section forces an edit to both, and neither cites the other for it (line 31 cites the Template only for 2.4's two lines) | diff | Keep headings and order in one section: give the Template each section's contents as its placeholder and reduce Section Structure to the augment rule and a cite of the Template, retargeting the `#section-structure` citers; or drop the numbered list from Section Structure and have it describe each Template heading by name |
| R-P2 | Contract | Medium | [Cite Resources at Section Grain](../../../../.worktrees/workflow/requirements-refinement-hygiene/corpus/canon/resources/design-principles.md#32-cite-resources-at-section-grain) / [A Relocation Records the Outcome It Keeps](../../../../.worktrees/workflow/requirements-refinement-hygiene/corpus/canon/resources/design-principles.md#38-a-relocation-records-the-outcome-it-keeps) | `techniques/update-specification.md` § 1 `initial` note; `resources/validation-rubric.md` § Structure; `techniques/TECHNIQUE.md` `specification-protocol-preserved` | What a section holds, and what 2.4 carries, now sit under two anchors, and each consumer cites one of them. The create path cites only `#template` ("instantiate the [Template]…"), which lacks the contents the rubric checks ("each section the run adds holds what that structure gives it"): no scope statement in the Executive Summary, the Use Case elements, domain subsections. The rubric and the rule cite only `#section-structure`, which now gives 2.4 as "the two lines the [Template] gives it" and not the lines | diff | Follows R-P1: one home for structure and contents, cited by each consumer; or cite both anchors on the create path and in rubric § Structure |
| R-P3 | Contract | Medium | [Cite Resources at Section Grain](../../../../.worktrees/workflow/requirements-refinement-hygiene/corpus/canon/resources/design-principles.md#32-cite-resources-at-section-grain) / [Cite Resource Policy; Do Not Restate It](../../../../.worktrees/workflow/requirements-refinement-hygiene/corpus/canon/resources/design-principles.md#29-cite-resource-policy-do-not-restate-it) | `resources/requirements-analysis-report.md` § Rules line 73; § Template `## Document Updates Required` | "list each in the section [Specification Protocol](./specification-protocol.md#section-structure) names for that source type" — Section Structure names no type-to-section mapping. It lives in § Source Reference Format: "Section 2.2 lists each transcript, and section 2.5 each document". The link text is not the section title, and the Template restates the mapping ("to 2.2 Meeting Transcripts or 2.5 Reference Documents, as its type directs") | pre-existing | Cite [Source Reference Format](./specification-protocol.md#source-reference-format) and drop the Template's restatement |
| R-P4 | Contract | Medium | [Encode Constraints as Structure](../../../../.worktrees/workflow/requirements-refinement-hygiene/corpus/canon/resources/design-principles.md#9-encode-constraints-as-structure) / [Single Source of Truth](../../../../.worktrees/workflow/requirements-refinement-hygiene/corpus/canon/resources/design-principles.md#14-single-source-of-truth) | `techniques/intake-sources.md` § 2, note line 40 | "A source the bound `{classified_sources}` already classifies, matched by file name, keeps that type". File name is the source's identity across intake (store-sources' folders and reuse rule, redact-transcripts' restore "with the same file name", now this note). No rule states, and nothing checks, that a run's sources carry distinct file names. Two sources named alike in different folders each match two bound entries, and a type correction to one can pass to the other | diff (the new note adds a third reliance on an identity that was already unbacked at base) | State distinct file names as an intake invariant and check it where `{source_readable}` is settled, so each by-name match has exactly one partner |
| R-P5 | Contract | Medium | [One Authoritative Home](../../../../.worktrees/workflow/requirements-refinement-hygiene/corpus/canon/resources/design-principles.md#6-one-authoritative-home) / [Edit the Owner](../../../../.worktrees/workflow/requirements-refinement-hygiene/corpus/canon/resources/design-principles.md#34-edit-the-owner); inventory "This activity needs X and produces Y" | `workflow.yaml` `variables[source_paths]` vs `activities/01-intake.yaml` `writes[source_paths]` | Workflow: "Filesystem paths of the source documents the user named, each…"; activity: "Filesystem paths of the local source documents being processed, each…". At base the first sentences were one text. The B12 fix edited the copy the schema does not treat as owner: an activity-written variable "is declared by that activity, under its own `variables.writes`" (`workflow.schema.ts` `variables`). `target_doc_path` has the same two declarations (identical, untouched) | diff | Remove the `workflow.yaml` entries for `source_paths` and `target_doc_path`, and keep activity 01's writes as the declaration (`required` is advisory authoring metadata) |
| R-P6 | Hygiene | Low | [Output Economy](../../../../.worktrees/workflow/requirements-refinement-hygiene/corpus/canon/resources/design-principles.md#12-output-economy) / [Prefer Removing the Thing That Needs a Prohibition](../../../../.worktrees/workflow/requirements-refinement-hygiene/corpus/canon/resources/design-principles.md#35-prefer-removing-the-thing-that-needs-a-prohibition) | `activities/01-intake.yaml` `record-intake.actions[0].message` and `sources-confirmed.message` | Two messages under the same `when` state one fact one after the other ("The source set and the target specification are captured, … ([intake record]…)"). The action copy still names "the target specification" with no link, a second site that B9's fix did not reach | pre-existing | Delete the action message, and let the checkpoint carry the statement |
| R-P7 | Hygiene | Low | B10 fix fidelity (`omit-null-sections`, covered by walk B) | `resources/requirements-analysis-report.md` § Template `## Quality Issues Identified`, `## Implementation Notes` | Both can be empty on a run, and neither is marked. The prior Fix reads "Mark the optional sections" | pre-existing | Mark both `[Omit this section if none]` |
| R-P8 | Hygiene | Low | [Edit the Owner](../../../../.worktrees/workflow/requirements-refinement-hygiene/corpus/canon/resources/design-principles.md#34-edit-the-owner) | `resources/specification-protocol.md` frontmatter `description`; `resources/README.md` Resources row | Both list the resource's sections ("section structure, identifier schemes, … source-reference format") and omit the new Template. Reference Documents and Rules were already missing at base | diff | Describe the resource without listing its sections, e.g. "The canonical specification layout and conventions, and the template a specification is created from" |

Highs: none raised. Mediums spot-confirmed at the cited lines: R-P1 lines 16–29 and 39–70; R-P2 `update-specification.md` line 71, rubric line 15, `TECHNIQUE.md` line 36; R-P3 lines 49 and 73 of the analysis report and protocol line 164; R-P4 `intake-sources.md` 40, `store-sources.md` 137–138, `redact-transcripts.md` 35; R-P5 `workflow.yaml` 27–30, activity 01 lines 12–14.

## Fix fidelity

| Prior | Stated Fix | Verdict |
|-------|-----------|---------|
| F6 | Carry settled classifications over re-inference; take each type from the bound `{classified_sources}` on re-entry | **Holds**, with the hazard in R-P4. See the trace below |
| A4 | Delete "…rather than as a whole." | Holds. The sentence is gone, and the bullet still says "For each path" |
| A5 | Move the `when` caveat to a `>` note | Holds. `analyze-source.md` line 47 is a lone-caveat note under the instruction, per principle 31 |
| A6 | State the instruction and carry the condition as a `>` note | Holds. Line 48 "> Unset, `{intake_correction}` changes no path." matches the sibling form in `redact-transcripts.md` line 36 |
| A8 | Delete the gate narration | Holds. The intro now opens "Creation guide for bare filename… Answers:", like `validation-report.md` |
| P9 | Give specification-protocol a `## Template` skeleton (seven sections, and the final form's key) | **Holds for the guide map; opens R-P1 and R-P2.** The README map now reaches a guide with a Template. The Template gives the working form and has no status key. That is sound: `finalize-specification.md` line 58 cites `#final-specification-form` directly, and the working form carries no key. The seven headings and the 2.x headings repeat Section Structure (R-P1). Citers of `#section-structure`: the `TECHNIQUE.md` rule and rubric § Structure still find the section list, and reach 2.4's lines only through a pointer to `#template` (R-P2). The analysis-report rule cites it for a mapping it never held (R-P3, pre-existing) |
| B9 | `[target specification]({target_doc_path})` | Holds at the checkpoint. The action message one step earlier names the target with no link (R-P6) |
| B10 | Mark the optional sections `[Omit if none]` | Holds for the cited sections. The form `[Omit this section if none]` on its own line matches the dominant sibling form (`work-package/resources/requirements-elicitation.md`, `wp-plan.md`, `web-research.md`). Two optional sections are still unmarked (R-P7) |
| B11 | Give the narrative clause its own entry | Holds. It is now two entries (`requirements-analysis-report.md` lines 78–79) |
| B12 | One line naming the value | Holds as one line. The workflow and activity texts now diverge (R-P5) |

### F6 trace (activity 01 → `revise` → `revise`)

Engine premise: `classified_sources` carries `defaultValue: []` on activity 01's writes. The session bag is seeded from `defaultValue` once, at session creation (`src/utils/variable-seed.ts`; `variable.schema.ts` `defaultValue` description), so re-entering intake does not reset it. It is in activity 01's `reads`, as a value intake-sources consumes before any step of the same pass writes it.

1. **First pass.** resolve-inputs reads `source_paths` from the request (originals, say `/x/m1.txt` and `/x/d1.pdf`). intake-sources: the bound `classified_sources` is `[]`, so there is no match, and inference misclassifies `m1.txt` as `document`. store-sources copies `m1.txt` to `documents/` (outside the repository) and rewrites `classified_sources` to the copies' absolute paths, keeping file names. redact-transcripts redacts nothing for `m1`. The user takes `revise` with "m1.txt is a meeting transcript".
2. **Second pass (type correction).** resolve-inputs: the bound `source_paths` still names the originals (store-sources rewrites only `classified_sources`), and the correction changes no path. intake-sources infers `document` again. The bound entry `documents/m1.txt` matches by file name and keeps `document`. `{intake_correction}` names the type, and is "recorded over both", giving `meeting`. store-sources: no `m1.txt` in `meetings/`, so it copies the file and adds it to `copied_transcripts`, and redact-transcripts redacts it. The corrected type reaches `classified_sources` as `meetings/m1.txt, meeting`.
3. **Third pass (unrelated correction, e.g. a passage to keep).** `recordReply` overwrites `{intake_correction}`, so the type correction text is gone. intake-sources infers `document`. The bound entry `meetings/m1.txt` matches by file name and keeps `meeting`. The correction names no type. **The corrected type survives.** store-sources reuses the existing `meetings/m1.txt` and does not re-redact it.

"Matched by file name" is sound once store-sources has rewritten paths. The rewrite keeps the file name ("keeping its file name"), an in-repo document keeps its original path, and redact-transcripts already matches `source_paths` to stored copies the same way. It is unsound only where two sources share a file name (R-P4). One side effect is outside this surface: after the first-pass misclassification, an unreferenced `documents/m1.txt` is left behind (store-sources, off surface, not recorded).

## Convention conformance

- **Omit marker.** `[Omit this section if none]` on its own line, followed by the content placeholder, is the dominant sibling form. `work-package` also uses the merged `[Omit this section if none. …]`. Conformant.
- **`## Template` in specification-protocol.** Sibling creation guides open with "Creation guide for bare filename …" and put `## Template` first. specification-protocol serves two filenames and is also the preserve-verbatim policy, so it puts Section Structure before Template and has no bare-filename opener. This is a justified divergence: principle 28 allows "A shared shape may share one guide". `{placeholder}` braces match `failure-report.md` in this workflow.
- **Versions.** Techniques: intake-sources gets a minor bump (1.7.0, behaviour change); analyze-source, resolve-inputs and update-specification get patch bumps (wording and cite changes). The activity and workflow go to 2.2.0. Resources in this workflow carry no `metadata.version`, so no bump is owed. Semantic `X.Y.Z` throughout.
- **Field order.** Unchanged: `id`, `version`, `name`, `description` in the activity, and frontmatter then Capability in the techniques.

## Schema construct inventory

The constructs the fixes chose:

- **F6: the activity variable contract and the container input.** Activity `variables.reads` covers a value the activity consumes before any of its own steps writes it. The container `TECHNIQUE.md` input is the inventory's "Shared inputs… for every technique in the folder". Correct.
- **A5, A6: a `>` note under the step.** Correct.
- **B9: a checkpoint `message` link.** The inventory routes this through `link-named-artifacts`. Correct.
- **P9, B10, B11: resource prose.** No schema construct applies.
- **R-P5.** The inventory maps "the session starts with X" to a workflow variable, and "this activity… produces Y" to the activity's writes. `source_paths` is produced by activity 01, which supports R-P5's Fix.

## Dropped candidates

- **B9 link in create mode.** When `target_doc_exists` is false, `[target specification]({target_doc_path})` points at a file that does not exist. Dropped: the message also states "(target exists: …)", and the path is the value the user is confirming. It is not a pointer to evidence.
- **A leaf `classified_sources` input on intake-sources** stating "empty on a first intake". Dropped. The inherited declaration describes the value, the seeded `[]` reads naturally as "already classifies" nothing, and a leaf redeclaration would reopen A1.
- **Activity 01 `reads` omits `source_paths`, `target_doc_path` and `intake_correction`.** resolve-inputs reads each on re-entry before they are written in that pass, the same position as `classified_sources`. Dropped from this slice: `reads` is advisory (`variable.schema.ts`), the bag supplies the values either way, the construct predates the base, and it belongs to walk A/B's variable-contract entries.
- **Template omits the status key.** Dropped. It is by design (see P9 above).
- **`Unset, …` note restating resolve-inputs' optional Input.** Dropped. It is the conditional branch principle 31 asks for, and it matches its sibling.

## Coverage ledger (divergences)

| Home | Unit | Status |
|------|------|--------|
| Design Principles | 2. Internalize Before Producing | `not-applicable`: authoring conduct ("before writing content") |
| Design Principles | 3. Define Complete Scope Before Execution | `not-applicable`: authoring conduct ("before starting") |
| Design Principles | 4. Clarify Before Assuming | `not-applicable`: authoring conduct ("ask one question before acting") |
| Design Principles | 21. Match the Harness Surface | `not-applicable`: the surface names no tool, return shape or bootstrap path |
| Design Principles | 23. Close the Loop | `not-applicable`: session conduct ("a recommendation is followed by the action") |
| Design Principles | 33. Pre-Session Prose Stands Alone | `not-applicable`: no prose on the surface is delivered before references resolve |
| Design Principles | 40. Fan-Out Lives at the Layer That Runs the Work | `not-applicable`: the surface has no fan-out |
| Design Principles | 41. A Phase States Answers the Tool Has Returned | `not-applicable`: no phase on the surface reads a tool response |
| Design Principles | 42. A Routine Holds the Codified Path | `not-applicable`: no routine on the surface |
| Design Principles | 43. A Workflow Borrows Activities | `not-applicable`: no borrowed activity |
| Design Principles | 47. A Calibrated Surface Extends by Wrapping | `not-applicable`: no schema or measured prompt is extended |

Blocked: 0. The other 36 principles, § Reference Conventions and the inventory were walked over all 13 files.

## File coverage

read 13 · unread 0.

| Disposition | Paths (under `corpus/requirements-refinement/`) |
|-------------|------|
| `read` | `activities/01-intake.yaml`, `workflow.yaml`, `techniques/analyze-source.md`, `techniques/intake-sources.md`, `techniques/resolve-inputs.md`, `techniques/update-specification.md`, `techniques/TECHNIQUE.md`, `resources/change-summary.md`, `resources/failure-report.md`, `resources/requirements-analysis-report.md`, `resources/specification-protocol.md`, `resources/validation-rubric.md`, `resources/README.md` |

These off-surface files were read for the F6 trace and conformance only, and none is reported against: `techniques/store-sources.md`, `techniques/redact-transcripts.md` (line 35–36), `techniques/finalize-specification.md` (line 58), `techniques/validate-specification.md` (cites), `resources/intake-record.md` and `resources/validation-report.md` (intros), and the `work-package` resources carrying omit markers.
