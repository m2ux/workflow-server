# Understand run: m2ux/workflow-server#1692

I wrote and registered the overview locally. The run stopped at Change Overview step 4, Publish and Link, because that step needs a git commit and push, which is outside my authority.

## Pull request
- **#1692**, "[I17:E02] Fields Behavior Candidates and Before-use Cycle Checks". It is merged into `i17/e02/workspace`.
- **Verified head:** `6fce88bdc343d55093d762daecc6557f1a7d5401`. The snapshot head, the captured FETCH_HEAD and the review worktree head all match, so no changed-head finding was raised.
- **Base SHA in the snapshot:** `1ec2a47…`. This is also the merge-base with the head.

## Evidence
- **Review worktree:** I reused `/home/mike1/projects/dev/workflow-server/.worktrees/pr/1692`. It is detached at the verified head and clean.
- **gitnexus status:** up to date, indexed commit `6fce88b`. No re-index was needed.
- **detect-changes:** 4 files, 77 changed symbols, 19 affected flows, risk "critical".
  - The base branch name `i17/e02/workspace`, both the local and the `origin/` ref, has moved past the merge, and the remote ref contains the head. Comparing against it would show an empty diff.
  - I therefore passed `--base-ref` the snapshot's base SHA `1ec2a47`. The procedure says to use the base branch, so this is a deliberate departure.
- **CLI truncation:** the gitnexus CLI cuts off its symbol list. I took the full surface from the MCP `detect_changes`, symbol relationships from MCP `context`, and ordered flow steps from Cypher queries on `STEP_IN_PROCESS`.
  - The CLI `query --limit 1` returned only partial process symbols.
- **Measured symbols:** context was taken for the 13 changed checker functions: main, check, fields_steps, contract_sections, behavior_clauses, fields_candidates, requirements, read_span, before_use_graph, before_use_cycles, connect, before_use_findings and label.
  - Ten flows were traced: proc_5, 6, 18, 59, 84, 158, 197, 231, 239 and 277.
  - The component areas follow the graph's communities, not the directory layout.

## Record
- **Folder:** `/tmp/claude-1002/-home-mike1-projects-dev-md-composer/13f9c3d7-1bdd-40e2-b7b0-924d181ef387/scratchpad/run/w39/trials/understand-2/out/artifacts/planning/2026-11-11-1692-fields-behavior-candidates-and-before-use-cycle-checks/`
  - It is new: the engineering worktree has no earlier record for #1692.
- **Files:** README.md (one Artifacts row, the PR under Links) and architecture-overview.md (256 lines).

## Diagrams
- **Component flowchart:** CLI or tests → main/check/undecided_rules → Fields execution, Fields candidates and Before-use cycles → shared contract and scanning, plus the rules.json store. Changed elements are green and context is grey.
  - It has 14 nodes, above the 5–10 target, because each of the three measured areas holds two to four changed functions.
- **Sequence — Fields execution:** check → fields_steps → operation_target → command_target → contract/structure_at.
- **Sequence — Fields behavior candidates:** main → fields_candidates → contract, scan, contract_sections. `behavior_clauses` is described in prose because it is in no indexed flow.
- **Sequence — Before-use cycles:** main → before_use_findings → before_use_graph → read_span, then before_use_cycles, then named.

## Risks the overview flags
- **Candidate word lists:** Fields behavior candidates are picked by fixed word lists. Drift in those lists shows only in printed output, since candidates never fail the run.
- **Recursion depth:** `connect` is recursive. A requirement chain deeper than about 1,000 nodes would exceed Python's recursion limit.
- **Narrow read-first pattern:** `BEFORE_USE` only matches "Read [links] first." and "Read [links] before …". A read-first requirement worded any other way adds no edge, so a cycle through it goes unreported.
- **Targets outside the checked roots:** the graph follows requirement targets outside the checked roots. A missing target reads as empty rather than being reported.

## Where it stopped
- **Step:** Change Overview step 4, Publish Planning Record (planning-record.md, Commit Planning Record). That needs `git add -A`, a commit, `git fetch origin engineering`, a rebase and `git push` in `/home/mike1/projects/dev/workflow-server/.engineering`. No captured output stands in for it.
- **Inputs I would have used:**
  - Copy the record folder into `/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/`.
  - Commit with a message file outside the worktree, e.g. "add architecture overview for #1692".
- **Not done after the stop:**
  - Editing the PR body. This would apply Overview URL into References of the current body from `pr-1692.json`, then Publish Pull Request, which runs Patch Pull Request Body against #1692.
  - The References row would be:
    `- **R4.** [Architecture Overview](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-11-11-1692-fields-behavior-candidates-and-before-use-cycle-checks/architecture-overview.md) — the change's structure, its flows, and the order to read the diff.`
  - R4 follows the body's existing R1–R3; no row names an overview yet.
- **Commands run:** no tracker writes, pushes or git writes were made. `gitnexus analyze` was not run.
