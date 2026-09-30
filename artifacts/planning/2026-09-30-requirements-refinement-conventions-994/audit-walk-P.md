# Canon Audit — `requirements-refinement` (slice P: principles, conformance, construct inventory, issue fidelity)

**Base ref:** `4662d88d` · **Corpus tree:** `.worktrees/workflow/requirements-refinement-conventions` at `6772e1ce` · **Coverage:** 49 of 49 units (47 design principles, 1 convention-conformance section, the schema construct inventory as one list) × 28 of 28 paths · **Change surface:** 21 files (touched: 18 · closure: 3 — `analyze-source.md`, `validate-specification.md`, `report-failure.md`, reached by the new `TECHNIQUE.md` rule · consumers: 0) · **Guards:** clean (236 of 236, per audit-surface; not re-run in this slice)

**Verdict:** Live 2 · Contract 9 · Hygiene 6, at that coverage. Residual: **0 files `unread`** of 28, **0 criteria units `blocked`** of 49.

| Band | Open | Known | Prior pass |
|------|-----:|------:|-----------:|
| Live | 2 | 0 | — |
| Contract | 9 | 0 | — |
| Hygiene | 6 | 0 | — |

All paths below are under `corpus/requirements-refinement/`.

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| F1 | Live | High | issue #994 item 1 | `techniques/store-sources.md` Inputs `meetings_dir`, `documents_dir` | "Directory, relative to `{host_repo_path}`, holding the meeting transcripts specifications cite." default `.engineering/artifacts/meetings/`. The server plans at `<project>/.engineering/artifacts/planning/`, "shared by every clone and worktree inside it" (`src/tools/resource-tools.ts` start_session description); a worktree checkout carries no `.engineering` (confirmed on this repo's worktrees). A run opened from a worktree stores transcripts inside that worktree, not beside the planning root, so the `../../meetings/` href form and cross-run reuse both miss | diff | Resolve both folders against the planning root (the parent of `{planning_folder_path}`'s folder), e.g. defaults `../meetings/` and `../documents/` relative to that root |
| F2 | Live | High | issue #994 item 3 / acceptance "Opening any citation…" | `resources/validation-rubric.md` § Consistency | "Every transcript href is relative and resolves to a transcript in the meetings folder." applies to every href, including those an augmented target already carries; only intake stores a transcript, and only one in `{source_paths}`. An inherited citation to a transcript this run was not given fails the check, no correction pass can store the file, and the rubric's "Source-traceability problems that cannot be resolved automatically" routes it to `report-failure` | diff | Have intake also store each transcript the target's section 2.2 lists when `{target_doc_exists}`, so every href the check reads has a stored copy |
| F3 | Contract | High | issue #994 item 3 | `resources/specification-protocol.md` § Source Reference Format; `techniques/finalize-specification.md` Rule `promotion-outside-this-operation` | "The href is the relative path from the specification to the file recorded for that reference in section 2." with examples `../../meetings/…`. The path base is the staged copy in the planning folder; the specification's home is `{target_doc_path}`. Promoted to a folder at another depth, every citation breaks, and an augment reading a rebased target breaks the working copy's citations instead | diff | Decide one base: state the href relative to `{target_doc_path}`'s folder and validate there, or state the rebase promotion applies; record the choice in Source Reference Format |
| F4 | Contract | Medium | [8. Confirm Before Irreversible Changes](design-principles.md); issue #994 items 1–2 | `techniques/store-sources.md` § 1 note; `techniques/redact-transcripts.md` § 1 | store-sources: "A file of that name already in the folder is that source's copy, and is reused as it stands." redact-transcripts then redacts every `meeting` entry again, before `sources-confirmed`, in a file other specifications already cite, so a passage an earlier run's user kept is re-redacted. Restore reads "from the entry of `{source_paths}` with the same file name", which is the redacted copy itself when the user names the stored transcript. A re-exported, corrected transcript of the same name is also discarded | diff | Redact only a copy store-sources made in this run; for a reused copy, list its existing markers and change them only as `{intake_correction}` names, stating that a restore needs the original named in `{source_paths}` |
| F5 | Contract | Medium | issue #994 item 2 (revise loop) | `activities/01-intake.yaml` `sources-confirmed` → `revise`; `techniques/redact-transcripts.md` § 1 | `recordReply: intake_correction` overwrites the prior correction; on each re-entry redact-transcripts reapplies [transcript-redaction](resources/transcript-redaction.md) to the stored copy. A passage restored on one revise is re-redacted on the next revise that corrects anything else | diff | Read `{transcript_redactions}` back into redact-transcripts on re-entry and keep each passage an earlier correction restored |
| F6 | Contract | Medium | intake outcome (revise loop) | `activities/01-intake.yaml` outcome; `techniques/intake-sources.md` § 2 | Outcome: "A correction the user types reaches the next intake as recorded text, over the paths and classifications already settled." intake-sources re-infers every type from content; a type correction survives only while it is the latest `{intake_correction}` | pre-existing | Take each source's type from the bound `{classified_sources}` on re-entry, and infer only for a source it lacks |
| F7 | Contract | Medium | issue #994 item 3 / acceptance "No planning artifact carries an absolute filesystem path" | `techniques/report-failure.md` § 3 | "filling the template's path slot from `{validation_report_path}`" — an absolute path by declaration ("Absolute path to the written validation report"), against the inherited rule `artifact-paths-relative`. Missing from the scope manifest | diff | Fill the slot with the validation report's path relative to the failure report (its bare filename) |
| F8 | Contract | Medium | [10. Non-Destructive Updates](design-principles.md) | `techniques/update-specification.md` § 1; `resources/validation-rubric.md` § Structure, § Content; `techniques/finalize-specification.md` § 2 | Rubric checks every entry ("No rationale reproduces a source's wording", "hold what Section Structure gives them"), so on augment the correction pass strips existing priority tags, rewords existing rationales, and drops an existing scope statement. The change summary is written "from `{requirements_analysis}`", which holds none of these, so the removals are never named | diff | Record the conformance rewrites applied to existing entries in the change summary, naming each removed priority tag and scope statement |
| P1 | Contract | Medium | [14. Single Source of Truth](design-principles.md); issue #994 item 1 ("every later activity name and read that file") | `techniques/TECHNIQUE.md` Inputs `source_paths`; `activities/03-…06-*.yaml` `variables.reads: source_paths`; `techniques/README.md` | After store-sources, `source_paths` holds the originals and `classified_sources[].path` the stored copies. Every technique inherits `source_paths` ("Filesystem paths of the source documents being processed"), activities 03–06 read it, and the README states completeness as "every normative statement in `{source_paths}`" — the unredacted originals | diff | Move `source_paths` out of the container's shared Inputs into the intake techniques that read it, drop it from 02–06 reads, and state completeness over `{classified_sources}` |
| P2 | Contract | Medium | [36. A Technique Names Only What Its Reader Holds](design-principles.md) | `resources/validation-rubric.md` § Consistency via `techniques/validate-specification.md` § 1; `activities/04-validate-specification.yaml` reads | The check "resolves to a transcript in the meetings folder" names a folder whose location lives only in store-sources' `meetings_dir` default. Activity 04 reads `source_paths` (originals), not `classified_sources` or `meetings_dir` | diff | Bind `classified_sources` into activity 04 and validate-specification, and phrase the check as resolving to the stored copy it names |
| P3 | Contract | Medium | [9. Encode Constraints as Structure](design-principles.md) | `techniques/TECHNIQUE.md` Rule `artifact-paths-relative`; `resources/intake-record.md`, `change-summary.md`, `requirements-analysis-report.md`, `failure-report.md` § Rules; rubric § Consistency | "No artifact carries an absolute filesystem path." is rule text. Its only check covers transcript hrefs in the specification; document hrefs, the intake record, the analysis, the change summary and the failure report have none, and `verify-artifact-conforms` checks guides whose Rules omit it | diff | Cite the rule from each creation guide's Rules so `verify-artifact-conforms` checks it, and widen the rubric check to every href |
| P4 | Hygiene | Low | [27. State Contract Contribution](design-principles.md) | `techniques/TECHNIQUE.md` Rule `artifacts-write-under-planning-folder`; `README.md` Overview | "Each technique writes its artifact under `{planning_folder_path}`." reaches store-sources and redact-transcripts, which write into the meetings and documents folders; README still reads "Every intermediate and final artifact lives in the run's planning folder." | diff | Scope the rule and the README sentence to declared planning artifacts |
| P5 | Hygiene | Low | [6. One Authoritative Home](design-principles.md) / [34. Edit the Owner](design-principles.md) | `resources/specification-protocol.md` § Final Specification Form | The key line `*Status: 🕒 pending · 💬 under review · ✅ accepted · 🗑️ deprecated*` restates each icon–status pair the Status Conventions table owns; a fifth status edits both | diff | State the key as the Status Conventions rows in table order, each icon then its status, joined by ` · ` |
| P6 | Hygiene | Low | [29. Cite Resource Policy; Do Not Restate It](design-principles.md) | `resources/validation-rubric.md` § Content (two new bullets); `techniques/update-specification.md` § 1 second bullet | Rubric: "No rationale reproduces a source's wording, a speaker-attributed form included." / "No rationale states what the sources leave open; each such statement is the entry's note." restate Requirement Entry Format uncited. update-specification: "and each question the sources leave open in its note" restates the same section | diff | Cite [Requirement Entry Format] on the rubric bullets; in update-specification keep only "whatever wording `{requirements_analysis}` carries" beside the citation |
| P7 | Hygiene | Low | [45. A Rule States One Invariant](design-principles.md) | `resources/intake-record.md` § Rules | "**A redaction names its passage, never its words.** One row per redacted passage, … The table is omitted when no transcript carries a redaction." — three constraints; the file's source table splits the same kinds ("One row per source.") | diff | Split into three entries |
| P8 | Hygiene | Low | [34. Edit the Owner](design-principles.md) | `intake_correction` in `activities/01-intake.yaml`, `techniques/resolve-inputs.md`, `intake-sources.md`, `redact-transcripts.md` | The enumeration "the sources, a source's classification, a transcript's redactions, or the target specification" sits in four files; three were edited only to keep agreeing | diff | Describe the input in each technique by what that technique reads from it, leaving the enumeration to the activity variable |
| P9 | Hygiene | Low | [28. Creation Guide for Generated Documents](design-principles.md) | `resources/README.md` § Planning artifact to guide map | `working-spec-{update_pass}.md` and `final-spec.md` map to `specification-protocol`, which has no `## Template` section | pre-existing | Give specification-protocol a `## Template` skeleton (the seven sections, and the final form's key) |

Highs re-derived from the cited file and entry: F1 (store-sources anchor vs the server's planning root; worktree checkouts confirmed without `.engineering`), F2 (rubric § Consistency scope vs intake as the only storing step; rubric critical category), F3 (Source Reference Format base vs finalize's promotion rule). None withdrawn. F3 held at Contract, not Live: the staged copy's citations resolve; the break lands on promotion.

## Issue fidelity (#994)

| Item | Status | Note |
|------|--------|------|
| 1 Keep transcripts in meetings folder | Partial | Copy rather than move is a recorded decision. Folder anchored to the checkout, not the planning root (F1). Later activities still bind the originals (P1). Reuse misfires on re-redaction and restore (F4) |
| 2 Redact before analysis | Delivered, with holes | Order, heading rule, record table and checkpoint link hold. Keep lost on a later revise (F5); reused copies re-redacted (F4) |
| 3 Relative citation href | Partial | Form, link text, 2.2 listing and rubric check delivered. Href base breaks on promotion (F3); inherited hrefs uncorrectable (F2); failure report absolute by protocol (F7); constraint unchecked outside transcript hrefs (P3) |
| 4 No priority tags | Delivered | Removal on augment unrecorded (F8) |
| 5 Status icon, final only | Delivered | Final Specification Form, finalize step, augment conversion back to status line |
| 6 Rationale in own words | Delivered | Protocol, update-specification, rubric § Content |
| 7 Open questions as notes | Delivered | Protocol note part, update-specification, rubric |
| 8 Executive summary purpose only | Delivered | |
| 9 Section 2.4 two lines | Delivered | Source Reference Format states storage and redaction |
| Acceptance | Partial | "No planning artifact carries an absolute filesystem path" contradicted by F7; "Opening any citation … lands on the cited timestamp section" holds for the staged copy only (F1, F3) |

## Candidates considered and dropped

- Copy rather than move (item 1) — recorded decision in the planning README.
- Checkpoint names redactions by linking the intake record, not inline (item 2) — recorded decision; the option description names the redactions.
- store-sources as a thin copy technique (26) — carries the reuse and inside-or-outside-repository judgement.
- Per-source iteration in the store and redact Protocols (40) — one judgement in one worker, same shape as sibling intake-sources; `loop-not-prose` is the anti-pattern walker's.
- `transcript_redactions` declared in `writes` though read only inside intake (inventory, activity variable contract) — sibling `source_readable` has the same shape.
- `_dir` suffix on `meetings_dir` / `documents_dir` (19) — matches `adr_dir`, `comprehension_dir`, `target_dir`.
- Step message and checkpoint message stating the same capture (12) — pre-existing shape; message entries are the anti-pattern walker's.
- Final Specification Form absent from `specification-protocol-preserved` — finalize cites the section directly; the rule preserves the target's layout.
- Icon-to-status-line conversion only in the `initial` branch — correction and revision passes read the working specification, which carries status lines.
- Same-name collision between two meetings — recorded as a known limit; the corrected re-export case is folded into F4.
- Resources without `metadata.version` — the workflow's resources, like work-package's, carry `order` only.
- `meetings_dir` description naming "specifications cite" (37) — describes the folder, not a caller.
- Section 2.4's second line omitting the document author — issue's exact wording.
- Negative phrasing in the protocol ("carries no priority tag", "never the heading") (17) — each states the invariant itself.

## Convention conformance (divergences)

| Concern | Divergence | Disposition |
|---------|-----------|-------------|
| Directory input description | `meetings_dir` / `documents_dir` state their anchor ("relative to `{host_repo_path}`"); `adr_dir` states none | More precise than the sibling, but the anchor is wrong (F1) |

Technique ids (`store-sources`, `redact-transcripts`), resource id (`transcript-redaction`, `order: 8`), `#### default` blocks, version bumps (workflow and intake minor; new techniques 1.0.0; description-only widenings patch), and field order (`id`, `version`, `name`, `description`, `variables`, `required`, `steps`, `exits`, `outcome`; Capability / Inputs / Outputs / Protocol) match `work-package`, `workflow-design` and `codebase-wiki`.

## Coverage

| Home | Unit | Status |
|------|------|--------|
| Design Principles | 2. Internalize Before Producing | not-applicable — governs the author's reading before drafting; no definition construct |
| Design Principles | 23. Close the Loop | not-applicable — "When implementation is in scope, a recommendation…"; no recommendation construct on the surface |
| Design Principles | 33. Pre-Session Prose Stands Alone | not-applicable — the surface carries no prose delivered before references resolve |
| Design Principles | 42. A Routine Holds the Codified Path | not-applicable — no routine and no sequence several sites share |
| Design Principles | 43. A Workflow Borrows Activities | not-applicable — no borrowed activity |
| Design Principles | 46. A Consumer Binds the Contract | not-applicable — no shared contract declared for other definitions |
| Design Principles | 47. A Calibrated Surface Extends by Wrapping | not-applicable — no schema or measured prompt touched |

Blocked: 0.

## File coverage

read 28 · unread 0. All 28 surface files read whole at `6772e1ce`; base versions read by `git diff 4662d88d HEAD` and `git show 4662d88d:…`. Reference files consulted whole: `work-package/techniques/create-adr.md`; by excerpt: sibling activity headers, `codebase-comprehension/TECHNIQUE.md`, `codebase-wiki` resource frontmatter, server `src/utils/session/scope.ts`, `src/tools/resource-tools.ts`.
