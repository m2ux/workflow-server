# Canon Re-audit — `requirements-refinement` — walk A (anti-pattern catalog, whole)

**Base ref:** `0193e9bb` · **Corpus tree:** `.worktrees/workflow/requirements-refinement-hygiene` at `34067ffc` · **Coverage:** 173 of 173 catalog units (8 Creation Rules + AP-01–AP-165) × 13 of 13 paths · **Change surface:** 13 files (touched: 10 · closure: 3 · consumers: 0), per [reaudit-surface.md](reaudit-surface.md) · **Guards:** 236 of 236 at HEAD (from the surface record; not re-run here)

**Verdict (this slice):** Live 0 · Contract 2 · Hygiene 7. All nine `pre-existing`; the fix round introduced none. Residual: **0 files `unread`** of 13, **0 units `blocked`** of 173.

| Band | Open | Known | Prior pass (walk A + B slices of [canon-audit.md](canon-audit.md)) |
|------|-----:|------:|-----------:|
| Live | 0 | 0 | 0 |
| Contract | 2 | 0 | 3 (A1, B2, B3) |
| Hygiene | 7 | 0 | 16 (A2–A8, B4–B12) |

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| R-A1 | Contract | Medium | `cited-home-owns-claim` | `resources/requirements-analysis-report.md` `## Rules`, "Every source gets its own reference under Document Updates Required." | "list each in the section [Specification Protocol](./specification-protocol.md#section-structure) names for that source type." § Section Structure lists 2.1 Product and Solution, 2.2 Meeting Transcripts, 2.3 Vendor, 2.5 Reference Documents, and maps no source type to a section. From that section alone a `document` could go to 2.1, 2.3 or 2.5. The mapping is in § Source Reference Format ("Section 2.2 lists each transcript, and section 2.5 each document") and § Reference Documents. The same guide's Template line 49 also states it. | pre-existing (same line at `0193e9bb`) | Cite [Source Reference Format](./specification-protocol.md#source-reference-format), which states the mapping, or state 2.2 / 2.5 in the rule. |
| R-A2 | Contract | Medium | `no-derived-state-shadow` | `activities/01-intake.yaml` `variables.writes` → `spec_basename`; read by `techniques/report-failure.md` `### spec_basename` input and the `05-finalize-specification` message | "Basename of the target specification": a pure projection of `target_doc_path`. A technique input reads it. `resolve-inputs` and the `target-doc-named` `recordReply` write `target_doc_path` before `record-intake` re-derives the shadow. The two can disagree, but only in a window no reader reaches. | pre-existing | Delete `spec_basename`. Readers take the basename of `{target_doc_path}`: report-failure derives it, and the finalize message links the path. |
| R-A3 | Hygiene | Low | `link-named-artifacts` | `activities/01-intake.yaml` step `record-intake` → `actions[0].message` | "The source set and the target specification are captured, … ([intake record]({intake_record_path}))." names the target specification with no link, although `{target_doc_path}` is bound at that step. B9 fixed the sibling checkpoint. This action message still has the same construct. | pre-existing (identical at `0193e9bb`) | `[target specification]({target_doc_path})`, as in `sources-confirmed`. |
| R-A4 | Hygiene | Low | `omit-null-sections` | `resources/requirements-analysis-report.md` `## Template` → `## Quality Issues Identified`, `## Implementation Notes` | Headed sections a run can leave empty (no ambiguities found; no extra context), with no omit mark. B10 marked only the three Requirements Changes subsections. | pre-existing | Add `[Omit this section if none]` under both headings (house spelling: 15 corpus uses). |
| R-A5 | Hygiene | Low | `one-invariant-per-rule` | `resources/failure-report.md` `## Rules`, "**Issue IDs carry over.**" | "The IDs are the ones the validation reports assigned. The report links the final validation report rather than restating its findings." These are two constraints, ID carry-over and link-not-restate. Each can be cited on its own. | pre-existing | Split: keep "Issue IDs carry over", and give "The report links the final validation report rather than restating its findings" its own entry. |
| R-A6 | Hygiene | Low | `one-invariant-per-rule` | `resources/change-summary.md` `## Rules`, "**Line budget:**" | "~40 lines. The summary says what changed; the specification says what the requirements are." This is the budget plus a content boundary, the shape B11 split in the analysis guide. | pre-existing | Give the content boundary its own entry. Keep the budget alone. |
| R-A7 | Hygiene | Low | `no-rationale-in-description` | `techniques/analyze-source.md` `## Protocol` → `### 3. Create Source References`, bullet 1 | "Assign one source reference per entry in `{classified_sources}`, so every document the analysis draws on is citable in its own right." Delete the "so…" clause and the instruction still says what is constrained. | pre-existing | Delete the clause. |
| R-A8 | Hygiene | Low | `no-technique-resource-dual-home` | `techniques/update-specification.md` `### 1. Apply Changes`, `initial` note | "create new requirements with sequential identifiers" restates [Identifier Schemes](../resources/specification-protocol.md#identifier-schemes) ("the next available number within its category"), uncited and with drift ("sequential" against "need not be contiguous"). "Set every newly added requirement's status to `pending` per [Status Conventions]" restates that section's first bullet beside the cite. | pre-existing | Cite Identifier Schemes for new identifiers. Reduce the status clause to "per [Status Conventions]", as B3 did for the entry format. |
| R-A9 | Hygiene | Low | `no-technique-resource-dual-home` | `techniques/analyze-source.md` `### 2. Identify Requirement Changes`, bullet 2 | "Map each change to an existing requirement identifier where one applies; otherwise mark it as a new requirement" restates, nearly word for word, requirements-analysis-report `## Rules` "Identifiers are reused where they apply. Map each change to an existing requirement identifier where one applies; otherwise propose a new identifier…". The technique links those Rules in § 2 bullet 3 and § 6. | pre-existing | Delete the bullet. § 2 bullet 3's cite of the Rules carries it, and the Identifier Schemes cite moves to that bullet. |

Highs: none raised. Mediums spot-confirmed: R-A1, re-read against § Section Structure (the section-type mapping is absent there, present in § Source Reference Format). R-A2, confirmed from the three `spec_basename` readers and the writers of `target_doc_path` in `01-intake`.

## Closure of the fixed findings

| Finding | Raising unit | Still fires? | Evidence at `34067ffc` |
|---|---|---|---|
| F6 | intake outcome (issue fidelity, walk P). Traced here under `unproduced-value-read` | No | `intake-sources` § 2 note: "A source the bound `{classified_sources}` already classifies, matched by file name, keeps that type over the inference", and a correction outranks both. First pass reads the `[]` default, which is seeded at session creation only (`src/schema/variable.schema.ts` `defaultValue`), so re-entering the activity does not reset it. On revise it reads store-sources' prior output, and store-sources keeps each file name, so the match holds. A correction from pass 2 survives pass 3's correction. |
| A4 | `no-rationale-in-description` | No | The sentence "Each source carries its own type, so … rather than as a whole." is gone. |
| A5 | `constraint-as-blockquote` | No | The condition sits in "> When `{target_doc_exists}`, also read…". |
| A6 | `constraint-as-blockquote` | No | "Apply `{intake_correction}` over the starting paths…", with "> Unset, `{intake_correction}` changes no path." |
| P9 | Creation Guide for Generated Documents (walk P). Catalog counterpart `no-template-creation-guide` | No | `specification-protocol.md` `## Template` exists. The guide map sends `working-spec-{update_pass}.md` and `final-spec.md` there, and update-specification cites `#template`. |
| A8 | `no-resource-caller-backlink` | No | The intro opens "Creation guide for bare filename `failure-report.md`": the creation-guide carve-out. |
| B9 | `link-named-artifacts` | No, on `sources-confirmed`. **Yes on the sibling action message** | See R-A3. |
| B10 | `omit-null-sections` | No, in change-summary. **Yes in the analysis report** | See R-A4. |
| B11 | `one-invariant-per-rule` | No, in the analysis report | The same shape remains in change-summary (R-A6), and failure-report has its own two-constraint rule (R-A5). |
| B12 | `variable-description-one-line` | No | "Filesystem paths of the source documents the user named, each a meeting transcript or an unstructured document". This now disagrees with the owning `01-intake` writes description (see notes for walk P). |

## Candidates dropped

- `constraint-as-blockquote`: intake-sources § 2's three notes (`  > - …`). Correct form, and an ordered ladder: "An ordered sub-action or a precedence ladder."
- `constraint-as-blockquote`: update-specification `initial` note, "Preserve the existing section structure when `{target_doc_exists}`; instantiate the [Template] when creating from scratch". Dropped: "An If / Else if / Otherwise ladder over one choice, at any indent."
- `constraint-as-blockquote`: analyze-source § 1 bullet 2, "Where two sources bear on the same subject, carry both readings forward…" (pre-existing). The condition is what triggers the instruction, and the instruction means nothing without it; A6's instruction still made sense unconditionally. No Do not flag clause names this. Proposed clause: *a condition that is the instruction's own trigger*.
- `unproduced-value-read`: intake-sources reads `{classified_sources}` before its own write on the first pass. Dropped: "A `defaultValue` seeded at session creation." The `[]` means what the reader needs, nothing classified yet, so the Fix's clause about a default indistinguishable from a produced value does not apply. Revise pass: traced in the closure table.
- `reference-without-provenance`: "matched by file name". The suppliers are named (`{classified_sources}` and `{source_paths}`, each entry's `path`). store-sources "keeping its file name" guarantees equality, and it matches the sibling form in redact-transcripts, "the entry of `{source_paths}` with the same file name". Off surface: two sources sharing a basename already collide in store-sources' folder, and the new match inherits that.
- `anchored-protocol-references`: same phrase. Dropped: "Domain prose that names no formal artifact."
- `whole-resource-for-one-section`: update-specification's cites into specification-protocol (`#source-reference-format`, `#status-conventions` ×2, `#template`, `#requirement-entry-format`) are all anchored, and none is bare. The Detect does not fire. "citation-grain" is not a catalog entry. The section-grain question (Template cited without the protocol's `#rules`) goes to walk P.
- `framing-outside-any-section`: pre-`##` framing in specification-protocol, failure-report (edited by A8) and requirements-analysis-report. Dropped: "Orientation-only framing a section consumer does not need (record the verdict)". Recorded as `harmless` / `orientation-only` in `ledgers/section-framing-triage.json`. The new prose (Section Structure line 31, the Template) sits under `##`.
- `no-guide-wrapper-ceremony`: specification-protocol's Section Structure beside the new Template. Dropped: "Behavioral reference documents … that are mostly operative". Each item carries a fill constraint. The edited message is out of this resource entry's reach.
- `omit-null-sections`: specification-protocol Template subsections 2.1, 2.3, 2.5 and sections 3–7 are headed with no content on a fresh specification. The rubric requires every canonical section present, and no Do not flag clause names a protocol-mandated section. Proposed clause: *a section a preserved external protocol requires present*. On the edited message: it confirms a non-null intake, so the Detect does not fire.
- `statement-not-question`: `sources-confirmed.message` is a statement with no `?`.
- `link-named-artifacts`: in create mode, `[target specification]({target_doc_path})` links a path no file occupies yet. The Detect keys on an unlinked name, so this falls outside it. The message carries "(target exists: false)".
- `stale-restatement-after-change`: "instantiate the full Section Structure" has no other home (grep of `instantiat|section-structure|from scratch`). The protocol intro's "instantiated in full" is consistent: "A restatement the change did not affect." The old phrasing "Section 2.4 carries these two lines" is gone. TECHNIQUE.md and the rubric cite Section Structure, which now names the Template for 2.4. The frontmatter `description` and the `resources/README.md` row list the sections without Template, but the change added a section; the Detect keys on a changed gate, precondition, default or ordering (to walk P).
- `cited-home-owns-claim`: validation-rubric § Structure, "each section the run adds holds what that structure gives it". Section Structure states that 2.4 carries "the two lines the [Template](#template) gives it". Dropped: "A citation that points at content in X."
- `canonical-fact-home`: Template headings against Section Structure's list. The Detect keys on several templates each mandating a section for one fact category. Here there is one template and one prose list, in one resource (to walk P, One Authoritative Home).
- `no-technique-resource-dual-home`: the same pair. Both homes are in the resource, and the Detect keys on technique and resource. update-specification's `#template` cite: "A one-line pointer to the resource."
- `no-dense-prose-after-config-examples`: Section Structure beside the Template. Dropped: "One sentence that adds a non-obvious constraint the example cannot show", once per item (no scope statement, domain subsections).
- `one-invariant-per-rule`: the analysis-report Line budget rule after the split. "The source-coverage matrix is the payload" elaborates the budget. The specification-protocol budget rationale and TECHNIQUE.md `artifact-paths-relative`'s entailed second sentence are dropped the same way: "A single constraint stated with the failure mode that makes it matter".
- `variable-description-one-line`: `host_repo_path` and `planning_folder_path` end "seeded when the session opens". Convention conformance decides a form the siblings carry: the same phrase appears in `workflow-design`, `workflow-authoring` and `plain-language` `workflow.yaml`.
- `overlapping-rule-scopes`: intake-sources note 1 (an empty source gets no classification) against note 2 (a carried type). The Detect's bucket is Rules or fill rules. These are Protocol notes, and an empty source ends the run at `source-unreadable`.
- `no-resource-caller-backlink`: analysis-report "Narrative about the sources belongs in the intake record." Dropped: "A sibling resource citation" (as in the prior pass).
- `no-bind-mechanics-as-prose`: "Unset, `{intake_correction}` changes no path" and "the bound `{classified_sources}`". Dropped: "Protocol that consumes an already-bound `{id}`". The first states what absence means.
- `inherited-input-re-declared`: resolve-inputs `target_doc_path`. Dropped: "an optionality the technique needs."
- `hoist-shared-inputs`: `source_paths` and `intake_correction` on three leaves. Dropped: "only two or three techniques whose common ancestor declares none".
- `brace-declared-ids`: the Template's `{System name}` and `{The purpose of the system.}` are template slots, not designators. The sibling `failure-report` uses `{spec basename}`, and `artifact-name-is-filename` recognises `{placeholder}`.
- `resource-id-names-its-content`: specification-protocol now holds `## Template`. Dropped: "A bare noun where no sibling carries a kind word."
- `relocation-without-a-preserved-outcome`: the 2.4 lines moved. The Detect keys on a gate, exit, bound technique or rule, and the site that lost the lines names the one that gained them.
- `no-rationale-in-description`: failure-report intro and the other resource body prose. The Detect's field list does not name resource body prose (as in the prior pass).
- `no-caption-only-message`: `sources-confirmed` repeats the preceding action message. Dropped: "Messages that link a persisted artifact".

## Coverage

| Home | Unit | Status |
|------|------|--------|
| Anti-Patterns | Creation Rules (8 entries) | `not-applicable`: the family binds when the change edits `anti-patterns.md`, and this change does not |
| Anti-Patterns | `no-partial-implementation`, `no-assumption-execution`, `scope-reverify-completion` | `not-applicable`: the Detect names a done claim or agent intent-choice, which is session conduct |
| Anti-Patterns | `impl-before-confirmed-approach`, `follow-through-on-recommend`, `verify-format-literacy`, `accept-correction` | `not-applicable`: the Detect names authoring-session conduct (modification before confirmation, recommendations as deliverable, drafting or commit validation, disputing a correction) |
| Anti-Patterns | `preserve-readme-content` | `not-applicable`: the Detect keys on a README edit and user confirmation, and no surface README was edited |
| Anti-Patterns | `complete-bootstrap-path`, `pre-session-prose-defers-to-the-framework` | `not-applicable`: the Detect names a bootstrap or pre-session surface, and there is none on the surface |
| Anti-Patterns | `describe-tool-value` | `not-applicable`: "On surfaces that legitimately describe tools", and there is none on the surface |
| Anti-Patterns | `prompt-restates-owned-mechanics`, `engine-internals-narrated` | `not-applicable`: the Detect names stub, agent-entry or engine techniques |
| Anti-Patterns | `no-shadow-audit-pass`, `canon-layer-cites-not-restates` | `not-applicable`: the Detect names an audit technique or an upper canon layer |
| Anti-Patterns | `cut-comment-jsdoc-verbosity` | `not-applicable`: the Detect names code comments or JSDoc, and the surface holds none |

Blocked units: 0. Walked: 149 of 173, each against all 13 files. The `atomic-checkpoints`, `one-question-per-message`, `statement-not-question`, `no-next-step-narration`, `link-named-artifacts` and `checkpoint-requires-decision` walks covered every `message` and option in `01-intake.yaml`.

## File coverage

read 13 · unread 0.

Touched (10): `activities/01-intake.yaml`, `workflow.yaml`, `techniques/{analyze-source,intake-sources,resolve-inputs,update-specification}.md`, `resources/{change-summary,failure-report,requirements-analysis-report,specification-protocol}.md`. Closure (3): `techniques/TECHNIQUE.md`, `resources/validation-rubric.md`, `resources/README.md`. Also read for tracing, and not reported against: `techniques/{store-sources,record-intake,redact-transcripts,report-failure}.md` (partial grep), `ledgers/section-framing-triage.json`, server `src/schema/variable.schema.ts` and `src/schema/workflow.schema.ts` (`defaultValue` seeding).

## Notes for walk P (outside this slice)

- **Edit the Owner / One Authoritative Home.** The B12 fix rewrote `workflow.yaml` `source_paths`. The `01-intake` `writes` declaration, which owns the variable per the schema ("A variable an activity writes is declared by that activity"), still reads "Filesystem paths of the local source documents being processed…". The same variable now carries two descriptions.
- **One Authoritative Home.** specification-protocol holds the section list and numbering twice, in § Section Structure's list and the Template's headings. Adding a section means editing both.
- **Cite Resources at Section Grain / convention.** update-specification cites `#template` without the protocol's `#rules` (per-entry line budget). Its siblings cite "[Template](…#template) and its [Rules](…#rules)" (analyze-source, record-intake, report-failure).
- **Completeness.** The frontmatter `description` and the `resources/README.md` row list the protocol's sections without Template (and without Reference Documents).

## Guard candidates (second occurrence)

- `omit-null-sections`: B10, then R-A4, in consecutive walks. Possible key: a `##`/`###` heading inside a `## Template` fence whose placeholder is a bracketed list or description, with no `[Omit…]` line. Optionality is a judgement, so this would be a triage-ledger guard.
- `one-invariant-per-rule`: B7, B11, then R-A5 and R-A6. Possible key: a resource `## Rules` bullet whose body after the bold lede holds two or more sentences with different subjects. Judgement-bound, so it would also need a triage ledger.
- `link-named-artifacts`: B9, then R-A3. Possible key: a `message` naming a noun that some `*_path` variable in the activity's reads or writes describes, with no `]({…_path})` in that message.
