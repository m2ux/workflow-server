---
metadata:
  version: 1.1.0
---

## Capability

The repository's definition guards run against one target, with every resolvable failure resolved.

## Outputs

### fail_count

Number of definition files a guard rejected, counted after every resolvable failure has been resolved. Zero when the whole suite is clean against the target.

## Protocol

### 1. Run the Definition Guards

- Run the whole suite against the tree this run edits: `npx tsx guards/check-all.ts --root {target_path} --corpus-only`. The registry in `guards/guards.ts` is the roster, each entry carrying the one line stating what it proves.
- The root resolves from `--root`, then `WORKFLOWS_DIR`, then a default relative path. An empty `--root` is treated as absent and falls back to that default, which is a checkout the run never touched.

### 2. Resolve the Failures

- Record each rejection with the guard that raised it and the message it printed, then correct the definition and re-run that guard with `--only <id>`
- A guard reporting against a committed baseline fails only on violations beyond it; a violation that is genuinely intended is recorded as a finding for disposition rather than baselined away here

## Rules

### guard-green-is-narrow-evidence

A clean guard is evidence only for the form that guard matches. Two known blind spots stand: a resource reference in already-projected form carries no `.md` and is invisible to the anchor guard, and an unresolvable resource is skipped at delivery with no warning at all. Treat an unexplained absence in a delivered payload as a reference defect, not as an empty result.

### guard-green-is-not-canon-green

`{fail_count}` zero never implies the criteria walk is complete or that `{open_finding_count}` may be treated as zero. Canon coverage is decided only by `{coverage_ledger}` under [audit-canon](./audit-canon.md) (including audit-canon.walked-requires-evidence). Description-hygiene and other mechanical nets catch a subset of Detect; they do not replace the Description Hygiene enumeration unit.
