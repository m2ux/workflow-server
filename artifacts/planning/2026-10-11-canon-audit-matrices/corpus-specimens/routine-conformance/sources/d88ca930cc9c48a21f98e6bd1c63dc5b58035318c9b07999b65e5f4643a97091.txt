# Merge Scan Findings

> Part of [techniques](../README.md)

Merge findings from multiple scanner agents into a unified set: deduplicate findings sharing the same file, line, and pattern.

The shared contract every technique here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`correlate-patterns`](correlate-patterns.md) | Correlate compound vulnerability chains across patterns, creating compound findings that capture the full attack chain and preserve all constituent pattern evidence |
| [`deduplicate`](deduplicate.md) | Merge duplicate findings sharing the same file, line, and pattern, keeping the most complete evidence and recording the duplicate mappings for reconciliation |
| [`load-outputs`](load-outputs.md) | Load every scanner output and extract its findings array |
| [`reconcile`](reconcile.md) | Map every scanner finding to its merged finding and confirm zero unaccounted findings for every scanner |
| [`write-output`](write-output.md) | Write the unified finding set, reconciliation table, and observation list to the planning folder |
