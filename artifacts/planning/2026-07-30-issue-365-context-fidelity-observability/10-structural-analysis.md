# Structural Analysis — #365 / PR #366

> structural-analysis · target: context fidelity & observability change set · 2026-07-31 · lens: L12 structural · head: a9c3ea2d

## Claim

**Initial claim:** The change set’s deepest problem is incomplete measurement of repeated technique preamble bytes and undeclared planning files.

**Transformed claim:** The deepest structural problem is **attribution asymmetry on a shared session**: delivery is already keyed by agent context, but history, usage, trace `aid`, technique-fetch credit, and step clocks historically collapsed to the session agent (or to “anyone who fetched”). Missing features are instances of that asymmetry, not four independent product gaps.

## Dialectic

- **Defend:** S2–S5 look like a backlog of independent epics; shipping four mechanisms matches the issue cut.
- **Attack:** If attribution were first-class on every history consumer, several “gaps” collapse to one filter + one optional field.
- **Probe:** Both sides assume a single session bag is the right unit of work; the probe is whether multi-worker fidelity can ever be honest without per-agent sessions.

Gap (diagnostic): product language (S2/S3/S4/S5) conceals a single structural seam — **who the evidence is about** — running through logging, validation, inspect, and delivery.

## Concealment Mechanism

**Name:** *Feature-slice narrative.* Issue bullets and task tables present set-diff, token sum, block dedup, and step events as peer deliverables. Reviewers audit each slice’s local correctness and miss that every slice either re-keys shared history or carefully refuses to (warn-only S2, whole-session folder).

**Applied:** Code review that only scores each function’s local SC can rate the PR green while a future consumer still double-counts unscoped usage or credits sibling fetches.

## Improvements (construction chain)

1. **Legitimate-looking improvement that deepens concealment:** Add a dashboard that sums `activity_usage` without `agentId` filter and call it “run cost.” Passes review (matches plain-sum API) while hiding multi-worker inflation and teaching operators the wrong grain.
   - Visible only after strengthening: (a) unattributed rows are first-class; (b) filter excludes them; (c) “run total” and “worker total” are different questions.
2. **Second improvement:** Require `agent_id` on every `record_usage`. Recreates property: solo walks and legacy harnesses break unless a synthetic id is invented — the asymmetry moves to the write path.
3. **Structural invariant:** *Evidence about work is either scoped to an agent context or explicitly session-global; mixed reads without a declared scope are undefined.*

## Structural Invariant

Session-scoped durable state (history, declaredArtifacts, deliveredContent) outlives any single worker context. Any claim of the form “worker W completed duty D” must either (1) carry W on the evidence row and filter on read, or (2) be defined only for solo/unscoped walks.

## Conservation Law

**Name:** *Attribution conservation on shared session history.*

| Resource | Producers | Clearers / consumers | Termination paths | Verdict |
|----------|-----------|----------------------|-------------------|---------|
| Delivery ledger entries (`deliveredContent[scope]`) | Full technique/resource deliveries under `scope` | Reference collapse; session end | Normal activity exit; abandon | Matched — per-agent scope |
| `activity_usage` rows | `record_usage` (± `agentId`) | `projectUsage` unscoped sum / filtered sum | Workflow complete; inspect | Matched if reader declares scope |
| Technique-fetch credit | `technique_fetched` / `technique_bundled` with `data.agentId` | `validateTechniqueFetches(agentId?)` | `next_activity` exit | Matched when `agent_id` passed; unscoped = solo/legacy |
| `step_started` | Bundle + lazy fetch via `appendStepStartedIfAbsent` | Idempotent skip on re-delivery | Re-fetch same step | Matched (idempotent) |
| `step_completed` | `next_activity` + non-empty manifest output | Timeline readers | Exit without output | Matched by design — no complete without output |
| `declaredArtifacts` | `artifacts_produced` merge-by-id | Planning-folder diff warnings | Session end | Matched — set grows with declarations; files not auto-deleted |
| Undeclared file warnings | Folder readdir vs cover set | Operator triage (advisory) | Transition always succeeds | Matched — no block; no silent stage of undeclared into “approved” |

**Inverted impossibility:** Fully private per-worker sessions make attribution trivial and make shared planning-folder / orchestrator bag coordination the new impossibility.

**Conservation law:** You cannot both share one session bag for orchestration and treat every history row as ambient truth for every worker. Filter or declare unscoped.

## Meta-Law

**Name:** *Advisory-channel gravity.*

The law above is satisfied by warn-only validation and optional filters. What it conceals for *this* codebase: operators can ignore `_meta.validation` and unscoped inspect views forever; the server remains “correct” while undeclared files and sibling-credited fidelity remain socially invisible.

**Testable consequence:** A harness that never passes `agent_id` on `next_activity` and never reads validation warnings will stay green on PR366 tests that *do* pass those params, yet recreate the pre-#365 multi-worker blind spot in production walks that omit them.

## Bug Table

| ID | Location | What breaks | Severity | Fixable / structural |
|----|----------|-------------|----------|----------------------|
| SA-1 | `workflow-tools.ts` undeclared cover `f.includes(id)` | Possible false suppress of undeclared warning | Low / Nit | Fixable (stricter match) |
| SA-2 | Unscoped `projectUsage` / history | Multi-worker totals if callers omit filter | Informational | Structural to shared session — mitigated by docs + filter API |
| SA-3 | `step_completed` only on non-empty output | Timeline gaps for steps with empty output | Informational | Structural (RE-8 hybrid) |

No Critical/Major/Minor correctness defects found on the authored surface. No unmatched producer of unbounded durable state beyond normal session lifetime growth.

## GitNexus preamble

- `projectUsage` upstream d=1: `projectSessionView` (CRITICAL graph rating = fan-out through server registration; plan discounts bootstrap).
- `dedupTechniqueBlocks` upstream d=1: `registerWorkflowTools`, `registerResourceTools`.

