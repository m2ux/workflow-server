## Summary

The corpus has one rule of thumb for reuse: a capability that more than one workflow needs lives once, in a shared home — the `meta` workflow for domain-agnostic patterns, or a reusable technique group — and each workflow binds it, keeping only its own domain content. Four places break that rule today, in two ways. Two capabilities exist only as private property of one workflow (a fully parameterized convergence loop, a bespoke comprehension artifact), and one structure exists only as free prose that every author re-describes (running independent checks at the same time). The fourth item is the survey that finds every other place paying for the same absence. This epic covers one work item per case.

## The four cases

**Concurrent execution is described, not bound.** One validation-suite technique tells the agent, in protocol prose, to fan out four concurrent shells, wait for all of them, gather results in a fixed order, and fall back to sequential execution under resource pressure. Nothing names that structure, so every caller that wants it must reinvent it in prose. Two shared techniques that may already be the answer exist under `meta` — a scatter-gather contract and a concurrent agent-dispatch variant — and the work is to decide the binding, not to assume a new primitive is needed. Whatever carries the pattern must stay domain-agnostic: the toolchain owns only its child operations and how their results fold into its envelope.

**Nobody knows where else this is being paid.** Several production workflows run work strictly one step after another even where the steps do not depend on each other — independent validations, sibling analysis passes, research and check runs inside a single activity. Every session pays the full sequential wall-clock cost. The corpus has never been inventoried for these sites: which are ready to bind an existing contract, which are blocked on a missing primitive, and which are not candidates at all because a true dependence, a human gate, or coordination holds them in order. The highest-traffic workflow is the clearest exemplar, with multi-stage validate, analyse, and prepare chains that look independent at the step level.

**The convergence loop is forked into one workflow.** A reusable loop for working through open concerns before asking the user about them — analyse, have independent perspectives challenge the findings, combine what survives, repeat until only the residue that genuinely needs a human answer remains — lives under the work-package workflow, yet nothing in it is work-package-specific: it is already fully parameterized (the analyse operation, the challenge perspectives, the convergence and residue flags, the residue collection, and the concern kind are all caller-supplied inputs). Any workflow that wants to converge what the agent can resolve itself before the residual asks reach the user must currently fork it.

**Comprehension writes a bespoke artifact next to a purpose-built knowledge base.** Before planning a change, the work-package comprehension stage studies the codebase and writes one markdown file per area into its own artifact folder. Separately, the corpus ships reusable codebase-wiki techniques for exactly this: a citation-backed, confidence-tagged knowledge base. The migration must split what comprehension writes — durable codebase knowledge (architecture, abstractions, rationale, the data-flow and operational-context analysis) goes to the wiki with citations and confidence scores; task and process metadata (open questions, per-work-package provenance, investigation history, applied-lens output) stays in the run's planning folder. The wiki is a knowledge base, not a lab notebook.

## The work

**W1 — Name the fan-out contract.** A written decision: bind the suite runner to the existing shared primitives (as-is or minimally extended), or introduce a new contract under `meta` with an explicit rationale for the mismatch. Then binding guidance — work-unit shape, combine hook, wait-for-all, degrade path — so authors bind instead of re-describing, and the motivating call site retargeted so it keeps only its toolchain-specific envelope folding. One caution: the corpus-backlog epic fixes a content defect at this same call site — the suite runner's concurrency instruction sits in tension with its group's foreground-only rule (#338 W1) — so whichever work item lands second inherits the other's resolution.

**W2 — Inventory the demand, plan the migration.** Walk the corpus for sequential sites that are candidates for concurrent execution; classify each as ready, blocked, or not-a-candidate, with citations and the reason independence holds; call out the high-traffic workflow's stages explicitly; produce a prioritised migration backlog with its dependency on W1 stated. This item is identify-and-plan only — implementing the migrations is follow-on work.

**W3 — Lift the convergence loop into `meta`.** The parameterized shell moves under a shared technique group as a named pattern — concern convergence — clearly distinguished in the catalog from worker fan-out, which does a different job. The originating workflow retargets its call sites and keeps what is genuinely its own: the interview and batch checkpoints for asking the user about residual concerns, and its domain analyse operations.

**W4 — Move comprehension onto the wiki techniques.** The comprehension stage binds the wiki operations instead of writing the monolithic per-area file, with the knowledge/metadata split applied and zero functional regression: the question-driven deep-dive loop keeps working, the lens passes still run, every declared outcome of the activity still holds, and downstream activities receive equivalent inputs — the durable reference now being the wiki, the task metadata now living in planning.

## Why now is cheap

The supply side is mostly built: the scatter-gather and concurrent-dispatch contracts already exist under `meta`, the convergence loop is already parameterized to the point where the lift is a move plus retargeting, and the wiki techniques shipped with exactly the page formats and operations comprehension needs. What is missing in every case is the decision and the binding, not the machinery. And the costs are recurring: the sequential wall-clock cost is paid on every session, and each new workflow authored against prose-described concurrency or a forked loop deepens the migration.

## Acceptance criteria

- [ ] A written fan-out binding decision; the supporting technique or resource lives under the shared home, domain-agnostic; the motivating call site no longer carries the concurrent-shell structure in prose alone.
- [ ] A corpus inventory with ready / blocked / not-a-candidate classifications and citations, an explicit call-out of the high-traffic workflow's stages, and a prioritised migration backlog with its dependencies stated.
- [ ] The shared home hosts the parameterized convergence loop; the originating workflow no longer owns a forked copy; its call sites behave equivalently; the catalog makes the split legible — worker fan-out on one side, concern convergence on the other.
- [ ] Comprehension binds the wiki operations; the wiki receives only durable knowledge, every claim cited with a confidence score; open questions, provenance, and lens output land in planning; the deep-dive loop, the data-flow analysis, and every declared outcome survive; downstream activities receive equivalent inputs.
- [ ] Schema, reference, and binding-fidelity checks stay clean across all four items.

## Non-goals

- No server-side parallel execution engine, and no second gather contract beside the one that already owns gathering.
- The residual-question user experience, the interview and batch checkpoints, and the domain analyse operations stay with the workflow that owns them — the shared home gets the structure, never the domain content.
- W2 does not implement migrations, and sites that already correctly bind the formal patterns are not reworked.
- No change to the child operations of any toolchain suite beyond follow-ups their own contracts already note.
- The artifact-conformance pass — today three near-identical private copies, a shared-homes case by this epic's own rule — is not inventoried here: the artifact-audience epic consolidates it into a shared home as part of binding it corpus-wide (#403 W5).

## Tracking

Each work item is delivered as its own pull request when picked up:

- [ ] W1 — fan-out binding decision, shared-home placement, call-site retarget
- [ ] W2 — parallelisation inventory and migration plan
- [ ] W3 — concern-convergence lift and retarget
- [ ] W4 — comprehension migration onto the wiki techniques

Consolidates #382 (W1), #384 (W2), #266 (W3), and #148 (W4); all four bodies are captured verbatim in the planning folder.

## Investigation detail

Full record — grouping rationale, verbatim issue captures with the placement tables, the knowledge-versus-metadata split, and the open design questions, plus links to the prior fan-out investigation folder:
**[engineering/artifacts/planning/2026-08-02-shared-capability-homes-consolidation](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-02-shared-capability-homes-consolidation)**



