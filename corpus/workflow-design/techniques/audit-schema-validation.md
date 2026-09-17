---
metadata:
  version: 1.3.0
---

## Capability

The repository's definition guards run against the tree under review, with every failure resolved.

## Outputs

### pass_count

Count of guards reporting clean against the tree under review.

### fail_count

Count of guards reporting findings, after every resolvable failure has been resolved.

## Protocol

### 1. Sweep the Tree

- Run `npx tsx guards/check-all.ts --root <workflows-dir>`. One invocation walks the guard registry, `guards/guards.ts`, and reports the sweep in one table — schema validation of every definition file, reference resolution through the loader, binding fidelity, and every other check that registry holds. A guard added there is run by the same command
- `<workflows-dir>` is the corpus root of the tree under review. Every guard resolves its corpus as `--root` > `WORKFLOWS_DIR` > the server checkout's own `workflows/`, so an omitted root measures that checkout and reports a clean pass on definitions the review never looked at
- Set `{pass_count}` and `{fail_count}` from the table. A guard the sweep could not measure is neither: the run exits 2 and the audit is incomplete until it measures

### 2. Resolve the Findings

- Record each finding with the guard that raised it and the message it printed, correct the definition, and re-run that guard with `--only <id>`
- A finding the binding guard has no verdict for is reported as untriaged. Give it one in `ledgers/binding-fidelity-triage.json` of the pointed corpus — `harmless`, `fix-later`, or `live-bug`, each against a named rationale — so an accepted finding and a real defect stop being the same silence. Classification is a human judgement: there is no flag that suppresses a finding without one
