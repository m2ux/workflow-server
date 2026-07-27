# Workflow Mechanisation Review — Deterministic Steps as Scripts

> Review · Created 2026-07-25 · **Status:** Planning

## 🎯 Executive Summary

Reviews `work-package` (15 activities, 163 technique-step bindings, 105 distinct techniques) for steps
whose deterministic core can move into a script the agent runs, and specifies the technique-plus-script
contract that makes such a step reliable, portable, and honest when it fails.

**Headline: this is a fidelity and drift programme with a speed dividend, not a token programme.** The
proof-of-concept measured the technique payload shrinking by **0.6 %** on the recommended candidate,
and that candidate *adds* a tool call where there was none. What it removes is four admissible answers
where one is required, and a silently-wrong path on the layout the project mandates.

## Problem Overview

Some technique steps ask an agent to perform arithmetic: derive a branch name from an issue type and
title, compute a worktree path from a planning-folder path, check whether a path is a registered
worktree, append a row to a provenance table. Prose expresses arithmetic imprecisely — the sweep found
one live rule admitting four branch names for one input — and an agent re-deriving it spends turns and
reasoning on an answer a function could return identically every time.

## Solution Overview

Move the deterministic core into a per-workflow script bundle (`<workflow>/scripts/<slug>.py`), and
reduce the technique to an invocation-and-binding protocol. The agent runs it; the server executes
nothing. Distribution rides an extension of the path-presentation layer that already translates
container paths to host paths for `planning_folder_path`. No schema change in any batch.

## Design Decisions

- **Interpreter: Python 3, stdlib only** — the execution host moved from CI/maintainer machines to an
  arbitrary user's host, where Node is guaranteed only on the stdio install path.
  ([contract §4](invocation-contract.md))
- **Addressability: a host-presented `script_root`, not inline source** — ~20 lines extending the
  container→host path map being built for `planning_folder_path` (uncommitted at 2026-07-25 — see the
  provenance caveat in [contract §2](invocation-contract.md)); inline delivery would cost 8–13k
  tokens/session to save a 0.6 % payload.
- **Exit 3 = `ambiguous` is a contractual hand-back to agent judgement**, distinct from exit 2 =
  `precondition`. The split is what keeps retry-vs-escalate from being a judgement call.
  ([contract §7](invocation-contract.md))
- **`warnings[]` is mandatory, surfaced verbatim, never acted on** — the only honest response to a
  rule a script cannot satisfy while satisfying a conflicting mandate.
- **No new step kind** — a mechanised step is an ordinary `kind: technique` step, so delivery,
  binding, and the step manifest all apply unchanged.

## 📊 Deliverables

| # | Item | Description |
|---|------|-------------|
| 1 | [Mechanisation ledger](mechanisation-ledger.md) | Determinism test; 15 mechanisable, 14 separable, 76 agentic; cost, evidence, permission posture, do-not list |
| 2 | [Invocation contract](invocation-contract.md) | The reusable specification — addressability, versioning, interpreter, I/O, trust, escalation, idempotency, portability, observability, technique template, author checklist |
| 3 | [Roadmap](roadmap.md) | Six batches by impact-per-effort; risks and reversibility; open questions and the next experiment |
| 4 | [PoC record](poc-naming-conventions.md) | `naming-conventions` script, 31 tests, 5 fixtures, 8 prose disagreements, and five corrections to the contract design |

## 🔗 Links

| Resource | Link |
|----------|------|
| Primary target | `workflows/work-package/` |
| Coupled targets | `workflows/meta/` (harness-compat, variable-binding, version-control), `src/utils/path-presentation.ts` |
| Review prompt | [workflow-mechanisation-review-prompt.md](../../templates/workflow-mechanisation-review-prompt.md) |
| Token baseline | [payload measurements, 2026-07-03](../2026-07-03-schema-technique-disclosure-review/payload-measurements.md) |
| Fidelity evidence | [#272 run retrospective close-out](../2026-07-22-work-package-run-retrospective-friction-points/COMPLETE.md) |
| PoC working tree | `/tmp/wp-mech-poc/` (ephemeral; reproduced in full in the PoC record) |
