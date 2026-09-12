# Server-owned session setup — Implementation Plan

> plan · HIGH · Planning · 6–9h agentic + 2h review · 2026-09-11

## Overview

### Problem & Scope

Problem, scope, and success criteria: [specification](README.md#acceptance-criteria); [design philosophy](02-design-philosophy.md#success-criteria). Landing 1 only.

## Inputs

- [Specification](README.md#the-change) — call contract, derivation, occupancy, tests 1–10, three landings
- [Change brief](01-change-brief.md#what-landing-1-owns) — this run's acceptance rows; corpus rewrite is Landing 2
- [Impact analysis](01-impact-analysis.md#gitnexus-blast-radius-on-writesessionfile) — persist cut; `writeSessionFile` CRITICAL, six direct callers
- [Design philosophy](02-design-philosophy.md#problem-classification) — occupancy-refuse, checkout-not-host, `createSessionFile` wrapper
- [Comprehension](../../comprehension/session-setup.md) — birth, persist, promote; [edit map](15-codebase-comprehension.md#landing-1-edit-map--2026-09-11)

## Proposed Approach

### Solution Design

Landing 1 on `feat/528-server-owned-session-setup` against `main`. GitNexus re-taken this pass: [`writeSessionFile`](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/store.ts#L422) CRITICAL (6 direct, 8 processes, 5 modules). Do not edit it. Occupancy is `createSessionFile` plus the promote existence check.

Leaves first. Add the occupancy code and wrapper, then the path inverse, then git derivation, then the two handlers, then published sentences that live in this worktree, then spec tests 1–10 against the real store.

`working_directory` is optional. When present, invert the agent path, derive `owner/repo` from that checkout's origin (component under work), create a durable folder, persist through `createSessionFile`. When both it and `planning_folder` are omitted, transient create stays so today's bootstrap still boots. A named folder that already holds a session still resumes. A derived slug that already holds one throws `FOLDER_OCCUPIED` and leaves both files untouched.

Open decisions are a successful tool JSON with no `session_index`: `decision`, `candidates`, `recommendation`, plus the derivation already done. Occupancy throws. Derivation disagreement returns.

Published sentences on this landing are the ones in this worktree (`src/`, `docs/`, `scripts/`), not corpus YAML. Replace-on-promote copy is rewritten because this landing makes it false. Agent-derived-repo copy on `start_session`, `discover`, `resolveSessionRoot`, `docs/ide-setup.md`, and `docs/api-reference.md` is rewritten to name `working_directory` as the bind input; the omit-both path still admits caller `repo` until Landing 3.

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Occupancy-refuse via `createSessionFile` | Leaves `writeSessionFile` unconditional; migration and store tests keep calling it | Two persist names | **Selected** |
| Occupancy inside `writeSessionFile` | One function | CRITICAL blast; breaks migration | Rejected |
| Reattach occupied child | Caller continues | Six recorded hazards | Rejected (non-goal) |
| Bind host superproject | Matches `resolve-host-repo` | Wrong-repo incidents | Rejected |

### Assumptions

Assumptions underlying the approach: [assumptions log](02-assumptions-log.md).

## Implementation Tasks

Ordered by dependency depth. Leaves before callers. Each task is one commit.

### Task 1: Occupancy wrapper (45–60 min)

**Goal:** A create that finds `session.json` refuses; `writeSessionFile` stays unconditional.  
**Depends on:** none.  
**Deliverables:**
- `FOLDER_OCCUPIED` on `SessionStoreError` (GitNexus CRITICAL, 12 direct; add a variant only)
- `createSessionFile(folder, state)` in `src/utils/session/store.ts`: `sessionFileExists` then throw, else `writeSessionFile`
- `describeSessionStoreError` `FOLDER_OCCUPIED` arm; occupancy `SEAL_MISMATCH` names key rotation (GitNexus CRITICAL, 3 direct)
- Store tests: occupied refuse, files byte-identical; existing store/concurrency/migration suites still call `writeSessionFile`

### Task 2: Path inverse (20–30 min)

**Goal:** Agent-facing `working_directory` maps onto the server tree.  
**Depends on:** none.  
**Deliverables:**
- `receivePathFromAgent` beside `presentPathToAgent` in `src/utils/path-presentation.ts` (GitNexus CRITICAL on the existing function, 4 direct — do not change it)
- Cases in `tests/path-presentation.test.ts`: mapped rewrite, identity when no map, no un-collapse of `owner/repo`

### Task 3: Checkout derivation (60–90 min)

**Goal:** Bound repo is the origin of the checkout under work.  
**Depends on:** Task 2.  
**Deliverables:**
- `src/utils/session/derive-working-directory.ts`: invert, `execFile` `git -C` (no shell string), `normalizeRepoPath`, host ascent, infrastructure paths `workflows` / `.engineering`
- Open-decision objects: `unbound-repo`, `binding-mismatch`, `component-choice`, `unmapped-root`; non-git path is a refuse, not a decision
- Fixture-checkout unit tests (origin SSH/HTTPS, submodule vs host, no-git, no-origin, basename mismatch)

### Task 4: `start_session` durable create (90–120 min)

**Goal:** Optional `working_directory` derives, creates durable, never overwrites a derived slug.  
**Depends on:** Tasks 1–3.  
**GitNexus:** `registerResourceTools` CRITICAL (35 upstream). Intended edit of the `start_session` closure. Re-take impact before editing.  
**Deliverables:**
- Optional absolute `working_directory`; bare/relative rejected
- Present: derive, durable slug (`YYYY-MM-DD-{initiative|workflow_id}`), `createSessionFile`, no transient registry
- Named `planning_folder` with readable session: resume (pin)
- Derived slug with readable session: `FOLDER_OCCUPIED` with folder and existing `session_index`
- Caller `repo` disagreeing with derivation: open decision `binding-mismatch`, nothing created
- Omit both `working_directory` and `planning_folder`: transient tmp unchanged

### Task 5: Promote occupancy (45–60 min)

**Goal:** Transient `dispatch_child` onto an occupied folder refuses; files untouched.  
**Depends on:** Task 1.  
**Deliverables:**
- After `ensurePlanningFolder`: if `sessionFileExists`, `verifySeal`. Readable → `FOLDER_OCCUPIED`. Unreadable → that code, key-rotation wording, files untouched. Absent → `createSessionFile`
- Persistent-parent append unchanged

### Task 6: Published sentences on main (30–45 min)

**Goal:** Sentences this landing makes false, in this worktree only.  
**Depends on:** Tasks 4–5 (behaviour true before the sentence changes).  
**Deliverables:**
- Replace-on-promote: `dispatch_child` description in `src/tools/resource-tools.ts`; `docs/dispatch-model.md`; `scripts/generate-site-data.ts` (regen site if generated regions change)
- Agent-derived repo on main: `start_session` description; `discover` / `repo_binding` in `src/tools/workflow-tools.ts`; `resolveSessionRoot` multi-root error in `src/utils/session/scope.ts`; `docs/ide-setup.md`; `docs/api-reference.md`
- Not this landing: corpus YAML, `meta` activities, `create-session` passing agent-derived `repo`

### Task 7: Spec tests 1–10 (90–120 min)

**Goal:** Ten cases against the real store, not a stub.  
**Depends on:** Tasks 4–5.  
**Deliverables:**
- Cases 1–10 as listed in the [specification](README.md#tests)
- Harness pattern from `tests/variable-seeding.test.ts`; store pattern from `tests/session-store.test.ts`
- Existing start-session, dispatch-child, migration, concurrency suites stay green
- A test that asserts promote-over-occupied is asserting the defect; rewrite it

## Success Criteria

Success criteria: [specification](README.md#acceptance-criteria); [design philosophy](02-design-philosophy.md#success-criteria). Task-level: GitNexus `detect_changes` after each commit names only the symbols that task intended; `writeSessionFile` body is byte-identical to `origin/main`.

## Testing Strategy

Test cases and acceptance matrix: [test plan](06-test-plan.md). Fixture checkouts use real `git init` plus `origin`; occupancy cases hash `session.json` and `.session-token` before and after the refuse.

## Dependencies & Risks

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Editing `writeSessionFile` | HIGH | LOW | Wrapper only; re-take impact before any persist edit |
| Occupancy swallows named resume | HIGH | MEDIUM | Pin test 6; named vs derived split in comprehension |
| Open decision implemented as throw | HIGH | MEDIUM | Successful JSON, no `session_index`; occupancy is the throw |
| Site/docs drift after copy rewrite | MEDIUM | HIGH | `npm run build:site` in Task 6; `docs-drift` suite |
