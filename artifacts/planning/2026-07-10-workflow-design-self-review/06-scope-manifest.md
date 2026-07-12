# Scope Manifest: workflow-design remediation (v1.6.0 → 1.7.0)

**Date:** 2026-07-12
**Session:** RPKOLJ · activity `scope-and-draft` (prefix 06)
**Worktree:** `/home/mike1/projects/work/workflows/2026-07-10-workflow-design-self-review/workflow-design/`
**Branch:** `workflow/workflow-design-self-review` (verified checked out)
**Change spec:** [08-compliance-review.md](08-compliance-review.md) — 30 findings · [05-impact-analysis.md](05-impact-analysis.md)

Every entry is action `modify` — no file is created, removed, or renamed (RR-1, RR-6). Ordered per the drafting convention: `workflow.yaml` → activities → techniques → resources → README.

## Structural design

No folder-layout change. The 9-activity structure and transition chain are unchanged (RR-1):
`intake-and-context → requirements-refinement → pattern-analysis → impact-analysis → scope-and-draft → quality-review → validate-and-commit → post-update-review → retrospective`.

The one structural rebuild is intra-activity: `06-scope-and-draft`'s drafting loop (H1) — reference pattern is `work-package` per-item loops (checkpoints live INSIDE the `forEach` body).

## File manifest (drafting order)

### 1. Root workflow.yaml (1)

| # | Path | Action | Type | Findings | What changes |
|---|------|--------|------|----------|--------------|
| 1 | `workflow.yaml` | modify | workflow | H8, M1, M2, RR-7 | Re-bucket 4 worker rules `rules.workflow`→`rules.activity` (H8); dissolve stale activity rules absorbing migrations (H6 coordination); delete 6 orphan variables (`all_files_validated`, `approach_confirmed`, `user_wants_fixes`, `has_design_context`, `requirements_confirmed`, `has_deferred_assumptions`) after zero-reader confirmation, keep `has_open_assumptions` wired (M1/RR-5); add `operation_type` variable (M2); version → 1.7.0 (RR-7) |

### 2. Activities (9)

| # | Path | Action | Findings | What changes |
|---|------|--------|----------|--------------|
| 2 | `activities/01-intake-and-context.yaml` | modify | H6, AP-38 | Dissolve `rules:` block; de-sequence description |
| 3 | `activities/03-requirements-refinement.yaml` | modify | H6, M11, M12, M1, AP-38 | Dissolve `rules:`; templated checkpoint id → static `assumption-decision` (M11); `has_open_assumptions` gate onto interview loop (M1/RR-5); `set-design-dimensions` mapping → technique output (M12); de-sequence description |
| 4 | `activities/04-pattern-analysis.yaml` | modify | H6 | Dissolve `rules:` (restates bound-technique protocol) |
| 5 | `activities/05-impact-analysis.yaml` | modify | H6 | Dissolve `rules:` |
| 6 | `activities/06-scope-and-draft.yaml` | modify | H1, H2, H3, M3, H6, L1, AP-38 | **Structural rebuild** — see §2a |
| 7 | `activities/08-quality-review.yaml` | modify | H4, H6, M10, M13, L1 | Dissolve `rules:`; ungate `verify-high-findings` review path (M10); re-gate update-chain on `scope_manifest_confirmed` (M13/RR-2); delete `offer-fixes` marker (L1); H4 count interpolations now backed |
| 8 | `activities/09-validate-and-commit.yaml` | modify | H4, M9, H6, L2 | Dissolve `rules:`; gate `stage-and-commit` `is_review_mode != true` (M9); H4 counts backed |
| 9 | `activities/10-post-update-review.yaml` | modify | H6 | Dissolve `rules:` |
| 10 | `activities/11-retrospective.yaml` | modify | H6/AP-27 | Dissolve `rules:` (2 rules dup `conduct-retrospective`) |

#### 2a. `06-scope-and-draft` structural rebuild (H1)

- **Remove** duplicated top-level `present-file-approach`/`yaml-authoring`/`present-for-review` steps (kept copies move into loop); remove `advance-to-next-file` empty marker (L1).
- **Restructure** `file-drafting-loop` body: approach → `file-approach-confirmed` → draft → review → `file-review` → `preservation-check`.
- **Move** `batch-review` to AFTER the loop.
- **H2**: relocate/gate `verify-preconditions` validate so it no longer precedes its producer.
- **H3**: `preservation-check` gate `has_unflagged_removals` gains a producer (content-drafting output).
- **M3**: `content-drafting` split into two ops re-pointing both bindings (co-located).
- No checkpoint added/removed (RR-6).

### 3. Techniques (20 modified of 34)

| # | Path | Findings | What changes |
|---|------|----------|--------------|
| 11 | `techniques/TECHNIQUE.md` | L5 | `tool-usage` rule "no session token" → `session_index` |
| 12 | `techniques/intake-classification.md` | H5, H7, L9, L8 | Declare `## Outputs` (mode flags, `workflow_id`, `target_workflow_id`, `operation_type`); wrapped-op refs (H7); fix AP-34 return claim (L9) |
| 13 | `techniques/reload-workflow.md` | H7 | Reference wrapped `workflow-engine::list-workflows` |
| 14 | `techniques/context-loading.md` | H7, L8 | Wrapped-op ref; mode input if branching |
| 15 | `techniques/content-drafting.md` | H3, M3, L8 | Split into two ops (approach / review); declare `has_unflagged_removals` output (H3); `current_file` input; mode input |
| 16 | `techniques/review-draft-yaml.md` | M8, L8 | Remove output "before the audit passes run" prose (M8); mode input |
| 17 | `techniques/audit-expressiveness.md` | H4 | Declare `## Outputs`: findings + `expressiveness_finding_count` |
| 18 | `techniques/audit-conformance.md` | H4 | Outputs + `conformance_finding_count` |
| 19 | `techniques/audit-rule-hygiene.md` | H4 | Outputs + `rule_hygiene_finding_count` |
| 20 | `techniques/audit-rule-enforcement.md` | H4 | Outputs + `enforcement_finding_count` |
| 21 | `techniques/compile-report.md` | H4 | Outputs: `pass_count`, `fail_count`, `review_findings_count`, etc. |
| 22 | `techniques/summarize-findings.md` | H4 | Outputs: `addressed_count`, `total_count` |
| 23 | `techniques/verify-high-findings.md` | M10, M8 | Remove fix-cycle-timing rule/output references (M8); (ungate handled in activity) |
| 24 | `techniques/apply-audit-fixes.md` | L3, M8 | `no-collateral-removal` prose → addressable rule/content (L3); de-couple input naming the four passes (M8) |
| 25 | `techniques/reconcile-design-assumptions.md` | M6, M8 | Absorb audit-mapping table from resource (M6); de-couple "the interview step" output (M8) |
| 26 | `techniques/scope-verification.md` | L2 | "the scope manifest" bare ×2 → `{scope_manifest}` |
| 27 | `techniques/conduct-retrospective.md` | L2 | Remove repeated literal `COMPLETE.md` (declared in `#### artifact`) |
| 28 | `techniques/readme-authoring.md` | L2, L8 | Remove repeated literal `README.md`; mode input |
| 29 | `techniques/create-completion-doc.md` | L8 | Declare mode input |
| 30 | `techniques/persist-report.md` | L8 | Declare mode input |
| 31 | `techniques/impact-analysis.md` | M6 | Absorb `update-mode-guide` impact procedure incl. 5th variable-integrity step (M6) |

### 4. Resources (10 modified of 11)

| # | Path | Findings | What changes |
|---|------|----------|--------------|
| 32 | `resources/update-mode-guide.md` | M6, L5 | Impact procedure + Content-Preservation rules subsumed into techniques, pointers left; 5th step preserved into `impact-analysis`; "resource index" stale vocab (L5) |
| 33 | `resources/review-mode-guide.md` | H5, L4 | Mode "recognition patterns" cease to be mutation source (structural producer added in intake-classification); severity vocab align (L4) |
| 34 | `resources/design-assumption-reconciliation.md` | M6 | Audit-mapping table subsumed into `reconcile-design-assumptions`, pointer left |
| 35 | `resources/design-assumptions.md` | M7 | Two-table log → single-row lifecycle log (AP-84) |
| 36 | `resources/design-context-readme.md` | M5, L4, L6 | Remove caller-coupling attribution (M5); "Nit" vocab align (L4); add Retrospective (11) row (L6) |
| 37 | `resources/completion-artifact.md` | M5 | Remove "written by conduct-retrospective" coupling |
| 38 | `resources/elicitation-guide.md` | M5 | Remove "The `elicitation` technique poses…" coupling |
| 39 | `resources/design-principles.md` | H2 | Repair P2 claim about `scope_manifest_confirmed` gate |
| 40 | `resources/anti-patterns.md` | M4 (IA) | Verify count references (82 authoritative); likely no content change |
| 41 | `resources/README.md` | M5, M4 | Remove per-resource producer/consumer attributions (M5); count/Used-By drift (M4) |

### 5. READMEs (3)

| # | Path | Findings | What changes |
|---|------|----------|--------------|
| 42 | `README.md` (root) | M4, M5 | Header → 1.7.0; "64"→82 (×3); category table add Output Economy; principles table add P15; Review-Mode output path → planning folder; retrospective-reuse claim → workflow-local; remove "Used By" column (M5) |
| 43 | `activities/README.md` | M4-adj (IA) | Verify no stale counts/claims |
| 44 | `techniques/README.md` | M4-adj (IA) | Verify roster after M3 split |

## Integrity checks to honor while drafting (from 05 §5)

1. Confirm zero readers before deleting each M1 variable.
2. Land `operation_type` producer (`intake-classification`) with its consumer (M2 interpolation).
3. Confirm meta wrapped ops exist before H7 rebind — `meta/techniques/workflow-engine/list-workflows.md` confirmed present.
4. Confirm M13 re-gate keeps the update path reachable (update sets `scope_manifest_confirmed=true` before quality-review — holds).
5. Preserve M6's variable-integrity 5th step INTO the `impact-analysis` technique (do not drop).
6. M3 `content-drafting` split re-points both bindings (`present-file-approach`, `present-for-review`) — co-located with H1.

## Drafting order rationale

`workflow.yaml` first (variables + rule buckets are referenced by activities/techniques), then activities (bind techniques), then techniques (declare the I/O the activities' interpolations read), then resources (subsumed content lands in techniques first), then READMEs (reflect the final counts/roster). This mirrors the reference-dependency chain.
