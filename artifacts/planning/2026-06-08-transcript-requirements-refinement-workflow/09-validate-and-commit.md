# 09 — Validate and Commit

**Activity:** validate-and-commit (terminal for create mode) · **Status:** ✅ Validated · ⏸ commit awaiting explicit user authorization.

## Schema validation — 7/7 pass
| File | Result |
|------|--------|
| `workflow.toon` | ✅ `WorkflowSchema` |
| `activities/01-intake-sources.toon` … `06-report-failure.toon` | ✅ `ActivitySchema` (6/6) |
| Full workflow via `loadWorkflow` | ✅ 6 activities, 12 variables, `initialActivity` resolved, all technique refs resolved |

## Scope manifest — 21/21 addressed
All files from the [scope manifest](06-scope-and-structure.md) are present: `workflow.toon`, 6 activities, `TECHNIQUE.md` + 5 techniques, 4 resources, 4 READMEs. README generated (create mode).

## Validation / scope checkpoints
- `validation-passed`: 7 passed, 0 failed → `all_files_validated = true`.
- `scope-verified`: 21/21 addressed.

## Scope addendum — source-document discrimination (post-review user request)

Before commit, the user requested a further capability: discriminate **meeting minutes vs unstructured
documents** so arbitrary documents can also be parsed into the specification, source-referenced, and
credited to the author. Folded into the (uncommitted) draft:

- `transcript_path` → `source_path`; new `source_type` (meeting | document) variable (13 vars total).
- `intake-sources`: new `classify-source-type` step (auto-classify + confirm at `sources-confirmed`).
- `analyze-transcript` activity/technique → **`analyze-source`** (generalized; step 3 branches: meeting → `SRC-MTG###` + initials, document → `SRC-DOC###` + author).
- `specification-protocol.md`: new `SRC-DOC###` class, §2.5 Reference Documents, author attribution (listing `**SRC-DOC###**: [Title](path) — Author Name` + inline `*Source: SRC-DOC### (Author Name)*`).
- `requirements-analysis-report.md` / `change-summary.md`: generalized Source block + author field.
- workflow rule added for the discrimination invariant (backed by the intake step + analyze branches).

Re-validated: 7/7 TOON pass; loader OK — activities `intake-sources, analyze-source, update-specification, validate-specification, finalize-specification, report-failure`; 13 variables; all technique refs resolved. (Caught and fixed two stale TOON array-count headers — `rules[6]→[7]`, `variables[12]→[13]` — during re-validation.)

## Commit status
Per the repository `explicit-commit` rule, no commit is made without an explicit user request. The
workflow is fully drafted and validated in the `workflows` worktree (branch `workflows`), staged for
the user's commit decision. The workflow-design `stage-and-commit` step is **gated on user
authorization**; awaiting that decision.
