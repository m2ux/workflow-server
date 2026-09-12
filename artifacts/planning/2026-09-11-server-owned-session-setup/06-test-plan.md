# Test Plan: Server-owned session setup (Landing 1)

> **ADR:** none · **Ticket:** [#528](https://github.com/m2ux/workflow-server/issues/528) · **PR:** pending

## Overview

This test plan validates Landing 1: `working_directory` derivation, durable create, occupancy refuse, open-decision shape, and `writeSessionFile` left unconditional.

Key changes to validate:
1. `createSessionFile` — exists-then-delegate; throws `FOLDER_OCCUPIED` when `session.json` is present
2. `deriveWorkingDirectory` — bound repo is the checkout under work
3. `start_session` — optional `working_directory`; durable create; named resume vs derived occupancy
4. Transient `dispatch_child` — occupancy refuse on promote; persistent parent still appends

Harness: `createHarness` + `call` in `tests/variable-seeding.test.ts`. Store: real folders in `tests/session-store.test.ts`. Cases 1–4 and 10 need a fixture checkout with `origin`; 5–9 use the existing store plus harness. No stub that cannot see a second write.

## Planned Test Cases

| Test ID | Objective | Type | Spec |
|---------|-----------|------|------|
| PR528-TC-01 | Verify `start_session` with `working_directory` at a checkout whose origin is `owner/repo` binds that repo, creates a durable folder, returns `session_index`, and registers no transient directory | Integration | 1 |
| PR528-TC-02 | Verify `working_directory` inside a non-infrastructure submodule binds the submodule origin, not the superproject; `host_repo` present when it differs | Integration | 2 |
| PR528-TC-03 | Verify a non-git `working_directory` is refused and no folder is created under the mapped basename | Integration | 3 |
| PR528-TC-04 | Verify caller `repo` that disagrees with derivation returns open decision `binding-mismatch` and creates nothing | Integration | 4 |
| PR528-TC-05 | Verify a derived slug whose folder already holds a readable session throws `FOLDER_OCCUPIED`, names that index, and leaves `session.json` and `.session-token` byte-identical | Integration | 5 |
| PR528-TC-06 | Verify a named `planning_folder` whose folder already holds a readable session resumes (occupancy does not swallow it) | Integration | 6 |
| PR528-TC-07 | Verify transient `dispatch_child` onto a folder that already holds a session throws `FOLDER_OCCUPIED` and leaves the file | Integration | 7 |
| PR528-TC-08 | Verify transient `dispatch_child` onto a folder with `session.json` present and a broken seal throws `SEAL_MISMATCH`, names key rotation, and leaves the file | Integration | 8 |
| PR528-TC-09 | Verify persistent-parent `dispatch_child` still appends; occupancy does not fire | Integration | 9 |
| PR528-TC-10 | Verify open decision `component-choice` when `working_directory` is a host with two non-infrastructure component submodules and the request names neither; a second call that names a candidate creates | Integration | 10 |
| PR528-TC-11 | Verify `createSessionFile` on an empty folder delegates to `writeSessionFile`; occupied folder throws without writing | Unit | Task 1 |
| PR528-TC-12 | Verify `receivePathFromAgent` inverse: longest host root → server root; identity when no map; no un-collapse of `owner/repo` | Unit | Task 2 |
| PR528-TC-13 | Verify derivation unit cases: SSH and HTTPS origin, no origin → `unbound-repo`, basename mismatch → `binding-mismatch`, unmapped root → `unmapped-root` | Unit | Task 3 |

*Detailed steps, expected results, and source links will be added after implementation.*

Boundaries and error paths: empty / relative / bare `working_directory` (reject); 0–1–N children on persistent parent (0 = first child, 1 = occupancy must not fire, N = two children reachable); unreadable session is not absent; open decision is success JSON with no `session_index`.

## Acceptance Criteria Matrix

| Requirement | Acceptance Criterion | Verifying Test Cases |
|-------------|----------------------|----------------------|
| AC-1 Fresh create | `working_directory` derives `owner/repo`, durable folder, `session_index`, no transient directory | PR528-TC-01 |
| AC-2 Bind subject | Checkout under work; differing host reported, not bound | PR528-TC-02 |
| AC-3 Non-git path | Refused; no directory created | PR528-TC-03 |
| AC-4 Open decisions | Named decision, candidates, recommendation; no session created | PR528-TC-04, PR528-TC-10, PR528-TC-13 |
| AC-5 Occupied readable | `FOLDER_OCCUPIED`; files byte-identical | PR528-TC-05, PR528-TC-07, PR528-TC-11 |
| AC-6 Unreadable session | Refused; key-rotation wording; files untouched | PR528-TC-08 |
| AC-7 Named resume | Caller-named folder still resumes | PR528-TC-06 |
| AC-8 Persistent append | Second child appends; occupancy does not fire | PR528-TC-09 |
| AC-9 Persist split | `writeSessionFile` body unchanged; occupancy on `createSessionFile` and promote check | PR528-TC-11 |

## Running Tests

```bash
npm run typecheck
npm run test:ci
npm run test:ci -- tests/session-store.test.ts
npm run test:ci -- tests/path-presentation.test.ts
```

Module and grep names will be filled once the spec cases land in a file.
