# Canon Audit — `requirements-refinement` — walk A (anti-patterns AP-01..AP-70)

**Base ref:** `4662d88d` · **Corpus tree:** `.worktrees/workflow/requirements-refinement-conventions` at `6772e1ce` · **Coverage:** 70 of 70 entries in slice × 28 of 28 paths · **Change surface:** 28 files (touched: 18 · closure: 10 — every technique leaf via `TECHNIQUE.md` rule `artifact-paths-relative`, plus the untouched activities and resources read for attribution · consumers: 0)

**Verdict (this slice):** Live 0 · Contract 1 · Hygiene 8. Residual: **0 files `unread`** of 28, **1 unit `blocked`** (partial) of 70.

| Band | Open | Known | Prior pass |
|------|-----:|------:|-----------:|
| Live | 0 | 0 | — |
| Contract | 1 | 0 | — |
| Hygiene | 8 | 0 | — |

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| A1 | Contract | High | `hoist-shared-inputs` | `techniques/{analyze-source,record-intake,redact-transcripts,store-sources}.md` `## Inputs` → `### classified_sources`; `techniques/TECHNIQUE.md` `## Inputs` declares none | Four leaves re-declare one input under a common ancestor that declares none. Three say "The source documents paired with their classifications, each `{ path, type }`."; `redact-transcripts` drifts: "…each `{ path, type }`, a meeting transcript at its copy in the repository." Base had two leaves (carve-out held); the diff adds `store-sources` and `redact-transcripts`, crossing "only two or three". | diff | Hoist `classified_sources` to `techniques/TECHNIQUE.md` `## Inputs` under one description, delete the four leaf declarations, keep it as an output on `intake-sources` and `store-sources`. |
| A2 | Hygiene | Low | `no-rationale-in-description` | `techniques/store-sources.md` `## Inputs` → `### meetings_dir`, `### documents_dir` | "Directory, relative to `{host_repo_path}`, holding the meeting transcripts specifications cite." / "…holding the documents from outside the repository that specifications cite." — the clause names what consumes the folder; deleting it leaves the input's meaning intact (sibling `create-adr` `adr_dir`: "Directory holding the project's ADR files"). | diff | Delete "specifications cite" / "that specifications cite". |
| A3 | Hygiene | Low | `grouped-rule-keys` | `techniques/TECHNIQUE.md` `## Rules` → `### artifacts-write-under-planning-folder`, `### artifact-paths-relative` | Two flat rules of one family (artifact placement and the paths an artifact records), with drifting prefixes `artifacts-` / `artifact-`. The loader supports a rule group (`src/schema/technique.schema.ts:47`, "Array of related rules grouped under this key"). | diff | Collapse both under one descriptive group key that replaces the prefix. |
| A4 | Hygiene | Low | `no-rationale-in-description` | `techniques/intake-sources.md` `## Protocol` → `### 2. Classify Each Source`, bullet 1 | "Each source carries its own type, so a mixed set is classified per document rather than as a whole." — restates the bullet's own "For each path in `{source_paths}`" and explains it; the "rather than as a whole" clause is also `avoidance-voice-in-definitions`. | pre-existing | Delete the sentence. |
| A5 | Hygiene | Low | `constraint-as-blockquote` | `techniques/analyze-source.md` `## Protocol` → `### 1. Read Sources`, bullet 1 | "Read every document named in `{classified_sources}`; when `{target_doc_exists}`, also read the current specification at `{target_doc_path}`." — a *when* caveat inside the step sentence. | pre-existing | Move the caveat into a `>` note under the instruction. |
| A6 | Hygiene | Low | `constraint-as-blockquote` | `techniques/resolve-inputs.md` `## Protocol` → `### 2. Apply the Correction` | "When `{intake_correction}` is bound, apply it over the starting paths: …" — the condition opens the step sentence. The workflow's own sibling form is a note (`analyze-source` §2: "> When `{analysis_feedback}` is bound, …"). | pre-existing | State the instruction and carry the condition as a `>` note under it. |
| A7 | Hygiene | Low | `readme-orients-not-transcribes` | `techniques/README.md` lines 5–7 | "[`TECHNIQUE.md`](TECHNIQUE.md) holds the shared inputs (`planning_folder_path`, `source_paths`, `target_doc_path`, `correction_iteration`) and the specification-fidelity rules." — transcribes the Inputs list; the block must be edited when `TECHNIQUE.md` inputs change. Sibling `work-package/techniques/README.md:7`: "holds the shared Inputs and Rules every technique here inherits." | pre-existing | Delete the enumeration; keep the link and a purpose phrase. |
| A8 | Hygiene | Low | `no-resource-caller-backlink` | `resources/failure-report.md` intro paragraph | "Written when the run stops with unresolved issues: a critical issue, or correctable issues left when the correction passes run out." — narrates the `uncorrectable` exit gate (`correction_iteration < 3`). No sibling creation guide carries a "Written when" clause. | pre-existing | Delete the gate narration; state what the report is. |
| A9 | Hygiene | Low | `technique-stage-agnostic` | `techniques/intake-sources.md` `## Rules` → `### intake-captures-only` | "Capture and classify only; do not analyze or modify the specification during intake." — "during intake" names the activity. | pre-existing | Drop the stage locus: "Capture and classify only; do not analyze or modify the specification." |

Highs re-derived: A1 confirmed from the five files and the entry (four leaf declarations, ancestor declares none, carve-out limited to two or three). None withdrawn or downgraded.

## Candidates dropped

- `atomic-checkpoints` — `01-intake` `sources-confirmed` now confirms sources, classifications, redactions and mode together. Dropped: "A single decision whose options naturally cover one atomic choice" (accept or correct one intake record).
- `artifact-not-buried` — `store-sources` copies files and `redact-transcripts` rewrites them with no `#### artifact`. Dropped: "Non-artifact outputs (variables, structured data) correctly declared as non-artifact outputs" (the copies are the declared `path` of `classified_sources`, the user's sources, not authored reports).
- `no-invented-naming` / `io-id-shape` — `meetings_dir`, `documents_dir`. Dropped: "Reuse of an already-established convention" (`adr_dir` with `.engineering/artifacts/adr/` default, `comprehension_dir`, `artifact_dir`).
- `canonical-artifact-ids` / `io-id-shape` — `*_path` outputs beside their artifact ids (`requirements_analysis_path` …). Dropped: the siblings carry the form (`midnight-system-review` `review_report` + `review_report_path`, "capture its written location").
- `io-id-shape` / `snake-case-symbols` — `classified_sources` in both Inputs and Outputs of `store-sources`. Dropped: "One snake symbol declared in both Inputs and Outputs when the value is input∩output" (same form as `resolve-inputs`, `update-specification` at base).
- `hoist-shared-inputs` — `intake_correction` (3 leaves), `host_repo_path` (2), `requirements_analysis` / `working_specification` (3). Dropped: "An input shared by only two or three techniques whose common ancestor declares none of them."
- `single-rule-authority` — `artifact-paths-relative` beside specification-protocol "The href is the relative path…" and validation-rubric "Every transcript href is relative…". Dropped: a worker-directed rule on the technique surface ("Worker-directed behavioural rules that must stay reachable"); the resource lines define and check the spec's form.
- `no-contradictory-rules` — `artifacts-write-under-planning-folder` vs `store-sources` writing into `{meetings_dir}`. Dropped: two rules are not in conflict; `store-sources` declares no artifact for the rule to govern.
- `avoidance-voice-in-definitions` — specification-protocol "It carries no priority tag…", "…this section carries no scope statement", "no admonition marker such as `[!NOTE]`", "never a timestamp", "The value `new` is not used." Dropped: operative constraints on spec content that augment runs and the validation rubric read ("not every English negation").
- `no-rationale-in-description` — resource prose rationale (transcript-redaction "so each timestamp fragment still resolves"; specification-protocol "delivery priority and timing belong to planning"; change-summary / specification-protocol line-budget reasons). Dropped: the Detect's field list names `description`, `message`, option/action descriptions, procedure bullets, technique `## Rules` and `rules.*`, not a resource's prose or `## Rules`.
- `brace-declared-ids` — backticked ids in `techniques/README.md` line 6. Dropped as a separate row: the ids are listed as names, not used as designators; A7's Fix deletes the construct.
- `backtick-code-tokens` — bare `{source_paths}` etc. in YAML `message` strings. Dropped: sibling convention (`work-package/activities/02-design-philosophy.yaml:95`); engine-interpolated messages.
- `readme-orients-not-transcribes` — root README "When the request names no target, the run asks for its path." Dropped: one orientation sentence, not an enumeration of `steps[]`.
- `no-opaque-artifact-path-array` — `source_paths`. Dropped: the Detect's "forces Protocol to name the files" does not hold; Protocol names none.
- `no-resource-caller-backlink` — requirements-analysis-report "belongs in the intake record", intake-record "belong to the analysis artifact". Dropped: "A sibling resource citation."
- `capability-group-placement` — `store-sources`, `redact-transcripts` as candidate shared primitives. Dropped: no second consumer of transcript storage or redaction in the corpus ("inventing a group for a hypothetical second cluster (YAGNI)").
- `technique-stage-agnostic` — "previous pass", "the pass that stopped refinement" in I/O descriptions. Dropped: "values the technique emits for the activity to route (counts…)" — the pass number is the technique's own output.

Mechanised sweeps: a code-span/brace/`$`/`word ([link](…))` scanner over the 23 markdown files found no hits; the same scanner reported the known cases in `corpus/canon/resources/anti-patterns.md` (lines 636, 756), so the empty result is a measurement (`no-redundant-link-label`, `escape-literal-dollar`, `backtick-code-tokens`).

## Outside this slice (for the other walks)

- `03-update-specification.yaml` / `05-finalize-specification.yaml` validate messages read `{working_specification}` / `{final_specification}`, which neither activity declares (pre-existing).
- `TECHNIQUE.md` Capability ("specification-fidelity invariants") and `techniques/README.md` ("the specification-fidelity rules") no longer describe the rule set once `artifact-paths-relative` joins it (diff extends a pre-existing gap).
- `artifact-paths-relative` makes spec hrefs relative to the planning folder; `finalize-specification` hands promotion to `{target_doc_path}` elsewhere, where those hrefs no longer resolve unless the target sits at the same depth (candidate for `relocation-without-a-preserved-outcome`).
- `record-intake` captures the absolute `{target_doc_path}` and `classified_sources` paths into `intake.md` with no step relativising them against `artifact-paths-relative`.
- `resolve-inputs` re-declares the inherited `source_paths` / `target_doc_path` (pre-existing; `inherited-input-re-declared`).

## Coverage

| Home | Unit | Status |
|------|------|--------|
| Anti-Patterns | Creation Rules (8 entries) | `not-applicable` — the family binds when the change edits `anti-patterns.md`; this change does not |
| Anti-Patterns | `no-partial-implementation` | `not-applicable` — Detect keys on "A commit, handoff, or 'done' claim"; no definition content carries one |
| Anti-Patterns | `no-assumption-execution` | `not-applicable` — Detect keys on "The agent chooses among materially different interpretations of user intent without asking"; session conduct |
| Anti-Patterns | `scope-reverify-completion` | `not-applicable` — Detect keys on "A done/complete claim, commit, or close-out"; session conduct |
| Anti-Patterns | `no-invented-naming` | `blocked` (partial) — the convention half walked clean; the "without user approval" half for the new redaction vocabulary (`*[Redacted: …]*` marker, `personal` / `off-topic` kinds) is not readable from the tree |

`atomic-checkpoints` and `one-question-per-message` walked against the checkpoint `message` and `options` in the three activities with checkpoints (`01-intake`, `02-analyze-sources`, `05-finalize-specification`). Blocked units: 1.

## File coverage

read 28 · unread 0.
