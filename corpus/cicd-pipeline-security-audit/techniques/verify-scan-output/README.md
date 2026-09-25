# Verify Scan Output

> Part of [techniques](../README.md)

Verify scan completeness by cross-referencing all scanner outputs against the workflow file inventory and pattern catalog, identifying gaps (unscanned files, skipped patterns, malformed….

The shared contract every technique here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`produce-gap-report`](produce-gap-report.md) | Compile all gaps and the per-file/per-pattern status into the gap report with coverage status and re-scan recommendations, recording the report as complete only when zero gaps remain |
| [`validate-structure`](validate-structure.md) | Load and structurally validate every scanner output against the output schema, counting malformed or missing-field outputs as gaps |
| [`verify-file-coverage`](verify-file-coverage.md) | Confirm every workflow file in scope was scanned by diffing the set of scanned files against the workflow inventory to identify any unscanned files |
| [`verify-pattern-coverage`](verify-pattern-coverage.md) | Identify any scanner that skipped a detection pattern by checking each output's coverage section for all seven patterns (P1-P7) |
