# Review: Workflow Mechanisation — Deterministic Steps as Scripts

You are reviewing the **workflow-server** project (this repository) — an MCP server providing a pseudo-deterministic framework that lets agents consistently and repeatably follow structured workflows. Workflows decompose into **activities**, supported by **techniques**, requiring **tools** and declared **inputs/outputs**.

Some of what those techniques ask an agent to do is not judgement at all — it is arithmetic. Deriving a branch name from an issue type and title, computing a canonical worktree path from a planning-folder path, checking whether a path is already a registered worktree, seeding a README from a profile, appending a row to a provenance table. An agent reading prose and performing these by hand costs tokens and turns, and produces a *moderately* predictable outcome where an exactly predictable one is available. A script produces the same answer every time, in one call, for a fraction of the cost.

**Mechanisation** is the substitution: move a step's deterministic core into a script, and reduce its technique to a thin invocation-and-binding protocol.

## Mission

Produce a **mechanisation ledger, an invocation contract, and a prioritised roadmap** answering three questions:

1. **Candidate question:** Which steps and techniques in `work-package` are mechanisable, under an explicitly stated determinism test — and how much does each currently cost?
2. **Contract question:** What is the technique-plus-script contract that makes a mechanised step reliable, portable across harnesses and install topologies, and honest when it fails?
3. **Roadmap question:** In what order should candidates be mechanised, in what batches — and which must **not** be, with reasons?

### Fixed architectural decision — do not relitigate

**The agent runs the scripts, by following an associated technique.** The server does not execute anything. Scripts ship alongside workflow definitions; a paired technique tells the agent how to invoke one and how to bind its outputs into the session variable bag.

This is settled because the server-side alternative is foreclosed on the evidence: `src/` contains no `child_process`/`spawn` usage anywhere (the server is pure computation plus filesystem), the container image installs no `git`, the container holds none of the user's GitHub/Jira/signing credentials (`HOME` is forced to the state dir and only four paths are bound), and container paths do not equal host paths. `docker-compose.yml:5` already records where the boundary sits: *"Agents create worktrees on the host before the server writes artifacts."*

Your job is the candidate set and the contract, not the locus. If you find a candidate that is *only* viable server-side, record it in the do-not-mechanise list with that reason rather than reopening the decision.

### Decision goals (the optimisation axes)

| Goal | Operational definition |
|---|---|
| **Token usage** | Technique payload delivered per step, cumulative input+output tokens across a full run, and reasoning spent re-deriving what a function could return. |
| **Workflow completion speed** | Turns, tool calls, and wall-clock time from session start to completion. |
| **Agent execution fidelity** | Adherence to the declared workflow: outputs actually produced, produced *correctly*, and produced identically across runs. A script cannot skip a step or improvise a path. |
| **Definition drift** | Whether a rule is single-sourced and testable, or restated in prose across techniques and docs where copies silently diverge. |

These trade off. Every finding and recommendation must say which goal it serves and what it costs the others. **Fidelity and drift are first-class here, not consolation prizes** — the token win may well be the smaller half of the case.

## Established constraints

Verified against tip on 2026-07-25. Treat as a starting frame, re-verify before relying on any of it, and correct the record where it has moved.

- **Step kinds are `technique | action | checkpoint | loop`** ([`schemas/activity.schema.json`](../../../schemas/activity.schema.json)) — there is no script step kind. Actions include `log`, `message`, `set`, `validate`. Whether mechanisation needs a new kind, a new action, or nothing beyond a conventional technique shape is yours to determine.
- **The workflows tree contains zero executable files today** — only `.md` and `.yaml` (plus a `.gitkeep`). It is also a *separate clone/worktree* from the server package.
- **Resources are markdown-only by path convention** — `resource-loader.ts` resolves exclusively to `<workflowDir>/<workflowId>/resources/<id>/SKILL.md`. There is currently no addressable non-markdown file class.
- **Distribution is the hard problem.** Under stdio, `workflowDir` is a real host path the agent can reach. Under http+Docker the server sees `/app/workflows`, a read-only bind whose host source is `HOST_WORKFLOWS_DIR` — a path the agent needs but the server's own view does not give it. Establish how an agent obtains a runnable, version-matched path to a script under **both** topologies before designing anything else. Delivering script *source* inline through a technique payload is an option, but price it: it spends the tokens mechanisation was meant to save.
- **Precedent to build on:** [`workflows/meta/techniques/harness-compat/`](../../../workflows/meta/techniques/harness-compat/) already models "the agent's environment provides a capability; a technique explains it portably" (`resolve-harness-operation.md`, plus per-harness files for Claude Code, Cursor, Cline, Continue, and a generic fallback). [`workflows/meta/techniques/variable-binding.md`](../../../workflows/meta/techniques/variable-binding.md) governs how outputs reach the bag. A mechanisation technique should sit in this lineage, not invent a parallel one.
- **Worked drift example.** [`workflows/work-package/techniques/naming-conventions.md:59`](../../../workflows/work-package/techniques/naming-conventions.md) derives `target_path` as `<install-root>/worktrees/<owner>/<repo>/<slug>/`. [`docs/install-projects-worktrees.md`](../../../docs/install-projects-worktrees.md) marks exactly that shape **deprecated**, and mandates `<checkout>/.worktrees/<slug>/`. Two sources of path arithmetic, already diverged. Use this as the canonical illustration of the drift axis.
- **Worked separation example.** The same file's step 2 reads "feature → `feat`, bug → `fix`, task/enhancement → `chore`/`refactor` as appropriate." Pure table lookup with a judgement clause welded on. Most candidates look like this: the question is rarely "mechanisable or not" but "where is the seam".
- **Permission friction is a real cost.** Under Claude Code, an agent-run script is a Bash call subject to the user's permission rules; an invocation shape that triggers a confirmation dialog on every run can be *net worse* than the prose it replaced. Score the permission posture of every proposed invocation shape (stable static prefix, no command substitution, allowlistable as a single rule).
- **Language is open, and now a client-side question.** [`scripts/`](../../../scripts/) is ~25 TypeScript validators with a build and a vitest suite — reusing that toolchain is free inside the repo. But scripts now execute on the *user's* machine: `python3` is near-universal on developer hosts and needs no build step or `node_modules`, whereas guaranteed Node availability is an artefact of the stdio install path only. Decide, and justify against interpreter availability, build/packaging burden, testability, and the cost of a second toolchain.

## Ground rules

- **Read-only review of the system.** Do not modify `src/`, `schemas/`, workflow YAML, or technique markdown. The proof-of-concept in Phase 4 goes in a temp directory outside the repo. The only repo write is the final planning artifact (Phase 5). Do not commit.
- The `.engineering/` submodule holds design artifacts — start with `.engineering/AGENTS.md` for layout. **Some artifacts are stale**: anything using "skill" terminology for what are now "techniques" predates the ≈2026-05 rename. Verify claims against current code and schemas before relying on them.
- **This is a free-form review, not a workflow run.** No session bootstrap applies — do not call `discover` or `start_session`. Read workflow definitions, activities and techniques directly from `workflows/` as files; that is also where the payload measurements in Phase 1c come from. Reach for workflow-server tools only if you specifically want a live response to size, and read-only if so.
- GitNexus tools are available for code exploration. If you use concept-rag tools, fetch the `concept-rag://activities` resource first.
- Mine prior planning artifacts for evidence rather than speculating about friction — in particular the run retrospectives under `.engineering/artifacts/planning/` (e.g. `2026-07-22-work-package-run-retrospective-friction-points`, and the issue #270/#271/#272 lineage). Where a past run actually drifted, misplaced a path, or burned turns on arithmetic, that is your fidelity evidence.

## Phase 1 — Candidate inventory

Sweep all 15 activities and the ~90 technique files under `workflows/work-package/`, plus the `meta` techniques they pull in.

**1a. State the determinism test** you will apply, then apply it uniformly. Proposed form, tighten as you see fit:

> A step is **fully mechanisable** iff, for every state the workflow can legally reach, its declared outputs are a total function of (a) inputs already bound in the session bag and (b) mechanically observable state — filesystem, git refs, file contents. No judgement, no natural-language interpretation, no user-facing decision.

Protocol language such as *as appropriate*, *assess*, *surface to the user*, *ask whether* marks a judgement clause. Its presence does **not** disqualify the step — it locates the seam.

**1b. Classify every candidate three ways:**

| Class | Meaning |
|---|---|
| **Mechanisable** | Whole step becomes a script call. |
| **Separable** | Deterministic core scripted; a named judgement clause stays with the agent. State exactly where the seam falls and what crosses it. |
| **Irreducibly agentic** | Judgement, elicitation, drafting, or review. Leave alone. |

**1c. Record per candidate:** the technique/step, its declared inputs and whether they are already bound at that point, its **side-effect class** (pure computation → read-only probe → filesystem mutation → git mutation → network/authenticated), its current cost (protocol steps, expected tool calls, technique payload size in chars ≈ tokens/4), and whether a checkpoint gates it.

Two hard exclusions to apply while inventorying, and to justify if you deviate: **never mechanise a decision a checkpoint exists to put in front of a human**, and treat authenticated network operations (GitHub, Jira) as a separate class — those already have technique protocols wrapping CLI/MCP tools, and re-mechanising them is a different project.

## Phase 2 — Cost and benefit measurement

**2a. Account for tokens honestly, including the asymmetry.** Because the agent still needs a technique telling it what to run, the technique payload does **not** vanish. Savings come from three places only: a shorter protocol, an eliminated multi-call tool loop, and eliminated reasoning. Measure both sides — current technique payload and observed/estimated call count, versus proposed thin technique payload plus one invocation plus its stdout. Report candidates where the net is small or negative; those belong in the do-not-mechanise list even if they pass the determinism test.

**2b. Measure the fidelity and drift case with evidence,** not assertion: for each candidate, cite either an observed drift/error in a past run, or a duplicated rule with a diverged copy, or state that you found none.

**2c. Score the permission and invocation posture** of each candidate under the shapes you are considering in Phase 3.

## Phase 3 — The invocation contract

This is the core design work; everything else is inventory around it. Specify, with a rationale and at least one rejected alternative per decision:

- **Addressability and distribution** — how a script reaches the agent, resolvable under both stdio and http+Docker topologies, given that the workflows tree is a separate clone and resources are markdown-only today. Does this need a new addressable file class, a sibling directory read by path, or something else?
- **Version coupling** — how a script is guaranteed to match the version of the technique that invokes it, and what happens when they diverge.
- **Interpreter and availability** — the language decision from the constraints above, plus the pre-flight check when the interpreter is missing.
- **I/O contract** — how outputs come back (structured stdout is the obvious candidate), how failures are signalled and classified by exit code, where human-readable diagnostics go, and how the technique's `Outputs` section maps onto the returned keys. Reconcile with `meta/techniques/variable-binding.md`.
- **Trust boundary** — whether the agent validates the script's answer or accepts it. A script that silently returns a *wrong* path is worse than an agent that gets it right by reading. Say what is checked.
- **Failure escalation** — how an unexpected repo shape, ambiguous state, or precondition violation hands control back to agent judgement, and how the agent knows it may.
- **Idempotency and re-entry** — behaviour on re-run after partial completion, and whether a dry-run/verify mode is warranted (relevant to every mutating candidate; see `create-worktree.md`'s existing idempotency check).
- **Harness portability** — how invocation is expressed so it works beyond Claude Code, via `harness-compat`.
- **Observability** — how a mechanised step still shows up in the session trace and step manifest, so mechanisation does not create a fidelity blind spot.
- **Technique shape** — what a mechanised technique file looks like, concretely. Provide the template. It must remain readable as a fallback when the script is unavailable, or explicitly declare that it is not.

## Phase 4 — Proof of concept

Pick the **single highest-scoring candidate** and build it in a temp directory: the script, its tests, and the rewritten thin technique.

Recommended unless your scoring says otherwise: **branch-name and `target_path` derivation** (`naming-conventions`). It is pure computation, it runs on every single work-package session, and its prose has already drifted from the docs — so it exercises all four decision goals at once.

Run it against at least three real fixtures covering both path layouts and one review-mode case. Then **diff the script's answers against what the prose instructs** and report every disagreement: each one is a live defect finding, not a PoC artefact. Report the delta on all four goals, and what the exercise taught you that Phase 3 got wrong.

## Phase 5 — Synthesis

Write the deliverable with this structure:

1. **Mechanisation ledger** — every candidate: class, side-effect class, current cost, projected cost, goals served, goals sacrificed, effort (S/M/L), confidence.
2. **Prioritised roadmap** — ordered by impact-per-effort, grouped into shippable batches, each with what lands and what it unblocks. Call out the first batch that would need a schema change, if any.
3. **Do-not-mechanise list** — with the reason per entry: judgement-bearing, checkpoint-gated, net-negative on tokens, server-side-only, or insufficient evidence. Negative results are part of the deliverable.
4. **Invocation contract specification** — the Phase 3 output as a standalone, reusable document. This is the most durable artifact here; write it so a future author can mechanise a technique by following it.
5. **Risks and reversibility** — how a mechanised step is rolled back, what breaks for users on older workflow clones, and the failure mode you consider most likely.
6. **Open questions** and the smallest next experiment that would resolve the weakest conclusion.

**Deliverable location.** `.engineering/artifacts/planning/{today's date as YYYY-MM-DD}-workflow-mechanisation-review/` containing `mechanisation-ledger.md`, `invocation-contract.md`, `roadmap.md`, and the PoC record. Follow `.engineering/AGENTS.md` conventions — planning artifacts are where rationale, alternatives weighed, and deferred items belong. Do not commit; leave the artifact for review.

Lead your final summary with the ledger's top five candidates by impact-per-effort, and the one contract decision you are least confident about.
