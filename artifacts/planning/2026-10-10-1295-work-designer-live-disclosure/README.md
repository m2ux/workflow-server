# Work Designer Live Disclosure Evaluation

Skill revision: `0a6ac0b180370c03d6c10095aae577a003254834` on `skill/work-designer`, PR 1295.

## Method

Independent sub-agents start without the parent's conversation. Each receives the skill path, a realistic request, the minimum repository identifiers and permitted side effects. Prompts do not identify expected reading choices or suspected defects. A repeated Review scenario checks whether the first observed miss recurs.

Tool calls and their returned output are extracted from the agents' own rollout records. The audit retains tool evidence, not private reasoning. Exact section matching identifies fully returned source sections, including intact JSON-escaped sections preserved inside truncated aggregate output; heading-only discovery is not treated as reading a section's body. Partial reads and commands are inspected separately. Counts describe returned file content, not total model context or token savings against a measured control. Decoded shell counts can omit malformed fragments; missing matches do not establish absence.

## Scenarios

| Scenario | Requested work | Allowed actions |
| --- | --- | --- |
| Review | Plan coverage for a Docker Compose host binding change to 127.0.0.1 using captured packaging, engine and definition revisions | Local reads and a report in the agent's final answer |
| Revise | Rename Required Actions to Next Actions in the review template, retaining its meaning | Edits and local validation in the isolated evaluation worktree; publication is excluded |
| Review repeat | The identical Review request in another fresh context | The same read-only scope |

The Revise fixture is `/home/mike1/projects/dev/workflow-server/.worktrees/eval/work-designer-revise-20261010`. The production skill worktree remains separate.

## Acceptance

- The selected mode and mandatory guidelines are loaded completely.
- Links to sections lead to bounded section reads, retaining subsections and required conventions.
- Variant selection loads identity and the active mode's configuration, then only relevant concern sections.
- Whole catalogs and unrelated authoring or project coverage are excluded unless required by the task.
- Task results retain their authority and evidence limits; the Revise fixture receives the requested edit and applicable local checks.

## Evidence

- `audit_rollout.py` extracts repeatable tool traces and complete-section matches.
- Per-scenario tool traces contain the actual tool inputs and returned outputs.
- Per-scenario audit summaries identify whole files and sections found in returned shell output.
- Per-scenario result files preserve the agents' final reports and command appendices.
- [Final findings](report.md) distinguish observed benefits from the remaining disclosure misses.
