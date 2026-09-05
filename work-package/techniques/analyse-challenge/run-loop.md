---
metadata:
  version: 1.2.0
---

## Capability

Parameterized analyse–challenge–combine iterations until agent-resolvable concerns converge.

## Inputs

### residual_opens

*(optional)* The residual open items carried into this pass; empty or unset on the first.

### target_path

*(optional)* Reference codebase root forwarded to analyse / challenge when they require it.

### iteration_mode

*(optional)* `until_converged` (default) — repeat analyse → challenge → combine while `{concerns_agent_resolvable}` is true. `once` — run a single analyse → challenge → combine pass and return (for activities that wrap this op in their own `while` with a soft gate).

## Outputs

### concerns_agent_resolvable

False after a normal `until_converged` exit; after a single `once` pass, true while agent-resolvable items remain.

### residual_opens_remain

True iff irreducible opens remain after the final combine; false for an empty open set.

### residual_opens

*(optional)* The irreducible open items after the final combine; empty when none remain.

## Protocol

### 1. Confirm The Analyse Operation

- Confirm `{analyse_technique}` resolves to a callable operation before the first pass.

### 2. Iterate (or Single Pass)

- When `{iteration_mode}` is `once`, run one analyse → challenge → combine cycle and proceed to handoff.
- When `{iteration_mode}` is `until_converged` (default), repeat while `{concerns_agent_resolvable}` is true (or on the first pass when the flag is unset and open concerns exist):
  1. **Analyse** — invoke the bound `{analyse_technique}` technique with forwarded context (`{concern_document}`, `{target_path}` as applicable). When `{concern_kind}` is `open_questions` and `{analyse_technique}` is `codebase-comprehension::deep-dive`, follow with [revise-questions](../codebase-comprehension/revise-questions.md) so the document's Open Questions and `{concerns_agent_resolvable}` / `{residual_opens_remain}` stay current. Analyse updates the concern set and may set `{concerns_agent_resolvable}` true when more agent-resolvable work remains.
  2. **Challenge** — invoke [challenge](./challenge.md) with `{challenge_perspectives}` and `{concern_document}`. Challenge fans out adversarially via scatter-gather and returns per-perspective findings without writing shared bag flags itself.
  3. **Combine** — invoke [combine](./combine.md) with `{concern_document}` to merge challenge findings into the concern set, resolve or reclassify items, and set `{concerns_agent_resolvable}` / `{residual_opens_remain}` (and `{residual_opens}` where supplied).
- Exit when `{concerns_agent_resolvable}` is false after combine (`until_converged`), or after the single pass (`once`). An empty open set yields `{residual_opens_remain}` false.

### 3. Hand Off Residue

- Emit `{concerns_agent_resolvable}`, `{residual_opens_remain}` and `{residual_opens}` as this loop's result. No residual interview or batch presentation runs here.

## Rules

### no-user-interaction

The loop runs autonomously; it opens no user checkpoint and waits on no answer.

### one-gather-contract

Challenge uses scatter-gather isolation-then-combine; per-perspective outputs never clobber shared flags — only [combine](./combine.md) mutates convergence/residue state.

### max-iterations-safety

Where an enclosing iteration declares a ceiling, honour it. Where this op owns iteration internally, stop after a sane ceiling (default 10) and leave remaining opens as residue with a note that convergence was iteration-capped.
