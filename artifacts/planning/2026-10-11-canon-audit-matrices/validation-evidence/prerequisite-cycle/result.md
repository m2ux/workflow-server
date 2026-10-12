# Prerequisite-index cycle: the prediction is wrong, and the reason is positional

**Four walks ran and were scored. The recorded prediction — ordering holds in all four — is falsified: three walks failed two cited pairs each. The failures are the same two pairs in every case, and their cause is not the citation but where the cited section sits in the file.**

The [plan](plan.md) and its amendment were committed at `bf88e1ce` and `6347f5a6`, before any worker launched.

## Ordering, the targeted question

| Walk | Cited pairs reached | Failed | Satisfied inside one range |
| --- | ---: | ---: | ---: |
| Author one | 32 | 2 | 30 |
| Author two | 28 | 0 | 25 |
| Audit one | 32 | 2 | 30 |
| Audit two | 32 | 2 | 30 |

Every failure is one of two pairs: `run-corpus-checks` needing `canon-check-conventions`, and `run-option-coverage` needing the same. Author two failed neither because it never reached either specification.

## Why those two and nothing else

The catalog's own line order decides it. `Canon Check Conventions` sits at line 493.

| Specification | Line | Cites | Prerequisite line | Direction | Result |
| --- | ---: | --- | ---: | --- | --- |
| `Run Project Check` | 272 | `#common` | 5 | backward | pass |
| `Run Corpus Checks` | 384 | `#canon-check-conventions` | 493 | **forward** | **fail** |
| `Run Option Coverage` | 398 | `#canon-check-conventions` | 493 | **forward** | **fail** |
| `Run Guard Suite` | 599 | `#canon-check-conventions` | 493 | backward | pass |
| `Run Guards on the Delta` | 610 | `#canon-check-conventions` | 493 | backward | pass |

A reader consuming the file in order meets a backward citation's target before the specification citing it, and a forward citation's target after. Two specifications cite forward; those two are exactly the two that fail, in every walk that reaches them. No other cited pair fails anywhere.

## What this establishes

A point-of-use prerequisite citation is necessary and not sufficient. It tells a reader what to read; it does not change the order in which a sequential read delivers it. Where the cited section already precedes its citer, the citation holds. Where it follows, the citation is advice the reader has already passed by.

The operation that motivated this change behaves as intended. `Run Project Check` carried no prerequisite at all and failed ordering in three of four walks of the previous cycle; it now cites `#common` at line 5 and passes in every walk reaching it. That part of the diagnosis survives.

The earlier judgement that file position was secondary once a point-of-use citation existed does not. Position is the deciding variable for exactly the pairs that fail, and the citation is what made them measurable.

## The indicated repair, untested

Moving `Canon Check Conventions` under the `## Conventions` heading at the top of the catalog would place it ahead of all five operations and turn both forward citations backward. That is the same consolidation deferred earlier on the grounds that the section sat near the commands it serves; the measurement contradicts that reasoning, since the two specifications it sits nearest are the two it fails.

This is an indicated repair, not a verified one. It is recorded here and not applied, because applying it inside the cycle that measured the defect would leave the fix unmeasured in turn.

## What the passes are worth

Of 124 intra-file pairs across the four walks, 115 resolved inside a single call. Three walks read the catalog whole in one command, so every pair they reached was settled by that one read's internal line order. Only Author two, which read the catalog in pieces, shows a pair resolving across separate calls, and only three times.

A pair settled inside one bulk read would have settled identically with no citation present. The citation did no work that this measurement can see. So the cycle's roughly 120 passes are not evidence that point-of-use citation routes a reader; they are evidence that a reader who loads the file gets its earlier lines first.

The failures are the opposite. A forward citation fails even under a bulk read, because no amount of reading breadth changes which line comes first. That is why the negative result is solid and the positive one is not.

## The one citation that crosses a document

Exactly one prerequisite citation in the skill names another file: `plan-audit-assignments` cites `audit-dispatch.md#sizing`. Three walks delivered that section before the specification citing it; one delivered it after.

A cross-document citation cannot be satisfied by file-order accident, since the target is not in the file being read. It can still be satisfied by breadth: a reader who opens `audit-dispatch.md` because the procedure needs it receives `#sizing` whether or not it acted on the citation, and that is what these three traces show. The confound changes shape and does not disappear.

The consequence for the convention is narrow and useful. A citation is load-bearing exactly where its target would otherwise go unread. Where the target sits in a document the reader opens anyway, the citation is decorative, and no walk can distinguish a reader that followed it from one that did not. Any future test of citation efficacy needs a cited target that broad reading does not already reach; absent that, the instrument can only detect citations failing, never succeeding.

## Strict disclosure, the standing gate

Not scored here. Ordering is decided by delivery order, which the trace settles; the gate turns on whether retrieved content was necessary, which needs the per-section necessity judgement the earlier reviews performed by hand. The four traces are retained for it. Nothing in this cycle reopens the gate, and the earlier failures stand.

## Limits

Four walks measure neither consistency nor a rate. The scenario pairs a real corpus with a fixture-dialect checker that cannot run against it, which three walks independently measured and reported; the mismatch does not affect ordering, which depends on which sections were retrieved rather than on whether a check would pass, but the scenario is less realistic than intended. The projection observes retrieval, never comprehension.

Two normaliser defects were found and fixed while scoring, both of which had silently hidden reads: a relative path following a `cd`, and a flag between a command and its path. Both were found because unrecognised commands are reported rather than dropped. A third shape may remain.

## What the repair became

The catalog is distributed rather than reordered. Each reference file carries the command specifications its own procedure runs, under its own conventions, and skill-wide conventions sit in a 33-line `command-conventions.md` that every mode reads once. The largest file falls from 653 lines to 256, and the skill loses 62 lines in all, almost every one of them a citation.

This settles the measured defect without the move the cycle recorded. `Run Corpus Checks`, `Run Option Coverage` and the canon check conventions they cite now share one file, so neither citation crosses a boundary a sequential reader can lose. The ordering question stops arising, which is a stronger outcome than turning the two citations backward.

The passes are what justified the larger change. A convention reachable only through a citation that 115 of 124 pairs never needed is a convention the file layout was already supplying. Distributing the catalog supplies it by position, to the reader this instrument observed: one that takes the file.

Intra-file prerequisite citation is gone from the skill, and the guideline that introduced it is retired in favour of one that admits a citation only where the target sits in another file. One such citation remains, `plan-audit-assignments` to `audit-dispatch.md#sizing`, which is the configuration this cycle found load-bearing.

Delivered at `be7bf1ab` and `ff1c0518` on `skill/canon-audit-matrices`. Static checks at those bytes: 195 local links in the skill, 71 audit and edit-guard tests, three mode-summary tests. No walk has been run against the distributed layout, so the volume prediction it implies is unmeasured.
