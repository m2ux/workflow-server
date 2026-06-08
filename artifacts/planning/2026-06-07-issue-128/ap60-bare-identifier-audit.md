# AP-60 Bare Single-Word Identifier Audit (corpus-wide)

**Trigger:** sharpening of AP-60 sub-rule 3 — "an identifier is a *qualified* noun phrase, never a bare single word." Full re-audit (4 parallel auditors, grep-grounded) of all 11 workflows.
**Important:** this re-audit CORRECTS the earlier `ap60-proposed-changes.md` batch list, which was built on stale data.

## Corrections to the earlier batch list

The earlier audit's headline `_path`/`_list` renames are mostly stale or false:
- `artifact_path`, `readme_path` → the current ids are already bare `artifact`, `readme` (so they ARE defects, but under the bare-word rule, not the suffix rule).
- `comprehension_artifact_path`, `change_block_index_path`, `uncertain_symbols_list`, `summary_markdown`, `gap_list`, `file_list`, `template_path`, `reference_report_path` → **do not exist** in current corpus; the live ids are already qualified (`comprehension_artifact`, `change_block_index`, `uncertain_symbols`, `summary`, `gaps`, `workflow_files`, `audit_prompt_template`, `reference_report`).
- `workflow-file-set`/`workflow-toon` → live ids are already `workflow-files`/`workflow-definition`.
- cargo `*_status`, `pr_url`/`issue_url`, `*_passed` → all already two-word qualified (NOT bare-word defects; they were the *shape* batch D/F, a separate axis).

## The real picture: ~120 bare single-word identifiers

### Class (a) — generic scalar/object, clearly need a qualifier
| Area | Count | Notable | Blast |
|---|---|---|---|
| work-package | ~40 | **20× `#### artifact` sub-fields** (one pattern), `readme`, `content`, `diagnostics`, `reversibility`; rule slugs `clarity`/`traceability` | mostly definition-local (LOW) |
| work-package HIGH-BLAST | 3 | `complexity` (~93 occ, state-var + checkpoints + create-adr), `requirements` (~188 occ, ambient input across 7 techniques), `plan` (`plan.tasks` dotted access) | HIGH |
| prism family | ~15 | `artifact` (×11 files), `scope`, `strategy`, `parallelism`, `units`, `role`, `overview`, `target` (workflow var, threaded) | mostly LOW; `target` MED |
| meta/design/work-packages | ~45 | `state` (workflow-engine, many techniques + dispatch call-sites), `context`, `catalog`, `candidates`, `effects`, `prompt`, `result`, `summary`, `trace`, `match`, `name`, `query`, `rows`, `stats`, `message`, `branch`, `title`, `body` | `state`/`context`/`catalog` MED; rest LOW |
| cicd/substrate | 6 (15 sites) | `summary`, `artifact` (×4), `coverage` (×3), `methodology` (×2), `recommendations`, `scope` (×2) | LOW |

### Class (b) — bare plural collections (DIRECT TENSION with AP-60 sub-rule 2)
AP-60 sub-rule 2 **endorses** bare plural item-nouns for collections (`tasks`, `failures`). The new sub-rule-3 sharpening would force-qualify them. This is an internal contradiction that must be resolved before touching these.
- work-package: `tasks`, `failures`, `findings`, `assumptions`, `commits`, `resources` (~6)
- prism: `dimensions`, `exclusions`
- meta: `agents`, `results`, `candidates`, `submodules`, `paths`, `substitutions`
- **cicd/substrate (SCHEMA-BOUND):** `findings` (315 raw occ; a key in `sub-agent-output-schema.md` + every agent's JSON output), `gaps`, `observations`, `compounds`, `missing_tables` — renaming these **breaks the JSON contract** with dispatched scanner sub-agents.

### Class (c) — correctly EXEMPT (not flagged)
External tool-param mirrors (Atlassian camelCase `pageId`/`spaceId`, GitHub `owner`/`repo`), kind/enum discriminators (`kind`, `type`, `direction`, `harness`), affirmative booleans (`is_monorepo`, `stale`, `*_passed`), and checkpoint-option/branch ids (`confirmed`, `accept`, `proceed`, …) — all single-word by design.

## Risk summary
1. **Convention self-contradiction:** sub-rule 2 (bare plural OK) vs new sub-rule 3 (qualify everything). Must decide whether the rule exempts plural collections.
2. **Schema-breaking:** `findings`/`gaps`/`observations`/`compounds`/`missing_tables` are bound to JSON schemas consumed by sub-agents — renaming ripples beyond the definition corpus.
3. **High-blast:** `complexity` (~93), `requirements` (~188), `state` (cross-technique), `target` (prism orchestrator) — large coordinated edits, error-prone.
4. **Low-blast safe set:** the ~70 definition-local class-(a) ids (the `#### artifact`/`#### summary`/`#### coverage`/etc. sub-fields and technique-local inputs with no cross-file `{id}` binding) are safe mechanical renames.

## Recommended approach
- **Decide the rule's reach first:** exempt plural collections (class b) and external-schema-bound ids, so the rule targets generic scalars/objects (class a). This removes the sub-rule-2 contradiction and the schema-breakage.
- **Apply the low-blast class-(a) safe set** (~70 ids) in this work package.
- **Stage the high-blast ids** (`complexity`, `requirements`, `state`, `target`) as their own reviewed change(s) — too risky to bundle.
- **`planning_folder_path`** remains its own server-coupled PR (unchanged from prior decision).
