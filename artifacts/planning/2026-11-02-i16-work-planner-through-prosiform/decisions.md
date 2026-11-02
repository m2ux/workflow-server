# Decisions

## Settled

- **No proposal.**  The user waived Plan Mode's Propose Mode run; [the confirmed goal](goal.md) stands as its source.
- **Four epics in the user's order.**  E01's title name reads Check Definitions, since a title name is two or three words.
- **No Deferred Debt epic.**  Findings are fixed in the delivery that finds them.
- **Superseded plan in References.**  #1427 is cited as the source of the carried evidence, by the user's decision. It stands on board 17, which Issue Body's References rule bars; the user keeps it as a departure from that rule.
- **Joins.**  E00 W01 and W02 share one pull request on the shared guidelines, and E00 W03 and W04 one on the shared check. E01 W01 and W03 are split by rule, as the [dependency report](dependencies.txt) states.
- **Measurement revision.**  Head measurements come from origin/workspace `785a5ee8c`, exported, since the local checkout is behind it.
- **Epic priority.**  E00 is 3, E01 and E02 are 2, E03 is 1, as the [dependency report](dependencies.txt) proposes. E01 and E02 run together.
- **Naming a skill to the prosiform findings.**  A command-line option names each skill held to them, passed by Work Planner's Revise Mode and the shared Verified rule. A caller that names no skill draws no prosiform finding.
- **Planning lands on engineering.**  Every planning artifact, the draft bodies and work items included, is committed directly to the engineering branch. No planning branch or discussion pull request is raised.

## Open Questions

### OQ1. Grammar Version

The installed `pf` reports 0.12.0 (`skill-markdown-v1`). Prosiform's README and source on main name `skill-markdown-v4` at 0.16.0, unreleased; the latest release, 0.15.0, is `skill-markdown-v3`. The bootstrap the goal names, run bare `pf` and follow the guide it prints, exists only on main.

The user holds the version undecided while prosiform is under heavy revision. Bodies name the pinned `pf` without a version. The question is settled before E00 or E03 starts.

### OQ2. Baseline Revision

md-composer `93dad5b9` is not a workflow-server object. Its Work Planner markdown equals workflow-server `ed508443`. The figures supplied with the brief were taken at `785a5ee8c`.

The user holds the baseline open. It is settled before E03 starts.

- **A.** Fix the baseline at workflow-server `ed508443`, recording its equivalence to md-composer `93dad5b9`.
- **B.** Fix it at `785a5ee8c`, the revision the stated figures came from.
