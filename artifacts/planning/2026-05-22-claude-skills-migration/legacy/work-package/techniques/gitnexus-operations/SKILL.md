---
name: gitnexus-operations
description: Parameterized GitNexus operations — primitive tool wrappers and composite analysis recipes — used by work-package skills.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 26
  legacy_id: 26
---

# GitNexus Operations

## Capability

Parameterized GitNexus operations for the work-package workflow. Primitive operations wrap each GitNexus MCP tool with the canonical work-package parameter set and output interpretation; composite operations encode the multi-call analysis recipes that recur across review and planning skills.

This is the single home for *how* GitNexus is driven. Skill protocol steps reference an operation by name (`gitnexus-operations::<op>`) and supply a parameter set; they do not paste raw `gitnexus_*` calls or Cypher. For the underlying tool, resource, and graph-schema reference, see [gitnexus-reference](legacy/work-package/resources/gitnexus-reference/SKILL.md).

> Migration note: this skill is introduced by the markdown migration — it has no 1:1 source TOON file. It is the GitNexus analogue of [cargo-operations](legacy/work-package/techniques/cargo-operations/SKILL.md), consolidating tool-usage that the source workflow previously scattered across per-skill protocol steps and rules.

## Operations

### impact

**Description:** Symbol blast radius — what depends on a symbol, at depth 1/2/3, with confidence and a risk level. The primary pre-edit safety check.

**Inputs:**

- **target** — the symbol name to analyse
- **direction** — `'upstream'` (dependents — what breaks if target changes; the work-package default) or `'downstream'` (dependencies)
- **maxDepth** — optional traversal depth (default 3)
- **minConfidence** — optional confidence floor (e.g. `0.8` to keep only high-confidence edges)

**Output:**

- **impact_report** — d=1 (WILL BREAK — direct callers/importers), d=2 (LIKELY AFFECTED), d=3 (MAY NEED TESTING); affected execution flows; risk level (LOW / MEDIUM / HIGH / CRITICAL)

**Procedure:**

- Call `gitnexus_impact({target, direction, maxDepth, minConfidence})`.
- Read d=1 items first — these WILL break. Weight high-confidence (>0.8) edges.
- Derive the risk level: <5 symbols/few processes = LOW; 5–15 symbols/2–5 processes = MEDIUM; >15 symbols or many processes = HIGH; critical path (auth, payments, consensus) = CRITICAL.
- The caller MUST surface HIGH or CRITICAL risk to the user before proceeding with an edit.

**Tools:**

- **mcp:** gitnexus

**Errors:**

- **stale_index** — Cause: the index is out of date · Recovery: run `npx gitnexus analyze` in terminal, then retry
- **symbol_not_found** — Cause: target does not resolve in the graph · Recovery: verify the symbol name; if it is new/unindexed, fall back to grep for callers

### context

**Description:** 360-degree view of one symbol — callers, callees, and the execution flows it participates in.

**Inputs:**

- **name** — the symbol to inspect

**Output:**

- **context_report** — incoming calls (callers), outgoing calls (callees), process membership with step positions

**Procedure:**

- Call `gitnexus_context({name})`.
- Read caller fan-out as a blast-radius signal: many callers and broad process participation → the symbol is path-committing; an isolated symbol is low-risk to touch.

**Tools:**

- **mcp:** gitnexus

**Errors:**

- **stale_index** — Cause: the index is out of date · Recovery: run `npx gitnexus analyze`, then retry
- **symbol_not_found** — Cause: name does not resolve · Recovery: verify the symbol name; fall back to grep when unindexed

### detect-changes

**Description:** Map the current git diff to the changed-symbol set and the execution flows it affects. The canonical pre-commit and diff-driven-review entry point.

**Inputs:**

- **scope** — `'staged'`, `'unstaged'`, or `'all'` (default `'all'`)

**Output:**

- **change_report** — changed symbols, changed files, affected execution flows, risk level

**Procedure:**

- Call `gitnexus_detect_changes({scope})`.
- Pre-commit: confirm the changes affect only the expected symbols and flows.
- Diff-driven review: use the changed-symbol set as the basis for coverage, scope, and severity work (see the composite operations below).

**Tools:**

- **mcp:** gitnexus

**Errors:**

- **stale_index** — Cause: the index is out of date · Recovery: run `npx gitnexus analyze`, then retry

### query

**Description:** Find execution flows related to a concept, symptom, or error string — the structural alternative to grepping for a concept.

**Inputs:**

- **query** — a concept, symptom, or error text (e.g. `'payment validation error'`)

**Output:**

- **query_report** — execution flows (processes) grouped, with member symbols and file locations

**Procedure:**

- Call `gitnexus_query({query})`.
- Use the returned processes to orient before deep-diving with `gitnexus-operations::context` on specific symbols.

**Tools:**

- **mcp:** gitnexus

**Errors:**

- **stale_index** — Cause: the index is out of date · Recovery: run `npx gitnexus analyze`, then retry
- **no_results** — Cause: the concept did not match indexed flows · Recovery: broaden the query terms; fall back to grep for pure text patterns

### cypher

**Description:** Raw graph query for traces and filters not covered by the higher-level operations.

**Inputs:**

- **query** — a Cypher query string
- **name** — repo name (usually the current repo)

**Output:**

- **rows** — the query result rows

**Procedure:**

- Read `gitnexus://repo/{name}/schema` first to confirm node labels and `CodeRelation.type` edge values.
- Call `gitnexus_cypher({query})`.
- Reserve this for custom call-chain traces, ordering/error-path assertions, and visibility filters; prefer `impact`/`context`/`query` when they suffice.

**Tools:**

- **mcp:** gitnexus

**Errors:**

- **stale_index** — Cause: the index is out of date · Recovery: run `npx gitnexus analyze`, then retry
- **schema_mismatch** — Cause: the query references labels/edges not in the schema · Recovery: re-read `gitnexus://repo/{name}/schema` and correct the query

### orphan-scan

**Description:** Find functions with zero in-degree CALLS edges (orphan/unused symbols) and intersect them with the changed-file set to surface introduced-but-unreferenced symbols as over-engineering candidates. Beats grep heuristics. (review-strategy)

**Inputs:**

- **changed_files** — the set of files changed by the work package (from `gitnexus-operations::detect-changes`)

**Output:**

- **orphan_candidates** — symbols in changed_files with no callers — over-engineering / dead-code candidates

**Procedure:**

- Run `gitnexus-operations::cypher` with `MATCH (f:Function) WHERE NOT (()-[:CodeRelation {type: 'CALLS'}]->(f)) RETURN f.name, f.filePath`.
- Intersect the orphan set with changed_files so only symbols *introduced or touched by this work* are surfaced.
- Report the intersection as over-engineering candidates for user decision.

**Tools:**

- **mcp:** gitnexus

**Errors:**

- **stale_index** — Cause: the index is out of date · Recovery: run `npx gitnexus analyze`, then retry

### public-api-enum

**Description:** Enumerate exactly the public/exported APIs in the diff that need doc comments — avoids guessing which changed symbols are exported. (finalize-documentation)

**Output:**

- **public_api_symbols** — the exported symbols present in the diff that require documentation

**Procedure:**

- Run `gitnexus-operations::detect-changes` to obtain the changed-symbol set.
- Run `gitnexus-operations::cypher` with a visibility filter to keep only public/exported symbols from that set.
- Return the filtered set as the doc-comment work list.

**Tools:**

- **mcp:** gitnexus

**Errors:**

- **stale_index** — Cause: the index is out of date · Recovery: run `npx gitnexus analyze`, then retry

### diff-coverage-map

**Description:** Drive test-coverage review from the actual changed-symbol set rather than project-wide heuristics. (review-test-suite)

**Output:**

- **coverage_gaps** — changed symbols with zero test callers
- **update_candidates** — changed symbols whose test callers are stale

**Procedure:**

- Run `gitnexus-operations::detect-changes` to enumerate the changed-symbol set.
- For each changed symbol, run `gitnexus-operations::context` and inspect incoming references from test files.
- Symbols with no test callers → coverage_gaps; symbols with stale test callers → update_candidates.

**Tools:**

- **mcp:** gitnexus

**Errors:**

- **stale_index** — Cause: the index is out of date · Recovery: run `npx gitnexus analyze`, then retry

### scope-discipline-check

**Description:** Verify the diff stays within the work-package's intended scope; flag scope creep where changes touch processes outside the requirements. (review-strategy, respond-to-pr-review)

**Inputs:**

- **requirements_scope** — the processes / functional areas the work package is meant to touch

**Output:**

- **scope_findings** — affected processes that fall outside requirements_scope (scope-creep candidates)

**Procedure:**

- Run `gitnexus-operations::detect-changes` to obtain the affected execution flows.
- Compare the affected flows against requirements_scope.
- Flag any affected flow outside requirements_scope as scope creep for user decision.

**Tools:**

- **mcp:** gitnexus

**Errors:**

- **stale_index** — Cause: the index is out of date · Recovery: run `npx gitnexus analyze`, then retry

### diagram-source-select

**Description:** Source architecture-diagram structure from graph resources rather than hand-rolled module surveys, scope-bounded to the affected processes. (summarize-architecture)

**Inputs:**

- **diagram_type** — `'package'` or `'sequence'`
- **name** — repo name

**Output:**

- **diagram_source** — for `'package'`: functional-area clusters and their members; for `'sequence'`: step-by-step process traces — bounded to processes affected by the work package

**Procedure:**

- Run `gitnexus-operations::detect-changes` to bound the diagram to affected processes.
- For `'package'`: read `gitnexus://repo/{name}/clusters` (functional areas with cohesion scores) and `gitnexus://repo/{name}/cluster/{name}` (members).
- For `'sequence'`: read `gitnexus://repo/{name}/process/{name}` (execution traces) for the affected processes.

**Tools:**

- **mcp:** gitnexus

**Errors:**

- **stale_index** — Cause: the index is out of date · Recovery: run `npx gitnexus analyze`, then retry

### complexity-signal

**Description:** Objective complexity estimate for an issue, from the fan-out of a preliminary target symbol. (classify-problem)

**Inputs:**

- **target** — a preliminary symbol inferred from the issue (when one can be inferred)

**Output:**

- **complexity_signal** — fan-out and affected-process count as an objective complexity indicator

**Procedure:**

- Run `gitnexus-operations::impact` with `{target, maxDepth: 2}`.
- High fan-out or many affected processes indicate higher complexity than the issue text alone might suggest.

**Tools:**

- **mcp:** gitnexus

**Errors:**

- **stale_index** — Cause: the index is out of date · Recovery: run `npx gitnexus analyze`, then retry
- **symbol_unknown** — Cause: no target symbol can be inferred from the issue · Recovery: signal unavailable — fall back to an issue-text complexity estimate

### reversibility-signal

**Description:** Gauge how reversible a change to a symbol is, to set the reversibility flag on judgement-augmentation assumptions. (review-assumptions)

**Inputs:**

- **name** — the symbol the assumption touches

**Output:**

- **reversibility** — `path-committing` (high caller fan-out and broad process participation) or `easily-reversible` (isolated symbol)

**Procedure:**

- Run `gitnexus-operations::context` for the symbol.
- High caller fan-out and broad process participation → path-committing; an isolated symbol → easily-reversible.

**Tools:**

- **mcp:** gitnexus

**Errors:**

- **stale_index** — Cause: the index is out of date · Recovery: run `npx gitnexus analyze`, then retry
- **symbol_unknown** — Cause: the symbol does not resolve · Recovery: gauge reversibility from the diff and surrounding code instead

## Rules

### must-use-operations

Indexed-codebase structural analysis (call relationships, execution flows, blast radius, change impact) MUST go through these operations. Do NOT paste raw `gitnexus_*` calls or Cypher into skill protocols — raw calls appear only inside the operation procedures here. grep / Read / glob are the fallback ONLY when the codebase is not indexed or the index is stale. This is a requirement, not a preference: it keeps tool-usage parameterised in one place and keeps skill protocols readable.

### index-freshness

Before the first operation in a session, confirm index freshness by reading `gitnexus://repo/{name}/context`. If it reports the index is stale, run `npx gitnexus analyze` in the terminal before relying on any operation's results. Every operation's `stale_index` recovery points back here.
