# Specimen workflows

Some workflows exist only so a test can drive a known shape. They are still workflows — they have a definition, activities and techniques — but they are not part of the product list an operator starts.

They sit here, under `corpus/`, so they travel with the other definitions. Discovery skips any directory named `specimens`, so a walk of `corpus/` or of the branch root does not list them. Pointing `--root` or `--workflow-dir` at this folder is how a job reaches them.

## Contents

- [`fan-conformance/`](fan-conformance/) — a specimen that makes fanning observable: an orchestrator opens every branch in one turn, each branch has its own identity, and convergence is taken from the record rather than judged by the agent.
