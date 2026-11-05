## Overview

Work Planner declares the heading steps, inline HTML invocations and linked contracts used by its converted documents. Its guidelines, rule mappings and source readers follow that installed model, so conversion-only declarations cannot mask a regression.

## Changes

The installed declaration defines the converted document families and supplies the model consumed by the checker and source readers.

### Installed Style Model

- **Declared document families.**
  Entry point sections, numbered heading steps, inline HTML commands, family preambles, Apply/Follow routing and linked artifact contracts are declared together.
- **Aligned guidelines.**
  Writing rules describe the installed structure and retain execution, prerequisites, checkout and ownership conditions.

### Source Reader Validation

- **One declaration authority.**
  Real-corpus readers select the installed model; synthetic controls state only their fixture declarations.
- **Meaningful source coverage.**
  Script reach, operation interfaces, fetched epic-base inputs and checkout propagation remain observable, with declaration-removal and literal-isolation controls.

## Test Plan

| Test | Description | Coverage | Pass |
| --- | --- | --- | --- |
| T1 | Ordinary installed whole-skill checker, without overrides | AC8 | [✓](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-05-1616-i17-e01-w08-activate-the-work-planner/validation.md#installed-model-check) |
| T2 | Complete Work Planner suite and final guideline consumer checks | AC8 | [✓](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-05-1616-i17-e01-w08-activate-the-work-planner/validation.md#work-planner-suite) |
| T3 | Complete shared checker suite | AC8 | [✓](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-05-1616-i17-e01-w08-activate-the-work-planner/validation.md#shared-checker-suite) |
| T4 | Final-head declaration, preserved source and documentation delta audit | AC8 | [✓](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-05-1616-i17-e01-w08-activate-the-work-planner/validation.md#source-and-head-audit) |

## References

- **R1.** [Implementation and evidence](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-11-05-1616-i17-e01-w08-activate-the-work-planner) — design, exact verification boundaries, required-context trace and Partial bounded disclosure observations.
