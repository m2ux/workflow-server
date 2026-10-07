# Coverage — AC4 and AC5

The two criteria W02's Coverage names, the test that observes each, and the part of AC4 no test reaches.

## The specified set

| Criterion | Statement | Observed by |
| --- | --- | --- |
| **AC4** | Every contract declares each value with the shape its filling operation publishes. | `tests/operation-contract-guard.test.ts` — the live-corpus run, and the eight fixture cases that prove the guard still fires. Partial: see [the reach of the check](#the-reach-of-the-check). |
| **AC5** | `check-operation-contract` reports nothing against the corpus. | `tests/operation-contract-guard.test.ts` — the live-corpus run, `it.skipIf(!liveCorpusRoot())`, which calls `collectFindings` over the corpus checkout and asserts it empty. |

## What the runs show

**AC5.** `check-operation-contract` over the edited corpus:

```text
npx tsx guards/check-operation-contract.ts --json --root <edited corpus worktree>
→ { "guard": "operation-contract", "findings": [] }
```

The same program over the unedited integration branch reports eleven. The check is the instrument the criterion names, so the criterion is met by the run rather than by a claim about a file.

**The run is a test, not only a command.** `tests/operation-contract-guard.test.ts` carries it. Against the unedited corpus the suite reports `1 failed | 8 passed`, with the failure naming all eleven findings; against the edited corpus, `9 passed`. A test that passes either way would observe nothing, so both directions were run.

**No guard was turned red.** `check:all` over the unedited base and over the edited corpus report the same `58 guard(s) — 53 pass, 5 fail, 0 unmeasured`, the five failures identical in both and each the subject of other work. The whole `vitest run` suite reports `9 failed | 2387 passed` on the base and `8 failed | 2388 passed` on the edited corpus — the difference is this task's own test turning over, and the eight that remain are the same eight, snapshots the corpus branch and the server tree disagree on until they merge. `npm run typecheck` is clean.

## The reach of the check

AC4 says *every* contract declares *each* value with the shape its filling operation publishes. A clean run of `check-operation-contract` is evidence for that only as far as the check reaches, and these are the places where a value's shape is settled by something it does not inspect. They are named here rather than left for the clean run to stand for.

- **Only the scalar-against-members crossing is measured.**
  The check reports a declaration whose type is in [`SCALAR_TYPES`](https://github.com/m2ux/workflow-server/blob/1caa9ff5/guards/check-operation-contract.ts#L62) — `string`, `number`, `boolean` — against an output declaring members. A contract naming `object` where the operation publishes a list, or `array` where it publishes one value, is outside its subject in both directions. 476 of the 1,397 `type:` declarations in the corpus's YAML name `object` or `array`.
- **An output declaring no members is unmeasured either way.**
  By [the check's own reading](https://github.com/m2ux/workflow-server/blob/1caa9ff5/guards/check-operation-contract.ts#L10-L12), an output stating no members states nothing about its shape and so contradicts nothing. Most outputs in the corpus declare none, so for most values AC4 rests on the author rather than on the check.
- **Member names are not compared.**
  The check asks whether the output has members, not which. A contract declaring `object` against an output publishing `a` and `b` passes whatever the contract says the members are. A step's read of a member it was never published is `check-binding-fidelity`'s subject, not this one's.
- **A value a routine step lands is outside the check entirely.**
  `structuredWrites` is populated only on the [technique branch](https://github.com/m2ux/workflow-server/blob/1caa9ff5/src/utils/activity-variables.ts#L661) of the derivation; the routine branch adds the target to `operationWrites` and nothing else. A routine signature declares typed outputs, and the referring activity declares the target it binds them to, so the two could disagree — and this check would not say so. The corpus holds 110 routine steps across 92 definition files.
- **A checkpoint, a `set` action and a loop variable fill values the check does not grade.**
  Each reaches the bag through `write()` alone. A `setVariable` effect or a `set` action whose value is a structure, declared a string, is not this check's finding.
- **A workflow-level declaration is not held against an operation.**
  The check iterates [the activity's own `variables.writes`](https://github.com/m2ux/workflow-server/blob/1caa9ff5/guards/check-operation-contract.ts#L104-L106). A name declared in `workflow.yaml` contributes to the namespace and is never compared with the output that fills it.
- **A technique the composer cannot read contributes nothing.**
  `readSignature` returns the empty signature on a failure and logs a warning. A workflow the loader refuses is reported as a `workflow-load` finding, so that case is not silent — an unreadable technique inside a loadable workflow is.

What the clean run does establish for AC4: across every value a technique step lands and an activity contract declares, no contract calls a value a scalar where the technique filling it publishes members. That is the whole of the crossing [#875](https://github.com/m2ux/workflow-server/issues/875) identified, and it is the claim AC5 makes precise.

## Not this task's criteria

AC6 and AC7 — the check in the standard sweep, and the registry entry that exempts it — are W03's. Until then nothing but this task's own test runs the check over the corpus, which is why the test asserts the zero rather than deferring to the sweep.
