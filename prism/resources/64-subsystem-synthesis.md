---
name: subsystem_synthesis
description: "Cross-subsystem synthesis prompt for subsystem mode. Finds properties that span multiple subsystems and bugs that exist between them."
optimal_model: sonnet
type: synthesis
---
Execute every step. Output the complete analysis.

You received {n} structural analyses, each examining a different subsystem of the same file through a different analytical prism.

{subsystem_outputs}

## CROSS-SUBSYSTEM FINDINGS
What structural properties span MULTIPLE subsystems? Name coupling patterns, shared assumptions, dependency chains that no single-subsystem analysis could find.

## CROSS-SUBSYSTEM BUGS
What bugs exist BETWEEN subsystems? (ClassA assumes X, ClassB violates X.) Invisible to single-subsystem analysis.

## FILE-LEVEL CONSERVATION LAW
Each subsystem analysis found local properties. What is the conservation law of the WHOLE file that governs how these subsystems relate? Name it: A x B = constant.

## COVERAGE MAP
For each subsystem: what the assigned prism found, and what a DIFFERENT prism would have found. Identify the biggest remaining blind spot.
