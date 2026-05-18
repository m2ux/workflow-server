# Change Block Index — Address Docs-Refresh Retrospective Issues

**Date:** 2026-05-15 (regenerated 2026-05-18)
**Activity:** `post-impl-review`
**PR:** [#120](https://github.com/m2ux/workflow-server/pull/120) (currently CLOSED on GitHub)
**Branch (target submodule):** `chore/docs-retrospective-followups`
**Diff base:** `97be373` (last commit before implement-activity touch sites)
**Diff HEAD:** `9be34eb` (feat(meta): collapse meta + client orchestrator into one agent)
**Diff stat:** 14 files, 210 insertions(+), 97 deletions(-)

This regeneration replaces the prior index (base `97be373` → head `1b4f2be`) which was based on the implementation as of `1b4f2be`. Four additional commits have since landed (`cf18f6c`, `5d9ce9c`, `ffc03cd`, `9be34eb`); rows are added/updated below.

The diff is workflow-content only — TOON skills, activities, resources, workflow variables, one meta operation, and three `workflow-design/resources/` markdown files (anti-pattern docs). No MCP-server source (`src/`) or schema (`schemas/`) edits. See plan §9 for the 17 acceptance criteria each row maps to.

> **How to read this index:** Open the PR diff in your side-by-side review tool (or `git diff 97be373..9be34eb` inside the workflows worktree). Each row below corresponds to one change block (hunk-group within a file). Note any row numbers you want to flag and return them when prompted at the `file-index-table` checkpoint (e.g., "rows 4, 7" or "none").

---

## Index

| Row | File | Hunk lines (added/removed) | Touch site (plan #) | Acceptance criterion (plan §9) | Rationale |
|---|---|---|---|---|---|
| 1 | `work-package/workflow.toon` | +20 / -0 (`variables[83]→[88]`; 5 appended entries, each with terse description after `cf18f6c` prose cleanup) | 1c, 4, 11 | §9.4, §9.11 | Declares `body_conforms`, `body_findings`, `body_override_recorded`, `submission_aborted`, `path_gating_complexity`. Variable count hand-updated 83→88; appended at end of `variables[]` per principle #12. Descriptions reduced to single declarative sentences (AP-36 hygiene). |
| 2 | `work-package/skills/18-update-pr.toon` | +11 / -1 (version 1.0.0→1.1.0; `protocol.verify-body[3]` added; `rules.pr-body-conformance[5]` added) | 1a, 1b | §9.1 | Canonical source of the five PR-body conformance rules; verify-body phase runs them. Rule wording matches plan §4.1 verbatim. Phase trimmed from 6 bullets to 3 in `cf18f6c` (process narration removed per AP-36). |
| 3 | `work-package/skills/12-review-strategy.toon` | +5 / -1 (version 1.2.0→1.3.0; `protocol.verify-pr-body-conformance[3]` added) | 2 | §9.2 | Audit-framed defence-in-depth phase. Trimmed in `cf18f6c` from a 6-bullet form (which restated each rule) to a 3-bullet form that delegates to `update-pr::protocol.verify-body` against the live body and records findings. The §4.2 audit-bullet wording is no longer kept inline — the strategic-review skill now invokes the canonical verify-body phase rather than maintaining a parallel rule set (a deviation from §9.2 verbatim wording — see code review). |
| 4 | `work-package/activities/12-submit-for-review.toon` | +56 / -3 (version 1.2.0→1.3.0; `loops[1]` block added; `checkpoints[3]→[4]` with `body-non-conformant` ckpt + 3 options; `context_to_preserve[6]→[10]`) | 3 | §9.3 | Canonical `while` loop with `maxIterations: 2` gating on `body_conforms == false`. Three-option escape-hatch checkpoint with explicit `effect.setVariable` / `effect.transitionTo` payloads per plan §5. Option descriptions tightened in `cf18f6c`. |
| 5 | `work-package/resources/12-pr-description.md` | +17 / -1 (version 1.1.0→1.2.0; new "Issue-skipped placeholder" subsection) | 4 | §9.5 | Documents the canonical `🐛 _Issue: skipped_` placeholder rendering and the three rules around it. Additive only. |
| 6 | `work-package/activities/01-start-work-package.toon` | +9 / -2 (version 3.5.0→3.6.0; `steps[25]→[26]`; new `verify-signing-precondition` step with `actions[1]`) | 5 | §9.6 | Pre-condition gate placed between `analyze-reference-with-gitnexus` and `detect-project-type`. **Originally 6 `validate` actions**; `ffc03cd` collapsed them to **a single composite `signing.configured` validate** because the prior six prescribed git-config-changing commands (`git config --global user.signingkey ...`, `gpgconf --launch gpg-agent`, etc.) which violates the workflow's "never modify upward" stance on user env. Acceptance criterion §9.6 ("six `actions[].action: validate` entries") is now NOT MET as written — see code review. |
| 7 | `work-package/activities/06-plan-prepare.toon` | +24 / -2 (version 1.4.2→1.5.0; `steps[10]→[11]`; `env-prerequisites` step at position 1 with `actions[6]`) | 6 | §9.7 | Pre-condition gate at front of `plan-prepare`. Six `validate` actions cover workflows worktree, `target_path`, `reference_path`, `planning_folder_path.writable`, `gh.auth.status`, GPG agent. Messages tightened in `cf18f6c` (AP-37: justification tails dropped, fix command retained). |
| 8 | `meta/skills/00-workflow-engine.toon` | +6 / -29 (operation deletions + handle-sub-workflow reduction; list-workflows reverted to MCP tool form) | 7 + 9b + 9c | §9.8, §9.13, §9.14 | **Three changes in one file.** (a) `list-workflows` operation body: `cf18f6c` reverted the harness `Read`+`Glob` rewrite back to `workflow-server.list_workflows`. **Acceptance criterion §9.8 ("operation body no longer references `workflow-server.list_workflows`") is now NOT MET — this is a regression.** (b) `9be34eb` deleted operations `bubble-checkpoint-up`, `extract-checkpoint-handle`, `handle-workflow-complete` (§9.13). (c) `9be34eb` reduced `handle-sub-workflow.procedure` from 2 bullets to 1 (§9.14). |
| 9 | `work-package/activities/02-design-philosophy.toon` | +9 / -3 (version 1.4.0→1.5.0; `classify-problem.actions[2]` with two `set` actions; `skip-optional` effect retargeted to `path_gating_complexity`; `context_to_preserve[7]→[8]`) | 8a, 8b | §9.9, §9.10 | Two `set` actions write `problem_type` and `complexity` BEFORE `classification-confirmed` yields. `skip-optional` option's effect writes `path_gating_complexity` (substantive `complexity` preserved). Action descriptions trimmed in `cf18f6c`. |
| 10 | `meta/skills/07-harness-compat.toon` | +9 / -3 (`spawn-agent.rules.depth-1-only` added; `claude-code` row added to all three per-harness prose tables; `cursor` rows reduced to "Same as claude-code") | 9a | §9.12 | Named rule `depth-1-only` declares that `Task` is harness-gated and does not transfer to spawned sub-agents. Per-harness tables now lead with `claude-code` and collapse cursor onto it. **Typo introduced in `9be34eb`:** `resume-agent.output[1].result` says "next yieltd or final output" (should be "yielded"). |
| 11 | `meta/activities/03-dispatch-client-workflow.toon` | +35 / -41 (version 4.0.0→5.0.0; activity rewritten — `operations[5]` repointed at workflow-engine ops; `steps[2]→[1]`; `loops[1]` rewritten as while-over-`current_activity`; `outcome[3]`, `context_to_preserve[1]→[2]`) | 9d | §9.15 | Rewrite of the activity. New `operations[]` references `workflow-engine::dispatch-activity`, `evaluate-transition`, `commit-and-persist`, `present-checkpoint-to-user`, `respond-checkpoint` per criterion 15. `loops[]` drives the client workflow's activity loop inline (no `spawn-agent`/`continue-agent`/`compose-prompt`/`extract-checkpoint-handle`/`handle-workflow-complete` references remain). |
| 12 | `workflow-design/resources/00-design-principles.md` | +1 / -1 (principle #4 prose extended) | new (AP-36/37 tie-in) | — | Principle #4 (Maximize Schema Expressiveness) now explicitly says prose must not narrate rationale/downstream consumers; cross-refs anti-pattern 36. Out-of-scope of the plan's §3 touch-site list but produced by `5d9ce9c` as the doctrinal anchor for AP-36/37. |
| 13 | `workflow-design/resources/02-anti-patterns.md` | +6 / -0 (new "Description Hygiene Anti-Patterns" section; AP-36 + AP-37 added) | new (AP-36/37) | — | AP-36 ("Let me explain why this is here") and AP-37 ("Without X, Y will happen") added in `5d9ce9c`. These are the principles applied by the `cf18f6c` and `ffc03cd` cleanup passes; landing them as durable rules is the substantive carry-over. Out-of-scope of the plan but valuable durable artifacts. |
| 14 | `workflow-design/resources/README.md` | +3 / -2 (header counts: 29→31 anti-patterns, 5→6 categories; new "Description hygiene" row) | new (AP-36/37) | — | Documentation index update reflecting AP-36/37. |

---

## Index — by acceptance criterion

| Criterion | Rows | Status / Notes |
|---|---|---|
| §9.1 (5 rules in `update-pr`, grouped-array form) | 2 | MET. Rule wording matches plan §4.1 verbatim. |
| §9.2 (audit bullets in `review-strategy`, NOT verbatim rule copies) | 3 | PARTIALLY MET. Bullets no longer copy rule strings (anti-pattern 24 still guarded), but the strategic-review phase no longer hosts five distinct audit bullets — it delegates to `update-pr::protocol.verify-body`. See code review. |
| §9.3 (`submit-for-review` loop + checkpoint with effects) | 4 | MET. All three option effects enumerated structurally. |
| §9.4 (four new variables: `body_conforms`, `body_findings`, `body_override_recorded`, `submission_aborted`) | 1 | MET. Variable count hand-updated 83→88. |
| §9.5 (Issue-skipped placeholder, additive) | 5 | MET. No existing content removed. |
| §9.6 (`start-work-package` signing pre-check, 6 validate actions) | 6 | **NOT MET as written.** Step exists but has 1 `validate` action, not 6. The intentional reversal (per `ffc03cd`) avoids prescribing git-config-changing commands; the spirit (pre-condition gate before downstream activities) is preserved. See code review. |
| §9.7 (`plan-prepare` env-prerequisites, 6 validate actions) | 7 | MET. Position 1 in `steps[]`; 6 `validate` actions present. |
| §9.8 (`meta/list-workflows` rewrite, external contract preserved) | 8 | **NOT MET.** Operation body was rewritten in `5de90e9` to use `harness.Glob`+`harness.Read`, then reverted to `workflow-server.list_workflows` in `cf18f6c`. The external contract (operation name + output description) is preserved; the body is back to the baseline. See code review. |
| §9.9 (`design-philosophy` set actions before classification-confirmed) | 9 | MET. Two `set` actions on `classify-problem` step. |
| §9.10 (`design-philosophy` skip-optional retargeted to `path_gating_complexity`) | 9 | MET. Only `skip-optional` retargeted. |
| §9.11 (`path_gating_complexity` variable declared) | 1 | MET. Fifth appended entry. |
| §9.12 (`harness-compat::spawn-agent.rules.depth-1-only` declared) | 10 | MET. Named rule present alongside existing `foreground-always` and `index-in-prompt`. |
| §9.13 (three obsolete `workflow-engine` operations deleted) | 8 | MET. `bubble-checkpoint-up`, `extract-checkpoint-handle`, `handle-workflow-complete` removed; no remaining callers. |
| §9.14 (`handle-sub-workflow.procedure` reduced to single `dispatch_child` bullet) | 8 | MET. Output (`child_session_index`) unchanged. |
| §9.15 (`dispatch-client-workflow` rewrite — operations list + loop) | 11 | MET. `operations[]` lists the five required workflow-engine ops; no spawn-agent/continue-agent/compose-prompt/extract-checkpoint-handle/handle-workflow-complete references remain at activity level. |
| §9.16 (validators exit 0) | — | MET. All three pass (see Validator status below). |
| §9.17 (smoke run of `update-pr` against PR #120) | — | Deferred to `validate` per plan; PR is currently CLOSED on GitHub so smoke deferral may need re-scoping. |

---

## Validator status (re-checked at start of regenerated post-impl-review)

| Command | Result |
|---|---|
| `npx tsx scripts/validate-workflow-toon.ts workflows/work-package` | PASS (14 activities, 25 skills) |
| `npx tsx scripts/validate-workflow-toon.ts workflows/meta` | PASS (5 activities, 8 skills) |
| `npx tsx scripts/validate-activities.ts workflows/work-package` | PASS (14/14) |

Schema acceptance criterion §9.16 is satisfied.

---

## What is NOT in this index

- Worktree-level submodule-pointer commits — they are housekeeping, not in-scope for code review.
- Pre-existing content in any edited file — only the hunks introduced by the work package commits are indexed.
- Activity README.md regenerations — none touched in this PR.
