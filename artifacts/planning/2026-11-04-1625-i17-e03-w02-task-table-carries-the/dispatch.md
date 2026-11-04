# Dispatch

## Authorization

The user requested delivery of Project 17 after reviewing the published revised plan and its next unit, W02+W03. This dispatch implements that joined unit alone. Its Lane cells are empty, so the unit is unlaned.

## Context

- The live queue selects I17 E03 at priority 8. E02 remains Backlog at 7 and E01 at 6; I16 remains Backlog with its E00/E01 ranking outstanding.
- The delivery survey reports W02+W03 as the sole available unit, covering AC11 and AC12, with zero holds, unresolved references, undeclared units or merge candidates.
- The unit branch is `i17/e03/w02-task-table-carries-the`, from `i17/e03/workspace`, at `.worktrees/i17/e03/w02-task-table-carries-the` in workflow-server.
- The epic base includes the latest workspace guidelines edit at `d0a62b8037bb1b8fdafac5bf0e0035ada8c64486`; its prepared revision is `7ac78e21ec2a41b58862c963ffe4cd85cc28075e`.
- W01 remains delivered by #1626. Its historical AC1 is retired from the current plan, so Sync reports its original check coverage as a disagreement. This is the disposition documented by the user's plan revision; its delivery history is preserved.
- The installed issue-format check reports the approved Lane column as absent from its current template. W02 owns that template change. The planning record's proposed-model validation verifies the seven-column body; the installed check must accept it after this unit.
- Integration #1627 remains draft; the epic has other undelivered units. W11–W13's reporting decision remains held until before W11.

## Checklist

- [x] Refresh live board, PRs and complete Development relations.
- [x] Apply the current queue and identify the joined unit.
- [x] Update the epic base with the current target guidelines.
- [x] Publish the unit's work items and dispatch context.
- [x] Reserve W02+W03 and confirm In Progress.
- [x] Create the isolated worktree and dispatch the delivery session.
