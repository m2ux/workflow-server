# Review: Workflow-Server Framework Value & Design Optimization

You are reviewing the **workflow-server** project (this repository) — an MCP server providing a pseudo-deterministic framework that lets agents consistently and repeatably follow structured workflows. Workflows decompose into **activities**, supported by **techniques**, requiring **tools** and declared **inputs/outputs**. These formalisations are semi-enforced by the server to maximise consistency of execution outcome.

## Mission

Produce a **decision memo and improvement roadmap** answering two questions:

1. **Value question:** How much improvement does this framework yield over simply authoring the same content as Claude Code agent skills (SKILL.md files invoked ad hoc — no MCP server, no session state, no checkpoint gates)? Answer per decision goal, with evidence and stated confidence.
2. **Optimization question:** What concrete design changes would most improve the framework against the three decision goals?

### Decision goals (the only optimization axes that matter)

| Goal | Operational definition |
|---|---|
| **Agent execution fidelity** | Adherence to the declared workflow: steps executed and in order, checkpoints honored (paused, not blown through), declared outputs actually produced, technique protocols followed, no unrequested scope drift. |
| **Workflow completion speed** | Turns, tool calls, and wall-clock time from session start to workflow completion. |
| **Token usage** | Per-tool-call payload size, cumulative input+output tokens across a full run, and redundancy (content re-fetched or re-stated that was already in context). |

These goals trade off (e.g., bundled techniques aid fidelity but cost tokens). Every finding and recommendation must say which goal it serves and what it costs the others.

## Ground rules

- **Read-only review of the system.** Do not modify `src/`, `schemas/`, workflow TOON files, or technique markdown. Experiment fixtures and the baseline skills package go in a temp directory outside the repo; the only repo write is the final planning artifact under `.engineering/artifacts/planning/` (Phase 3).
- The `.engineering/` submodule holds design artifacts — start with `.engineering/AGENTS.md` for layout. **Some comprehension artifacts are stale**: anything using "skill" terminology for what is now "techniques" predates the skills→techniques rename (≈2026-05); verify claims against current code/schemas before relying on them.
- Known fact: **no prior comparison data exists** between the framework and a skills baseline. Existing metrics cover session-token size (~70% reduction work, ≤140B target) and decode latency (~0.2–0.6ms/request) — infrastructure costs, not the agent-facing costs this review targets.
- The repo's CLAUDE.md rules apply (use `discover` first for workflow-server MCP interaction; GitNexus tools are available for code exploration).

## Phase 1 — Static design review

**1a. Ground truth.** Read, in this order:
- `README.md`, `docs/api-reference.md`, `docs/orchestra-specification.md`, `docs/checkpoint_model.md`, `docs/dispatch_model.md`, `docs/resource_resolution_model.md`, `schemas/README.md`
- `.engineering` ADRs (at minimum ADR-0002 *executionModel*, ADR-0003 *server-managed session state*) and the 2026-05/06 technique-binding artifacts (markdown-skills migration architecture, technique I/O contract audit, technique protocol requirements)
- Skim 2 representative workflow definitions in `workflows/` (the `meta` workflow plus one sequential client workflow) — workflow.toon, activities, techniques.

**1b. Mechanism ledger.** For each framework mechanism, record: what it does, whether it is **hard-enforced** (blocks) or **advisory** (warns), which decision goal it serves, and its token/latency cost. Mechanisms to cover at minimum:
session lifecycle (`start_session`/`session_index`/session.json+HMAC seal), checkpoint gating (`yield/present/respond/resume_checkpoint` + hard gate on `next_activity`), step manifests and activity manifests, transition validation, technique bundling in `get_workflow`/`get_activity`, technique composition (`Initial`/`Final` inheritance wrapping), lazy `get_resource` resolution, trace tokens/`get_trace`, `dispatch_child`/parent sessions, modes, recognition vs transitions.

**1c. Measured payload costs.** Using a live session against a representative workflow, capture the **actual response sizes (chars ≈ tokens/4)** of `discover`, `list_workflows`, `start_session`, `get_workflow`, `get_activity`, `next_activity`, `get_technique`, `get_resource`. Sum the minimum protocol token cost of a full deterministic walk of that workflow (every activity, no retries). Identify the top 3 payload-size contributors and any content delivered more than once across a walk (e.g., techniques bundled in both `get_workflow` and `get_activity`).

## Phase 2 — Empirical comparison (framework vs skills baseline)

**2a. Test workflow: `work-package`.** This is the chosen workflow — the richest client workflow (sequential activities, blocking checkpoints, loops, conditional transitions, modes, technique bindings). It depends on external services (Jira, GitHub); **stub these**: define a fixed fictional issue (description, acceptance criteria) up front, have both arms write would-be Jira comments/PR bodies to scratch files in a temp working directory, and pre-script identical responses for any external lookups. Choose a small, bounded implementation task (e.g., a single-function change in a throwaway sample project in the temp dir) so trials complete in reasonable time; both arms get the identical task and fixtures.

**2b. Construct the baseline arm by reuse.** The markdown skill content already exists at `/home/mike1/projects/work/workflow-server/feat/125-markdown-skills-content/work-package/` (`techniques/`, `resources/`, `README.md`) — reuse it directly as the baseline skills package rather than re-translating. Copy it into a temp directory laid out as Claude Code skills, and add one top-level orchestrating SKILL.md that expresses the workflow structure (activity sequence, transitions, checkpoint intent as prose — "stop and ask before X") drawn from `work-package/workflow.toon` and its activities. Preserve **informational parity** with the framework arm; document anything that cannot be represented without the server (hard gates, manifests, session resume). No orchestration server, no session state. If the reused content has drifted from the current `workflows/` worktree (it predates recent technique-binding fixes), note material drift but do not silently upgrade it — drift is itself a finding about the maintenance cost of the skills-only approach.

**2c. Run trials.** Run **N=3 trials per arm** (6 total) on the task from 2a, using fresh subagents with identical task prompts:
- **Framework arm:** subagent instructed per the repo rules (discover → start_session → next_activity loop), with workflow-server MCP tools.
- **Baseline arm:** subagent given the skills package and the same task, no workflow-server tools.
- Checkpoints: since no human is present, have the subagent route checkpoint decisions to you (the orchestrator) and respond with a fixed, pre-scripted decision per checkpoint so both arms get identical answers.
- Capture per trial: full transcript or detailed self-report, turn count, tool-call count, approximate cumulative tokens, wall-clock, artifacts produced.

**2d. Score with independent judges.** Do not grade your own runs. For each trial, spawn a judge agent given (a) the workflow definition as the rubric source and (b) the trial transcript, scoring: step coverage (%), ordering violations (count), checkpoint compliance (honored/violated per checkpoint), output-contract completeness (%), unrequested actions (count). Judges must not know which arm they are scoring where avoidable.

**2e. Honest statistics.** N=3 per arm supports direction-of-effect and failure-mode observation, not precise effect sizes. Report ranges, not just means; report per-trial failure modes verbatim; state confidence (high/medium/low) per conclusion and what sample size would firm it up.

## Phase 3 — Synthesis: decision memo + roadmap

Write the memo with this structure:

1. **Verdict table** — rows: fidelity, speed, tokens; columns: framework arm, baseline arm, delta direction, confidence, key evidence pointer.
2. **Mechanism attribution** — when the framework wins or loses on a goal, which specific mechanism drives it. (A fidelity win attributable solely to checkpoint hard-gates argues for a much thinner server than one attributable to bundled technique composition.)
3. **Cost/benefit ledger** — the Phase 1b table updated with empirical evidence: per mechanism, fidelity benefit observed vs token/speed cost measured. Explicitly flag mechanisms with cost but no observed benefit.
4. **Prioritized roadmap** — concrete design changes, each with: the change, goal(s) served, expected impact (with the evidence behind the expectation), estimated effort (S/M/L), and risk. Order by impact-per-effort. Consider at minimum these candidates surfaced by prior engineering artifacts, but do not limit yourself to them:
   - runtime enforcement of `executionModel` roles (deferred issue #65) — fidelity
   - promoting advisory validations (step/activity manifests, transitions) to configurable hard gates — fidelity vs speed trade
   - payload slimming: summary/delta modes for `get_workflow`/`get_activity`, deduplicating technique content across calls, on-demand technique fetch — tokens
   - resolving the permissive-default validation ambiguity (null = "no constraint" vs "data missing") — fidelity
   - TraceStore observability gaps (silent event drops) — measurement capability itself
   - error designators unanchored to protocol steps (deferred from the 2026-06 I/O audit) — fidelity
5. **Hybrid option assessment** — explicitly evaluate the middle architecture: keep checkpoint gates + session state (the mechanisms that cannot exist as skills) but deliver technique/activity *content* via skills-style progressive disclosure. Is the full server justified, a thinner server, or skills alone?
6. **Open questions and the follow-up experiment** that would raise confidence on the weakest conclusion.

**Deliverable location.** Save the memo as a planning artifact in the `.engineering` submodule: create `.engineering/artifacts/planning/{today's date as YYYY-MM-DD}-framework-vs-skills-review/` containing `decision-memo.md` (the memo) plus supporting files (mechanism ledger, payload measurements, trial records, judge scorecards) as separate documents in that folder. Follow `.engineering/AGENTS.md` conventions — planning artifacts are the place to record rationale, alternatives weighed, and deferred items. Do not commit; leave the artifact for review.

Lead your final summary with the verdict table and your single highest-leverage recommendation.
