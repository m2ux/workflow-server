---
name: verify-task-locally
description: >
  Run typecheck and the affected tests to confirm a task's implementation
  is locally correct. Produces a verification record; refuses to
  complete on any failure.
metadata:
  ontology: workflow-canonical
  kind: technique
---

# Verify task locally

## Pre-conditions

- Code changes from
  [write-task-code](implement-task/write-task-code/SKILL.md) are present
  in the workspace.
- A context summary exists (used to scope the test selection).
- The local toolchain is functional (build env configured, dependencies
  resolvable).

## Invariants

- **Read-only on source.** This technique runs verification commands;
  it never edits source code. Any fix required is the responsibility of
  [write-task-code](implement-task/write-task-code/SKILL.md), re-invoked
  after the failure is understood.
- **No skipping.** Verification commands are not bypassed because they
  "should" pass. Either they run, or this technique refuses to
  complete.

## Procedure

1. **Run typecheck.** For Rust: `cargo check --workspace` (scope to the
   affected crate with `--package <name>` if practical given the
   dependency graph). For TypeScript: `npm run typecheck`. Every type
   error must be resolved before proceeding.

2. **Run the affected tests.** Scope from the context summary's
   acceptance criteria. Rust: `cargo test --package <crate>` plus any
   specific test names. TypeScript: `npm test -- <pattern>`. Every
   test that should pass must pass; new tests added for this task must
   pass.

3. **Spot-check for regressions.** Skim output for unexpected failures
   in tests not directly related to this task. Unrelated failures →
   investigate before declaring the technique complete (most
   "unrelated" failures turn out to be downstream consequences).

4. **Record the verification.** Brief log entry: commands run, outcomes
   (pass/fail counts, runtime), any warnings of note.

## Output

- Typecheck clean (zero errors).
- Affected tests passing — including any newly-added tests for the
  task's acceptance criteria.
- A verification log entry recording commands and outcomes.

## Refusal paths

- **Typecheck fails.** Refuse to complete. The failure is for
  [write-task-code](implement-task/write-task-code/SKILL.md) to address,
  re-invoked.
- **Tests fail.** Refuse to complete. If the failure looks unrelated,
  re-invoke [impact](gitnexus/impact/SKILL.md) on the failing test's
  symbols before deciding the test is flaky — most "unrelated" failures
  are real downstream consequences.
- **Toolchain cannot run verification.** If local commands cannot be
  executed (build env misconfigured, missing dependencies, registry
  unreachable) and the agent cannot bring the toolchain up within a
  small number of attempts, stop and surface the specific error.
  Skipping verification is not acceptable.
