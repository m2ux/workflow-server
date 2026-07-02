# Impact Analysis: work-package remediation (13 findings)

**Date:** 2026-07-02
**Mode:** UPDATE (`is_update_mode=true`)
**Target:** work-package v3.15.0 · `workflows/work-package/`
**Change spec:** the 13 findings in [08-compliance-review.md](./08-compliance-review.md) + [assumptions-log.md](./assumptions-log.md) (RE-1 branch (a), RE-2 keep-as-is)
**Guards at baseline (verified this activity):** `validate-workflow-yaml.ts` = 1 FAIL (`respond-to-pr-review.md`, 3 tokens); `check-all-refs.ts` = 0 unresolved; `check-binding-fidelity.ts` = 40 total / 40 baselined / 0 NEW / 0 fixed.

---

## 1. File Inventory (target workflow)

The workflow has **132 files**: `workflow.yaml`, 15 activity YAMLs, 96 technique files, 26 resources, 3 READMEs (root, activities/, resources/). The 13 fixes touch **9 files**; the other 123 are **unaffected**.

## 2. Impact Classification (per file)

### Directly modified (9 files)

| # | File | Findings | Change kind |
|---|------|----------|-------------|
| 1 | `techniques/respond-to-pr-review.md` | H-1 | Content edit — resolve 3 unanchored tokens (`updated_at`, `html_url`, `unresolved_comments`) in the §1 fenced bash block so `validate-workflow-yaml.ts` passes. |
| 2 | `techniques/implement-task.md` | H-2 | Add a producing step for the edit-target symbol in §1/§2; normalize both reads to bare `{target_symbol}` (or declare `target_symbol` as an input). Binding-gap fix. |
| 3 | `activities/10-post-impl-review.yaml` | M-1, L-1 | Collapse the two consecutive `review-diff` steps (`regenerate-index` + `re-manual-diff-review`) in the `review-fix-cycle` loop into one; drop the two `set` descriptions on `reset-fix-flags`. |
| 4 | `activities/04-research.yaml` | M-2, M-3, L-3 | Delete the shadowed `declare-context-scope` set step; trim `context-scope-declaration` message (drop downstream-consumer rationale); normalize `present-resolved-assumptions` message tail. |
| 5 | `activities/02-design-philosophy.yaml` | M-3, L-1, L-5 | Trim `classification-and-path-confirmed` message (drop auto-advance restatement + mode→path enumeration); drop `set-review-mode-path` description; drop/replace `document-philosophy` "Created:" message. |
| 6 | `activities/09-lean-coding-audit.yaml` | M-3 | Trim `audit-findings-confirmed` message (drop artifact-content re-listing). |
| 7 | `activities/15-codebase-comprehension.yaml` | M-5 | Trim `create-comprehension-artifact` message (drop flow/checkpoint narration + literal path); route path via a defaulted variable if the dir is a fixed convention. |
| 8 | `activities/01-start-work-package.yaml` | M-4 (RE-1), L-1, L-2, L-4 | Add `setVariable` effect to `jira-project-selection` (both options capture the chosen project) — **conditional, see §5**; drop `gitnexus_indexed` set description; trim `verify-signing-precondition` validate justification tail; trim `bind-planning-folder-path` set message. |
| 9 | `activities/05-implementation-analysis.yaml` | L-3 | Normalize `present-resolved-assumptions` message tail (drop "during this phase"). |

Note: L-3 is **systemic across 3 activities** (04, 05, 08). Activity **08-implement.yaml** carries the same "Resolved Assumptions … during this phase" message (line 98) and is therefore a **10th directly-modified file** if L-3 is applied uniformly. The compliance report cites 04/05/08 explicitly; the impact scope for L-3 is those three files. (Table above lists 08 implicitly under L-3; treat 08 as directly modified for L-3 only.)

### Indirectly affected (0 files)

**None.** Verified below (§3) — no fix removes/renames anything another file references.

### Removed (0 whole files)

No file is deleted. The only *step*-level deletion is `declare-context-scope` (M-2) inside `04-research.yaml`.

## 3. Integrity Checks (transitions + references)

**Transition-chain integrity: INTACT.** No activity is added, removed, or reordered. No `transitions[].to` or `decisions[].transitionTo` target is touched by any of the 13 fixes. All fixes are intra-activity (message/description/step-body edits) or intra-technique. The activity graph (01→…→15, plus the review-mode/blocker/body-conformance branches) is unchanged.

**Reference integrity: INTACT.** `check-all-refs.ts` = 0 unresolved at baseline, and:
- **No `step.technique` binding target changes.** M-1 collapses two steps that BOTH bind `review-diff`; the surviving step still binds `review-diff` — the technique reference is preserved. H-2 keeps `gitnexus-operations::impact`/`::context` refs. H-1 edits only prose tokens inside a fenced block, not the `pr-review-response.md` resource hyperlinks.
- **No resource ref orphaned.** No resource file is deleted; M-5's path-through-variable option (if taken) is a variable/default change, not a resource-hyperlink change.
- **Step-id deletions checked for external references.** `declare-context-scope` (M-2 delete) and the two collapsed `review-diff` step-ids (`regenerate-index`, `re-manual-diff-review`, M-1) are referenced **nowhere else** in the workflow (grep-verified across all YAML + both READMEs). No `when`/`condition`/`transition` reads a variable those steps uniquely produced — `declare-context-scope` set `context_scope` with **no value** (the `context-scope-declaration` checkpoint is the real setter, and it stays), and the `review-diff` steps produce the change-block index consumed by later steps in the same loop, which the surviving collapsed step still produces.

**README/mermaid integrity: INTACT.** Grep-verified: `activities/README.md` mermaid nodes reference `context-scope-declaration` (line 169) and `jira-project-selection` (line 33) — **both checkpoints are kept**, so their diagram nodes are unaffected. `declare-context-scope` is **not** a mermaid node (it was a value-less set, never diagrammed), so its deletion requires no README edit. No README transcribes the trimmed message/description text (AP-76 clean per the compliance review), so message trims don't ripple into README prose.

## 4. Cross-File Ripple & Guard Baselines

| Guard | Baseline | Expected after fixes | Ripple risk |
|-------|----------|----------------------|-------------|
| `validate-workflow-yaml.ts` | 1 FAIL (`respond-to-pr-review.md`) | **0 FAIL** | H-1 is the sole failing file; its fix is the only change that moves this guard. Must re-run to confirm the 3 tokens resolve and no *new* validator finding is introduced by any message/description edit. |
| `check-all-refs.ts` | 0 unresolved | **0 unresolved** | Only at risk if a fix renamed a technique/resource ref — none do. M-1's step-collapse keeps the `review-diff` ref live. |
| `check-binding-fidelity.ts` | 40 / 40 baselined / 0 NEW | **40 / 40 / 0 NEW** (or 41/… if H-2 adds a new baselined read) | H-2 introduces a *new* `{target_symbol}` producer + reads. The producing step must make the read resolvable so it does **not** register as a NEW unresolved read. If H-2 declares `target_symbol` as an input (vs. a `$`-local produced by a step), fidelity stays clean. This is the one guard-sensitive fix — re-run after H-2. (Baseline currently has **no** entry for `implement-task.md` or `respond-to-pr-review.md`; those tokens live in `$`-local/fenced-code positions the fidelity checker does not currently flag, so H-1/H-2 fixes should not add baseline rows.) |

**Version bumps (ripple, not risk):** each directly-modified activity YAML and technique file bumps its own `version:`; `workflow.yaml` version bumps to reflect the remediation. These are metadata edits, not behavioral.

## 5. RE-1 Branch Resolution — jira-project-selection (M-4)

**Resolved (final — user decision after impact-analysis verification):** KEEP the `jira-project-selection` checkpoint as a real decision gate (both options get a `setVariable` capturing the chosen project) **AND** add a `jira_project` input to the `create-issue` technique so the effect is consumed downstream and genuinely load-bearing. Do NOT demote to `action: message`; do NOT leave a bare dead variable.

**Why the consumer must be added.** The `create-issue` step (`create-issue.md` §3, line 51) currently handles project selection **interactively inside the technique** ("List available projects via `getVisibleJiraProjects`, then obtain the user's project selection") and declares inputs `issue_platform` / `issue_type` / `target_submodule` — **no `jira_project` / `project_key` input**. Grep-verified: **no structural consumer** of a captured project variable exists anywhere in the workflow today. So the checkpoint's new `setVariable` alone would be a written-but-never-read variable (the AP-82-adjacent dead-effect smell M-4 flags); adding the `create-issue` input is what makes the gate load-bearing.

**Scope for scope-and-draft (both files):**
- `01-start-work-package.yaml` — give the `jira-project-selection` options a `setVariable` effect capturing the chosen project (e.g. `jira_project`), keeping the checkpoint as a gate.
- `create-issue.md` — add a `jira_project` input to the signature and read it in §3 (the value the checkpoint captured), replacing/anchoring the "obtain the user's project selection" prose so the bound value is consumed.

This expands the RE-1 change from 1 file to **2 files** (`01-start-work-package.yaml` + `create-issue.md`). `create-issue.md` was previously unaffected; it becomes a **directly-modified technique file** for RE-1. Net workflow file count: **10 directly modified** (11 if L-3 is applied to activity 08). All other integrity checks in §3–§4 are unaffected — `create-issue` keeps its existing `step.technique` binding and hyperlinks; only its input signature grows (binding-fidelity must stay clean — the new input is a declared producer for the `{jira_project}` read, so it does not register as a NEW unresolved read).

## 6. Content-Removal Inventory (for preservation checkpoint)

Every fix that **removes** content, for explicit confirmation:

| Finding | File | Content removed |
|---------|------|-----------------|
| M-2 | `04-research.yaml` | The entire `declare-context-scope` action step (value-less `set context_scope`). Behavior preserved — the `context-scope-declaration` checkpoint remains the authoritative setter. |
| M-1 | `10-post-impl-review.yaml` | One of the two `review-diff` steps in `review-fix-cycle` (the loop goes from 2 identical `review-diff` invocations to 1). |
| M-3 | `02`, `04`, `09` | Message prose: auto-advance restatement + mode→path enumeration (02); downstream-consumer rationale (04); artifact-content re-listing (09). No structural/effect content removed. |
| M-5 | `15-codebase-comprehension.yaml` | Message prose: flow/checkpoint narration + embedded literal path. |
| L-1 | `01`, `02`, `10` | `set` action `description` fields (4 sites). The `set` targets/values/whens are **kept** — only the redundant descriptions go. |
| L-2 | `01-start-work-package.yaml` | Validate-message justification tail ("The workflow does not modify your git configuration."). Diagnostic + fix instruction kept. |
| L-3 | `04`, `05`, `08` | Message tail "during this phase" / "were resolved through code analysis during this phase" → normalized to "resolved through code analysis." |
| L-4 | `01-start-work-package.yaml` | Set-message narration ("Never anchored to target_path or any CWD"). Value description kept. |
| L-5 | `02-design-philosophy.yaml` | `document-philosophy` "Created: design-philosophy.md" message (replaced with a value cue or omitted). |

**No behavioral removal.** Every deletion is either (a) redundant narration whose semantics live in a bound technique / workflow rule, or (b) a value-less/duplicate structural step whose effect is covered elsewhere. No checkpoint, effect, `setVariable`, condition, transition, or technique binding is removed. RE-2 explicitly **keeps** the `review-received` gate (13-submit-for-review.yaml) unchanged — no removal there.

## 7. Blast-Radius Summary

- **Files changed:** 9 (10 if L-3 applied to 08); **123 unaffected.**
- **Cross-file ripple:** version bumps only; **no transition, ref, or README-node breakage.**
- **Guard-sensitive fix:** H-2 (binding-fidelity) and H-1 (yaml-validator) — re-run both guards after fixing; expect validator 0-FAIL, fidelity unchanged.
- **Confined to enumerated files:** confirmed. The one scope-expansion to watch is RE-1: branch (a) as-written adds a dead variable (no consumer), so scope-and-draft should either demote (branch b) or add the `create-issue` consumer — otherwise the fix contradicts the finding it resolves.
- **Collateral behavior-change risk:** none identified. All message/description edits are cosmetic to the agent-facing prose; the structural setters, gates, and bindings that drive behavior are untouched.
