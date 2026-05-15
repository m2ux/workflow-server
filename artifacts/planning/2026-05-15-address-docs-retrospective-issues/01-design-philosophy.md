# Design Philosophy — Address Docs-Refresh Retrospective Issues

**Date:** 2026-05-15
**Activity:** `design-philosophy`
**Driving input:** [2026-05-14-refresh-workflow-server-docs/13-workflow-retrospective.md](../2026-05-14-refresh-workflow-server-docs/13-workflow-retrospective.md)

---

## 1. Problem statement

### What is the problem?

The preceding work package (refresh-workflow-server-docs, PR #119) reached human review with three deviations standing in the PR body — missing Issue link, an over-long Summary, and Changes grouped by commit message rather than by component. Every reviewer feedback item on that run pointed at one of those three deviations, and none of the workflow's automated gates flagged any of them. The retrospective traces all three to a single structural cause: the canonical PR-description template's strongest constraints live as prose inside a "What NOT to Include" markdown table in resource `12-pr-description.md`, not as enforceable `rules:` on the `update-pr` skill and not as line items on the `strategic-review` checklist. The gates that already render and review the PR therefore see those constraints only as advisory text and pass the work package as `acceptable` while the deviations stand.

Three secondary process gaps were recorded alongside the primary root cause:

1. All four feature-branch commits arrived unsigned; the unsigned state was detected only at `strategic-review`, which then asked the user to authorise a rebase-and-force-push late in the lifecycle.
2. The `workflows` worktree prerequisite for the test baseline surfaced as an out-of-plan assumption mid-implementation rather than at `plan-prepare`.
3. The `meta/discover-session` activity prescribes `workflow-engine::list-workflows` (which calls the `list_workflows` MCP tool), but worker-agent rules forbid that tool, forcing the worker to read `workflows/*/workflow.toon` directly as a workaround.

### System understanding

The affected system is the `work-package` workflow itself plus one `meta` activity — i.e. TOON skill and activity definitions under `workflows/`. No MCP-server source code or schemas are in scope. The relevant files identified by the retrospective are:

- `workflows/work-package/skills/12-review-strategy.toon` — `strategic-review` skill that gates PRs and would carry the new checklist line.
- `workflows/work-package/skills/18-update-pr.toon` — `update-pr` skill that renders and PATCHes the PR body; would gain a verify step and promoted rules.
- `workflows/work-package/resources/12-pr-description.md` — canonical PR-description template that today carries the constraints as prose; selected constraints get promoted to `rules:` on `update-pr` and a `skip-issue` placeholder rule is added.
- `workflows/work-package/activities/start-work-package.toon` (or its operations) — pre-implementation signing check.
- `workflows/work-package/skills/15-manage-git.toon` — alternative location for an earlier signing detection inside `manage-git::commit`.
- `workflows/work-package/activities/plan-prepare.toon` — environment-prerequisites step.
- `workflows/meta/activities/discover-session.toon` (and its operations) — tool-allowlist mismatch.

### Impact

Without these changes, the next docs-shaped or scope-light work package will reproduce the same failure mode: `strategic-review` will rate the work `acceptable` while the same class of PR-body deviations stand, and a human reviewer will catch them at `review-received`. The medium- and low-priority gaps will continue to cost a small fixed amount of friction per work package (late re-signing, mid-implementation environment fixes, worker workarounds for the `list_workflows` restriction).

### Success criteria

- The strongest constraints from the canonical PR-description template are enforceable, not advisory — they appear either as `rules:` on `update-pr` or as a line item on the `strategic-review` reviewer checklist (or both).
- `update-pr` verifies the rendered PR body against those rules before `gh api PATCH` and loops back to re-render on failure.
- The `skip-issue` checkpoint option and the "Always include Issue link" rule are reconciled — when `issue_skipped=true`, `update-pr` renders an explicit placeholder line rather than silently dropping the Issue section.
- Unsigned-commit detection happens before `strategic-review` (no late rebase-and-force-push).
- The `workflows` worktree prerequisite is verified at `plan-prepare`, not surfaced as an assumption during `implement`.
- `meta/discover-session` no longer prescribes a tool the worker cannot call.

### Constraints

- **Workflow fidelity.** Edits are TOON skill/activity files; they must validate against the schemas under `schemas/` and respect existing operation conventions.
- **No server-source changes.** The MCP server (`src/`, `schemas/`) and TOON validation tooling are out of scope unless an edit forces a schema extension — in which case the schema change is itself in scope but must be minimal.
- **No retroactive PR-body fix on #119.** That PR was already corrected inline and merged-status set by the prior run; this work package fixes the future, not the past.
- **Worktree discipline.** Implementation commits land on `chore/docs-retrospective-followups` in the worktree at `~/projects/work/workflow-server/2026-05-15-address-docs-retrospective-issues/`. Planning artefacts land on the current branch in the parent monorepo.

---

## 2. Problem classification

### Problem type

**Specific problem with known cause** (Type 1 — cause known).

The retrospective identifies the root cause of all three review-feedback items as a single structural fact: the canonical PR-description template's strongest constraints are encoded as prose in a markdown table inside resource 12 rather than as `rules:` on `update-pr` or as a `strategic-review` checklist line. The secondary gaps are each well-localised to a single skill or activity, with a recommended change already proposed by the retrospective.

This is not an inventive goal (no improvement-without-defect framing) and not a Type 2 specific problem (cause unknown). The retrospective has already done the cause-attribution work.

### Complexity assessment

**Moderate.**

- **Scope breadth.** Six identified change sites across the work-package workflow plus one meta activity. Each is a TOON skill or activity edit; none requires new tooling or schema extension as currently scoped.
- **Risk.** Low-to-moderate. The edits are workflow-content changes. The highest-risk change is the `update-pr` verify step, because it adds a render-validate-rerender loop and must avoid infinite loops on rules that cannot self-correct (e.g., a missing engineering link).
- **Coupling.** Moderate. The new `update-pr` rules and the `strategic-review` checklist line are intentionally redundant by design (defence in depth). Care is needed to keep their wording consistent so a passing `update-pr` body cannot fail `strategic-review` on the same constraint.
- **Surface for regressions.** Limited to the work-package workflow. No existing user-facing artefact format changes; the rendered PR body keeps the same shape — only the rules around it tighten.

### Why not simple

A simple-complexity classification would skip optional discovery and proceed direct-to-plan. The work qualifies for skip-optional discovery on those grounds (the retrospective is the elicitation output; no research needed). The classification is **moderate** rather than **simple** because the recommendations span multiple skill files and one cross-cutting concern (defence in depth between `update-pr` and `strategic-review`), and the plan should sequence them deliberately rather than as a single drive-by edit.

### Why not complex

Complex would imply an inventive goal, an unbounded scope, or open architectural questions. None apply: the change list is enumerated, the affected files are named, the recommended fix shape is described in the retrospective.

---

## 3. Workflow path

### Recommended path

**Skip optional activities** (`needs_elicitation=false`, `needs_research=false`, `skip_optional_activities=true`).

### Rationale

- **No elicitation needed.** The retrospective enumerates the problems, root causes, recommendations, priorities, and affected files. The driving input is the elicitation output.
- **No research needed.** The fix space is internal to this repository — canonical template, skill TOON, activity TOON. No external best-practice survey or library evaluation is required. The "what good looks like" is the existing template plus the retrospective's recommendations.
- **Codebase comprehension is mandatory** (set by the activity's `determine-path` action). The implementer needs to read the affected TOON files end-to-end before editing them; `update-pr` and `strategic-review` in particular have to be understood as a system, not as independent edits.

### Path

```
start-work-package → design-philosophy → plan-prepare → implement → post-impl-review → validate → strategic-review → submit-for-review → complete
```

Identical to the path taken by the driving retrospective's own work package — appropriate, because this is the same shape of change (workflow-content edits with no schema or server-source impact).

---

## 4. Bootstrap observations (issues surfaced while running this work package)

In addition to the driving retrospective, two issues emerged while executing this work package's own `start-work-package → design-philosophy` bootstrap on 2026-05-15. They are captured in [observations-from-bootstrap.md](observations-from-bootstrap.md) and are not from the driving retrospective; `plan-prepare` will decide whether to fold them into scope.

### 4.1 `design-philosophy/classification-confirmed` checkpoint renders templated literals

The checkpoint's message uses `{problem_type}` and `{complexity}` substitution markers, but the activity has no step that writes those variables to session state before the checkpoint yields. The presented prompt arrived with literal braces. Compounding the bug, `yield_checkpoint` has no `variables` payload, so a worker that notices mid-yield cannot self-correct.

**Possible scope items** (`plan-prepare` decides):

- Add explicit steps to `design-philosophy` that write `problem_type` and `complexity` to session state before the checkpoint.
- Or change the message away from templated substitution and let the worker emit a structured summary the orchestrator passes verbatim.
- Defensive: extend `yield_checkpoint` to accept an optional `variables` payload. This crosses into MCP-server source (`src/`, `schemas/`) — it is the only candidate in this work package that does — so it should be a deliberate scope decision, not folded in by default.

### 4.2 ~~Sub-agents lack the `Task` primitive~~ — RETRACTED

This observation was based on the bootstrap experience where a depth-1 sub-agent could not invoke `harness-compat::spawn-agent`. **The user has clarified that workers CAN be spawned as foreground tasks from depth ≥ 1 in this harness.** The actual cause of the bootstrap failure was therefore not a depth limit — most likely the spawned agent's `subagent_type` did not include the Task tool in its allowed-tools list, or the prompt did not pass through correctly. The architectural concern raised here (collapse meta and client orchestrator into one agent) is not justified by the evidence.

**No scope items.** The observation is retracted. `harness-compat::spawn-agent` does not need a depth-constraint doc edit, and `workflow-engine::dispatch-activity` does not need an inline-fallback note for depth ≥ 1.

If a related issue does need addressing, it is at the per-subagent-type level: ensuring whichever agent type is used for client orchestrators is configured with Task. That is a harness/permission configuration concern, not a workflow-content one.

### 4.3 Worker-local classification overwritten by checkpoint effect

The `workflow-path-selected` checkpoint's `skip-optional` option sets `complexity=simple` as an `effect`, overwriting the worker's earlier classification of `moderate` for substantive purposes. The session-level `simple` is used only to gate optional-activity skipping; the substantive work is still moderate. This is a "definition smell" — the same variable name encodes two distinct concerns (path-gating vs. substantive complexity). Already flagged in [observations-from-bootstrap.md](observations-from-bootstrap.md).

**Possible scope item**: separate the path-gating variable from the substantive complexity classification on `workflow-path-selected`. Out of scope here unless `plan-prepare` elects to bundle it.

---

## 5. Open questions deferred to `plan-prepare`

These are not blocking the design philosophy but should be resolved when sequencing tasks:

1. **Scope cut.** Are all six recommendation buckets from the retrospective in scope for this work package, or only the High and Medium? The retrospective suggests "highest leverage first" but does not impose a cut. A scope-confirmation checkpoint at `plan-prepare` is the right place to decide.
2. **Bootstrap-observation scope.** Are the three bootstrap-observation items (§4.1, §4.2, §4.3 above) in scope for this work package, or should they spin out as a separate one? §4.1's defensive option (extend `yield_checkpoint`) would force a server-source change; the others are workflow-content edits.
3. **Verify loop bounds.** The `update-pr` render-validate-rerender loop needs an explicit max-iterations or escape hatch for rules that no amount of re-rendering can satisfy (e.g., missing engineering link before the engineering branch is pushed).
4. **Defence-in-depth wording.** The `update-pr` rules and the `strategic-review` checklist line need to use identical or near-identical wording so they are obviously two checks of the same constraint.
5. **Signing detection placement.** Two options were proposed (precondition at `start-work-package` vs. detection inside `manage-git::commit`). They are not mutually exclusive; `plan-prepare` should pick one as primary.

---

## 6. Constraints summary

| Constraint | Source |
|---|---|
| Workflow fidelity — edits must validate against TOON schemas | Repo discipline; `schemas/` |
| No MCP-server source changes unless schema extension is forced | This activity's scope decision (§4.1's `yield_checkpoint` variant is the one candidate that would force a server-source change — `plan-prepare` decides) |
| No retroactive PR-body fix on #119 | Out of scope by design |
| Target-path discipline — code commits land in the worktree, planning artefacts in the parent monorepo on the current branch | Workflow orchestrator-discipline rule |
| Commit signing must succeed locally | Repo `.gitconfig` (the very gap this work package addresses) |
