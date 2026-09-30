# Re-audit 2 Walk P — principles, conformance, inventory, fix fidelity

**Base ref:** `07a3daf0` · **Tree:** `.worktrees/workflow/requirements-refinement-hygiene` at `9049523a` · **Surface:** 11 files (touched 7 · closure 4 · consumers 0), per [reaudit2-surface.md](reaudit2-surface.md) · **Coverage:** 49 of 49 units (47 principles, § Reference Conventions, the schema construct inventory as one unit) × 11 of 11 paths · **Blocked:** 0

**Verdict (this slice):** Live 0 · Contract 1 · Hygiene 2. No High. All three are `pre-existing`; the commit introduces no finding. Fix fidelity: R-A2, R-A7, R-A8 and R-A9 each hold. R-A9 holds by a rewrite of the bullet, not the deletion its Fix stated.

Principles are cited by title; links go to [design-principles](../../../../.worktrees/workflow/requirements-refinement-hygiene/corpus/canon/resources/design-principles.md) on the corpus tree.

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| R2-P2 | Contract | Medium | Cite Resources at Section Grain / One Authoritative Home | `techniques/update-specification.md` § 1 `initial` note; `resources/specification-protocol.md` § Reference Documents | The `initial` pass applies each analysis change, and the analysis's Document Updates Required puts "one new source reference per source — to 2.2 Meeting Transcripts or 2.5 Reference Documents". The only home of a section-2 entry's form is § Reference Documents (`**SRC-DOC###**: [Document Title](path) — Author Name`, "credited to its author, mirroring the meeting-transcript listing"). No construct in the corpus, ledgers or walks cites `#reference-documents`. The note cites Source Reference Format, Identifier Schemes, Status Conventions, Template and Requirement Entry Format, so the writer of every 2.5 entry never receives its form. The 2.2 form that section mirrors is stated nowhere. The bare guide reaches only the finalize conformance check, through the guide map | pre-existing | Cite [Reference Documents](../resources/specification-protocol.md#reference-documents) where the `initial` pass adds a source's section-2 entry, and state the 2.2 transcript entry form in that section, or name the form it mirrors |
| R2-P1 | Hygiene | Low | Output Economy | `activities/05-finalize-specification.yaml` step `finalize-specification.actions[0].message` and checkpoint `finalization-confirmed.message` | The action says "The validation-passed specification and an account of every applied change are staged in the planning folder ([final specification]…, [change summary]…)". Two steps later the checkpoint says "The final specification and the change summary are staged ([final specification]…, [change summary]…)". One fact, the same two links, stated twice. The base checkpoint also named `{spec_basename}`. With that dropped, the checkpoint adds nothing the action lacks. This is the activity 05 twin of R-A3 / R-P6, which the prior round fixed in activity 01 by deleting the action message | pre-existing | Delete the step's action message, and let the checkpoint carry the statement |
| R2-P3 | Hygiene | Low | Edit the Owner | `resources/specification-protocol.md` frontmatter `description`; `resources/README.md` Resources row | Both still list the resource's sections: "template, identifier schemes, requirement-entry format, status conventions, final specification form, and source-reference format". Reference Documents and Rules are missing. R-P8's Fix read "Describe the resource without listing its sections". The round added the Template to the list, and [reaudit.md](reaudit.md) records R-P8 as Fixed | pre-existing (R-P8 residual) | Describe the resource without listing its sections, per R-P8 |

Highs: none raised. Mediums spot-confirmed: R2-P2, by `grep -rn "reference-documents" corpus ledgers walks` (no hit) and `update-specification.md` line 71 (five other `specification-protocol` anchors). R2-P1 at `05-finalize-specification.yaml` lines 42 and 57, against the base checkpoint at `07a3daf0`.

## Fix fidelity

| Prior | Stated Fix | Verdict |
|-------|-----------|---------|
| R-A2 | Delete `spec_basename`. Readers take the basename of `{target_doc_path}`: report-failure derives it, and the finalize message links the path | **Holds.** See the traces below. Every writer and reader is gone: activity 01 `writes`, the record-intake Output, its § 1 emit and § 2 capture, the `intake_record` description, activity 05 `reads` and its checkpoint message, activity 06 `reads`, and the report-failure Input. None remains in the corpus, ledgers, walks, or the server's `src`, `tests`, `guards` and `schemas` |
| R-A7 | Delete the "so…" clause | **Holds.** The clause is gone. The change also replaces "one source reference per entry" with a cite of the analysis-report [Rules]. That home carries the fact: "Every source gets its own reference under Document Updates Required. Assign one per source document…" (line 75) |
| R-A8 | Cite Identifier Schemes for new identifiers; reduce the status clause to "per [Status Conventions]" | **Holds.** The note now reads "create new requirements with identifiers per [Identifier Schemes] … each status per [Status Conventions]". Identifier Schemes carries "Each new requirement takes the next available number within its category". Status Conventions carries "A newly added requirement takes status `pending`" and "A retired requirement takes status `deprecated`". "sequential" and the restated `pending` clause are gone, and no other surface file states "sequential" |
| R-A9 | Delete the bullet; § 2 bullet 3's Rules cite carries it, and the Identifier Schemes cite moves there | **Holds in effect, differs in form.** The bullet was rewritten as a pure cite: "Map each change to a requirement identifier per the [Rules], in the category [Identifier Schemes] gives it". The Rules carry the reuse rule (line 74: "Map each change to an existing requirement identifier where one applies; otherwise propose a new identifier within the correct category"). Identifier Schemes enumerates the categories and each one's identifier form. No restatement remains. The rewrite is the sounder choice: bullet 3 cites the Rules for contributing passages, not for mapping identifiers |

### R-A2 traces

- **Intake run (01).** resolve-inputs, or the `target-doc-named` `recordReply`, binds `target_doc_path`. record-intake § 1 emits it as an absolute path, along with `target_doc_exists`. § 2 captures `{target_doc_path}` into the intake record, whose Template heads `# Intake — {spec basename}`. The filler holds the specification's path, and "spec basename" names a projection of it, so the placeholder has a source. The `sources-confirmed` message reads only `target_doc_path`, `target_doc_exists` and `intake_record_path`. No step reads a removed name.
- **Failure run (04 → 06).** Activity 04 exits `uncorrectable` (isDefault) to 06. Activity 06 `variables.reads` lists `target_doc_path`, which is bound since intake. That entry was already present at base; the change removed only `spec_basename`. report-failure inherits `target_doc_path` from `techniques/TECHNIQUE.md` § Inputs, and § 3 writes the report "for the specification at `{target_doc_path}`". So the Template's `# Failure Report — {spec basename}` is filled from a value the reader holds (A Technique Names Only What Its Reader Holds).
- **Finalize (05) checkpoint.** "The final specification and the change summary are staged ([final specification]({final_specification_path}), [change summary]({change_summary_path}))." The subject of the decision (the staged artifacts to accept or revise) is named and linked, both bound by the step before. The target's name is not what the user decides: it was confirmed at `sources-confirmed`, and promotion to `{target_doc_path}` is outside finalize (`promotion-outside-this-operation`). The Fix's "links the path" is met by the `final_specification_path` link. See R2-P1 for the duplicate action message this leaves.

## Convention conformance

- **Versions.** Each Output or Input removal takes a minor bump: record-intake 1.1.0 → 1.2.0, report-failure 1.5.1 → 1.6.0, and activities 01 2.2.0 → 2.3.0, 05 1.9.1 → 1.10.0, 06 1.6.1 → 1.7.0. This matches the sibling practice, for example the `workflow-design` round that dropped `*_findings_path` and `operation_type` inputs with minor bumps (audit-anti-patterns 1.13.0 → 1.14.0, prepare-workflow-branch 2.2.0 → 2.3.0). Wording and cite changes take a patch bump: analyze-source 1.6.3, update-specification 1.10.2. `workflow.yaml` stays at 2.2.0. Its bytes are unchanged, and sibling practice bumps a file's own version only (`work-package` activity commits leave `workflow.yaml` untouched). Semantic `X.Y.Z` throughout.
- **Field order.** Unchanged: `id`, `version`, `name`, `description`, `variables` in the activities, and frontmatter, Capability, Inputs, Outputs, Protocol, Rules in the techniques.
- **Document-name placeholder with no variable.** Sibling creation guides fill a heading's subject with a descriptive placeholder that no variable backs and no technique derives. `workflow-design` does this with `{short title}` in design-specification, file-review-note, drafting-plan, impact-analysis, scope-manifest and draft-attestation, and `work-package/resources/codebase-comprehension.md` with `{Codebase Area Name}`. The one sibling that states a derivation, `work-package/techniques/create-adr.md` (`{$decision_title}` "as a slugified short title"), builds a filename, not a heading. So `{spec basename}` in intake-record and failure-report conforms. It also has a nearer source than the siblings' placeholders, because both fillers hold `{target_doc_path}`.

## Schema construct inventory

- **R-A2: the activity variable contract** ("This activity needs X and produces Y"). A projection of a bound value is not a boundary-crossing name. Removing it from `variables.writes` and `reads` leaves `target_doc_path` as the one variable (Single Source of Truth). The inventory routes the shadow to `no-derived-state-shadow`. Correct.
- **R-A2: the container input** ("Shared inputs… for every technique in the folder"). report-failure reads `target_doc_path` through `TECHNIQUE.md`, with no leaf redeclaration. Correct.
- **R-A2: the checkpoint `message`** ("Ask the user whether to proceed"). It keeps its linked subject. Correct.
- **R-A7, R-A8, R-A9: Protocol prose citing resource sections.** No schema construct applies.

## Dropped candidates

- **Finalize checkpoint lost the target's name.** Dropped. The message no longer names the target, so `link-named-artifacts` has no construct to key on. The decision is about the staged content, and the target was confirmed at intake.
- **"in the category [Identifier Schemes] gives it" credits the home with choosing a change's category.** Dropped. Identifier Schemes enumerates the categories (functional, non-functional, success criterion) and each one's identifier form. That is what the bullet needs from it. Which category a change falls in reads from those entity names.
- **update-specification "Preserve the existing section structure when `{target_doc_exists}`" restates the Template's augment rule uncited.** Dropped. The note selects the branch (cadence and how). The inherited `specification-protocol-preserved` rule delivers the Template cite to this technique.
- **requirements-analysis-report Rules line 75 bundles one-reference-per-source with placement by type.** Left to walk A: it keys on the construct `one-invariant-per-rule`'s Detect names, and A Rule States One Invariant reaches no spelling beyond it.
- **update-specification cites five of the protocol's eight sections** (Cite Resources at Section Grain, "most of the body"). Dropped. The set was already five at base, through the inherited rule's `#identifier-schemes`. A bare cite would also deliver Final Specification Form, which a working pass must not apply.
- **Intake-record heading `{spec basename}` beside the `Target specification | {target path}` row.** Dropped. A title naming the record's subject, as sibling guides use one, is not a second statement of the fact.

## Coverage ledger (divergences)

| Home | Unit | Status |
|------|------|--------|
| Design Principles | 2. Internalize Before Producing | `not-applicable`: authoring conduct ("before writing content") |
| Design Principles | 3. Define Complete Scope Before Execution | `not-applicable`: authoring conduct ("before starting") |
| Design Principles | 4. Clarify Before Assuming | `not-applicable`: authoring conduct ("ask one question before acting") |
| Design Principles | 21. Match the Harness Surface | `not-applicable`: the surface names no tool, return shape or bootstrap path |
| Design Principles | 23. Close the Loop | `not-applicable`: session conduct ("a recommendation is followed by the action") |
| Design Principles | 27. State Contract Contribution | `not-applicable`: no container `TECHNIQUE.md` on the surface |
| Design Principles | 33. Pre-Session Prose Stands Alone | `not-applicable`: no prose on the surface is delivered before references resolve |
| Design Principles | 40. Fan-Out Lives at the Layer That Runs the Work | `not-applicable`: the surface has no fan-out |
| Design Principles | 41. A Phase States Answers the Tool Has Returned | `not-applicable`: no phase on the surface reads a tool response |
| Design Principles | 42. A Routine Holds the Codified Path | `not-applicable`: no routine on the surface |
| Design Principles | 43. A Workflow Borrows Activities | `not-applicable`: no borrowed activity |
| Design Principles | 47. A Calibrated Surface Extends by Wrapping | `not-applicable`: no schema or measured prompt is extended |

Blocked: 0. The other 35 principles, § Reference Conventions and the inventory were walked over all 11 files.

## File coverage

read 11 · unread 0.

| Disposition | Paths (under `corpus/requirements-refinement/`) |
|-------------|------|
| `read` | `activities/01-intake.yaml`, `activities/05-finalize-specification.yaml`, `activities/06-report-failure.yaml`, `techniques/analyze-source.md`, `techniques/record-intake.md`, `techniques/report-failure.md`, `techniques/update-specification.md`, `resources/intake-record.md`, `resources/failure-report.md`, `resources/requirements-analysis-report.md`, `resources/specification-protocol.md` |

These off-surface files were read for the traces and conformance only, and none is reported against: `techniques/TECHNIQUE.md`, `techniques/finalize-specification.md`, `activities/03-update-specification.yaml`, `activities/04-validate-specification.yaml`, `workflow.yaml`, `resources/README.md`, `resources/validation-rubric.md` (by grep), and the `workflow-design` / `work-package` creation-guide headings and technique version history.
