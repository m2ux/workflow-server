# Orchestrate Package Execution

> Part of [techniques](../README.md)

Trigger and manage work-package workflow instances for each planned package in priority order, spanning iteration initialization and per-package execution.

The shared contract every operation here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`execute-package`](execute-package.md) | Select the highest-priority unstarted package, trigger its work-package workflow, update the roadmap status on completion, and advance the remaining/completed sets |
| [`initialize-iteration`](initialize-iteration.md) | Prepare the ordered list of packages not yet started and initialize the overall-progress indicator from the priority order and completed set |
