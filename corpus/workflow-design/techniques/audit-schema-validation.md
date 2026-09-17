---
metadata:
  version: 1.2.0
---

## Capability

JSON-schema and loader reference-resolution validation across a workflow's YAML files.

## Outputs

### pass_count

Count of YAML files that passed schema validation.

### fail_count

Count of YAML files that failed schema validation.

## Protocol

### 1. Run the Definition Guards

- Run the whole suite over the tree under review: `npx tsx guards/check-all.ts --root <workflows-dir> --corpus-only`. The registry in `guards/guards.ts` is the roster, each entry carrying the one line stating what it proves
- `<workflows-dir>` is the corpus root of the tree under review. A guard resolves its corpus as `--root` > `WORKFLOWS_DIR` > the server checkout's own corpus, so an omitted root measures that checkout and reports a clean pass on definitions the review never looked at
- Record pass/fail per guard with the message it printed; resolve every failure. Set `{pass_count}` and `{fail_count}`

### 2. Triage the Binding-Fidelity Findings

- A binding-fidelity finding the guard has no verdict for is reported as untriaged. Give it one in `ledgers/binding-fidelity-triage.json` of the pointed corpus — `harmless`, `fix-later`, or `live-bug`, each against a named rationale — so an accepted finding and a real defect stop being the same silence. Classification is a human judgement: there is no flag that suppresses a finding without one
