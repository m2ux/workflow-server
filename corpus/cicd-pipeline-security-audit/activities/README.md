# Cicd Pipeline Security Audit Activities

> Part of [cicd pipeline security audit](../README.md)

What this folder holds, and what each member contributes. The order work runs in belongs to whatever binds them, not to this index.

| Activity | Carries |
|---|---|
| [`01-scope-setup`](01-scope-setup.yaml) | Set up the audit scope and planning folder |
| [`02-reconnaissance`](02-reconnaissance.yaml) | Classify discovered workflows and assign scanner agents |
| [`03-primary-scan`](03-primary-scan.yaml) | Gather the per-submodule scanner branches and merge their findings |
| [`04-report-generation`](04-report-generation.yaml) | Produce the final CI/CD security audit report |
| [`05-sub-workflow-scan`](05-sub-workflow-scan.yaml) | Scan the assigned submodule's workflow files for the seven detection patterns |
| [`06-sub-verification`](06-sub-verification.yaml) | Verify scan completeness across all scanner outputs |
| [`07-sub-merge`](07-sub-merge.yaml) | Merge scanner outputs into a unified finding set |
