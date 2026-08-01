# Change Block Index

> chore/379-when-expressions-parentheses-precedence vs main · 11 files · 13 hunks · est. review ~7 minutes (30 sec/change)

HEAD under review: `8c96d33f51fe35759a5fceca4513dcb634403775`

## Block Rationale

### [Block 1 — .engineering (submodule pin)](https://github.com/m2ux/workflow-server/blob/8c96d33f51fe35759a5fceca4513dcb634403775/.engineering)

Advances the `.engineering` gitlink so the host checkout points at the planning folder and session state for issue #379. No runtime behaviour; keeps PR-linked planning artifacts reachable from the feature worktree.

### [Block 2 — package.json:34](https://github.com/m2ux/workflow-server/blob/8c96d33f51fe35759a5fceca4513dcb634403775/package.json#L34)

Registers `check:when` so the new authoring guard is invokable via npm and the guard registry’s `npmScript` field. One-line script entry only; no dependency changes.

### [Block 3 — check-stealth-isolation.ts:42](https://github.com/m2ux/workflow-server/blob/8c96d33f51fe35759a5fceca4513dcb634403775/scripts/check-stealth-isolation.ts#L42)

Imports `parseWhen` / `evaluateWhenExpression` so stealth reachability analysis uses the same dialect as the walker and unit suite. Prevents a second incomplete `when` parser from drifting on `||` and parentheses.

### [Block 4 — check-stealth-isolation.ts:116](https://github.com/m2ux/workflow-server/blob/8c96d33f51fe35759a5fceca4513dcb634403775/scripts/check-stealth-isolation.ts#L116)

Replaces the local `&&`-only `evalWhen` with parse-then-evaluate against the shared module. Parse failure still returns `undefined` (treat as reachable) so the isolation guard stays conservative rather than failing closed on authoring errors—that strictness lives in `check:when` and the e2e walker.

### [Block 5 — check-when-expression.ts:1](https://github.com/m2ux/workflow-server/blob/8c96d33f51fe35759a5fceca4513dcb634403775/scripts/check-when-expression.ts#L1)

New corpus guard: walks every activity YAML `when:` string through `assertWhenAuthoring`, failing on parse errors and bare mixed `&&`/`||` at the same nesting depth. Closes the authoring gap that docs already described before the evaluator existed.

### [Block 6 — guards.ts:133](https://github.com/m2ux/workflow-server/blob/8c96d33f51fe35759a5fceca4513dcb634403775/scripts/guards.ts#L133)

Adds the `when-expression` guard spec (`check:when`, corpus scope) so `check:all` / `check:delta` include the new check with a stated proof obligation.

### [Block 7 — activity.schema.ts:74](https://github.com/m2ux/workflow-server/blob/8c96d33f51fe35759a5fceca4513dcb634403775/src/schema/activity.schema.ts#L74)

Expands the Zod `when` field description to the full grammar card: operators, C-style precedence, mixed-ops parentheses rule, fail-closed mechanical nets, and nested production examples. Schema still stores a free string; agents remain the production evaluators.

### [Block 8 — when-expression.ts:1](https://github.com/m2ux/workflow-server/blob/8c96d33f51fe35759a5fceca4513dcb634403775/src/schema/when-expression.ts#L1)

Reference recursive-descent module: tokenize, parse with C-style precedence, evaluate against the bag, and `assertWhenAuthoring` for mixed-ops parentheses. Single source of truth for walker, stealth guard, unit tests, and the corpus check. Fail-closed evaluation returns false on invalid input so mechanical nets skip the step rather than pass through.

### [Block 9 — corpus-sha.json:1](https://github.com/m2ux/workflow-server/blob/8c96d33f51fe35759a5fceca4513dcb634403775/tests/e2e/__snapshots__/corpus-sha.json#L1)

Stamps the e2e corpus baseline after the workflows submodule pin for the four OR keep-site migrations. Expected when definition content changes under the workflows gitlink.

### [Block 10 — walker.ts:19](https://github.com/m2ux/workflow-server/blob/8c96d33f51fe35759a5fceca4513dcb634403775/tests/e2e/walker.ts#L19)

Imports `evaluateWhenExpression` so step `when` gates in the robot worker share the reference dialect with production authoring docs and unit fixtures.

### [Block 11 — walker.ts:295](https://github.com/m2ux/workflow-server/blob/8c96d33f51fe35759a5fceca4513dcb634403775/tests/e2e/walker.ts#L295)

Collapses the prior incomplete `evaluateWhen` / local path helper into a thin wrapper (and removes unused `getVar`). Invalid expressions fail closed (skip), matching the schema description and eliminating dual-walker drift on `||` and parentheses.

### [Block 12 — when-expression.test.ts:1](https://github.com/m2ux/workflow-server/blob/8c96d33f51fe35759a5fceca4513dcb634403775/tests/when-expression.test.ts#L1)

Truth-table and parity suite (PR383-TC-01…11): flat OR, parentheses precedence, bare mixed rejection, unary `!`, literals/paths, bare truthiness, fail-closed junk, the four nested keep-site shapes, structured-condition parity, and flat `&&` regression. The runnable safety floor for the dialect.

### [Block 13 — workflows (submodule pin)](https://github.com/m2ux/workflow-server/blob/8c96d33f51fe35759a5fceca4513dcb634403775/workflows)

Points the workflows gitlink at `workflow/379-when-expressions-parentheses-precedence` after migrating the four OR keep-sites from structured `condition:` to parenthesized `when:`. Definition content lives on the orphan workflows branch; this pin is the host-side delivery handle.
