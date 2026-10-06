# Measurements

Every tick this record supports comes from one of the runs below. Both branches are at their `origin` tips: `main` at `9f536289` and `workflows` at `38bc4aea`.

## Standard sweep, before and after #1155

The sweep runs from a `main` checkout with `--root` naming the definitions checkout.

```bash
npx tsx guards/check-all.ts --root <workflows-checkout>
```

| Corpus | Result |
| --- | --- |
| `ccdaa64d` — `workflows` before #1155 | 58 guards, 55 pass, 3 fail |
| `38bc4aea` — `workflows` after #1155 | 58 guards, 58 pass, 0 fail |

The three that failed:

- `activity-variables` — `strategic-review` declares a write of `strategic_review_findings` that no step produces.
- `binding-fidelity` — a triaged `orphan-input` finding no longer occurs, and the ledger still names it.
- `repeated-runs` — a 3-step run at the top level in 3 activity files that no baseline entry classifies.

This is what keeps E07 AC1: the activity-variables guard reports no findings against the corpus.

## Server suite against the served corpus

```bash
WORKFLOWS_DIR=<workflows-checkout> npm run test:ci
```

At `main` `9f536289` against `workflows` `38bc4aea`: **137 test files passed, 2 skipped; 2388 tests passed, 6 skipped.** The twenty failures #1158 opens on are gone, and no corpus-reading test is skipped.

This is what keeps E10 AC4.

## Fires-on reach of AP-166

```bash
npx tsx guards/list-fires-on.ts --root <workflows-checkout> routine.steps
```

Lists `corpus/canon/resources/anti-patterns.md:2435 AP-166. inherited-input-never-spent`. The entry's Fires-on line names `technique.inputs`, `technique.inherited_inputs`, `technique.protocol`, `technique.rules`, `activity.steps`, `routine.steps` and `workflow.variables`.

This is what keeps E09 AC11.

## Named tests

| Criterion | Test |
| --- | --- |
| E09 AC10 | The entry at `corpus/canon/resources/anti-patterns.md:2429`, with its Detect, Do-not-flag and Fix |
| E10 AC1, AC2 | `tests/declared-values.test.ts` — four cases over the citation, a citation of another output, and the unassigned and reassigned ones |
| E10 AC3 | `tests/batch-loop-walk.test.ts:415` — reads every body step, and reads no step the body dropped |
