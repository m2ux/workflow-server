# Evaluation Plan: workflow-server

## 1. Target Overview

- **Target type:** mixed
- **Target path:** `/home/mike1/projects/dev/workflow-server`
- **Summary:** The MCP workflow server defines its activity and workflow definition language in Zod (`src/schema/`), generates JSON Schemas from it, loads YAML definitions through `src/loaders/`, and enforces the language's static semantics through a ~40-script guard suite in `scripts/`. The evaluation asks where that language can carry expressions in shorthand. Today `when` is the only construct with a compound, language-like syntax; the structured `condition` tree is marked LEGACY in its favour yet remains load-bearing on checkpoints, and a third undeclared expression grammar lives in `actions[].target`. The run settles a target grammar covering activity *and* workflow definitions and specifies it precisely enough that `grammar/activity.ebnf`, `constraints/activity.als`, `grammar/workflow.ebnf` and `constraints/workflow.als` could be generated from it. It does not write those four files; they are the specification's target consumers.

**Structure inventory**

| Section / Module | Size |
|------------------|------|
| `src/schema/` — the grammar itself (10 files) | 1,652 LOC |
| `src/loaders/` — YAML to validated object (8 files) | 2,387 LOC |
| `src/utils/` — incl. `gate-liveness.ts`, `binding-provenance.ts` | 2,099 LOC |
| `src/` remainder (tools, session, transports, config) | 6,848 LOC |
| `schemas/` — 6 JSON Schemas, 5 generated from Zod | 2,508 LOC |
| `scripts/` — ~40 `check-*.ts` static-semantics guards | grammar's real enforcement layer |
| `workflows/` — 17 workflows, 139 YAML files | 13,097 lines |
| `grammar/`, `constraints/` — placeholders, untouched since 23 July | 129 + 279 lines |
| Grammar-covering tests | 9 `it(` blocks for `when`, 38 for `condition` |

**Key topics:** 281 `when:` gates across 60 files (35% compound, max 5 terms) against 109 `condition:` trees across 45 files (69% a single leaf, depth never exceeding 2, `type: not` never used, all 86 child nodes restating `type: simple`); the same 4-term predicate written both ways — 19 lines vs 1 — inside one file; `when` typed `z.string()` and so unvalidated by Zod, evaluated only by guards and the test walker since the server never evaluates gates; `when` and `Condition` sharing no code, with two ASTs, two evaluators and two dotted-path resolvers meeting only as an and-combination in `gate-liveness.ts`; `exists`/`notExists` available only in the tree form; 638 technique bindings of which 427 are bare strings and 211 structured, with 145 of 410 input entries pure renames and all 17 outputs pure renames; `reads` 618/618 bare strings against `writes` 525/525 four-key objects with `required` populated 1.1% of the time; 38 `actions[].target` predicates forming an undeclared third grammar; 192 graph edges carrying 79 exit labels; 15 existing sugar mechanisms including bare-string technique binding and implicit same-name variable binding.

## 2. Dimension Plan

| Dimension | Pipeline Mode | Lenses | Analysis Focus | Output Location |
|-----------|---------------|--------|----------------|-----------------|
| Consistency | full-prism | 00, 01, 02 | Evaluate consistency of the two parallel predicate grammars — 281 string `when:` gates against 109 structured `condition:` trees with no lowering between them, including the verbatim same 4-term predicate written both ways in `workflow-authoring/activities/09-validate-and-commit.yaml`; the undeclared third grammar in `actions[].target` (38 uses, 22 with operators) competing with 11 `actions[].condition` trees on the same verb; the `reads`/`writes` asymmetry; and whether constructs appearing at both activity and workflow level are written alike. | `consistency/` |
| Expressiveness | portfolio | 06, 07 | Evaluate expressiveness against what authors are forced to restate: the 5-line-vs-1-line cost of `condition` where 75 of 109 are a single leaf and all 86 children restate `type: simple`; 145 of 410 technique inputs being pure renames with 10 identity passthroughs; `required` populated on 6 of 525 `writes`; the absence of set-membership against the corpus's `a == 'x' \|\| a == 'y'` chains; and which of the 15 existing sugar precedents transfer to the un-sugared constructs. | `dimensions/` |
| Architecture | portfolio | 12, 15 | Assess architectural soundness of a shorthand: whether `when` should desugar into `Condition` or stay parallel, given two ASTs, two evaluators, two duplicated path resolvers and a single and-combination meeting point; placement of the parse boundary given the server never evaluates gates and enforcement lives in `scripts/`; the four-way single source of truth across Zod, generated JSON Schemas, EBNF and Alloy; loader-level sugar present in neither schema; and whether the settled grammar is expressible in EBNF and constrainable in Alloy at all. | `dimensions/` |
| Feasibility | portfolio | 08 | Analyse feasibility constraints across the 139-file, 13,097-line corpus: `when` being `z.string()` so no Zod change catches new syntax, which must instead be taught to `tokenize`/`Parser` and to `scripts/check-when-expression.ts`; JSON Schemas generated with no regeneration or drift check and already stale; `technique.schema.json` hand-maintained and already drifted in wording; and migration touching 109 condition blocks, 211 structured bindings and 192 graph edges. | `dimensions/` |

## 3. Execution Groups

| Group | Pipeline Mode | Dimensions | Lenses | Combined Analysis Focus | Output Subdir |
|-------|---------------|------------|--------|-------------------------|---------------|
| 1 | full-prism | Consistency | 00, 01, 02 | Three-pass structural, adversarial and synthesis analysis of the coexisting predicate grammars and the activity/workflow parity question. | `consistency/` |
| 2 | portfolio | Expressiveness, Architecture, Feasibility | 06, 07, 08, 12, 15 | Author burden and transferable sugar patterns; desugaring and single-source-of-truth structure; and the migration and enforcement cost of landing a shorthand. | `dimensions/` |

- **Execution order:** Group 1 (full-prism) first, then Group 2 (portfolio).
- **Estimated sub-agent dispatches:** 8 — three sequential passes for Group 1, five parallel lenses for Group 2.
