# Score Cicd Severity

> Part of [techniques](../README.md)

Score CI/CD pipeline vulnerabilities using a two-dimensional rubric — Impact (what damage can result) x Exploitability (how easily an attacker can trigger it) — calibrated against….

The shared contract every operation here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`apply-severity`](apply-severity.md) | Score every finding on the Impact x Exploitability rubric: load the matrix, assess each finding's impact and exploitability tiers, and elevate compound findings |
| [`calibrate`](calibrate.md) | Cross-check severity assignments against the campaign calibration anchors, adjust any finding that diverges by two or more levels, and emit the calibrated findings |
