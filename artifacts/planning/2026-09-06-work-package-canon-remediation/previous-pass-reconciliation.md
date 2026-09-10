# This pass against 2026-09-05

The [2026-09-05 audit](../2026-09-05-canon-audit-work-package/) covered the same target one day earlier, at base `75777ca2`. This pass ran at base `330cec28` and did not consult it. That was a miss: the register was on disk, and the canon's implement path asks whether a specification still holds before building to it — a question this pass applied to its own findings and never to the corpus's existing record.

Reconciling after the fact, the cost turned out to be small. Eleven of the prior pass's thirteen findings had been fixed in the corpus between the two base refs. Two remain, and one of those is a finding this pass should have found on its own.

## Disposition of the prior pass's thirteen

| Prior ID | Entry | State at `c1d07a29` | How |
|---|---|---|---|
| C1 | `option-coverage` — unreachable `correct-assumption` option | Closed | The option now sits in `tests/e2e/option-coverage.json` under a stated reason |
| C2 | `option-coverage` stamp mismatch | **Open** | `corpus-sha.json` still holds `69a01ca1c3b5`; the `binding-fidelity` ledger carries the same sha. Part of the adoption commit |
| 1 | `unproduced-value-read` on `validation_results` | Closed | `document-failures` now carries the producer's full gate, so the readers and the producer are reachable on the same paths |
| 2 | `operative-criteria-need-a-home` — canonical-home map, unresolvable bind | Closed | The map is a resource; the bind reads `work-package/canonical-home-map` |
| 3 | `bind-site-is-orchestration-truth` — REVIEW-MODE.md checkpoint inventory | Closed | The three phantom constructs are gone, and this pass replaced the surviving roster with a criterion (F3) |
| 4 | `cited-home-owns-claim` — technique-to-activity table | Closed | `techniques/README.md` no longer attributes a table to the workflow README |
| 5 | `bind-site-is-orchestration-truth` — groups-by-area table | Closed | The table is gone; the folder listing is the membership |
| 6 | `stale-restatement-after-change` — review-mode detection confirms | Closed | This pass rewrote the section (F6, F19) |
| 7 | `bind-site-is-orchestration-truth` — review flow omits comprehension | Closed | This pass redrew both graphs (F8) |
| 8 | `avoidance-voice-in-definitions` — deprecated-notice resource | Closed | File and index row deleted |
| 9 | `technique-stage-agnostic` — `create-issue.md` names activity gates | **Open, reduced** | One clause survives: an Input description reading "Jira project chosen at the `jira-project-selection` gate". The Protocol occurrences are gone |
| 10 | `link-named-artifacts` — bare `{change_block_index}` | Closed | The message now interpolates the linked form |
| 11 | `value-set-in-prose` — `project_type` | Closed | The variable declares `values: [rust-substrate, other]` |

## The one this pass should have caught

Prior finding 9 is squarely inside what this pass swept. F7 exists for exactly that shape, and its scan ran over every technique body.

The scan found it and the output was truncated. The command piped its results through `head -50`, the create-issue hit fell past the cut, and the remainder was never read. Nothing in the register records a limit, so the sweep reads as complete.

The canon names this: a search locates, it does not conclude, and an empty result bounds absence only where the probe's own terms were checked. Here the probe was sound and its output was discarded — a failure mode neither that rule nor the untested-scan rule quite covers, because the check did fire and did find the case.

The practical guard is to count what a scan returns before trusting what it shows, and to record the count. A sweep whose output is capped is a sweep with an unrecorded exclusion.

## What the two passes together say about the target

The prior pass found two Criticals, both from the option-coverage walk, and this pass never ran that walk to a verdict. That is the same gap twice: a check that takes tens of minutes, that `npm run test:ci` skips, and that neither pass closed. Between them the two registers have twenty-nine content findings and no coverage verdict.

The corpus stamp finding, C2, has now survived two audits. It is not a definition defect — it is the adoption step that both passes' remediation left owing on the code branch.
