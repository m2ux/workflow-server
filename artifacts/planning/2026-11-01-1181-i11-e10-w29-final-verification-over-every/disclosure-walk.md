# Disclosure Walk — GitNexus and Server in the Loop

> Live disclosure check · Recorded 2026-11-01 · Skills at `8e505b44244c7aadf447ee1942440fd92e0fc207` (`i11/e10/w29-final-verification-over-every`), whose gitnexus and server-in-the-loop trees match `i11/e10/workspace` at `9947ff911`

W30 and W31 restructured these entry points so each routes its requests to an operations or mode file. This walk tests that reading path with live agents, as [Disclosure Verification](https://github.com/m2ux/workflow-server/blob/workspace/skills/guidelines.md#disclosure-verification) requires.

## Method

- Five independent sub-agents, each in a fresh context, each given one entry point path and one realistic request. None was told what to read or what earlier walks found.
- Authority limit: a dry run. Each read only files under `skills/`, followed the skill up to its first tool call or command, then wrote out its planned sequence, every file it read in order with its range, what it lacked and what it read without use.
- Reads are the agents' own reports; their tool-call counts (three each: two reads and the hand-back) agree with them.
- Each scenario ran once. Consistency across repeats is not claimed.

## Results

| Scenario | Entry point | Request | Files read | Necessary context missing | Unrelated file loaded |
| --- | --- | --- | --- | --- | --- |
| S1 | gitnexus-debugging | Trace where an intermittent `get_resource` error comes from | `SKILL.md`, `references/operations.md` | None for routing | None |
| S2 | gitnexus-refactoring | Rename a function across the codebase safely | `SKILL.md`, `references/operations.md` | None for routing | None |
| S3 | gitnexus-cli | Reindex a stale index, then generate a wiki | `SKILL.md`, `references/operations.md` | None for routing | None |
| S4 | server-in-the-loop | Run a live sidecar loop on an engine change, tests already passing | `SKILL.md`, `references/loop-mode.md` | None for routing | None |
| S5 | server-in-the-loop | Stop the experiment sidecar | `SKILL.md`, `references/loop-mode.md` | None for routing | None |

## Observations

- **Two reads reach the procedure.**
  Every scenario read its entry point whole and one linked file whole, and found the procedure and command it needed there.
- **The stale-index rule defers its cross-skill read.**
  S1 and S2 named the gitnexus-cli Index a Repository link and left it unread until a tool reports a stale index, as the rule's condition states.
- **Whole-file reads carry sibling procedures.**
  Each operations or mode file is read whole, so procedures the request did not need were loaded with it: Extract a Module and Split a Function in S2, Remove GitNexus in S3, and bring-up and walk steps in S5. Each file serves one skill's role, as File size in the shared guidelines sizes it.
- **Content gaps outside disclosure.**
  S1, S2 and S3 found no step naming how to learn the indexed repository name for a `gitnexus://repo/{name}` resource or a `repo` parameter. S5 found the stop command's success output and an already-stopped sidecar undescribed. These are gaps in the skills' content, not in their reading paths.
- **Repository name fixed in this unit.**
  `524ba6353` names the source of `{name}` where debugging's Trace a Bug and the CLI's Index a Repository use it: `gitnexus://repos` and List Repositories. Refactoring's tool calls take no repository name, and exploring already reads `gitnexus://repos` first. The S5 gaps concern the stop script's own behaviour, which the skill cites rather than copies, so they stand.

## Verdict

- **Structural.**
  `check_skill_files.py` reports no finding over either skill.
- **Live.**
  Each scenario reached its procedure and commands through its entry point's routing, with no missing context and no file outside the skill's own routing loaded.
