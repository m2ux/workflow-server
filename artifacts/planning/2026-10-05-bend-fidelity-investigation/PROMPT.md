# Investigation Prompt: Bend as the Fidelity System

You are investigating whether **Bend** (https://github.com/bendlang/bend) could subsume some or all of the workflow-server's fidelity guarantee system. You report findings, build a spike that proves or disproves the central claims, and make a recommendation. You do not change the server or the corpus.

## The question

Today most of fidelity *detects* and does not *prevent*. Of the seven runtime layers, two refuse a call (seal, checkpoint gate). The other five warn and record. Around 60 static guards check, after authoring, that definitions bind together correctly. Bend 2 claims laws the compiler proves, dependent types (types that state facts about values), affine values (each used at most once), and checked termination.

Find out which fidelity guarantees could move from **warns** or **records** to **refused** or **proven**, what that costs, and which existing constructs (techniques, routines, contracts, bundles, manifests, guards, the definition formats themselves) would become unnecessary. **Scope is not limited to existing constructs.** A finding that retires a whole construct is in scope and welcome.

## Ground truth to read first

Read from fresh worktrees of `origin/main` (server) and `origin/workflows` (corpus). Local checkouts under `.project/` can be stale or on feature branches. Do not trust them.

Server (`origin/main`):

- `docs/fidelity.md`: the seven layers, and **Limits of Detectability**. That section is your main target list.
- `docs/state.md`, `docs/checkpoint.md`, `docs/dispatch.md`, `docs/delivery.md`: seal, gate timers, child sessions, bundling.
- `docs/workflow.md`, `docs/technique.md`, `docs/routine.md`, `docs/resource.md`, `docs/resolution.md`: the definition model.
- `src/utils/validation.ts`, `src/utils/session/`, `src/trace.ts`, `src/tools/workflow-tools.ts`: where the runtime checks live.
- `guards/README.md`, `guards/guards.ts`, `guards/check-binding-fidelity.ts`: the static guard system and its triage ledger model (`harmless` / `fix-later` / `live-bug`).
- `schemas/`: the definition schemas.

Corpus (`origin/workflows`):

- `corpus/specimens/`: small conformance workflows.
- `corpus/work-package/`, `corpus/meta/`: production workflows with checkpoints, loops, conditional exits and child dispatch.
- `canon/`: design principles and anti-patterns. The canon states rules in prose. Ask which of them could become laws.
- `ledgers/`: recorded guard verdicts.

Bend:

- Clone the repository. Read the README, the `bend guide` output, the examples, and any `LAWS.bend` / `PROOF.bend` samples **from source**. Do not rely on summaries. Record the exact commit you studied.
- Establish which Bend you are looking at. Bend 1 (HVM2, untyped, parallel runtime) and Bend 2 (dependent types, laws, proofs, BendRT) are different systems. Your findings concern Bend 2 unless you show that Bend 1 matters.
- Establish what the checker actually proves, what `--verdict` (the Lean-proven kernel) covers, how effects and IO are typed, and how `@unsafe` escapes termination checking.

## Placements to weigh

Assess each placement, rank them, and propose a fourth if the evidence points to one.

1. **Definition language.** Workflows, activities, techniques and routines are written as Bend programs. The compiler proves graph and binding properties at author time: every exit is bound, every read has a producer, no output is dead, loops terminate. Static guards retire. The TypeScript server stays.
2. **Runtime engine.** The server's session state machine is a Bend program. The session is a linear value, so stale, forked or replayed state cannot be type-correct. Test whether this simplifies or removes the seal, transition validation and the trace.
3. **Proof-carrying work.** Workers return Bend terms whose types encode what each step owes. A step's output is evidence the step happened, not a manifest claim. Test this against the step manifest and technique-fetch fidelity layers.

For each placement, state how Bend reaches the MCP boundary. Bend has no JSON, HTTP or TLS support. Choose between the JS backend embedded in the server, an author-time checker only, a subprocess, or something else, and justify the choice.

## The trust boundary

A type checker proves properties of programs. It does not prove that a language model did the work it reports, that a predicate it asserts is true, or that a person saw a checkpoint. For every item in **Limits of Detectability**, classify it as one of:

- **moves**: Bend makes it refused or proven. Say how.
- **narrows**: Bend shrinks what an agent can fake. Say what is left.
- **inherent**: no type system reaches it, because the agent controls the channel. Say why.

Do not oversell. A guarantee that rests on an unaudited checker (the README calls the compiler "99% AI-written and not yet fully audited") is weaker than one that rests on the Lean kernel. Say which one each claim rests on.

## Baseline

For every gain you attribute to Bend, name the cheapest alternative that buys the same guarantee. Candidates: stricter TypeScript types, schema validation the server already uses, Lean, Idris or Agda, TLA+ for the state machine, or a guard that refuses instead of warning. Bend wins a row only when it beats that alternative on guarantee strength or total cost. Without this control, the investigation proves nothing.

## Spike

Build Bend **from source** in `/tmp`. Do not run the `curl | sh` installer. Read the build and install steps before running them. Ask the user before anything writes outside `/tmp` or the planning folder. If the build fails, stop and report it. Do not simulate results.

Grow it in layers:

1. **MVW**: one orchestrator, one activity, one routine, one technique, encoded in Bend. Prove at least: every declared exit binds to a target; no transition past an open checkpoint type-checks; every ungated step appears in the reported run.
2. **One real workflow**: pick one from the corpus with checkpoints, a loop with a continuation test, gated steps, and ideally child dispatch. Justify the choice. Prove at least one binding-fidelity property (read resolution or orphan input) and loop termination.
3. **Negative cases**: for each law, a deliberately broken variant that must fail to compile, with the compiler's actual output captured. A law that accepts the broken variant is a finding.

Record per law: what it states, which existing layer or guard it would replace, whether it rests on the checker or on `--verdict`, the lines of proof it took, and check time.

## Assess each mechanism

Build one table covering every runtime layer, every guard family (group the ~60 guards by the invariant they police), and every definition construct. Columns:

| Mechanism | Today (refuses / warns / records / none) | Bend placement | Strength under Bend (proven / refused / warns / unchanged) | Retires | Cheapest alternative | Cost and risk |

## Judge against the design principles

The workspace `CLAUDE.md` applies: no backward compatibility, simplest implementation that fully meets requirements, decide for the long term, prefer established libraries, and exhaust existing dependencies. Weigh the following:

- **Authoring cost.** Definitions are written and revised by agents. Can an agent write and maintain Bend proofs reliably, given that Bend has no tactics or proof automation? Measure this in the spike. Do not estimate it.
- **Maturity.** Weigh the young compiler, the thin standard library, strings as linked lists, terse errors, and no debugger, against a decision meant to last.
- **Corpus scale.** The corpus has many workflows. Estimate the cost of re-expressing it, and what that cost buys.

## Deliverables

Write everything in `.engineering/artifacts/planning/2026-10-05-bend-fidelity-investigation/`:

- `README.md`: verdict first. The placements ranked, then constructs to deprecate, then constructs that survive, then the recommendation and open questions for the user.
- `mapping.md`: the mechanism table and the trust-boundary classification.
- `spike/`: Bend sources, negative cases, captured compiler output, and a `README.md` giving the Bend commit, the build steps and the run commands.

Write in present tense and plain language. Disambiguate jargon on first use. Every claim about Bend cites a file and line at the recorded commit, or a captured spike output.

## Working rules

- Follow the workspace `CLAUDE.md` and `rules/bash-composition.md` exactly. They cover the sandbox (`sbx`), shell constructs that prompt, worktrees, and REST-only `gh`.
- Read the server and corpus only. Make no edits there.
- Commit incrementally to the `engineering` branch and push directly with no PR. Commit subjects state the finding in present tense.
- Before you finish, report to the user using the workspace response format: grouped by area of concern (definitions, runtime, guards, workers, toolchain), with problem/solution pairs.
- Stop and ask the user when a finding forces a decision that is theirs to make. One example: a placement that retires the definition formats entirely.
