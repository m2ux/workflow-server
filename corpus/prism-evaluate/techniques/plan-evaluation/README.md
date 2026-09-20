# Plan Evaluation

> Part of [techniques](../README.md)

Turns an evaluation request into a runnable plan: what the target is, which dimensions judge it, and the prism configuration each dimension takes.

The shared contract every operation here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`classify-target`](classify-target.md) | Classify an evaluation target from its path, resolving the target type that governs which dimension set and survey approach apply |
| [`collect-scope`](collect-scope.md) | Establishes the evaluation scope from the user's request — what to evaluate, against what goals, and where the artifacts land |
| [`create-output-folder`](create-output-folder.md) | Materialises the evaluation's output directory, so the artifacts have somewhere to land |
| [`derive-dimensions`](derive-dimensions.md) | Settles the evaluation dimensions — validating the ones supplied, or deriving a set from the target's kind and the evaluation's goals |
| [`group-for-execution`](group-for-execution.md) | Collects the planned dimensions into the execution groups the analysis stage triggers, one run per group |
| [`map-dimensions-to-lenses`](map-dimensions-to-lenses.md) | Fixes each dimension's prism configuration — its pipeline mode, lenses, analysis focus, and output location — as the machine-readable plan the analysis stage runs from |
| [`summarize-scope`](summarize-scope.md) | Gathers the settled evaluation scope into one summary a reader can judge in a single pass |
| [`survey-target`](survey-target.md) | Survey the target's structure, claims, and key topics, so each dimension's analysis focus can name content the target actually holds |
| [`write-evaluation-plan`](write-evaluation-plan.md) | Renders the settled plan as the human-readable document a reader approves the evaluation from |
