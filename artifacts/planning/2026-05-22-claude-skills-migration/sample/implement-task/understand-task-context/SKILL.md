---
name: understand-task-context
description: >
  Read a single task from a work-package plan and produce a written
  context summary covering scope, affected files, acceptance criteria,
  and governing conventions.
metadata:
  ontology: workflow-canonical
  kind: technique
---

# Understand task context

## Pre-conditions

- A task object is available (from the work-package plan or the
  activity iterator).
- The plan is loaded into agent state.
- (Optional) A test plan is loaded — if present, used as the canonical
  source of acceptance criteria.

## Invariants

- **Read-only.** No file is modified by this technique.
- **No guessing.** Ambiguity is resolved by surfacing to the user, not
  by inference (see Refusal paths).

## Procedure

1. **Read the task.** Extract: task ID, prose description, in-scope
   symbols/files, acceptance criteria, dependencies on adjacent tasks.

2. **Identify affected files.** Walk the task description and cross-
   reference against repo structure. List every file that will be
   edited AND every file that imports/uses the symbol(s) about to
   change. Keep the list explicit — no "and related files" hand-waves.

3. **Locate acceptance criteria.** If a test plan is loaded, scan it for
   tests relevant to this task. Note: tests that must pass after the
   change, and tests that need to be newly added.

4. **Identify governing conventions.** For each affected file/module,
   note existing patterns the change must conform to — naming, error
   handling, module structure, logging style, comment style.

5. **Write the context summary.** 1–2 paragraphs covering: scope,
   affected files, acceptance criteria, conventions. Store in agent
   state.

## Output

A context summary stored in agent state, consumed by downstream
techniques such as
[write-task-code](implement-task/write-task-code/SKILL.md) and
[verify-task-locally](implement-task/verify-task-locally/SKILL.md).

## Refusal paths

- **Task description too ambiguous to summarise.** Stop and surface the
  specific ambiguity (which file? which symbol? which criterion?). Do
  not guess.
- **Acceptance criteria missing.** If no test plan exists and the task
  does not state how completion is verified, stop and request criteria.
