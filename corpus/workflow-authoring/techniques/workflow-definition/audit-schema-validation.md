---
metadata:
  version: 1.1.0
---

## Capability

The repository's definition guards run against one target, with every resolvable failure resolved.

## Outputs

### fail_count

Number of guards still reporting findings, counted after every resolvable failure has been resolved. Zero when the whole sweep is clean against the target.

## Protocol

### 1. Run the Definition Guards

- Run `npx tsx guards/check-all.ts --root {target_path}`. One invocation walks the guard registry, `guards/guards.ts`, and reports the whole sweep in one table. The registry is the single enumeration of what verifies that repository, so a guard added to it is run here by the same command, and a program retired with the mechanism it policed leaves with it.
- Each guard resolves its corpus root from `--root`, then `WORKFLOWS_DIR`, then a default relative path. Pass `--root {target_path}` so every guard reads the tree this run edits; an empty value is treated as absent and silently falls back to that default, which is a checkout the run never touched.
- Add `--corpus-only` where the target holds definitions alone, which drops the guards that read the repository's own files rather than the corpus. Add `--only <id,id>` to re-run named guards while resolving failures.
- The sweep exits 0 clean, 1 with findings, and 2 where a guard could not measure at all. An unmeasured guard is a failed measurement, never a pass, so a run that reports one has not been audited.

### 2. Resolve the Failures

- Record each rejection with the guard that raised it and the message it printed, then correct the definition and re-run that guard with `--only`
- A guard reporting against a committed baseline fails only on violations beyond it; a violation that is genuinely intended is recorded as a finding for disposition rather than baselined away here

## Rules

### guard-green-is-narrow-evidence

A clean guard is evidence only for the form that guard matches. Two known blind spots stand: a resource reference in already-projected form carries no `.md` and is invisible to the anchor guard, and an unresolvable resource is skipped at delivery with no warning at all. Treat an unexplained absence in a delivered payload as a reference defect, not as an empty result.

### guard-green-is-not-canon-green

`{fail_count}` zero never implies the criteria walk is complete or that `{open_finding_count}` may be treated as zero. Canon coverage is decided only by `{coverage_ledger}` under [audit-canon](./audit-canon.md) (including [walked-requires-evidence](./audit-canon.md#walked-requires-evidence)). Description-hygiene and other mechanical nets catch a subset of Detect; they do not replace the Description Hygiene enumeration unit.
