# Prism Techniques

> Part of the [prism workflow](../README.md)

Each operation here applies a lens, plans which lens to apply, or turns what the passes produced into something a reader or a consuming workflow can use. The lens prompts themselves are [resources](../resources/README.md); a technique is how one is loaded, applied and read.

[`TECHNIQUE.md`](TECHNIQUE.md) holds the inputs every operation inherits and the invariants every one of them is held to — pass isolation, evidence, and write discipline.

---

## Planning a run

| Technique | Answers |
|-----------|---------|
| [`plan-analysis`](plan-analysis.md) | Which lens the goal calls for, at what depth, over how many units |

## Applying a lens

| Technique | Applies |
|-----------|---------|
| [`structural-analysis`](structural-analysis.md) | The L12 structural lens — conservation law, meta-law, bug table |
| [`single-lens-analysis`](single-lens-analysis.md) | One named lens, where the goal wants one reading |
| [`portfolio-analysis`](portfolio-analysis.md) | Several complementary lenses for breadth |
| [`dispute-analysis`](dispute-analysis.md) | Two orthogonal lenses, and the disagreement between them |
| [`reflect-analysis`](reflect-analysis.md) | A meta-analysis over a prior pass's output |

## Multi-pass modes

Each folder holds one mode's chain: a container contract and the passes beneath it.

| Group | Runs |
|-------|------|
| [`full-prism`](full-prism/README.md) | Structural, then a challenge to it, then the reconciliation |
| [`behavioral-pipeline`](behavioral-pipeline/README.md) | Four behavioural lenses, then their convergence |
| [`subsystem-analysis`](subsystem-analysis/README.md) | Decompose, calibrate per region, execute, synthesise |
| [`verified-analysis`](verified-analysis/README.md) | Analyse, detect and extract gaps, re-analyse against them |
| [`smart-analysis`](smart-analysis/README.md) | A chain assembled from the target rather than from the caller |
| [`adaptive-analysis`](adaptive-analysis/README.md) | Depth escalation, stopping at the first adequate signal |

## Closing a run

| Technique | Produces |
|-----------|----------|
| [`generate-report`](generate-report.md) | The reader-facing report and the definitive findings |
| [`link-report-references`](link-report-references.md) | The report's citations, resolved against the target |
| [`emit-run-manifest`](emit-run-manifest.md) / [`read-run-manifest`](read-run-manifest.md) | What a run recorded, and what a later run reads back |
| [`accumulate-analysis-run`](accumulate-analysis-run.md) | One completed run appended to the caller's accumulators, including a partial or error run |
| [`read-definitive-findings`](read-definitive-findings.md) | The findings contract a consuming workflow reads instead of the raw artifacts |
