---
metadata:
  version: 1.0.0
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

A clean guard is evidence only for the form that guard matches.

> A resource reference in already-projected form carries no `.md`, so the anchor guard does not see it.

### guard-green-is-not-canon-green

`{fail_count}` zero is a verdict about the guard suite and about nothing else. Canon coverage is decided under `audit-canon.guards-are-not-canon-coverage`.
