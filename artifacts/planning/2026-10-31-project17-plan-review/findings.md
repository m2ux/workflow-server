# Project 17 plan review

Review date: 2026-10-31. Findings are proposals; no issue, dependency, Joins, priority or acceptance-criterion edits were applied by this review.

Scope: all 18 board epics, 117 task rows, I11, linked work items and planning records, the marked requirements source, and selected current implementation/tests at workspace merge 04de875a8517dcf229462e3b939099e16ffe3e63. E17 is concurrently in delivery; its agent-provided write set is explicitly identified where used.

P1 means resolve before affected delivery or closure; P2 means reconcile before treating the plan as consistent or parallel-safe.

## F01 — P1 — Cancelled E09 criterion still blocks closure

**Problem.** Only AC1 was cancelled by the user, but it remains an unchecked Acceptance Criteria checkbox. Neither the criteria parser nor closure ignores the RETRACTED suffix. A temporary specimen with every other E09 criterion ticked still returns criteria_met=False. Its Overview and Proposal still require a single In Progress initiative, so a new delivery could implement the cancelled policy.

**Proposed correction.** Retain the cancellation in provenance, remove AC1 from the active criterion set without renumbering surviving IDs, and remove its operative rule from Overview/Proposal. Keep W03 active for AC2/AC3 and W04 dependent on W03.

**Evidence.**

- [E09.md:60](snapshots/E09.md#L60): - [ ] **AC1.** A theme board carries at most one In Progress initiative per repository. [RETRACTED]

- [E09.md:26](snapshots/E09.md#L26): - **One In Progress initiative.**

**Decision:** Proposed; not applied.

## F02 — P1 — E09 status criteria conflict with active delivery

**Problem.** AC3 forbids In Progress without an open PR, while completed E15 AC2 and dispatch reservations intentionally mark work In Progress before a PR exists. AC4 permits Ready epics only under a Ready initiative, but current dispatch uses an In Progress initiative and permits independent work alongside its active epic. Implementing W03/W04 literally would undo reservation status and suppress the ready queue.

**Proposed correction.** Define one status precedence including reservation, open PR, review gate and completed delivery. Permit eligible Ready epics under the applicable active initiative states. Preserve the Backlog cascade only where it does not erase actual active delivery evidence; specify that boundary before implementation.

**Evidence.**

- [E09.md:62](snapshots/E09.md#L62): - [ ] **AC3.** An epic with no open pull request on it is not In Progress.

- [E09.md:63](snapshots/E09.md#L63): - [ ] **AC4.** An epic is Ready only while its initiative is Ready and every dependency in its row is delivered.

- [E15.md:38](snapshots/E15.md#L38): - [x] **AC2.** A row a session holds stands at In Progress on its board, as the skill's fixture suite checks a row linking its planning record against one linking its work item.

- [E08.md:26](snapshots/E08.md#L26): - **Dispatched work moves.**

**Decision:** Proposed; not applied.

## F03 — P1 — REST-only check would reject planned evidence capture

**Problem.** E10 W05/AC7 reports every non-REST command, while initiative AC24 allows GraphQL where REST lacks the relation and E16 explicitly implements GraphQL Development captures. The marked source still requires a one-off exception. These are three different contracts for the same interface.

**Proposed correction.** Use the accepted relation-based exception consistently in E10, the current requirements source and E16. Test an allowed Development relation and an unjustified GraphQL operation separately.

**Evidence.**

- [E10.md:68](snapshots/E10.md#L68): - [ ] **AC7.** The interface check reports a command specification that reaches GitHub other than over REST.

- [I11.md:85](snapshots/I11.md#L85): - [ ] **AC24.** The skill reaches GitHub over REST, and over GraphQL only where no REST field carries the relation it reads, as the skill's fixture suite checks its command specifications.

- [E16.md:29](snapshots/E16.md#L29): - **The query is generated into a file, never inlined.**

- [requirements.md:282](snapshots/requirements.md#L282): 🕒 **REQ-NF002: The skill SHALL reach GitHub over REST, using GraphQL only where the user grants an explicit one-off exception for an operation REST cannot perform**

**Decision:** Proposed; not applied.

## F04 — P1 — Integration and stacking contracts are superseded but active

**Problem.** I11 AC12 and completed E05 require initiative-wide integration; I11 AC16 and E10 W02/AC10 require dependent PRs to stack on preceding task branches. Current delivery uses task PRs into epic bases and separately reviewed epic integration. The just-merged E11 while I11 remains open is concrete contrary evidence. E10 could add checks that reject the current authorized delivery model.

**Proposed correction.** State task-to-epic-base and epic-to-long-lived integration in the active initiative and pending E10 criteria. Record supersession of E05 and source REQ-F025/F026 without rewriting delivered IDs or pretending historic PRs failed their then-current contract.

**Evidence.**

- [I11.md:73](snapshots/I11.md#L73): - [x] **AC12.** Work belonging to an initiative reaches a long-lived branch only once that initiative is complete, as the format check reports over the repository's open initiative pull requests.

- [I11.md:77](snapshots/I11.md#L77): - [ ] **AC16.** Tasks that build on one another are delivered as a stack, each pull request based on the one before, as the format check reports over the repository's initiative pull requests.

- [E10.md:71](snapshots/E10.md#L71): - [ ] **AC10.** The pull request check reports a dependent task's pull request based on a long-lived branch rather than on the pull request before it.

- [E05.md:50](snapshots/E05.md#L50): - [x] **AC5.** Every pull request delivering an initiative's work targets that initiative's integration branch for the long-lived branch it changes.

- [requirements.md:302](snapshots/requirements.md#L302): 🕒 **REQ-F026: Where an epic's tasks build on one another, their pull requests SHALL be delivered as a stack, each based on the one before**

**Decision:** Proposed; not applied.

## F05 — P1 — E17 initiative coverage points outside Acceptance Criteria

**Problem.** I11 E17 cites AC36, but AC36 was inserted under Non-Goals. The format check reports “E17: Coverage cites AC36, which is not a criterion”. This was introduced by the current session hoisting #1482. E17 itself has valid task coverage.

**Proposed correction.** Move the existing AC36 line into Acceptance Criteria, preserving its ID, and rerun initiative validation. This is a mechanical correction, not a change to the requested review gate.

**Evidence.**

- [I11.md:98](snapshots/I11.md#L98): ## Non-Goals

- [I11.md:106](snapshots/I11.md#L106): - [ ] **AC36.** An epic handoff carries agent review evidence for its current integration head, as delivery-procedure fixtures demonstrate.

- [I11.md:58](snapshots/I11.md#L58): | [E17](https://github.com/m2ux/workflow-server/issues/1482) | Epic Review | AC36 | | |

**Decision:** Proposed; not applied.

## F06 — P1 — Final citation evidence can precede its final edits

**Problem.** E14 W09 generates current citation manifests and W10 measures final instruction retrieval, yet neither depends on W11. W11 changes shared check definitions and script citations across skills, so it can invalidate both manifests and measured read sets after their criteria were marked complete. The planning record explicitly treats W09/W11 and W10/W11 as separate independent work.

**Proposed correction.** Make final manifest generation and final disclosure measurement follow every citation-changing task, including W11. W11 may follow W08 as today; then generate manifests and perform final walks against the settled head. Separate implementation of a generator from publication of final generated output if useful.

**Evidence.**

- [E14.md:69](snapshots/E14.md#L69): | W09 | Each skill's read set generated and checked | AC19, AC20, AC21 | W05, W06, W07 | | |

- [E14.md:70](snapshots/E14.md#L70): | W10 | Efficacy and retrieval walked over both skills | AC22, AC23 | W05, W06, W07 | | |

- [E14.md:71](snapshots/E14.md#L71): | W11 | Every check defined where prose names it | AC24, AC25, AC26 | W08 | | |

- [e14-decisions.md:191](snapshots/e14-decisions.md#L191): - **The checks task against the rest: W06 and W11, W07 and W11, W09 and W11, W10 and W11.**

**Decision:** Proposed; not applied.

## F07 — P2 — Joins records are stale and not machine-readable

**Problem.** With the linked planning records supplied, the checker reports 428 unaccounted pairs: 343 in open E09/E10/E14 (12/319/12), plus 85 in historical closed epics. This is not a recommendation to join them all. Existing records often use bare W IDs, ranges or several pairs on one line, while the checker needs a line naming exactly two qualified task IDs. E10’s retrospective says W03/W04 share a PR, while the live table joins W04/W05. E14’s decisions say W02/W03 share one, while the table joins W03/W04; W03 also depends on W02, making the old pair invalid under the current graph.

**Proposed correction.** Reconcile each open-epic pair against current task meaning. Keep true joined units mutual in the table; record each deliberately separate pair with qualified IDs and its reason. Archive superseded join statements. Treat historical completed pairs as evidence normalization, not new implementation work.

**Evidence.**

- [retrospective-joins.md:32](snapshots/retrospective-joins.md#L32): W03 and W04 share a pull request, and name each other.

- [E10.md:36](snapshots/E10.md#L36): | W04 | Command specification and vocabulary checks | AC2, AC5 | W01 | W05 | |

- [e14-decisions.md:181](snapshots/e14-decisions.md#L181): W02 and W03 share one pull request: one rule applied across two skills, where the second skill's citations are the evidence that the rule reads the same in a file the first skill never had. No other eligible pair shares a pull request.

- [E14.md:63](snapshots/E14.md#L63): | W03 | Work Planner citations named by section | AC5 | W02 | W04 | |

**Decision:** Proposed; not applied.

## F08 — P2 — Whole-epic task dependencies overstate consumption

**Problem.** Ten task edges name entire epics. Nine are historical E01–E08 edges; the live one is E09 W03 -> E08. The graph expands these successfully, so there are no unknown references or cycles, but it flags their granularity. The full graph’s 17-step longest chain is largely delivered history and does not describe the remaining critical path.

**Proposed correction.** For remaining work, name the producing rows actually consumed or record that the needed capability is already in the base and remove a redundant prerequisite. Preserve completed identifiers and record historical supersession. Do not use the historical longest chain to justify current parallelism.

**Evidence.**

- [E09.md:53](snapshots/E09.md#L53): | W03 | Initiative membership and epic activity determine status | AC2, AC3 | [E08](https://github.com/m2ux/workflow-server/issues/1175) | | |

- [E08.md:35](snapshots/E08.md#L35): | [W01](https://github.com/m2ux/workflow-server/pull/1122) | Advance a theme board by priority set | AC1, AC2 | [E05](https://github.com/m2ux/workflow-server/issues/1172) | | ✓ |

**Decision:** Proposed; not applied.

## F09 — P2 — Incomplete work-item coverage hides component contention

**Problem.** Of 50 unfinished rows, 23 resolve a linked work item and 27 do not. E13/E14 planning folders have decisions but no row work files; E16 has bare rows. Some available component declarations point to removed references/work-breakdown.md. Even valid declarations understate reach: E17 declares review-pull-request.md but its running implementation also edits board.py and deliver.py. A graph with those omissions cannot certify disjoint implementation.

**Proposed correction.** Populate or reconnect current work items, migrate stale paths, and record intended write sets before publishing a parallel schedule. Serialize E17 with E09 board work and E10 W03/W10 delivery-script edits. Serialize shared-checker edits or use one explicitly joined unit where the work truly shares a PR.

**Evidence.**

- [E13.md:31](snapshots/E13.md#L31): | W01 | A project declares the criteria its epics carry | AC1 | | | |

- [E14.md:61](snapshots/E14.md#L61): | W01 | The targets a reading rule serves stated | AC1 | | | |

- [E16.md:48](snapshots/E16.md#L48): | W01 | The link relation read from each end | AC1, AC2, AC3 | | | |

- [E17.md:27](snapshots/E17.md#L27): | [W01](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-31-1482-i11-e17-w01-agent-review-gates-epic/) | Agent review gates epic handoff | AC1, AC2, AC3 | | | |

**Decision:** Proposed; not applied.

## F10 — P2 — E10 has duplicate ownership and an early all-skills pass

**Problem.** W11 and W13 both fix the same GitNexus bold lead, and W11’s AC17 demands the whole skill pass even though W13 owns its command-specification violations. W21 can finish after W20 alone although AC27 requires every skill clean and W11/W13 and other conformance rows can still be outstanding. W21’s work item also allows excluding GitNexus, contrary to AC27’s every-skill scope.

**Proposed correction.** Give each GitNexus fix one owner; join or order W11/W13 around a scoped criterion. Make the final all-skills verification follow all required cleanup/check changes, and remove the exclusion alternative unless the user explicitly narrows the criterion. Do not treat running a partial check as evidence of AC27.

**Evidence.**

- [E10.md:43](snapshots/E10.md#L43): | [W11](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-12-1322-i11-e10-w11-bold-leads-every-lead-within/w11.md) | Bold leads within the width limit | AC17 | | | |

- [E10.md:45](snapshots/E10.md#L45): | [W13](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-12-1342-i11-e10-w13-entry-point-no-specification-in/w13.md) | The entry point holds no specification | AC19 | | | |

- [E10.md:53](snapshots/E10.md#L53): | [W21](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-13-1392-i11-e10-w21-check-scope-one-run-over/w21.md) | One run over every skill | AC27 | W20 | | |

- [E10.md:93](snapshots/E10.md#L93): - [ ] **AC27.** A run of the shared skill-file check over every skill in the repository reports no finding, as that run's output shows.

**Decision:** Proposed; not applied.

## F11 — P2 — Pending placement rule reverses completed caller semantics

**Problem.** E12 W09/AC14 deliberately counts only procedure callers. E10 W24 now counts command-specification citations as reach, reversing the completed rule; its work item restores a shared catalog, whereas the current skill uses modes/protocols/artifacts. E10 W22/AC29 also repeats completed E12 W13/AC13 for Workflow Canon command placement. Delivering old wording can restore obsolete structure or redo completed work.

**Proposed correction.** Decide and record the intended distinction between execution callers and retrieval reach, update W24 to the current architecture, and scope W22 to any remaining measured delta. Preserve E12 as historical delivery with explicit supersession. Re-verify current behavior before closing or cancelling duplicate outcomes.

**Evidence.**

- [E12.md:85](snapshots/E12.md#L85): - [x] **AC14.** The shared skill-file check counts a file among a command specification's callers only where a procedure of that file runs the command, reading the file holding the specification and every other file the same way, as the check's own test suite shows against a specimen carrying each.

- [E10.md:99](snapshots/E10.md#L99): - [ ] **AC33.** The shared skill-file check reports a command specification held in a mode file that another mode's file reaches, whether that reach is a procedure's citation or a command specification's, as the check's own test suite shows against a specimen carrying one.

- [E12.md:84](snapshots/E12.md#L84): - [x] **AC13.** Every command specification the Workflow Canon skill states that one procedure runs stands in that procedure's file, as the shared skill-file check reports over that skill's files.

- [E10.md:95](snapshots/E10.md#L95): - [ ] **AC29.** Every command specification the Workflow Canon skill states that one procedure runs stands in that procedure's file, whatever heading level or file title holds it, as the shared skill-file check reports over that skill's files.

**Decision:** Proposed; not applied.

## F12 — P2 — Retrieval non-regression has no complete parent trace

**Problem.** I11 AC30 promises retrieval no greater than the prior layout. Its covering E12 AC6 and E14 AC23 only require recording retrieval, allowing a regression to pass both child criteria. E10 AC34 explicitly requires no increase, but E10’s initiative Coverage omits AC30. E14’s own trace table incorrectly treats recording a measurement as satisfying the non-regression promise.

**Proposed correction.** Assign the non-regression outcome to one explicit task with a pinned baseline and pass threshold, or consciously revise the initiative promise. Add the proper initiative Coverage and make final measurements follow all relevant layout edits. Keep measurement collection separate from a passing comparison.

**Evidence.**

- [I11.md:91](snapshots/I11.md#L91): - [ ] **AC30.** A layout change to the skill leaves each mode's retrieval under the skill's representative scenarios no greater than the layout it replaced, as the disclosure verification record measures.

- [I11.md:51](snapshots/I11.md#L51): | [E10](https://github.com/m2ux/workflow-server/issues/1181) | Conformance Checks | AC14, AC15, AC16, AC18, AC20, AC21, AC22, AC23, AC24 | | |

- [E12.md:77](snapshots/E12.md#L77): - [x] **AC6.** Each mode's retrieval under the skill's representative scenarios is recorded against the layout that served it, as the disclosure verification record holds.

- [E14.md:97](snapshots/E14.md#L97): - [ ] **AC23.** Each mode's retrieval under the skill's representative scenarios is recorded against the layout that served it, as the disclosure verification record holds.

- [E10.md:100](snapshots/E10.md#L100): - [ ] **AC34.** A disclosure verification record measures each mode's retrieval over the layout at the skill's head and records no mode opening more files than the record of the layout it replaced, as that record shows.

**Decision:** Proposed; not applied.

## F13 — P2 — E17 supersedes the completed readiness signal

**Problem.** E15 and I11 AC34 describe task/criterion completion as the signal that readies an epic. E17 adds an actual review pass, so that signal is necessary but no longer sufficient. A head-only acceptance contract also leaves the reviewed diff ambiguous if the target base changes without a head change. The active E17 agent reports implementing a head-and-base-bound gate, which is stronger than the issue’s current wording.

**Proposed correction.** Qualify the active readiness contract by valid review evidence and resolved blocking findings; record E15 supersession. Bind review evidence to both ends of the reviewed comparison or an equivalent immutable diff identity. Keep the agent review distinct from required human approval.

**Evidence.**

- [I11.md:95](snapshots/I11.md#L95): - [x] **AC34.** A completed epic's review pull request stands for review on the signal that completes it, as the skill's fixture suite checks the delivery run it plans.

- [E15.md:39](snapshots/E15.md#L39): - [x] **AC3.** An epic whose tasks are all delivered and criteria all ticked has the pull request merging its base named for readying, as the skill's fixture suite checks the signal a delivery run reads.

- [E17.md:32](snapshots/E17.md#L32): - [ ] **AC1.** An epic's In Review handoff requires recorded agent review evidence for its current integration head, as delivery-procedure fixtures demonstrate for missing, stale and current review records.

- [E17.md:20](snapshots/E17.md#L20): - **The handoff preserves human approval.**

**Decision:** Proposed; not applied.

## F14 — P2 — Marked source has no current supersession map

**Problem.** The normative specification still requires old table columns, criteria embedded in Description, initiative integration, stacked PRs, one-off GraphQL exceptions and replacement of a reservation by work-file links after planning. Several conflict with current accepted epics and implementation. Historical E01 also says work files carry no table, while the current work-item template requires a Work Breakdown table. The source remains marked normative with no applicable-version map, so source alignment can demand regressions.

**Proposed correction.** Publish a current requirements/supersession map that retains the historic source and its provenance, names the later accepted rule for each changed requirement and records additions such as E13–E17. Review active plans against the current contract; do not silently rewrite the historical record.

**Evidence.**

- [requirements.md:110](snapshots/requirements.md#L110): 🕒 **REQ-F012: An initiative's Work Breakdown table SHALL be `Epic | Description | Depends on` and an epic's SHALL be `Task | Description | Depends on | Join`; a task warranting its own issue SHALL follow the epic body shape without a table**

- [requirements.md:114](snapshots/requirements.md#L114): 🕒 **REQ-F013: A Description cell SHALL be at most eight words and SHALL end by citing the criteria that row delivers, as `→ AC1, AC3`**

- [requirements.md:226](snapshots/requirements.md#L226): 🕒 **REQ-F040: Once a dispatched session has planned, the epic's work items SHALL point at the planning artifacts rather than at the reserved folder**

- [E01.md:59](snapshots/E01.md#L59): - [x] **AC8.** A task's work file states its design in paragraphs and bullets, carrying no table.

- [I11.md:110](snapshots/I11.md#L110): - **R1.** **Source.** [Work Planner Skill Requirements Specification](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-07-meta/05-final-spec.md) — The requirements the scheme answers to, drawn from the sessions in which it was argued.

**Decision:** Proposed; not applied.

## F15 — P2 — E16 couples independent delivery components

**Problem.** E16 W03 combines a repository closure sweep, a disposable revision checkout helper and reachability of every script. The revision helper consumes no captured Development relation, but inherits W02’s capture dependency. There are no linked work items identifying a common implementation component. This obscures parallelism and makes one PR span distinct failure and cleanup behavior.

**Proposed correction.** Split the closure sweep from revision materialization, retain the real capture dependency only for the sweep, and put shared reachability validation at the appropriate final boundary. Each task needs its own component, failure tests and cleanup evidence.

**Evidence.**

- [E16.md:50](snapshots/E16.md#L50): | W03 | The closure sweep and the revision helper | AC5, AC6, AC7 | W02 | | |

- [E16.md:58](snapshots/E16.md#L58): - [ ] **AC5.** The closure sweep lists each closed issue whose criteria are unticked or whose linked pull request has not merged, and states that issue's closure reason, as its run over a repository holding a transferred and an unproven closure shows.

- [E16.md:59](snapshots/E16.md#L59): - [ ] **AC6.** The revision helper runs a supplied command at the commit a supplied branch or tag resolves to, as a run that succeeds and one that fails then checked against `git worktree list` show.

**Decision:** Proposed; not applied.

## F16 — P2 — Initiative verification backlog is not assigned

**Problem.** I11 AC17 remains unticked although its sole covering E00 is complete; AC25–AC28 remain unticked after E11 merged. Closure of those epics does not itself prove the initiative instruments. Broad checked claims AC2/AC3 also require fresh interpretation because the current live plan has demonstrated conformance failures. There is no new implementation automatically implied by these states.

**Proposed correction.** Run the named initiative instruments, publish criterion-specific evidence and tick only successful results. Classify a failure as an actual gap with an owner. Keep old successful evidence tied to its revision rather than presenting a historical checkbox as proof of the current board.

**Evidence.**

- [I11.md:78](snapshots/I11.md#L78): - [ ] **AC17.** A body of work the skill plans leaves a planning record holding the decisions its criteria rest on, as the review pass reports over the repository's open initiatives.

- [I11.md:86](snapshots/I11.md#L86): - [ ] **AC25.** A merged pull request's passed test plan settles the epic criteria its checks observe, as the skill's fixture suite shows against a plan with and without the tick.

- [I11.md:63](snapshots/I11.md#L63): - [x] **AC2.** Every agent-engineering issue body conforms to its kind's template and to the scheme's prose rules, as the format check reports over the repository's open issues.

**Decision:** Proposed; not applied.

## F17 — P2 — Configuration authority changes within E09 and across E13

**Problem.** Delivered E09 W05/AC10 makes a linked worktree return the main worktree's branch names. Pending W06/AC12 explicitly returns the epic base's names when they differ from the long-lived branch. Those cannot both be the unconditional current rule. E13's declaration design cites the main-worktree behavior as the precedent, so implementing the two epics independently can give branch configuration and required-criteria configuration different, unstated authorities.

**Proposed correction.** Define the source revision for each project declaration and the context in which the main-worktree rule applies. Record W06 as superseding the relevant W05 behavior if epic-base authority is intended. Align E13's declaration reader to that decision or state its intentional difference; add shared fixtures for divergent base/long-lived values and missing declarations.

**Evidence.** E09 AC10 says “A run from a linked worktree returns the long-lived branches its main working tree returns.” AC12 says a sync against a base differing from the long-lived branch “returns that base's names.” See [E09 snapshot](snapshots/E09.md). E13's [decision D2](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-13-i11-e13-project-variance/decisions.md) explicitly adopts the main-working-tree precedent.

**Decision:** Proposed; not applied.
