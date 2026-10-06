# Orchestrate Package Execution

> Part of [techniques](../README.md)

Trigger and manage work-package workflow instances for each planned package in priority order, spanning iteration initialization, per-package execution, and the roadmap record each package leaves.

The shared contract every technique here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`execute-package`](execute-package.md) | Select the highest-priority unstarted package and trigger its work-package workflow |
| [`initialize-iteration`](initialize-iteration.md) | Prepare the ordered list of packages not yet started and initialize the overall-progress indicator from the priority order and completed set |
| [`record-package-progress`](record-package-progress.md) | Record a package the child walk has finished: its planning-folder path, its place in the roadmap, and what remains |
