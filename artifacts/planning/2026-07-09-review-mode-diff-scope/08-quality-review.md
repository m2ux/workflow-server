# Quality Review — Review-Mode Diff-Scope Fix

**Session:** HS4VHZ · **Workflow:** workflow-design · **Activity:** quality-review
**Date:** 2026-07-09 · **Mode:** UPDATE (`is_update_mode = true`, `is_review_mode = false`) · **Target:** `work-package` (→ v3.26.0)
**Audit target:** the 8 drafted files in worktree `/home/mike1/projects/work/workflows/2026-07-09-review-mode-diff-scope` (branch `workflow/203-review-diff-scope`), issue [#203](https://github.com/m2ux/workflow-server/issues/203).

Audit run against the WORKTREE. Design authority delegated; the fix is intentionally minimal — findings flag only genuine schema-invalidity, anti-pattern violations, or correctness defects. No complexity-adding findings invented.

---

## Guard / schema results (worktree, `--root`)

| Guard | Result |
|---|---|
| `validate-workflow-yaml.ts work-package` | **PASS** — workflow.yaml valid, all 15 activities valid, 99 techniques, no unanchored protocol refs |
| `check-variable-model.ts` | **OK** — defaults, gates, setVariable effects coherent |
| `check-binding-fidelity.ts` | **OK** — 0 NEW; 5 fixed (drafts declared `changed_files` output + `pr_number` inputs, shrinking drift) |
| `check-self-provisioned-input.ts` | **OK** — no self-provisioned inputs |
| `check-review-mode-gating.ts` | **OK** — 6 baselined, 0 NEW |

**No schema-invalidity anywhere.** The workflow loads and runs.

---

## Pass results

### Pass 1 — Expressiveness (`expressiveness_finding_count = 0`)
All changed content is in the correct formal home: new inputs/outputs as `### <id>` sections, new rules as `### <name>` under `## Rules`, protocol edits in `## Protocol`, resource narrative in the resource file. No prose substitutes for a step/checkpoint/decision/loop/transition/condition/trigger/action/variable. The **merge-in guard is deliberately log-only (not a checkpoint)** — correct; making it a gate would over-engineer beyond #203. **Clean.**

### Pass 2 — Conformance (`conformance_finding_count = 0`)
Version bumps follow `X.Y.Z` (minor bumps for additive edits). Rule keys kebab-case; input/output section style matches sibling review techniques; the `findings-constraint` shared-rule text is identical across the finding producers, matching the established shared-rule convention. **Clean.**

### Pass 3 — Rule Hygiene (`rule_hygiene_finding_count = 0`)
`findings-constraint` appears verbatim in `review-code`, `review-test-suite`, `review-scope` and is enforced in `review-summary` protocol + `review-mode` narrative. Under the **AP-27 worker-visibility carve-out**, per-technique duplication of worker-directed behavioural rules is correct — workers receive each technique via `get_technique`, never `workflow.yaml`, so the rule cannot be lifted to the root. `authoritative-authored-surface` and `merge-in-guard` add authority/rationale, not verbatim protocol restatement (not AP-24). No sibling contradiction, no prefix-pattern regression, no single-step rule. **Clean.**

### Pass 4 — Rule Enforcement (`enforcement_finding_count = 0`)
No `workflow.yaml` or activity `rules[]` entry was added or changed — all new rules are technique-level agent guidance. The findings-constraint is a review-quality heuristic applied while forming findings, not a critical invariant demanding a checkpoint/condition/validate. Backing it with structure would over-engineer beyond #203. **Clean.**

---

## Verified findings (`verify-high-findings`)

### F1 — Create-path `changed_files` loses its producer — **High (confirmed)**

**Files:** `techniques/review-code.md` (protocol step 1), `techniques/strategic-review/review-scope.md` (protocol step 1).

**Defect.** `changed_files` is not a declared workflow variable and is set/remapped by no activity. Its producers are technique protocols only:
- **Review mode:** `review-baseline-state` (the drafts' new, correct canonical producer) — gated `is_review_mode == true` in activity 05.
- **Create mode (authoring):** the ONLY producer was `review-code` step-1 self-derivation (`"Establish the {changed_files} set by running git diff …"`) and `review-scope` step-1 self-derivation (`git diff --name-only <base> HEAD`). **The drafts remove both**, repointing them to consume from `review-baseline-state`.

But `review-baseline-state` runs only in review mode. In create mode it is skipped, so nothing produces `changed_files`. The create-path consumers that ran ungated after `review-code` — `review-test-suite` (activity 10), `summarize-architecture` (activity 10), `review-scope` (activity 12), `finalize-documentation/ensure-docs` — are pure consumers (verified: none self-derives). They lose their upstream source on the create path.

**Consumer gate table (verified):**

| Technique (step) | Activity | Gated `is_review_mode==true`? | Runs create mode? |
|---|---|---|---|
| `review-baseline-state` (producer) | 05 | YES | no |
| `review-code` (code-review) | 10 | **NO** | **yes** |
| `review-test-suite` (test-suite-review) | 10 | **NO** | **yes** |
| `summarize-architecture` | 10 | NO | yes |
| `review-scope` (review-strategy) | 12 | **NO** | **yes** |
| `review-test-suite` (11), `review-summary` (13) | 11/13 | YES | no |

**Adversarial re-derivation (refute-by-default): confirmed.** Re-derived from the cited protocol steps and the consumer gates alone — pre-change `review-code`/`review-scope` self-derived; post-change they consume a review-mode-only value; no other create-path producer exists. The impact-analysis artifact (§3.2) asserted create-path consumers "retain their existing (unchanged) source" — that claim is inaccurate: their source WAS `review-code`'s now-removed self-derivation.

**Why High, not Critical:** schema-valid, guards green, workflow loads and runs; a create-mode agent still has the review resources describing the diff and would likely fall back to reading it. But the technique no longer instructs it to, so create-mode review scope becomes underspecified — a correctness regression on an execution path #203 did not intend to touch.

**Why the guards missed it:** the create-path derivation lived in prose, never a declared output, so it was invisible to the variable-model / binding-fidelity graphs. Removing invisible prose registers as no drift.

**Recommended remediation (minimal, no over-engineering):** in `review-code.md` and `review-scope.md` step 1, keep the review-mode instruction to consume the canonical `{changed_files}` from `review-baseline-state`, and add a create-mode fallback clause — "when `{changed_files}` is not already established (authoring/create mode, no PR baseline), derive it from the local working-tree diff against the base branch." This restores the create-path source in one sentence per file, touches no activity YAML, adds no variable/checkpoint, and keeps the review-mode authoritative-surface behaviour intact. This is a technique-prose edit only.

*No Medium findings surfaced; the confirmation pass had nothing to spot-check.*

### F1 — Resolution: APPLIED (audit-fix-cycle, iteration 1)

Classified F1 as a finding to fix (`needs_audit_fixes = true`, `has_critical_finding = false`) and applied the minimal create-mode fallback — prose-only, one clause per file, no activity YAML / variable / checkpoint change:

- `techniques/review-code.md` step 1: consume the canonical `{changed_files}` **when it is established (review mode, produced by `review-baseline-state`)**; **otherwise (create mode, no PR baseline) derive it from the local working-tree diff against the base branch.**
- `techniques/strategic-review/review-scope.md` step 1: added sub-bullet — consume the canonical `{changed_files}` when established (review mode); **otherwise (create mode, no PR baseline) derive it from the local working-tree diff against `{$base_branch}`.**

Re-audit (all four passes) clean; re-ran schema validation + all guards — all green (validate-workflow-yaml PASS, binding-fidelity 0 NEW / 5 fixed, self-input OK, variable-model OK, review-mode-gating OK). `needs_audit_fixes` driven back to **false**; loop exits after one iteration. Review-mode authoritative-surface behaviour untouched.

---

## Variables (final)

| Variable | Value |
|---|---|
| `expressiveness_finding_count` | 0 |
| `conformance_finding_count` | 0 |
| `rule_hygiene_finding_count` | 0 |
| `enforcement_finding_count` | 0 |
| `verified_findings` | F1 (High, confirmed) — **resolved** |
| `review_findings_count` | 1 (F1) |
| `needs_audit_fixes` | **false** (after fix-cycle iteration 1) |
| `has_critical_finding` | **false** |
| `user_wants_fixes` | **true** (F1 fix elected and applied) |

---

## Outcome

Four audit passes clean; all schema/guards green; binding fidelity improved (5 fixed). One confirmed High correctness finding (F1): the drafts removed the create-path `changed_files` producer while adding the review-path one, leaving authoring-mode review scope without a source. Remediation applied — a one-sentence create-mode fallback in `review-code.md` and `review-scope.md`, prose-only, no structural change; review-mode authoritative-surface behaviour untouched. Re-audit and all guards clean, `needs_audit_fixes = false`. No Critical findings — the blocker gate (`has_critical_finding == false`) takes the default `no-blocker` branch; transition to `validate-and-commit`.
