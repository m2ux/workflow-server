# Specimen workflows

A specimen is a worked example of a form. An author copies from it when creating a workflow that needs that form, and a test drives it so the form stays loadable and observable. Specimens are still workflows — they have a definition, activities and techniques — but they are not part of the product list an operator starts.

They sit here, under `corpus/`, so they travel with the other definitions. Discovery skips any directory named `specimens`, so a walk of `corpus/` or of the branch root does not list them. Pointing `--root` or `--workflow-dir` at this folder is how a job reaches them.

## Contents

- [`fan-conformance/`](fan-conformance/) — a specimen of graph fanning: an orchestrator opens every branch in one turn, each branch has its own identity, and convergence is taken from the record rather than judged by the agent. Its README names the two readers: someone checking that fanning works, and someone writing a fan of their own.

