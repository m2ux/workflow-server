# Canon Re-audit 2 — `requirements-refinement` — walk A (anti-pattern catalog, whole)

**Base ref:** `07a3daf0` · **Corpus tree:** `.worktrees/workflow/requirements-refinement-hygiene` at `9049523a` · **Coverage:** 173 of 173 catalog units (8 Creation Rules + AP-01–AP-165) × 11 of 11 paths · **Change surface:** 11 files (touched: 7 · closure: 4 · consumers: 0), per [reaudit2-surface.md](reaudit2-surface.md) · **Guards:** 236 of 236 at HEAD (from the surface record; not re-run here)

**Verdict (this slice):** Live 0 · Contract 1 · Hygiene 1. R2-A1 is `diff`: the R-A8 fix widened a citation. R2-A2 is `pre-existing`. Residual: **0 files `unread`** of 11, **0 units `blocked`** of 173.

| Band | Open | Known | Prior pass ([reaudit-walk-A.md](reaudit-walk-A.md)) |
|------|-----:|------:|-----------:|
| Live | 0 | 0 | 0 |
| Contract | 1 | 0 | 2 (R-A1, R-A2) |
| Hygiene | 1 | 0 | 7 (R-A3–R-A9) |

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| R2-A1 | Contract | Medium | `cited-home-owns-claim` | `techniques/update-specification.md` `### 1. Apply Changes`, `initial` note | "create new requirements with identifiers per [Identifier Schemes], update existing requirements, and deprecate as directed, each status per [Status Conventions](../resources/specification-protocol.md#status-conventions)." "Each status" covers all three actions. § Status Conventions sets a status for a new requirement ("takes status `pending`") and a retired one ("takes status `deprecated`"). It sets none for an updated one: its only other bullet governs "A status change away from `pending`". From that section alone, an `accepted` requirement the pass updates has two readings: it stays `accepted` (no bullet changes it), or it becomes `pending` (the table's meaning "Recorded from the sources, not yet reviewed" now fits). At base the cite covered new requirements only: "Set every newly added requirement's status to `pending` per [Status Conventions]". The Identifier Schemes half holds: "Each new requirement takes the next available number within its category." | diff | Limit the cite to what the section states ("each new or deprecated requirement's status per [Status Conventions]"). Otherwise, add the status an updated requirement takes to § Status Conventions. |
| R2-A2 | Hygiene | Low | `no-technique-resource-dual-home` | `techniques/update-specification.md` `### 1. Apply Changes`, `initial` note | "Preserve the existing section structure when `{target_doc_exists}`; instantiate the [Template](../resources/specification-protocol.md#template) when creating from scratch." The same sentence links the Template. The Template's own intro already states the augment case: "When augmenting, the existing section set and ordering are retained; new material is added under the matching section." The technique cites the Template for the create case only, and restates the augment case without a cite. This is the same shape as R-A8, one clause later in the same note. | pre-existing (identical at `07a3daf0`; specification-protocol untouched) | Cite the Template for both modes (for example "lay the specification out per the [Template]") and delete the restated augment clause. |

Highs: none raised. Medium spot-confirmed: I re-read R2-A1 against the whole § Status Conventions, one table and three bullets, none of which names an updated requirement. The validation rubric does not fill the gap either: "Status values are drawn from [Status Conventions]; newly added requirements are `pending`".

## Closure of the fixed findings

| Finding | Raising unit | Still fires? | Evidence at `9049523a` |
|---|---|---|---|
| R-A2 | `no-derived-state-shadow` | No | `spec_basename` has no declaration, write, input or `{token}` anywhere under `corpus/`, `ledgers/` or `walks/` (grep). 01 `writes`, 05 and 06 `reads`, record-intake `### spec_basename` output and § 1 emit, report-failure `### spec_basename` input: all removed. The 05 checkpoint links `{final_specification_path}`. Report-failure § 3 writes "for the specification at `{target_doc_path}`", an inherited input that activity 06 reads. |
| R-A7 | `no-rationale-in-description` | No | analyze-source § 3 bullet 1 reads "Assign each entry in `{classified_sources}` its source reference per the [Rules]". The "so every document … citable in its own right" clause is gone. |
| R-A8 | `no-technique-resource-dual-home` | No, at the cited clauses | "sequential identifiers" and "Set every newly added requirement's status to `pending`" are gone, and both are now cites. The replacement opened R2-A1. The same note has a separate pre-existing restatement, R2-A2. |
| R-A9 | `no-technique-resource-dual-home` | No | analyze-source § 2 bullet 2 is now a pointer: "Map each change to a requirement identifier per the [Rules], in the category [Identifier Schemes] gives it." Do not flag: "A one-line pointer to the resource". This differs from the recorded Fix (delete the bullet). The pointer form reaches the same end. |

## Candidates dropped

- **`cited-home-owns-claim`, analyze-source § 2 bullet 2 "per the [Rules]".** requirements-analysis-report § Rules: "**Identifiers are reused where they apply.** Map each change to an existing requirement identifier where one applies; otherwise propose a new identifier within the correct category." Holds.
- **`cited-home-owns-claim`, analyze-source § 3 bullet 1 "its source reference per the [Rules]".** § Rules: "**Every source gets its own reference under Document Updates Required.** Assign one per source document…". Holds.
- **`cited-home-owns-claim`, analyze-source § 2 bullet 2 "in the category [Identifier Schemes] gives it".** § Identifier Schemes lists each category (functional, non-functional, success criterion, source kinds) with its prefix. Dropped: "A citation that points at content in X". Choosing functional or non-functional is a judgement on the change. The citer does not attribute that judgement to the section.
- **`cited-home-owns-claim`, update-specification "identifiers per [Identifier Schemes]".** Holds, as quoted under R2-A1.
- **`cited-home-owns-claim`, "takes the status line that icon names in [Status Conventions]".** The table carries an Icon column. Holds.
- **`whole-resource-for-one-section` / citation grain, analyze-source's four cites into requirements-analysis-report.** These are `#rules` ×3 (§ 2 b2, § 2 b3, § 3 b1), plus `#template` with `#rules` (§ 6) and `#source-coverage-matrix` (§ 5). Every cite is anchored, and each link text is the section title. The Detect keys on a missing `#anchor` or a bare cite beside anchored ones, so it does not fire. The § 6 pair is "a filler using `## Template` with its `## Rules`". The one-bullet claims cited at section grain go to walk P: rule bullets carry no anchors.
- **`whole-resource-for-one-section`, record-intake and report-failure.** They cite `intake-record.md#template` + `#rules` and `failure-report.md#template` + `#rules`, all anchored.
- **`reference-without-provenance` / `stale-restatement-after-change`, Template headings `# Intake — {spec basename}` and `# Failure Report — {spec basename}`.** Something does supply the value: the basename of the specification at `{target_doc_path}`. Record-intake § 2 captures `{target_doc_path}`, which also fills the same template's `{target path}` row. Report-failure § 3 writes "for the specification at `{target_doc_path}`". No context holds several specifications. The stale check does not fire: the change removed a variable and altered no gate, precondition, default or ordering. The heading still holds true: it names the specification's basename.
- **`brace-declared-ids`, `{spec basename}`.** Once `spec_basename` is gone, no declared id carries that spelling. Dropped: a fill slot whose words are ordinary English, the same form as `{target path}`, `{source path}` and `{n}` in the sibling templates.
- **`unproduced-value-read` / `declared-input-never-read` / `output-without-destination`, after the removal.** No reader of `spec_basename` remains. Report-failure inputs: `validation_report` (§ 1, § 2) and `validation_report_path` (§ 1, § 3). Record-intake inputs: `host_repo_path` (§ 1 note) and `transcript_redactions` (§ 2). Record-intake outputs: `target_doc_path` is read downstream. `target_doc_exists` is read by analyze-source, update-specification and the `sources-confirmed` message. `intake_record` is an `#### artifact`. `intake_record_path` is read by the `sources-confirmed` message. Report-failure outputs: `failure_report` is an artifact and `failure_report_path` is read by the 06 message. The 05 checkpoint tokens `{final_specification_path}` and `{change_summary_path}` are produced by an ungated step and default to `""`.
- **`link-named-artifacts`, 05 `finalization-confirmed` message.** "The final specification and the change summary are staged ([final specification]({final_specification_path}), [change summary]({change_summary_path}))." Both named artifacts are linked, with no `NN-` prefix.
- **`no-caption-only-message`, the same message.** It repeats the preceding `finalize-specification` action message. Dropped: "Messages that link a persisted artifact".
- **`statement-not-question`, the same message.** A statement, with no `?` and no interrogative opener. The decision sits in `accepted` / `revise`.
- **`atomic-checkpoints` / `one-decision-one-checkpoint`, 05.** One accept-or-revise decision.
- **`link-named-artifacts`, 05 `enforce-staging-boundary` validate message.** "The final specification is not staged under the planning folder. Write `{final_specification}` …". This is pre-existing. Dropped: "internal … diagnostics that are not user-presented artifact references". It is a remedy addressed to the agent, for a file at the wrong location. The undeclared `{final_specification}` token was noted outside the slice in [audit-walk-A.md](audit-walk-A.md). It is the finalize-specification output id, produced by an ungated step, so `unproduced-value-read` does not fire.
- **`link-named-artifacts`, 01 `sources-confirmed` "the target specification {target_doc_path}".** Pre-existing. Inherited from B9's withdrawal: in create mode no file is at the path ("Pure in-chat subjects (no durable file)").
- **`checkpoint-requires-decision`, 01 `target-doc-named` (single option).** The option sets a variable (`recordReply: target_doc_path`). The Detect needs "sets no variable".
- **`constraint-as-blockquote`, update-specification `initial` note (edited).** "each status per …" is not a caveat. The mode clauses form a ladder: "An If / Else if / Otherwise ladder over one choice, at any indent."
- **`constraint-as-blockquote`, record-intake § 1 and § 2 notes, report-failure § 1 note, analyze-source § 1 and § 2 notes.** Already in the `>` form.
- **`constraint-as-blockquote`, analyze-source § 1 bullet 2, "Where two sources bear on the same subject, carry both readings forward…".** Pre-existing. Dropped as in [reaudit-walk-A.md](reaudit-walk-A.md): the condition is the instruction's own trigger. **The Do not flag clause proposed there is not in the catalog at HEAD. That catalog edit is still owed.**
- **`no-technique-resource-dual-home`, update-specification "path from that source's section-2 record, fragment from the heading the change recorded, one list entry per recorded heading".** This overlaps Source Reference Format's href composition. Dropped: "technique-owned HOW the resource does not define". The clause maps the analysis's recorded citations onto list entries, and Source Reference Format does not say where the heading comes from.
- **`no-technique-resource-dual-home`, update-specification "the status key is dropped".** Final Specification Form defines the two end states. The conversion between them belongs to the technique. Same clause.
- **`no-technique-resource-dual-home`, report-failure § 2 "State, for each unresolved issue ID …, the manual resolution required" beside failure-report "Every unresolved issue carries a resolution".** Dropped: the phase does the work, and the rule constrains the artifact.
- **`no-technique-resource-dual-home`, analyze-source § 1 bullet 2 beside § Rules "A change drawn from several sources cites each of them".** These are distinct facts: carrying both readings into the analysis versus citing both sources.
- **`one-invariant-per-rule`, requirements-analysis-report "Every source gets its own reference under Document Updates Required. Assign one per source document and list each in the section [Source Reference Format] names for that source type."** Dropped: "Paragraphs or bullets elaborating one constraint". The placement is where that one reference is listed.
- **`no-dense-prose-after-config-examples`, requirements-analysis-report § Source Coverage Matrix after the Template.** The Detect keys on a paragraph that "only re-explains keys". This one also sets the verbatim-heading constraint and points at the rubric's definition.
- **`framing-outside-any-section`, pre-`##` framing in the four closure resources.** Known: `harmless` / `orientation-only` in `ledgers/section-framing-triage.json`.
- **`no-resource-caller-backlink`, intake-record "belong to the analysis artifact" and failure-report "belongs to the validation reports".** Dropped: "A sibling resource citation" (as in prior passes).
- **`rule-binds-beyond-its-operation`, report-failure `promotion-withheld-on-failure` and analyze-source `analysis-records-intended-changes-only`.** Dropped: "A prohibition or conformance statement addressed to the reader".
- **`omit-null-sections`, specification-protocol Template sections 2.1, 2.3, 2.5 and 3–7.** Pre-existing, dropped as in [reaudit-walk-A.md](reaudit-walk-A.md). The proposed clause (*a section a preserved external protocol requires present*) is not in the catalog at HEAD, so that edit is still owed.
- **`unproduced-value-read`, `intake_correction` (01, no `defaultValue`).** Inherited from [audit-walk-B.md](audit-walk-B.md): an optional technique input whose contract states the unset case.
- **`hoist-shared-inputs`, `target_doc_exists` on analyze-source and update-specification.** Dropped: "only two or three techniques whose common ancestor declares none".
- **`contract-not-procedure`, record-intake § 1 "Emit `{target_doc_exists}` per its output contract."** Dropped: "Protocol that emits `{id}` by reference to Output criteria".
- **`dotted-rule-address`, "per `artifact-paths-relative`" in record-intake and report-failure.** Dropped: "Inherited from self, group, or namespace root: the bare name".
- **`relocation-without-a-preserved-outcome`.** The change moved no gate, exit, bound technique or rule. It removes a variable and states no replacement, and the readers take `{target_doc_path}` directly.

## Coverage

| Home | Unit | Status |
|------|------|--------|
| Anti-Patterns | Creation Rules (8 entries) | `not-applicable`: the family binds when the change edits `anti-patterns.md`, and this change does not |
| Anti-Patterns | `no-partial-implementation`, `no-assumption-execution`, `scope-reverify-completion` | `not-applicable`: the Detect names a done claim or an agent's choice of intent, which is session conduct |
| Anti-Patterns | `impl-before-confirmed-approach`, `follow-through-on-recommend`, `verify-format-literacy`, `accept-correction` | `not-applicable`: the Detect names authoring-session conduct |
| Anti-Patterns | `preserve-readme-content` | `not-applicable`: the Detect keys on a README edit, and no surface README was edited |
| Anti-Patterns | `complete-bootstrap-path`, `pre-session-prose-defers-to-the-framework` | `not-applicable`: no bootstrap or pre-session surface is on the surface |
| Anti-Patterns | `describe-tool-value` | `not-applicable`: "On surfaces that legitimately describe tools", and there is none on the surface |
| Anti-Patterns | `prompt-restates-owned-mechanics`, `engine-internals-narrated` | `not-applicable`: the Detect names stub, agent-entry or engine techniques |
| Anti-Patterns | `no-shadow-audit-pass`, `canon-layer-cites-not-restates` | `not-applicable`: the Detect names an audit technique or an upper canon layer |
| Anti-Patterns | `cut-comment-jsdoc-verbosity` | `not-applicable`: the surface holds no code comments or JSDoc |

Blocked units: 0. Walked: 149 of 173, each against all 11 files. The message and checkpoint entries (`atomic-checkpoints`, `one-question-per-message`, `statement-not-question`, `no-next-step-narration`, `link-named-artifacts`, `no-caption-only-message`, `checkpoint-requires-decision`) covered every `message`, option and validate message in 01, 05 and 06.

## File coverage

read 11 · unread 0.

Touched (7): `activities/{01-intake,05-finalize-specification,06-report-failure}.yaml`, `techniques/{analyze-source,record-intake,report-failure,update-specification}.md`. Closure (4): `resources/{intake-record,failure-report,requirements-analysis-report,specification-protocol}.md`. Each file was read whole at `9049523a`. Base versions were read by diff and by `git show 07a3daf0:` for attribution.

Also read for tracing, and not reported against: `techniques/TECHNIQUE.md` (whole), `workflow.yaml` (whole), `resources/validation-rubric.md` § Checks, `activities/04-validate-specification.yaml` (variables), grep hits in `techniques/{finalize-specification,intake-sources,resolve-inputs,redact-transcripts}.md`, `activities/0{2,3}-*.yaml`, the four READMEs, and `ledgers/section-framing-triage.json`.

## Notes for walk P (outside this slice)

- **Single Source of Truth / One Authoritative Home.** Four places say the failure report carries "the correction history": report-failure `## Capability`, the `failure_report` output, the activity 06 `description`, and its action message. The failure-report guide disagrees. Its Rule says "This report states what is still broken. Which pass tried what belongs to the validation reports," and its Template carries only "Correction passes attempted: {n}". This is pre-existing, and every site is on this surface. No catalog entry keys on it.
- **Cite Resources at Section Grain.** analyze-source cites requirements-analysis-report `#rules` three times, once per bullet claim (identifier reuse, contributing passages, one reference per source). The section holds seven rules, and a rule bullet has no anchor of its own.

## Guard candidates (second occurrence)

- `cited-home-owns-claim`: R-A1, then R2-A1, in consecutive walks. The judgement is whether the cited section determines the claim, so a guard would need a triage ledger. Possible key: a `per [X](…#anchor)` phrase whose governed clause names more cases than the anchored section's bullets mention.
- `no-technique-resource-dual-home`: R-A8 and R-A9, then R2-A2. Possible key: a technique sentence that links `resource#section` and shares a long clause with that section's body, outside the linked clause. Judgement-bound.
