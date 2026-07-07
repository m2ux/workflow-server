# Workflow E2E test mechanisms

This harness drives the workflow-server's own workflows (currently `work-package`)
through the **real MCP server** to verify they work end-to-end. It exists to
validate large changes — e.g. the skills→techniques migration — by answering two
questions: *is the machinery wired correctly?* and *can an agent actually follow
the workflow?*

There are four mechanisms, ordered from cheapest/most-deterministic to most
realistic/most-expensive. Pick by what you need to learn.

| Mechanism | LLM? | Determinism | Speed / cost | Answers |
|---|---|---|---|---|
| **Deterministic suite** (vitest) | no | full | seconds, free | machinery wired? refs resolve? all branches reach the end? |
| **Standalone 3c run** (`run-3c.ts`) | no | full | seconds, free | *show me* one walk: steps, checkpoints, artifacts created |
| **3a agent smoke-run** | worker only | low | minutes, tokens | can a real worker *interpret* and execute the migrated workflow? |
| **3b dual-agent run** | both | none | minutes+, more tokens | does the full two-agent (orchestrator+worker) system work? |

All four share one engine (`walker.ts`) and one set of decision policies
(`policies.ts`). A **policy** decides which option to pick at each checkpoint,
which determines the path taken; the six named policies (`default`,
`skip-optional`, `full-workflow`, `research-only`, `elicitation-only`,
`review-mode`) cover the workflow's distinct branches.

---

## Prerequisites

```bash
npm install
npm run build      # only needed for the 3a agent smoke-run (worker uses dist/)
```

The agent runs also require the `claude` CLI at `/home/mike1/.local/bin/claude`.

---

## 1. Deterministic suite (vitest) — the CI gate

```bash
npx vitest run tests/e2e/          # all deterministic layers
npx vitest run tests/e2e/workflow-e2e.test.ts   # just the branch matrix
```

No LLM, runs in seconds, fully reproducible. This is the gate that should stay
green. It is four test files:

- **`workflow-e2e.test.ts`** — the **6-policy branch matrix**. Each policy walks
  a distinct path to the terminal `complete` activity and asserts the session
  flips to `completed`. *Catches:* broken transitions, unreachable terminals,
  branch-gating regressions.
- **`robot-execution.test.ts`** — **Layer 3c**, the deterministic "robot worker."
  Executes each activity's *steps* in order, firing the checkpoint a step
  declares, writing a stub for every declared planning artifact, and submitting
  step manifests. *Catches:* missing/renamed artifacts, steps that no longer
  produce their declared files, manifest (step-id) drift, checkpoints that fire
  at the wrong point. This is the deterministic proof of "all planning files
  created, all decision points presented."
- **`definition-lint.test.ts`** — **Layer 2**. Across all policies, asserts every
  operation/technique reference the server is asked to resolve actually resolves
  (against a recorded baseline), and that every declared activity is reachable.
  *Catches:* dangling refs from a rename (the migration's most likely breakage).
- **`snapshot.test.ts`** — a normalized, committed **baseline** per policy (path,
  checkpoint decisions, artifacts written, manifest status, unresolved refs).
  *Catches:* any unintended change to behaviour; update intentionally with
  `npx vitest run tests/e2e -u`.

**Benefits:** fast, free, reproducible, CI-able; pinpoints machinery and
definition regressions precisely.
**Costs / limits:** no LLM, so it does **not** test whether an agent can
*interpret* the prose, and it cannot reach **situational checkpoints** (ones a
worker yields on a runtime branch rather than from a step's `checkpoint` field —
6 of these are recorded in `robot-execution.test.ts`).

### A note on the two walker modes
The engine supports `mode: 'robot'` (default — Layer 3c, executes steps) and
`mode: 'graph'` (Layer 1 — just walks transitions and resolves checkpoints,
lighter). The suite uses `robot`; `graph` remains available for a faster, shallower
smoke.

---

## 2. Standalone 3c run — inspect one walk

```bash
npx tsx scripts/run-3c.ts --policy=full-workflow      # default policy: full-workflow
npx tsx scripts/run-3c.ts --policy=review-mode
```

Same deterministic 3c engine as the suite, but prints a readable per-activity
**transcript** — steps executed, checkpoints fired (`id=option`), artifact stubs
written, manifest status, unresolved refs, step-unbound checkpoints — then lists
the files created on disk and **keeps the workspace** so you can open them.

**Use it when** you want to *see* what a walk does (e.g. confirm an activity now
creates the right artifacts) rather than just get a pass/fail.
**Benefits:** free, instant, concrete. **Costs:** none beyond the suite; it's a
viewer, not a gate.

---

## 3. Agent smoke-run (Layer 3a) — real worker, deterministic orchestrator

```bash
npm run build                                                  # required first
npx tsx scripts/smoke/smoke-orchestrator.ts --activities=2     # scoped (recommended first)
npx tsx scripts/smoke/smoke-orchestrator.ts --activities=14 --keep   # full walk
```

A real headless `claude` **worker** executes each activity's steps against the
**technique-branch** server, while the walker acts as a **deterministic
orchestrator** (transitions + checkpoint responses from a policy). Worker and
orchestrator are separate processes cooperating through the on-disk sealed
`session.json`. See [scripts/smoke/README.md](../../scripts/smoke/README.md) for
the architecture.

Flags: `--activities=N` (cap, default 2), `--model=sonnet`, `--keep` (keep
sandbox + transcript), `--full` (allow the worker `Bash` — off by default so it
cannot create branches/worktrees outside the sandbox; it narrates those steps).

**Benefits:** the only deterministic-orchestrator way to test **worker
interpretation** — does an agent understand the migrated activity/technique prose,
execute the steps, and yield checkpoints correctly? Also exercises the
*worker-side* missing-conduct-rules impact (see Findings).
**Costs:** spends real tokens, takes minutes (≈ a few minutes per activity), and
is **non-deterministic** (agent behaviour varies). Not a CI gate — run it to
build confidence or investigate a suspected interpretation issue. **Start
scoped** (`--activities=1` or `2`) before a full walk.

---

## 4. Dual-agent run (Layer 3b) — `--orchestrator=agent`

```bash
npx tsx scripts/smoke/smoke-orchestrator.ts --orchestrator=agent --activities=2
```

Same driver/plumbing as 3a, but the **orchestrator is also an agent**: when the
worker yields, an orchestrator agent calls `present_checkpoint`, judges, and
calls `respond_checkpoint` (falling back to the policy if it fails to resolve).
It's the only mechanism that tests the *orchestrator's* interpretation and the
orchestrator-side missing-conduct-rules impact (`orchestrator-discipline`, etc.).
Transitions stay deterministic (graph/variable-determined). Most realistic, most
expensive, fully non-deterministic — a "run it a few times for confidence" check,
never a gate. Run scoped first.

---

## Choosing a mechanism

- **Did I break the machinery / a reference / a branch?** → deterministic suite (1).
- **Show me exactly what an activity does now.** → standalone 3c run (2).
- **Can an agent still follow this after my change?** → 3a agent smoke-run (3).
- **Does the whole two-agent system still work?** → 3b (4, when built).

Day to day, run (1) on every change. Reach for (3) when the change touches prose
agents read (technique/activity wording, operation bundles), not just structure.

---

## Findings & baselines

The deterministic layers record current state as baselines and fail on *new*
drift, surfacing known issues without going red.

**From the deterministic layers (L2 / 3c):**
- **Unresolved op refs** (`definition-lint.test.ts`): core conduct ops
  (`agent-conduct::*`, `workflow-engine::*`) and some grouped-technique ops
  (`cargo-operations`, `validate-build`, `manage-artifacts`) don't resolve — so
  those bundles are degraded. Suspected grouped→flattened rule rename from the
  migration.
- **Step-unbound (situational) checkpoints** (`robot-execution.test.ts`): 6
  checkpoints aren't bound to a step; only the agent runs reach them.
- **Routing**: `elicitation-only` still routes through the `research` activity.

**From the agent runs (3a/3b) — things no deterministic layer can see:**
- A full 3a walk **completed all 11 activities** (skip-optional path), all 13
  checkpoints resolved, all declared artifacts created. **The missing conduct
  rules caused no observable worker misbehavior** on this path (step descriptions
  were self-contained) — but that's a latent risk on harder work packages where
  the disciplines actually bite.
- **Artifact path divergence**: the worker wrote artifacts under its CWD
  (`target/.engineering`) rather than the orchestrator's
  `workspace/.engineering`. Worth investigating.
- **`get_workflow_status` gap**: returns empty `variables` /
  `completed_activities` even though `session.json` holds them, forcing the
  worker to infer state from artifacts. (Variables side improved by #166 B7:
  the bag is now seeded from declared defaults at session creation, so status
  reflects real state from the first call.)
- **Resource-layer refs also unresolved**: `classify-problem`,
  `reconcile-assumptions`, and prism lenses returned "not found" — broader than
  the op-ref set, harmless here only because step descriptions stood alone.
- **Definition smells** the worker flagged: an inverted-looking
  `update-reference-submodules` condition, and `present-problem-overview`
  ordered before `initialize-planning-folder`.
- 3b confirmed the orchestrator *agent* can resolve checkpoints by its own
  judgement (it chose `skip-issue` where the deterministic policy chose
  `provide-existing`).

Classifying the resolution findings as migration regressions vs. pre-existing is
the job of the **legacy comparison** (run the same suite against a
`main`/skill.yaml build and diff) — deferred for now.
