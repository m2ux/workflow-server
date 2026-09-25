# Compose Evaluation Report

> Part of [techniques](../README.md)

Consolidates the per-dimension findings of sibling analysis runs into one evaluation of the target, adding the reading no single run reaches: what holds across dimensions.

The shared contract every technique here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`compile-delivery-metrics`](compile-delivery-metrics.md) | Compiles what the evaluation amounts to in figures, and an index of every artifact it produced, so the delivery names both |
| [`compose-report`](compose-report.md) | Renders the consolidated evaluation as the standalone document its reader decides from |
| [`extract-findings`](extract-findings.md) | Draws each dimension's findings out of its analysis run and into the report's per-dimension sections, under the identities the run gave them |
| [`identify-patterns`](identify-patterns.md) | Reads the findings against each other to name the one insight that explains the most of them, and the patterns spanning more than one dimension |
| [`verify-report`](verify-report.md) | Checks the written report against the invariants its readers depend on — unique findings, counts that agree, and no methodology showing through |
