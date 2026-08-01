# Provenance Log

| Task ID | Assistant | Model | Prompt Class | Context Scope | Description |
|---|---|---|---|---|---|
| T1 | Cursor Agent | GPT-class coding agent | implement | mixed | Added `src/schema/when-expression.ts` reference parse/eval with C-style precedence, authoring mixed-ops check, fail-closed evaluate |
| T2 | Cursor Agent | GPT-class coding agent | implement | mixed | Added `tests/when-expression.test.ts` truth tables (flat OR, parens, bare mixed reject, unary, comparisons, fail-closed, keep-site matrices, structured parity, flat && regression) |
| T3 | Cursor Agent | GPT-class coding agent | implement | mixed | Wired `tests/e2e/walker.ts` `evaluateWhen` to shared `evaluateWhenExpression` |
| T4 | Cursor Agent | GPT-class coding agent | implement | mixed | Extended `activity.schema.ts` when describe + activity-worker gate rule for grammar/precedence/fail-closed |
| T5 | Cursor Agent | GPT-class coding agent | implement | mixed | Added `scripts/check-when-expression.ts`, registered in guards/package.json as `check:when` |
| T6 | Cursor Agent | GPT-class coding agent | implement | mixed | Migrated four OR keep-sites to parenthesized `when`; bumped workflows submodule pin |
| T7 | Cursor Agent | GPT-class coding agent | implement | mixed | Stealth isolation guard imports shared when-expression module |

## Attestation

- **Timestamp:** 2026-08-01T14:58:47Z
- **Certifier:** Mike Clay <mike.clay@shielded.io>
- **Option:** certify
