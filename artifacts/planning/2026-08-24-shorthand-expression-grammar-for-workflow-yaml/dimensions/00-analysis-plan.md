# Analysis Plan — workflow-server YAML definition grammar (Expressiveness · Architecture · Feasibility)

**Scope:** module · **Budget:** standard · **Units:** 1 · **Dispatches:** 6

Group 1 asked whether the definition language treats like constructs alike. This group asks the three questions that follow from its answer: what a shorthand would have to express, where it would have to sit, and what it would cost to land. Breadth beats depth here — five lenses that share no findings, run against one evidence base, each pointed at a different property of the same grammar. The one unit keeps every artifact in a single directory and produces a single cross-lens synthesis; the per-lens focus is carried in the briefs below rather than in the binding.

## Units

| # | Target | Role | Risk | Mode | Lenses | Why |
|---|--------|------|------|------|--------|-----|
| 1 | `workflows/**/*.yaml`, `src/schema/`, `src/utils/gate-liveness.ts`, `schemas/`, `scripts/check-*.ts`, `grammar/`, `constraints/` | api-surface | high | portfolio | pedagogy, claim, scarcity, deep-scan, sdl-abstraction | The grammar is the surface every workflow author writes against and the run must specify it well enough to generate four formal artifacts from; a goal naming three distinct concerns takes breadth, and portfolio is the mode that buys five non-overlapping reads for the price of five single passes. |

## Passes

Five lens workers, all five concurrent — no lens reads another's output — then one synthesis that reads all five artifacts. Each pass takes the model its lens resource declares.

| Lens | Dimension | Model | Pointed at |
|------|-----------|-------|------------|
| pedagogy (06) | Expressiveness | haiku | Every explicit choice the corpus makes about how a predicate is written, and which of the 15 existing sugar precedents survive transfer to the un-sugared constructs. Transfer corruption is the lens's subject: bare-string technique binding and implicit same-name variable binding are the precedents most likely to be copied without their preconditions. |
| claim (07) | Expressiveness | haiku | The empirical claims the shorthand proposal embeds — that authors want terseness, that a single leaf `condition` is restatement rather than deliberate structure, that a rename-only binding carries no intent. Invert each and trace what breaks. |
| scarcity (08) | Feasibility | haiku | What is conserved across every possible design: `when` typed `z.string()` so no Zod change catches new syntax, enforcement living in `scripts/` rather than the schema, JSON Schemas generated with no regeneration or drift check, and a migration touching the condition trees, the structured bindings and the 192 graph edges. |
| deep-scan (12) | Architecture | opus | The implementation: two ASTs, two evaluators and two dotted-path resolvers in `when-expression.ts` and `condition.schema.ts` meeting only as an and-combination in `gate-liveness.ts`. Whether `when` should lower into `Condition` or stay parallel, and where the parse boundary belongs given the server never evaluates gates. Code-only lens — it reads source, not YAML. |
| sdl-abstraction (15) | Architecture | haiku | What leaks across the four-way single source of truth — Zod, the generated JSON Schemas, EBNF and Alloy. Loader-level sugar present in neither schema. Whether the settled grammar is expressible in EBNF and constrainable in Alloy at all. |

## Reading the right revision

The checked-out superproject is 42 commits behind `origin/main` (`b061faee`) and its `src/schema/` has no `variable.schema.ts`, no `ExitSchema` and no `GraphSchema`. A pass that reads those paths from the working tree analyses a superseded schema and re-litigates merged work.

- **Superproject paths** — `src/`, `schemas/`, `scripts/`, `grammar/`, `constraints/` — read via `git show origin/main:<path>`, never from disk.
- **Corpus paths** — `workflows/**` is a submodule; its working tree carries all 17 `graph:` blocks and is current, so read it from disk.

## Evidence the passes are pointed at

Carried from Group 1 and from measurement against `origin/main`; the passes confirm or overturn these rather than assuming them.

- **Group 1's prediction, to be tested rather than rediscovered.** Of the `actions[].target` predicates, 34 already parse as valid `when` expressions; the 4 that do not are one presence test (`target_path exists`) and three emptiness tests (`broken_artifact_links == []`, `summary_budget_overruns == []`, `summary_completeness_findings == []`). Group 1 predicts a postfix presence form plus an emptiness form takes the residue to zero. That prediction is falsifiable and cheap to check.
- **A correction to how that field was counted.** `target:` is one key over two grammars, split by the sibling verb: under `action: set` it is a variable name, under `action: validate` it is a boolean predicate. Of 248 action entries, 122 carry `target:` across 87 distinct values; Group 1's count reached only the `validate` sense. A shorthand that treats `target` as one construct will be wrong about the other half.
- **The workflow half, which Group 1 left unexamined.** All 17 workflow definitions declare `graph:`; it holds 106 nodes and 192 edges under 79 exit labels, and not one edge value is anything but a bare string. That is enforced, not merely observed — `GraphSchema` is `z.record(z.record(z.string()))`, which cannot hold a predicate. Every predicate in the corpus sits inside an activity: 227 step `when` gates, 67 checkpoint `condition` trees, 54 `exits[].when`, 11 `actions[].condition`. The workflow tier can say where an exit label leads, never under what circumstances.
- **Two of the four target artifacts have no ancestor.** `grammar/workflow.ebnf` and `constraints/workflow.als` are listed as TBD and do not exist. The two that do exist — `activity.ebnf` (129 lines) and `activity.als` (279 lines) — are complete formal specs of a superseded design, both stamped 3.0.0 / 2026-02-10, describing `decisions:`, `flows:` and `skill:` bindings the current schema does not have. There is no prior formal statement anywhere of what a workflow-level predicate would mean, so the workflow half is specification from nothing rather than revision.
- **The author-burden measurements.** 75 of 109 `condition` blocks are a single leaf and all 86 child nodes restate `type: simple`; the same four-term predicate appears both ways — 19 lines against 1 — in one file. 145 of 410 technique input entries are pure renames, 10 of them identity passthroughs, and all 17 output entries are renames. `required` is populated on 6 of 525 `writes`. The corpus writes `a == 'x' || a == 'y'` chains because it has no set-membership form.

## Boundary

The run settles a target grammar covering activity and workflow definitions and specifies it precisely enough that the four formal artifacts could be generated from it. It does not write them.
