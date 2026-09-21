# Write Cicd Report

> Part of [techniques](../README.md)

Format merged, severity-scored findings into a structured markdown CI/CD security audit report.

The shared contract every operation here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`attach-remediation`](attach-remediation.md) | Load the remediation playbook so per-finding remediation steps and before/after code examples are available for the report |
| [`write-report`](write-report.md) | Produce the final audit report: write the executive summary, per-finding details, severity distribution, remediation roadmap, and methodology, then assemble them into the complete report |
