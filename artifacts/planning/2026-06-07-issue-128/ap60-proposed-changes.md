# AP-60 Cleanup — Proposed Changes Decision Report

Issue #128 introduced anti-pattern 60 (AP-60: identifier grammatical shape encodes kind) plus the
workflow-design step-8 audit heuristic, and migrated a small in-scope subset. This report audits the
full post-change corpus to surface residual non-compliance, so a human can decide what to fold into
the PR and what to defer.

**Corpus audited:** `workflows` submodule @ `3512c65` (`feat(workflows): canonical identifier naming
convention (#128)`), at `/home/mike1/projects/work/workflow-server/2026-06-07-issue-128/workflows`.
**Reference repo** (for server coupling): `/home/mike1/projects/main/workflow-server`.

Every blast-radius number below is a literal `grep` count over `*.toon` + `*.md` in the corpus
(declaration + all binding-surface references: protocol `{id}` designators, `set`/`validate`/condition
reads, `passContext`, prose). Binding surfaces are exact-string-match, so every occurrence of a
renamed symbol must change in the same commit or the variable silently fails to resolve.

AP-60's four sub-rules: (1) boolean = affirmative predicate, no `*_flag`/`*_status`/`*_check`;
(2) collection = plural item noun, no `_list`/`_array`/`_collection`/`_set`; (3) I/O id = qualified
noun phrase, head noun last, no representation-in-head (`_path`/`_url`/`_markdown`/`-toon`),
`_mode`/`_type` exempt; (4) rule slug = positive declarative assertion, irreplaceable negations stay.

---

## 1. Executive summary

The dominant residual is **representation-suffix in I/O ids** (sub-rule 3) and one cross-cutting
concept, `planning_folder_path`, that the migration left unrenamed across the entire corpus *and*
server source. The clear violations are ~18 concepts (the consolidated note's "~25" double-counted
some sub-fields and per-file lines); the prism-family `_path`-as-location pattern and the cargo
`*_status` cluster are large but each is **one decision applied many times**, not many independent fixes.

### Decision table

| Batch | Items | Blast radius (files / occ.) | Risk | Recommendation |
|---|---|---|---|---|
| **A. `planning_folder_path` → `planning_folder`** | 1 concept | corpus: 73 files / 113 occ. + server: 7 files / 31 occ. | HIGH (cross-cutting, server-coupled) | Defer to its own PR. Cross-cuts workflows + `src/` + `schemas/` + `docs/` + tests; needs server code + schema + test changes in lockstep. |
| **B. Definition-local representation-suffix renames** | 11 concepts | 1–5 files each, 1–7 occ. each (≈30 occ. total) | LOW | Fold into the #128 PR. Each is contained to one or two technique/activity files; pure exact-string rename. |
| **C. Collection `_list`/`_set` suffix drops** | 6 concepts | 1–5 occ. each (≈16 occ. total) | LOW | Fold into the #128 PR. Same mechanical drop-suffix-pluralize. |
| **D. Cargo/validate `*_status` → `*_passed`** | 6 ids | 20 occ. across ~6 files | MEDIUM | Decide first: the values wrap `{passed: bool}` objects, so the rename interacts with `.passed` reads. Worth doing but verify each read site. |
| **E. Imperative-verb booleans** | 3 ids | `use_existing_pr` / `post_jira_comment` / `verify_invariants` | LOW–MED | Judgement: rename to predicate (`existing_pr_reused`?) only if meaning stays clear; `verify_invariants` is arguably a mode toggle. |
| **F. `_url`/`_ref` representation suffixes** | 4 id families | `issue_url` 20, `pr_url` 11, `review_pr_url` 3, `template_ref` 2 | MED | Judgement & meaning-dependent: a URL distinct from `*_number`/id may justify the suffix. Decide per family. |
| **G. prism-family `_path`-as-location convention** | ~40 distinct ids, 271 occ. | very large | HIGH (churn) | Corpus-wide convention call. Recommend a **separate dedicated decision** (keep `_path` as a deliberate location convention, or migrate all). Do NOT fold into #128. |
| **H. meta `target_path`/`submodule_path`/`source_path`/`repo_path`** | 4 ids, ~43 occ. | large | MED–HIGH | Same convention question as G; `target_path` is an ambient workflow input (AP-58 interface ref). Decide with G. |
| **I. Negation / process rule slugs** | ~12 slugs | 1 occ. each (declaration) | LOW | Judgement per slug; sub-rule 4 explicitly keeps irreplaceable-clarity negations. Most read fine as-is. |

**Headline numbers:** `planning_folder_path` = 113 corpus occurrences in 73 files + 31 server-source
occurrences in 7 files (the single largest item by an order of magnitude). All other clear violations
combined ≈ 46 occurrences. The prism-family `_path` convention is 271 occurrences — larger than
everything else but a single policy decision.

---

## 2. Clear violations

All identifiers below were verified to still exist with the stated shape. Corrections to the prior
consolidated findings are flagged inline.

### Batch A — `planning_folder_path` → `planning_folder` (cross-cutting)

**Current state.** One concept — the canonical absolute path to the client workflow's planning folder
— named with a `_path` representation suffix (sub-rule 3 / AP-42 violation). AP-60 item 52 calls this
out by name as the motivating example. It is declared and referenced corpus-wide and is also a
first-class field in the server's session/workflow schema and tooling.

**Proposed change.** `planning_folder_path` → `planning_folder` everywhere, in lockstep across the
workflows corpus **and** the reference repo. Surfaces that must change together (exact-string bindings):
workflow.toon variable declarations, activity input/output lists, technique `### planning_folder_path`
declarations + `{planning_folder_path}` protocol reads, README I/O tables, prose, **plus** the server's
schema field, the code that reads/writes it, the schema JSON, the docs that document it, and the test
fixtures/assertions that reference it.

**Blast radius.**

| Location | Files | Occurrences |
|---|---|---|
| workflows corpus (toon + md) | 73 | 113 |
| reference `src/` | 5 (`utils/session/store.ts` 1, `schema/session.schema.ts` 5, `schema/workflow.schema.ts` 1, `tools/resource-tools.ts` 10, `tools/workflow-tools.ts` 3) | 20 |
| reference `schemas/` | 2 (`README.md` 2, `workflow.schema.json` 1) | 3 |
| reference `docs/` | 3 (artifact/state-management + technique-protocol-spec, 1 each) | 3 |
| reference `tests/` | 1 (`mcp-server.test.ts`) | 5 |
| **Total** | **84** | **144** |

**Recommendation: DEFER to its own PR.** This is the only item that crosses the workflow/server
boundary. A schema-field rename touches `session.schema.ts`/`workflow.schema.ts`, the JSON schema, the
resource/workflow tools, and the test suite simultaneously — it needs `npm run typecheck` + `npm test`
and a migration story for any persisted session state keyed on the old field name. Run impact analysis
on the server symbol before editing. Folding it into #128 would dwarf and destabilize the rest.

### Batch B — definition-local representation-suffix renames (`_path` / `_markdown` / `-toon`)

Each is contained to one or two files; the new id is the noun the value IS.

| # | Current id | Proposed | Location(s) | Surfaces to change together | Files / occ. |
|---|---|---|---|---|---|
| B1 | `artifact_path` | `artifact` | work-package `manage-artifacts/write-artifact.md` (`### artifact_path` :26, `{artifact_path}` :38) | output decl + protocol read | 1 / 2 |
| B2 | `readme_path` | `readme` | work-package `manage-artifacts/create-readme.md` (`### readme_path` :18, `{readme_path}` :27) | output decl + protocol read | 1 / 2 |
| B3 | `comprehension_artifact_path` | `comprehension_artifact` | work-package `workflow.toon` :319 (+ disambiguation note :337), `activities/14-codebase-comprehension.toon` :154 | var decl + the prose note that contrasts it with the basename var + activity output | 2 / 3 |
| B4 | `change_block_index_path` | `change_block_index` | work-package `workflow.toon` :331, `activities/09-post-impl-review.toon` (checkpoint message :118, output :248) | var decl + checkpoint `{…}` interpolation + activity output | 2 / 3 |
| B5 | `summary_markdown` | `summary` | meta `workflow-engine/generate-summary.md` (`### summary_markdown` :22, `{summary_markdown}` :28) | output decl + protocol read | 1 / 2 |
| B6 | `template_path` | `audit_prompt_template` | substrate `workflow.toon` :58, `README.md` :352, `activities/01-scope-setup.toon` :54 (validate-action prose) | var decl + README table + activity validate description. **Correction:** prior note said "workflow.toon" only; it also appears in the scope-setup validate text. | 3 / 3 |
| B7 | `reference_report_path` | `reference_report` | substrate `workflow.toon` :62, `README.md` :353, `write-gap-analysis.md` (`### reference_report_path` :16, `{reference_report_path}` :22), `activities/01-scope-setup.toon` :71, `activities/07-gap-analysis.toon` (:17 prose, :27 description) | var decl + input decl + protocol read + README + two activities' prose. **Correction:** broader than "workflow.toon + write-gap-analysis input" — 7 occ. across 4 files incl. activity prose. | 4 / 7 |
| B8 | `reference_document_paths` | `reference_documents` | substrate `setup-audit-target.md` (`#### reference_document_paths` :68) | sub-field decl (+ any protocol read) | 1 / 1 |
| B9 | `workflow-file-set` | `workflow-files` | workflow-design `workflow-design.md` (`### workflow-file-set` :154, prose ref :150) | output decl + protocol prose. Note this id is also kebab-cased (AP-55) — the rename fixes both. | 1 / 2 |
| B10 | `workflow-toon` | `workflow-definition` | workflow-design `workflow-design.md` (`#### workflow-toon` :158, sub-field of `workflow-file-set`) | sub-field decl. `-toon` is a representation suffix. | 1 / 1 |

Counts for B1/B2/B5 are exact; confirm no downstream activity reads `{artifact_path}`/`{readme_path}`/
`{summary_markdown}` beyond the technique (grep showed none).

**Recommendation: FOLD INTO #128.** All ten are low-risk, file-local exact-string renames.

### Batch C — collection `_list` / `_set` suffix drops (sub-rule 2)

Drop the representation suffix, pluralize the item noun (or keep plural).

| # | Current id | Proposed | Location(s) | Surfaces / Files / occ. |
|---|---|---|---|---|
| C1 | `uncertain_symbols_list` | `uncertain_symbols` | work-package `workflow.toon` :354, `activities/08-implement.toon` (:64 `target:`, :122 message interpolation, :194 output) | var decl + checkpoint-effect `target` + message `{…}` + activity output. 2 files / 5 occ. |
| C2 | `gap_list` | `gaps` | substrate `compare-finding-sets.md` (`#### gap_list` :52), `write-gap-analysis.md` (`#### gap_list` :45 + assembly read :25), `activities/07-gap-analysis.toon` :66 | sub-field decl in two techniques + protocol read + activity output. **Correction:** prior note said "write-gap-analysis.md AND compare-finding-sets.md"; the activity output is a third surface. 3 files / 4 occ. |
| C3 | `missing_tables_list` | `missing_tables` | substrate `verify-sub-agent-output.md` (`#### missing_tables_list` :96) | sub-field decl. 1 file / 1 occ. |
| C4 | `skip_list` | `skipped_units` | prism `plan-analysis.md` (`#### skip_list` :149) — sub-field of `plan` ("Units below budget threshold"). | sub-field decl. 1 file / 1 occ. Confirmed sub-field, as the prior note stated. |
| C5 | `file_list` | `workflow_files` | cicd `inventory-workflows.md` (`#### file_list` :56). **Also present** in `resources/intermediate-artifact-schemas.md` (:16, :24, :78) as the schema field name. | sub-field decl + the resource schema that documents it. **Correction:** prior note said "inventory-workflows.md" only; the resource schema (3 occ.) names the same field and must change with it or the schema drifts. 2 files / 4 occ. |
| C6 | `uncertain_symbols_list` (see C1) | — | — | — |

**Recommendation: FOLD INTO #128**, with the caveat that C5 (`file_list`) drags the
`intermediate-artifact-schemas.md` resource with it — still low risk but two coupled files.

---

## 3. Judgement calls

Grouped by theme; each needs a decision before action. None is an unambiguous defect.

### Batch D — cargo/validate `*_status` booleans → `*_passed` (sub-rule 1)

**Current state.** `check_status` (5), `clippy_status` (4), `fmt_status` (4), `test_status` (4),
`build_status` (2), `format_status` (1) — 20 occurrences across the work-package cargo-operations
techniques, `validate-build/aggregate-results.md`, and `activities/10-validate.toon`. These are
`*_status` generic-noun ids, which sub-rule 1 names as a defect.

**The decision.** The values are NOT plain booleans — they wrap `{ passed: boolean }` objects
(`run-suite.md` :40 composes `{validation_passed}: {check_status}.passed AND {clippy_status}.passed
AND …`; `clippy.md` :23 sets `{ passed: true/false }`). Renaming `check_status` → `check_passed` while
the value is an object read as `.passed` makes `check_passed.passed` — awkward. Two coherent options:

- **(a)** Rename to `*_passed` AND flatten the object to a bare boolean (drop the `.passed` wrapper).
  Cleaner long-term, but touches the composition logic in `run-suite.md` and every `.passed` read.
- **(b)** Keep the object but rename the *field*-bearing id to `*_result` (a result object, not a
  status flag) — sidesteps sub-rule 1's `_status` prohibition without claiming the id is a boolean.

Recommend **(a)** if doing it, but it is MEDIUM risk because of the object-shape interaction — verify
each `.passed` read. Note `validation_passed` already exists and is conformant.

### Batch E — imperative-verb booleans (sub-rule 1)

| Id | Location | Note / decision |
|---|---|---|
| `use_existing_pr` | work-package `workflow.toon` :154 | Imperative verb, not a predicate. Predicate form e.g. `existing_pr_reused` / `reuse_existing_pr` reads as an intent toggle either way — decide if the rename improves clarity. |
| `post_jira_comment` | work-package `workflow.toon` :177 | Same — a do-this toggle. `jira_comment_posted` would read as a result flag, changing the meaning. Likely a config/mode flag; consider leaving or renaming to `jira_comment_enabled`. |
| `verify_invariants` | substrate `scan-storage-lifecycle.md` (`### verify_invariants` :20, read :44) + `activities/10-sub-crate-review.toon` :64 (`verify_invariants: true`) | Reads as a mode/feature toggle ("should this scan verify invariants"), arguably exempt as an enable-flag. Low value to rename. |

**Recommendation:** these are mostly enable/config toggles where the imperative reads naturally;
rename only if the team wants strict predicate form. Low priority.

### Batch F — `_url` / `_ref` representation suffixes (sub-rule 3, meaning-dependent)

| Id family | Occ. | Decision |
|---|---|---|
| `issue_url` | 20 | A URL is a representation. But it is genuinely distinct from `issue_number`/issue id (different value). If both exist, the suffix disambiguates and may be justified. Decide vs `issue` (ambiguous) / `issue_link`. |
| `pr_url` | 11 | Same as above vs `pr_number`. |
| `review_pr_url` | 3 | Same family. |
| `template_ref` | 2 | `_ref` is a representation suffix; `template` may collide with other template ids. Decide per site. |

**Recommendation:** meaning-dependent — keep where the URL is a distinct value from an adjacent
`*_number`/id, rename where the suffix is pure representation. Resolve per family, low urgency.

### Batch G + H — `_path`-as-location convention (sub-rule 3, corpus-wide policy)

**Current state.** The prism family (`prism`, `prism-audit`, `prism-evaluate`, `prism-update`) uses
`_path`/`_paths` as a systematic location convention: **271 occurrences across ~40 distinct ids** —
`output_path` (103), `all_artifact_paths` (29), `target_path` (28), `structural_output_path` (9),
`resource_path` (9), `*_output_path` clusters, `all_analysis_artifact_paths`, `behavioral_output_paths`,
etc. meta adds `target_path` (30), `repo_path` (6), `submodule_path` (5), `source_path` (2).

**The decision.** This is not a set of independent defects — it is a deliberate (or at least
consistent) convention that "an `_path` id holds a filesystem location." Sub-rule 3 says the head noun
should be the thing the value IS, which would make `output_path` → `output` (or `output_dir` if a
directory). But `target_path` in meta is an **ambient workflow input** delivered by the activity
(AP-58 interface reference) and mirrors a convention used across many workflows; renaming it has reach
beyond this corpus.

**Recommendation: SEPARATE DECISION, do NOT fold into #128.** Either (1) ratify `_path` as an
intentional location-suffix convention and add a carve-out to AP-60 sub-rule 3 (the way `_mode`/`_type`
are exempt), or (2) commit to migrating the whole family in a dedicated PR. Folding 271 occurrences
into the #128 cleanup PR would make it unreviewable and is the highest-churn item after Batch A.

### Batch I — negation / process rule slugs (sub-rule 4)

Sub-rule 4 explicitly keeps irreplaceable-clarity negations (`no-cargo-here`, `do-not-mask-flaky`,
`never-resume`). Each slug below is a single declaration occurrence (kebab name, not an evaluated
variable), so blast radius is 1 each (the `### slug` line, plus any dotted-address citation).

| Slug | Location | Reads better as positive? |
|---|---|---|
| `no-implementation-details` | work-package `create-issue.md` :85 | Marginal. `issue-states-what-not-how`? The negation is clear; likely keep. |
| `no-raw-commands-in-plan` | work-package `create-plan.md` :80 | `plan-references-techniques`? Negation is clearer. Keep. |
| `no-user-interaction` | work-package `reconcile-assumptions.md` :76 | `runs-unattended`? Plausible positive. Optional. |
| `no-duplicate-review` | work-package `validate-build/TECHNIQUE.md` :22 | `review-runs-once`? Optional. |
| `no-get-activity-from-orchestrator` | meta `workflow-engine/dispatch-activity.md` :49 | Names a specific prohibition with clarity; keep. |
| `no-pre-load-techniques` | meta `workflow-engine/dispatch-activity.md` :53 | `load-techniques-on-demand`? Optional. |
| `no-hook-skipping` | meta `version-control/TECHNIQUE.md` :22 | `hooks-always-run`? Plausible positive. Optional. |
| `query-not-grep` | meta `gitnexus-operations/TECHNIQUE.md` :18 | Already a positive-ish preference; the `-not-` is irreplaceable clarity. Keep. |
| `under-rating` / `over-rating` | substrate (12 occ. combined across files) | These are calibration concepts, not negations; not AP-60 sub-rule-4 targets. Likely out of scope. |
| `independence-test` / `type-determines-method` | work-packages | Already positive declarative assertions. No change needed. |

**Recommendation:** sub-rule 4 self-limits to where positive form is *at least as clear*. Most of
these read better as negations and should be **left as-is**. The handful marked "Optional" (e.g.
`no-user-interaction` → `runs-unattended`, `no-hook-skipping` → `hooks-always-run`) are the only
candidates, and they are pure judgement with blast radius 1.

---

## 4. Recommended sequencing / batches

1. **Fold into the #128 PR now (LOW risk, definition-local):** Batch B (10 concepts, ≈26 occ.) +
   Batch C (5 concepts, ≈12 occ.). All exact-string renames contained to 1–4 files each. Run
   `npm run typecheck` + `npm test` after (loader validates TOON; renames must keep bindings intact).
   Watch the two coupled cases: B7 `reference_report_path` (4 files incl. activity prose) and C5
   `file_list` (drags `intermediate-artifact-schemas.md`).

2. **Decide, then do in #128 if approved (MEDIUM risk):** Batch D (`*_status` → `*_passed`) — requires
   the object-vs-boolean decision first. Batch E/F are optional, meaning-dependent; resolve per item
   but they need not block #128.

3. **Dedicated follow-up PR (HIGH reach / cross-boundary):** Batch A (`planning_folder_path` →
   `planning_folder`) — workflows + server `src/`/`schemas/`/`docs/`/tests in lockstep, with a
   persisted-session migration check. Run `gitnexus_impact` on the server field first.

4. **Separate convention decision (do NOT bundle):** Batch G + H (`_path`-as-location, 271 + ~43 occ.).
   Either carve `_path` into AP-60 as an intentional location convention, or migrate the whole family
   in its own PR.

5. **Mostly leave as-is (LOW value):** Batch I rule slugs — sub-rule 4 keeps clarity-bearing
   negations; only 2–3 marginal candidates, blast radius 1 each.

### Corrections made to the prior consolidated findings

- `template_path` (B6): also occurs in `activities/01-scope-setup.toon` validate prose, not just `workflow.toon`.
- `reference_report_path` (B7): 7 occ. across 4 files (incl. two activity files' prose), broader than "workflow.toon + write-gap-analysis input".
- `gap_list` (C2): third surface is the `activities/07-gap-analysis.toon` output, beyond the two named techniques.
- `file_list` (C5): the same field name also appears 3× in `cicd .../resources/intermediate-artifact-schemas.md` and must move with it.
- `workflow-file-set`/`workflow-toon` (B9/B10): both are also kebab-cased symbol ids (AP-55), so the rename fixes case + representation together.
- The "~25 clear violations" figure resolves to ~16 distinct concepts once per-file lines and sub-fields are de-duplicated.
