# AP-60 Corpus Compliance Audit

**Scope:** all 11 workflows (206 technique `.md`, 92 activity `.toon`, 11 `workflow.toon`) audited against AP-60's four sub-rules, on the post-implementation content (`workflows` @ `3512c65`).
**Method:** 4 parallel auditors (work-package; prism family; workflow-design/work-packages/meta; cicd/substrate/remediate-vuln), each enumerating inputs/outputs, state-variables, and rule slugs — not sampling.
**Purpose:** answer whether the small PR #129/#130 diff implies the rest of the corpus is already compliant. **It does not.**

## Headline

The PR establishes the convention (AP-60 + spec + audit heuristic) and fixes the clear in-scope deviations it set out to fix (1 boolean I/O rename, 1 binding defect, 5 rule slugs). It does **not** certify corpus-wide conformance. Two reasons the diff is small:

1. **The convention ratifies most existing names by design** — booleans use affirmative-predicate with an *optional* prefix, so the ~45 `has_*`/`needs_*`/`*_passed`/`*_confirmed`/`*_complete` flags are conformant unchanged.
2. **Deliberate scoping** — `planning_folder_path` (highest blast radius) was explicitly deferred; collections were never a plan task; 17 of 22 negation slugs were held back.

## Clear violations remaining (~25)

Dominated by **representation-in-head suffixes** (sub-rules 2 & 3): `_path`, `_list`, `_set`, `_markdown`, `-toon`.

### `planning_folder_path` — one concept, 8 declarations (highest value)
AP-52's own text names this as the canonical drift example whose fix is `planning_folder`. Still carries `_path` in: `work-package/techniques/TECHNIQUE.md` (input), `work-package/workflow.toon`, `work-packages/techniques/TECHNIQUE.md`, `work-packages/workflow.toon`, `meta/workflow.toon`, `meta/techniques/workflow-engine/commit-and-persist.md` (input), `meta/techniques/workflow-engine/create-session.md` (output), `workflow-design/workflow.toon`.
**Caveat:** this id is coupled to server code (the recent `fix(server): surface canonical planning_folder_path` commit) — renaming it is a cross-cutting change touching `src/`, not just definition files. This is why it was deferred; it remains the single highest-value (and highest-risk) cleanup.

### Other clear `_path`/`_list`/`_set`/format-suffix violations
| workflow | file | identifier | sub-rule | suggested |
|---|---|---|---|---|
| work-package | manage-artifacts/write-artifact.md | `artifact_path` (output) | 3 | `artifact` |
| work-package | manage-artifacts/create-readme.md | `readme_path` (output) | 3 | `readme` |
| work-package | workflow.toon | `comprehension_artifact_path` | 3 | `comprehension_artifact` |
| work-package | workflow.toon | `change_block_index_path` | 3 | `change_block_index` |
| work-package | workflow.toon | `uncertain_symbols_list` | 2 | `uncertain_symbols` |
| prism | techniques/plan-analysis.md | `skip_list` (sub-field) | 2 | `skipped_units` |
| workflow-design | techniques/workflow-design.md | `workflow-file-set` (output) | 2 | `workflow-files` |
| workflow-design | techniques/workflow-design.md | `workflow-toon` (sub-component) | 3 | `workflow-definition` |
| meta | workflow-engine/generate-summary.md | `summary_markdown` (output) | 3 | `summary` |
| cicd | inventory-workflows.md | `file_list` (sub-field) | 2 | `workflow_files` |
| substrate | verify-sub-agent-output.md | `missing_tables_list` | 2 | `missing_tables` |
| substrate | write-gap-analysis.md | `gap_list` | 2 | `gaps` |
| substrate | compare-finding-sets.md | `gap_list` | 2 | `gaps` |
| substrate | workflow.toon | `template_path` | 3 | `audit_prompt_template` |
| substrate | workflow.toon + write-gap-analysis.md | `reference_report_path` (×2) | 3 | `reference_report` |
| substrate | setup-audit-target.md | `reference_document_paths` | 2/3 | `reference_documents` |

## Judgement calls (~47) — themes

- **Cargo/validate `*_status` outputs** (work-package, ~8): `check_status`/`clippy_status`/`fmt_status`/`test_status`/`build_status`/`format_status` wrap a `{ passed: boolean }` — `_status` hides the predicate (sub-rule 1); affirmative form is `*_passed`.
- **Imperative-verb booleans** (sub-rule 1): `post_jira_comment`, `use_existing_pr` (work-package), `verify_invariants` (substrate) — read as commands, not state assertions.
- **`_url` / `_ref` representation suffixes** (sub-rule 3): `pr_url`, `issue_url`, `review_pr_url`, `template_ref` — representation-in-head, but disambiguate from `*_number`/id; meaning-dependent.
- **`*_path` as deliberate location convention** (prism/audit/evaluate/update + meta `target_path`/`submodule_path`/`source_path`): under a strict reading every `_path` id violates sub-rule 3, but the corpus uses `_path` consistently as the artifact-location convention and several are genuine path-as-value inputs (AP-57/58). A corpus-wide decision, not isolated errors.
- **Negation / process-narration rule slugs** (sub-rule 4): `no-implementation-details`, `no-raw-commands-in-plan`, `no-user-interaction`, `no-duplicate-review` (work-package); `no-get-activity-from-orchestrator`, `no-pre-load-techniques`, `no-hook-skipping`, `query-not-grep` (meta); `under-rating`, `over-rating` (substrate); `independence-test`, `type-determines-method` (work-packages). Each has a positive restatement; some may carry clarity worth keeping.

## Carve-outs (correctly NOT flagged)
Affirmative result flags (`worktree_created`, `*_passed`, `*_confirmed`, `*_complete`), `has_*`/`needs_*`/`is_*` predicates, plural item-noun collections (`tasks`, `failures`, `open_assumptions`, …), singular key-addressed maps (`dependency_map`, `permission_map`, `severity_to_count`), `_type`/`_mode` enum discriminators, irreplaceable-clarity negations (`no-cargo-here`, `do-not-mask-flaky`, `never-resume`), rendered-table/manifest deliverables, and the didactic example strings inside `anti-patterns.md` itself.

## Bottom line
- The audit heuristic (T3) added by this PR is exactly the instrument that surfaces all of the above; it had simply never been run corpus-wide.
- The clear `_path`/`_list` representation suffixes (especially the 8 `planning_folder_path` declarations) are the highest-value follow-up; `planning_folder_path` additionally requires a coordinated `src/` change.
- The `*_status` outputs and negation rule slugs are coherent next batches if the convention is to be enforced beyond the initial scope.
