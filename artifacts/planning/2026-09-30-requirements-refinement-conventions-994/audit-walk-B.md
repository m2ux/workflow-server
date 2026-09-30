# Canon Audit Walk B — `requirements-refinement`, anti-patterns AP-71 to AP-165

**Base ref:** `4662d88d` · **Corpus tree:** `.worktrees/workflow/requirements-refinement-conventions` @ `6772e1ce` · **Slice:** anti-pattern families Tool-Technique-Doc Consistency, Execution, Output Economy, Canon Hygiene, Technique Protocol, Draft Hygiene (95 entries, through the last entry of the file, `unproducible-declared-value`) · **Coverage:** 95 units × 28 paths, 28 read, 0 unread · **Change surface:** 28 files (touched 18, closure 10 technique leaves via `TECHNIQUE.md`, consumers 0)

**Verdict:** Live 0 · Contract 3 · Hygiene 9. Residual: 0 files `unread`, 0 units `blocked`.

| Band | Open | Known | Prior pass |
|------|-----:|------:|-----------:|
| Live | 0 | 0 | — |
| Contract | 3 | 0 | — |
| Hygiene | 9 | 0 | — |

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| B1 | Contract | High | `reference-without-provenance` | `resources/specification-protocol.md` § Source Reference Format, first paragraph | "The href is the relative path from the specification to the file recorded for that reference in section 2." A run holds several specifications: `working-spec-{update_pass}.md` and `final-spec.md` in the planning folder, and the canonical one at `{target_doc_path}`. The examples (`../../meetings/2026-04-12-planning.md`) resolve only from `.engineering/artifacts/planning/<folder>/`. The merged rule `artifact-paths-relative` ("relative to that artifact's folder") fixes the base at the planning folder. So every href breaks once the spec is promoted to a `{target_doc_path}` at another depth. In augment mode, existing hrefs that are relative to the target's folder are carried into the planning-folder working spec, where the rubric's "Every transcript href is relative and resolves" check reads them. | diff (at base the href was "the source file recorded for that reference", with no relative base) | Name the base the href is relative to (e.g. the folder of `{target_doc_path}`), or declare it and reference the designator. Reconcile `artifact-paths-relative` for the specification artifact to match. |
| B2 | Contract | Medium | `overlapping-rule-scopes` | `resources/transcript-redaction.md` § Redacted Conversation (`personal`) vs § Rules | `personal`: "A participant's private life, such as family, health, and whereabouts". Rule: "**Conversation on the meeting's topics is kept whole**, informal wording included." An on-topic passage that carries a whereabouts or health aside (for example, an absence that moves a review) meets both triggers. One says redact and the other says keep whole, and neither sets the order. | diff (new file) | Make it one entry with the narrower case as a condition (e.g. a personal detail inside on-topic conversation is redacted, and the rest of the passage is kept), or have the narrower entry name what it overrides. |
| B3 | Contract | Medium | `no-technique-resource-dual-home` | `techniques/update-specification.md` § Protocol › 1. Apply Changes, second bullet | "Write each entry … per [Requirement Entry Format](…#requirement-entry-format): its rationale in the specification's own words, whatever wording `{requirements_analysis}` carries, and each question the sources leave open in its note." The linked section already owns "never reproduces a source's wording" and "The note … states what the sources leave open … The rationale carries no such statement." | diff | Keep the pointer and the technique-owned clause ("whatever wording `{requirements_analysis}` carries"). Delete the restated note criterion. |
| B4 | Hygiene | Low | `stale-restatement-after-change` | `techniques/intake-sources.md` § Rules › `intake-captures-only` | "Capture and classify only; do not analyze or modify the specification during intake." The change adds `store-sources` (copy into the repository) and `redact-transcripts` (rewrite the stored transcripts) to the intake activity, so "only … during intake" no longer holds. | diff (the rule text is at base; the change made it stale) | Scope the rule to what this technique does, or restate what intake excludes (analysis, specification edits) without "only". |
| B5 | Hygiene | Low | `stale-restatement-after-change` | `techniques/README.md`, closing paragraph | "Completeness is a comparison of the documents in hand: every normative statement in `{source_paths}` reaches a requirement…". After the change, the documents in hand are the stored, redacted copies in `{classified_sources}` (analyze-source reads those, and `store-sources` re-produces the paths). `{source_paths}` stays the originals. | diff (line at base; the change moved where sources are read from) | Name the stored copies (`{classified_sources}`) as the compared set, or drop the variable from the orientation line. |
| B6 | Hygiene | Low | `whole-resource-for-one-section` | `techniques/redact-transcripts.md` § Outputs › `transcript_redactions` | "the kind [transcript-redaction](../resources/transcript-redaction.md) gives it". The phrase reads one section (Redacted Conversation, the Kind table) of a resource with three sections. (The Protocol's bare citation reads all three, so its Do-not-flag clause covers it.) | diff (new file) | Cite `../resources/transcript-redaction.md#redacted-conversation` with the section title as link text. |
| B7 | Hygiene | Low | `one-invariant-per-rule` | `resources/intake-record.md` § Rules, redaction entry | "**A redaction names its passage, never its words.** One row per redacted passage, giving its transcript, the heading above it, and its kind per […]. The table is omitted when no transcript carries a redaction." This holds three constraints: no quoted words, the row shape, and omission when there are none. Sibling `validation-report.md` gives omission its own entry ("Coverage gaps are omitted when coverage is complete."). | diff | Split the omission clause (and the row shape if it is citable on its own) into their own entries. |
| B8 | Hygiene | Low | `instruction-narrates-an-actor` | `techniques/TECHNIQUE.md` § Rules › `artifacts-write-under-planning-folder` | "Each technique writes its artifact under `{planning_folder_path}`." The container merges this into every leaf. `store-sources` and `redact-transcripts` declare no artifact and write repository files under `{meetings_dir}` / `{documents_dir}`, so this clause states a third-person duty that they cannot meet and that contradicts their Protocol's destination. | diff (the rule is at base; the new leaves are where it fails) | Address the reader and scope the rule to its own actor: "Write each declared `#### artifact` under `{planning_folder_path}`." |
| B9 | Hygiene | Low | `link-named-artifacts` | `activities/01-intake.yaml` › `sources-confirmed.message` | "The source set and the target specification {target_doc_path} (target exists: {target_doc_exists}) are captured…". This names a durable file (existing in augment mode) as a bare interpolation, not as `[label]({target_doc_path})`. | pre-existing (the same construct at base line 78; the line was touched) | Interpolate `[target specification]({target_doc_path})`. |
| B10 | Hygiene | Low | `omit-null-sections` | `resources/change-summary.md` § Template (`## New/Updated/Deprecated Requirements`, `## Sources Added`), `resources/requirements-analysis-report.md` § Template (`### Deprecated Requirements`) | Headed sections with no omit instruction. A run with no deprecations writes an empty headed section. | pre-existing | Mark the optional sections `[Omit if none]` in each template. |
| B11 | Hygiene | Low | `one-invariant-per-rule` | `resources/requirements-analysis-report.md` § Rules › Line budget | "**Line budget:** ~120 lines, whatever the size of the source set. The source-coverage matrix is the payload; narrative about the sources belongs in the intake record." This holds two constraints: the budget, and where source narrative lives. | pre-existing | Give "narrative about the sources belongs in the intake record" its own entry. |
| B12 | Hygiene | Low | `variable-description-one-line` | `workflow.yaml` › `variables[source_paths].description` | "Filesystem paths of the local source documents being processed, each a meeting transcript or an unstructured document. A single-document run carries one entry." This is two sentences. | pre-existing | Keep one line naming the value. |

**High verification.** I re-derived B1 from `specification-protocol.md` and the entry alone. The Detect's second clause ("the named kind is one the context holds several of") reproduces: the run holds three specification files at two locations. It stays High because the defect reaches every citation in every spec the run produces. The caller should decide whether the augment-mode path (existing target hrefs re-read from the planning folder by the rubric's resolve check) makes it Live.

## Candidates considered and dropped

- `unproduced-value-read`: `classified_sources` has a second producer, `store-sources`, gated `source_readable == true`. Its readers `redact-transcripts` and `record-intake` carry the same gate. Activity 02 is reachable only through `sources-confirmed`, after the `source-unreadable` exit takes the false branch, and there is `defaultValue: []`. Do-not-flag clause: "A reader gated by the same expression as its producer" / "A `defaultValue` seeded at session creation".
- `unproduced-value-read`: `transcript_redactions` has one producer (`redact-transcripts`) and one reader (`record-intake` input), both `when: source_readable == true`. Same clause.
- `unproduced-value-read`: `intake_correction` has a new reader (`redact-transcripts`). The reader is an optional technique input whose contract states the unset case ("Unset until a correction is given"). Neither Detect shape applies (no equality or relational reader gate, and no ungated reader that needs the value).
- `output-without-destination`: `store-sources.classified_sources` is read by `redact-transcripts`, `record-intake` and `analyze-source`. `redact-transcripts.transcript_redactions` goes to the same-named `record-intake` input, which is captured into `intake.md`. Every other output on the surface lands in an artifact, a message, a validate target or an exit.
- `declared-input-never-read`: every input of all 11 leaves is referenced in Protocol or Rules (new: `store-sources` classified_sources, host_repo_path, meetings_dir, documents_dir; `redact-transcripts` classified_sources, intake_correction; `record-intake` transcript_redactions). `TECHNIQUE.md` Do-not-flag clause: "An input on a container `TECHNIQUE.md`".
- `apply-omits-declared-input`: there are no Protocol `Apply` or `::` sites on the surface.
- `inherited-input-re-declared`: `resolve-inputs` re-declares `source_paths` and `target_doc_path` as *(optional)*. Do-not-flag clause: "an optionality the technique needs". `redact-transcripts` uses the inherited `{source_paths}` without re-declaring it. `host_repo_path`, `classified_sources` and `intake_correction` are shared by leaves that no ancestor declares. Do-not-flag clause: `hoist-shared-inputs`.
- `unproducible-declared-value`: `kind` `personal` / `off-topic`, `type` `meeting` / `document`, `update_pass_kind` and `update_pass` are each assigned on some path, and no later phase reassigns them.
- `stale-restatement-after-change`, other searches:
  - Priority tags: no surviving `P0` or "priority" claim.
  - Scope: no Executive-Summary scope claim elsewhere.
  - Status line: `update-specification` maps the icon to the status line, and the working spec keeps the line.
  - The `01-intake.yaml` `description` was not widened, but it asserts nothing false. Clause: "A restatement the change did not affect".
  - "specification-fidelity rules" (`TECHNIQUE.md` Capability, `techniques/README.md`): `artifacts-write-under-planning-folder` already sat outside that label at base.
  - `report-failure` "filling the template's path slot from `{validation_report_path}`" and `record-intake` "capturing `{classified_sources}` … `{target_doc_path}`" (absolute values): "from" and "capturing" allow a relative path to be derived, and the merged `artifact-paths-relative` rule governs the form, so no restatement asserts an absolute path.
  - README Structure line "report/rubric/summary templates" (now also `transcript-redaction`): the Detect keys on a changed gate, precondition, default or ordering.
- `whole-resource-for-one-section`: the `redact-transcripts` Protocol "per [transcript-redaction]" reads all three sections. Clause: "a technique whose sections are most of the file". Every other technique citation is anchored.
- `framing-outside-any-section`: `transcript-redaction.md` has 86 characters before the first `##`, under the ~100 threshold. The `intake-record.md` framing was reworded in the diff but is still orientation, as `ledgers/section-framing-triage.json` records (orientation-only). The `requirements-analysis-report.md` and `specification-protocol.md` framings are judged by the same ledger.
- `artifact-audience-declared`: every `#### artifact` carries `#### audience`. `store-sources` and `redact-transcripts` declare no artifact. Clause: "An output with no `#### artifact`".
- `link-named-artifacts`: the `record-intake` action message implies the stored copies ("each source held in the repository") without linking them. The linked intake record lists each copy. There is no clause for this. Proposed Do-not-flag carve-out: "a set of files the linked artifact enumerates."
- `statement-not-question`: all four checkpoint messages are statements with no `?`.
- `no-next-step-narration`: `06` "Refinement stops with unresolved issues." and the `target-doc-named` option description are factual status. Clause: "Pure factual status clauses".
- `no-technique-resource-dual-home`:
  - `redact-transcripts` Capability "keeping every heading" states the product's defining property and carries no criteria list.
  - The `report-failure` verdict mapping is technique-owned HOW.
- `cited-home-owns-claim`: I checked every "per X" / "from X" citation on the surface, and each target section holds the claim (Redacted Conversation, Status Conventions icons, Final Specification Form, Section Structure 2.2/2.5, requirements-analysis-report Rules).
- `bind-site-is-orchestration-truth`: the README activity table and Flow diagram. Clause: "at-a-glance activity names with one-line roles". Sibling workflows carry the same Flow form.
- `structure-backed-constraints`: `artifact-paths-relative` is backed for the specification by the rubric's Consistency checks. Planning-artifact portability is non-critical. Clause: "Explicitly guidance-only / non-critical rules".
- `no-derived-state-shadow`: `update_pass_kind` versus `has_correctable_issues`. `update_pass_kind` has three producers (02, 04, 05). Clause: "Distinct facts that merely correlate".
- `procedure-in-capability` / `deployment-path-in-capability`: the `store-sources` Capability names folders by kind, and the paths sit in `#### default`. Clause: "A path in … an I/O `#### default`".
- `variable-description-one-line`: `host_repo_path` / `planning_folder_path` "seeded when the session opens" is the sibling form in `workflow-design`, `workflow-authoring` and `plain-language`.
- `branch-on-undeclared-threshold`: `correction_iteration < 3` is a server-evaluated exit. Clause: "Thresholds the harness or server owns".
- `rule-binds-beyond-its-operation`: `intake-captures-only` ("during intake"). Clause: "A prohibition … addressed to the reader". Taken as B4 instead.
- `no-dense-prose-after-config-examples`: each paragraph after the specification-protocol entry example adds a constraint the fence cannot show. Clause: "One sentence that adds a non-obvious constraint".

**Cross-slice pointers** (outside AP-71 to AP-165, for the other walker):
- `store-sources` writes outside `{planning_folder_path}` under the merged rule `artifacts-write-under-planning-folder`: `no-contradictory-rules`.
- `intake_correction` is declared identically in 3 leaves, `classified_sources` in 4 and `host_repo_path` in 2: `hoist-shared-inputs`.
- `store-sources` and `redact-transcripts` write or modify repository files with no `#### artifact`: `artifact-not-buried`.

## Coverage

| Home | Unit | Status |
|------|------|--------|
| Anti-Patterns | `impl-before-confirmed-approach` | not-applicable: "File/workflow modifications begin before the user has confirmed" (authoring-session conduct) |
| Anti-Patterns | `follow-through-on-recommend` | not-applicable: "The agent emits recommendations/analysis as the deliverable" (session conduct) |
| Anti-Patterns | `preserve-readme-content` | not-applicable: "A README edit removes or shrinks substantive content without … user confirmation" (session conduct; the README diffs here are additive) |
| Anti-Patterns | `verify-format-literacy` | not-applicable: "drafted without checking … or commits proceed without validating" (session conduct) |
| Anti-Patterns | `work-through-activities` | not-applicable: "Results are combined, advanced, or closed outside the workflow's defined activities" (session conduct) |
| Anti-Patterns | `accept-correction` | not-applicable: "The agent disputes a user correction" (session conduct) |
| Anti-Patterns | `prompt-restates-owned-mechanics` | not-applicable: "A worker/orchestrator spawn stub or agent-entry technique" (none on the surface) |
| Anti-Patterns | `pre-session-prose-defers-to-the-framework` | not-applicable: "a surface delivered before a session exists — the `discover` bootstrap procedure" (none) |
| Anti-Patterns | `engine-internals-narrated` | not-applicable: "An engine or agent-entry technique" (none) |
| Anti-Patterns | `cut-comment-jsdoc-verbosity` | not-applicable: "Comments or JSDoc" (no comments in the surface) |
| Anti-Patterns | `call-omits-conditionally-required-argument` / `call-omits-required-argument` / `call-names-an-undeclared-argument` | not-applicable: "each tool call a Protocol phase or Rule writes as a signature" (the surface writes none) |

Blocked: 0. The Tool-Technique-Doc Consistency family was walked. A grep for harness tool names (`get_*`, `next_activity`, `*_session`, `dispatch`, `present_*`, `record_usage`, `yield`) over all 28 files returned nothing, so no surface describes a tool.

## File coverage

read 28 · unread 0. All 28 surface files were read whole: `README.md`, `workflow.yaml`, 6 activities plus `activities/README.md`, 12 technique files, and 9 resource files. I also read the full diff against `4662d88d` and `ledgers/section-framing-triage.json` / `ledgers/unproduced-read-triage.json` (requirements-refinement entries).
