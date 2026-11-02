# Decisions

## Settled

- **No proposal.**  The user waived Plan Mode's Propose Mode run; [the confirmed goal](goal.md) stands as its source.
- **Four epics in the user's order.**  E01's title name reads Check Definitions, since a title name is two or three words.
- **No Deferred Debt epic.**  Findings are fixed in the delivery that finds them.
- **Superseded plan in References.**  #1427 is cited as the source of the carried evidence, by the user's decision.
- **Joins.**  E00 W01 and W02 share one pull request on the shared guidelines, and E00 W03 and W04 one on the shared check. E01 W01 and W03 are split by rule, as the [dependency report](dependencies.txt) states.
- **Measurement revision.**  Head measurements come from origin/workspace `785a5ee8c`, exported, since the local checkout is behind it.

## Open Questions

Each carries options and a recommendation; none is settled until the user answers.

### OQ1. Grammar Version

The installed `pf` reports 0.12.0 (`skill-markdown-v1`). Prosiform's README and source on main name `skill-markdown-v4` at 0.16.0, unreleased; the latest release, 0.15.0, is `skill-markdown-v3`. The bootstrap the goal names, run bare `pf` and follow the guide it prints, exists only on main.

- **A.** Pin the release carrying `skill-markdown-v4` and install it before E00's check and E03's bootstrap land. **Recommended:** the bootstrap clause needs the guide, and one version then compiles every measurement.
- **B.** Pin the installed 0.12.0 and spell the bootstrap as an explicit compile command.
- **C.** Pin 0.15.0.

### OQ2. Naming a Skill to the Prosiform Findings

workflow-canon's Revise Mode runs the shared check over workflow-canon, which this initiative never edits, so the prosiform findings must reach only the skills named to them.

- **A.** A command-line option naming each skill held to them, passed by Work Planner's Revise Mode and the shared Verified rule. **Recommended:** it is the goal's own wording, holds no state in a skill, and an unnamed caller is untouched.
- **B.** A key in the skill's `structure.json`.
- **C.** Detection of the entry point's `pf` bootstrap.

### OQ3. Baseline Revision

md-composer `93dad5b9` is not a workflow-server object. Its Work Planner markdown equals workflow-server `ed508443`. The figures supplied with the brief were taken at `785a5ee8c`.

- **A.** Fix the baseline at workflow-server `ed508443`, recording its equivalence to md-composer `93dad5b9`. **Recommended:** the user's baseline, by a revision this repository resolves.
- **B.** Fix it at `785a5ee8c`, the revision the stated figures came from.

### OQ4. Discussion Pull Request Head

Planning Record states the engineering branch takes no further branch, while Plan Mode opens the discussion pull request from a planning branch into a target. This run committed the record to engineering and opened the discussion from `planning/2026-11-02-i16-work-planner-through-prosiform`, carrying the draft bodies and work items.

- **A.** Raise the conflict as a Work Planner fix outside I16, which the user schedules. **Recommended:** I16's epics do not touch the planning-record artifact.
- **B.** Add a task to E02, which edits Work Planner files already.

### OQ5. Same-Board Reference

Issue Body's References rule bars linking an issue on the same board, and #1427 stands on board 17.

- **A.** Keep #1427 in References as decided, until it closes. **Recommended:** the user decided it, and the record names the departure.
- **B.** Move it to the planning record's Links and name it in plain text in the body.
