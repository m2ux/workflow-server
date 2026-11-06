# Advance Mode

Decides which initiatives, epics and hot-fixes on a theme board are underway and which are next, from current recorded delivery.

Follow the [Procedure](#procedure "ƒ"), adhering to [Rules](../rules.md) and [Conventions](../conventions.md) and ensure all [Outcomes](#outcomes) are met.

## Procedure

### 1. Select the Board

- Apply [Select Project Board](../artifacts/board.md#select-project-board "ƒ") with the requested theme or board identity.

- Use the provided owner and board number for the sync and fetch steps.
- Resolve a pending theme selection before continuing.

### 2. Sync

- Follow [Sync Mode](sync-mode.md "ƒ") for each open initiative on the selected board, with the allowance the caller supplied.

- Wait for its saved delivery results before the fetch step.
- Provide any blocker that prevents current delivery from being established.

### 3. Fetch

- Apply [Read Board State](../artifacts/board.md#read-board-state "ƒ") for the current board items and Status field.
- Apply [Fetch All Delivery Pull Requests](../artifacts/pull-request.md#fetch-all-delivery-pull-requests "ƒ") for the [repositories](../artifacts/board.md#repositories) and items Read Board State provided.
- Apply [Fetch Pull Request Issue Links](../artifacts/pull-request.md#fetch-pull-request-issue-links "ƒ") for those pull requests, which is where the issue each one delivers is read.
- Apply [Read Board Configuration](../artifacts/board.md#read-board-configuration "ƒ") for the board fields.
- Run [Find User](../artifacts/board.md#find-user "ƒ") for the assignee login.

### 4. Plan

- Run [Compute Board Queue](../artifacts/board-queue.md#compute-board-queue "ƒ") for the selected board.

- Include every resolved off-board issue file and confirmed unplanned initiative identity.

### 5. Resolve Missing Evidence

- For each unresolved issue reference:

- Apply [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue "ƒ") into a file.

- Add the provided file to the resolved off-board issue files.

- Run [Compute Board Queue](../artifacts/board-queue.md#compute-board-queue "ƒ") for the selected board, retaining resolved issue files and confirmed unplanned initiative identities.

- Repeat while references remain unresolved; an unavailable issue leaves the queue pending.

### 6. Resolve Queue Decisions

- Decide only from an `order` or `ask` line in [Report Lines](../artifacts/board-queue.md#report-lines), each of which is a re-prioritisation.

- Apply [Check Plan Change Autonomy](../artifacts/plan-change.md#check-plan-change-autonomy "ƒ") for each line, with the allowance the caller supplied.

- For an automatic `order` or `ask` line, use these recommendations:

- For `order`, priority 1 on every open initiative already In Progress or named by an open pull request, and no number on the rest. Where no initiative qualifies, nothing is under way and the line has no recommended answer.
- For `ask`, the number of the highest set already running, so the initiative joins it, or 1 where no initiative carries a priority label.

- For an automatic line, take its recommended decision and Apply [Record Plan Change](../artifacts/plan-change.md#record-plan-change "ƒ") with that decision.
- A held line, and an automatic one the recommendation leaves without an answer, is settled as [Held Change](../artifacts/plan-change.md#held-change) states, following the interview rules in the [guidelines](../guidelines.md#modes) where it reaches the user.
- A line this mode records rather than asks leaves the queue pending, which the write step reads as incomplete.

- For `order`, the answer is the [parallel work map](../artifacts/board-queue.md#priority-sets): a positive integer on each listed initiative, or none left unordered.

- For `ask`:

- The answer is a positive integer or none.
- Record the initiative's identity as confirmed unplanned when the answer is none.

- After an answer:

- Apply [Ensure Repository Labels](../artifacts/repository-labels.md#ensure-repository-labels "ƒ") with the priority label each confirmed number names, for every repository holding one of those initiatives.
- Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue "ƒ") with each initiative identity and its confirmed priority-label addition.
- Apply [Read Board State](../artifacts/board.md#read-board-state "ƒ") again.
- Run [Compute Board Queue](../artifacts/board-queue.md#compute-board-queue "ƒ") for the selected board using refreshed board items and the retained pull request and issue-link snapshots, retaining resolved issue files and confirmed unplanned initiative identities.

- Resolve any further missing evidence through step 5.

- Repeat this step while a decision is pending. An unanswered question leaves the queue pending.
- Provide the [change list](../artifacts/plan-change.md#change-list) with the queue, so the caller reports each decision this mode made and each it held.

### 7. Write

- Once the queue is [complete](../artifacts/board-queue.md#completeness), run each proposed Status and assignee call it provided.

- Apply [Read Board State](../artifacts/board.md#read-board-state "ƒ") again.
- Run [Compute Board Queue](../artifacts/board-queue.md#compute-board-queue "ƒ") for the selected board using refreshed board items and the retained pull request and issue-link snapshots, retaining resolved issue files and confirmed unplanned initiative identities.
- Resolve new missing evidence or decisions through steps 5 and 6.
- Repeat this step until the refreshed queue is complete and contains no further call.

### 8. Report

Report each move and each line in [Report Lines](../artifacts/board-queue.md#report-lines).

## Outcomes

- **A queue.**
  The user has a queue for one theme: which initiatives are underway together, which are next, and which wait.
- **A parallel work map.**
  The user has a ranking that sets which initiatives run together and which wait.
- **Epics follow the initiative.**
  The user sees which epics of each initiative are underway, which are next, which wait on a ranking, and which work waits for them to reconcile it.
