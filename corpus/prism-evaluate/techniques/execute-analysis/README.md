# Execute Analysis

> Part of [techniques](../README.md)

Composes each execution group's prism trigger context and records the resulting run into the evaluation's accumulators, so the analysis stage holds the run's contract artifacts and its….

The shared contract every technique here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`accumulate-analysis-run`](accumulate-analysis-run.md) | One completed analysis run recorded into the evaluation's accumulators, so consolidation reads every dimension from a single place |
| [`compose-trigger-context`](compose-trigger-context.md) | Resolves the context one execution group's analysis run is dispatched with, translating the evaluation's own terms into the ones that run reads |
