# I04 Branch Separation — October 2026

> Delivery follow-up · Created 2026-10-12

## Executive Summary

I04's work reaches `main` and `workflows` as one pull request per epic. Each epic base holds the net change its own task pull requests contributed to the integration tree, measured against the long-lived branch, with nothing of any other epic in it.

The initiative integration branches `i04/main` and `i04/workflows` are retired, along with the epic bases that held no residual work.

## Reconstruction

The integration trees carried twelve epics' task pull requests merged together. Separation reads each base's merge history, attributes every changed file to the epic that owns it, and rebuilds one branch per epic on the long-lived tip.

- **Single-owner files** take the net diff from the integration branch point to its tip, so a file an epic revised several times arrives in its final state.
- **Shared files** take each owning task pull request's own merge diff in merge order, so an epic receives only its own hunks of a file several epics touched.
- **An epic whose every file is shared and later superseded is absorbed.** `i04/e03/workflows` is the one such case: its two task pull requests (#1187, #1194) changed only lines that later epics rewrote, so no branch carries it.

| Base | Epic | Branch | Head | Source task pull requests |
| --- | --- | --- | --- | --- |
| `main` | E00 | `i04/e00/main` | `1244edf9` | #1211 |
| `main` | E01 | `i04/e01/main` | `71459f89` | #1204, #1206, #1209 |
| `main` | E03 | `i04/e03/main` | `da484ada` | #1188, #1191, #1195, #1197 |
| `main` | E04 | `i04/e04/main` | `0ca57a8d` | #1186, #1196 |
| `main` | E05 | `i04/e05/main` | `a047e979` | #1185, #1192, #1198, #1200 |
| `main` | E06 | `i04/e06/main` | `0857dce2` | #1184, #1202 |
| `main` | E09 | `i04/e09/main` | `a6f80b8a` | #1146 |
| `workflows` | E01 | `i04/e01/workflows` | `5cf25fbb` | #1205, #1208 |
| `workflows` | E05 | `i04/e05/workflows` | `f09eb513` | #1193 |
| `workflows` | E06 | `i04/e06/workflows` | `2a5d0e76` | #1183 |
| `workflows` | E09 | `i04/e09/workflows` | `f0a4e1e1` | #1203, #1207, #1210, #1212, #1213 |

## Evidence

The separation is complete when merging every epic branch in sequence reproduces the integration tree exactly. Both bases do:

| Base | Integration tip | Expected tree | Aggregate tree | Residual diff |
| --- | --- | --- | --- | --- |
| `main` | `c2bfb89e` | `a5e2af5d` | `a5e2af5d` | none |
| `workflows` | `47732727` | `0b769f2d` | `0b769f2d` | none |

Three files are touched by more than one epic, so a sequential merge of the branches reports a conflict on them. Each is resolved to the integration tree's own content, which is what makes the aggregate match:

- `tests/guard-registry.test.ts` — E04, E05, E06 and E09 each register a guard in it.
- `corpus/work-package/techniques/update-pr/TECHNIQUE.md` — E01 and E09 each revise it.

Each branch merges cleanly into the current tip of its long-lived branch on its own. The conflicts arise only between siblings, so whichever of them merges second takes the other's rows by merging its base in.

## Continuous integration

`verify.yml` pairs a change with the definitions branch its base names. With the initiative branches retired, every I04 pull request pairs with the `workflows` tip rather than with `i04/workflows`.

An epic that changes both trees therefore reads its own half only once that half has merged. E05, E06 and E09 each hold a `main` and a `workflows` pull request, and the pair is merged together.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Attribution plan](evidence/i04-plan.json) | Each base's branch point, tip and target, the task pull requests of each epic, and the owning epics of every changed file |
| [Build results](evidence/i04-build-results.json) | Each branch's construction steps, conflicts and head |
| [Validation](evidence/i04-validation.json) | Expected and aggregate trees, the overlap resolutions, and the residual diff |
| [Build script](evidence/i04-build.py) | Attribution and branch construction |
| [Resolve script](evidence/i04-resolve.py) | Overlap resolution on the three shared files |
| [Verify script](evidence/i04-verify.py) | Commit, sequential merge and tree comparison |

## Links

| Resource | Link |
| --- | --- |
| Initiative | https://github.com/m2ux/workflow-server/issues/706 |
| Retired `main` integration | https://github.com/m2ux/workflow-server/pull/1225 |
| Retired `workflows` integration | https://github.com/m2ux/workflow-server/pull/1226 |
