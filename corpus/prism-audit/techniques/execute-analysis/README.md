# Execute Analysis

> Part of [techniques](../README.md)

Composes each audit scope's analysis trigger context and records the resulting run into the audit's accumulators, so finalization holds the run's contract artifacts and the status it….

The shared contract every technique here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`accumulate-analysis-run`](accumulate-analysis-run.md) | One completed analysis run recorded into the audit's accumulators, so finalization consolidates every scope from a single place |
| [`compose-trigger-context`](compose-trigger-context.md) | Resolves the context one audit scope's analysis run is dispatched with |
