# Corpus survey — activity representation

> Measured 2026-09-10 against `workflows/` at `af79b8a3`
> (worktree `2026-09-09-parallel-activities`).

## Method

Every `*.yaml` under a `workflows/*/activities/` directory, parsed with PyYAML for
structural counts and scanned line-wise for byte attribution. Loop bodies are walked
recursively, so a step nested in a loop counts once at its own depth. Scripts are in
[scripts/](scripts/); each takes the workflows root as its argument.

| Script | Produces |
|---|---|
| `measure.py` | File, step and kind counts; step-id classification |
| `bytes.py` | Byte attribution by top-level section and by step field |
| `dup.py` | Variable declaration duplication; step-id proximity buckets |
| `ids.py` | Droppable vs load-bearing step ids |
| `refs.py` | Technique reference forms (string/structured × bare/qualified) |

## Corpus shape

117 activity files · 451,365 bytes · 12,526 lines · 966 steps.

| Step kind | Count |
|---|---:|
| technique | 642 |
| action | 160 |
| checkpoint | 114 |
| loop | 50 |

## Byte attribution

### By top-level section

| Section | Bytes | Share |
|---|---:|---:|
| `steps` | 261,619 | 58.0% |
| `variables` | 119,745 | 26.5% |
| `outcome` | 37,369 | 8.3% |
| `description` | 13,540 | 3.0% |
| `exits` | 8,774 | 1.9% |
| `name` | 3,005 | 0.7% |
| `id` | 2,371 | 0.5% |
| `version` | 1,777 | 0.4% |
| `required` | 1,223 | 0.3% |
| `triggers` | 1,031 | 0.2% |
| `techniques` | 911 | 0.2% |

### By field inside `steps`

| Field | Bytes | Lines | Share of `steps` |
|---|---:|---:|---:|
| (continuation lines) | 35,444 | 786 | 13.6% |
| `message` | 35,015 | 300 | 13.4% |
| `id` | 34,871 | 1,232 | 13.4% |
| `description` | 22,671 | 276 | 8.7% |
| `technique` | 21,836 | 642 | 8.4% |
| `kind` | 19,428 | 966 | 7.4% |
| `when` | 14,028 | 246 | 5.4% |
| `name` | 11,836 | 273 | 4.5% |
| `label` | 10,274 | 266 | 3.9% |

`kind` is exactly one line per step, so its 19,428 bytes are the whole cost of the
discriminator.

## Step ids

### Distance from the derivable default

The default is the last `::` segment of the technique reference. A "collision" is a
scope in which two technique steps resolve to the same default.

| Relation of authored id to the derived default | Count | Share |
|---|---:|---:|
| Exactly the default | 199 | 31.0% |
| Near-synonym (≥0.6 sequence similarity) | 165 | 25.7% |
| Shares a word | 123 | 19.2% |
| Default collides in scope — a distinct id is forced | 84 | 13.1% |
| Genuinely distinct name | 71 | 11.1% |

Examples of each, in order: `apply-severity` ← `apply-severity`;
`discover-workflows` ← `discover-files`; `coverage-gate` ← `verify-file-coverage`;
three steps binding `orchestration-patterns::dispatch-workers` in one activity;
`severity-crosscheck` ← `calibrate`.

### Droppable under derive-and-name-collisions

| | Count | Authored bytes |
|---|---:|---:|
| Default unique in scope — **id droppable** | 555 | 16,723 |
| Default collides — id load-bearing | 87 | — |

Of the 555 droppable: 196 already write the default verbatim, 165 are near-synonyms
the default reads fine for, 194 carry an authored name that differs enough to be a
judgement call at migration time.

The 87 exceeds the 84 collision count above because three steps write the default
verbatim in a scope where another step binds the same technique under a renamed id —
the default collides, but the authored ids do not.

## The injector never fires

| Step authored as | Count |
|---|---:|
| `- kind: technique` first | 672 |
| `- technique:` first | 0 |

`injectResolvedStepIds` (`src/schema/activity.schema.ts:234`) matches
`^(\s*)- technique:[ \t]*(.+)$`. No corpus step matches it. The function is referenced
only from `src/tools/workflow-tools.ts:1399` and from no test.

Consequence: a step that omits its id gets one from `populateStepIds`
(`src/schema/activity.schema.ts:193`) server-side, but the YAML `get_activity`
delivers carries no id line, so the worker cannot name the step for
`get_technique { step_id }` or for `completed_steps`. That is why 0 of 642 technique
steps omit an id despite the schema declaring it optional
(`src/schema/activity.schema.ts:97`).

## Technique reference forms

| Binding form | Qualified with `::` | Bare | Total |
|---|---:|---:|---:|
| String | 213 | 206 | 419 |
| Structured (`{ name, inputs, outputs }`) | 169 | 54 | 223 |
| **Total** | **382** | **260** | **642** |

260 of 642 (40%) carry no `::`. A rule keyed on the separator would misread all of
them; a rule keyed on the `technique` field name reads all 642 correctly.

## Variables (context for the deferred item)

| | Value |
|---|---:|
| `variables.reads` bytes | 14,798 |
| `variables.writes` bytes | 103,660 |
| Distinct `(workflow, name)` write declarations | 462 |
| Declared in more than one activity of the same workflow | 76 |
| — of those, byte-identical across copies | 74 |
| — of those, **divergent** across copies | 2 |
| Bytes in the 2nd..Nth copies | 20,946 |

The two divergent names are `workflow-authoring/impact_analysis` (3 copies, 3 variants)
and `work-package/stakeholder_overview` (2 copies, 2 variants). Type and default
disagreements fail the load; description drift does not.

`check-activity-variables.ts` passes at hard zero on this corpus, which means the
declared read and write sets exactly equal the sets `deriveActivityContract`
(`src/utils/activity-variables.ts:417`) computes from the steps. See
[03-variables-deferred.md](03-variables-deferred.md).
