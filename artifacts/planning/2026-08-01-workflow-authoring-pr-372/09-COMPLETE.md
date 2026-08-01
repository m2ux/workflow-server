# Workflow Authoring: 358-338-corpus-batch — Complete

> Update · 2026-08-01

## Summary

Multi-target corpus batch on nine workflows closed the remaining unblocked #358 / #338 debt: section-grain citation retargets where AP-134 required anchors, five #189-C3 content defects in cargo-operations and work-package, and ORCHESTRATION MODEL inline rules converted to fragment refs. Source is on `workflow/358-338-corpus-batch` @ `4efc4fd0`, published as [PR #372](https://github.com/m2ux/workflow-server/pull/372) against `workflows`.

## What Was Delivered

- **Activities:** modified `work-package/activities/02-design-philosophy.yaml` (classification checkpoint message).
- **Techniques:** modified cargo-operations group (`TECHNIQUE.md`, `run-suite.md`, six env-before-nice ops), `work-package/techniques/create-issue.md`, `work-package/techniques/requirements-elicitation/ask-question.md`, `substrate-node-security-audit/techniques/score-severity.md`.
- **Resources:** none modified (retarget anchors resolved to existing headings).
- **Variables and rules:** prism and remediate-vuln root rules — inline ORCHESTRATION MODEL → fragment refs (`prism-audit::orchestration-model` + local `pass-output-forwarding`; local `inline-orchestration-model`); cargo-operations `resource-budget` and `foreground-only` wording.

## Design Decisions

- [Change brief](01-change-brief.md) — purpose and open judgements (fragment home stays `prism-audit`; variant bodies stay local; PR-text third copy is the home body).
- [Impact analysis](01-impact-analysis.md) — blast radius, integrity, removals inventory (four approved content removals inside modified files).
- [Scope manifest](06-scope-manifest.md) — 14-file file manifest and drafting order.
- [Findings register](08-findings-register.md) — empty open decision surface after independent High re-derivation (zero High rows).

## Scope Outcome

Manifest delivered exactly: 14 of 14 entries addressed; reverse change-set check against base `46bc1811` shows no unplanned files.

## Known Limitations and Deferrals

- **Leave-whole citation pairs** — 18 of the top-20 reserved pairs stay whole-resource this pass (AP-134 leave-whole); logged in the scope manifest out-of-scope list, not as open findings.
- **Deferred backlog** — #338 W8 (B12 retire sweep), #316, #320 C-3 `trace_token`, when-migration and citation-grain guard remain on other routing-plan PRs (see change brief out-of-scope).
- **Known baselines** — 45 class-keyed binding-fidelity / headless baselines remain accepted exclusions, not open findings.

## Run Retrospective

- Definition source was already committed and pushed from scope-and-draft (`4efc4fd0`); validate-and-commit correctly treated stage-and-commit as a no-op empty tree rather than inventing a second definition commit.
- Session bag counters `addressed_count` / `total_count` were not persisted from the prior worker leg; re-derivation from the worktree and manifest was required at the approve gate — bag handoff of verification counts would have avoided that recompute.
- Host `gh` / SSH from the agent shell only succeeds on allowlisted simple invocations; complex compound shells hit sandbox UID/SSH-config failures even when the host keyring is healthy.
