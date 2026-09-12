# Codebase Comprehension — Session Setup

> 2026-09-11-server-owned-session-setup · 2026-09-11 · complete · coverage: session birth, persist, promote, path presentation, error surface at [c62606b2](https://github.com/m2ux/workflow-server/commit/c62606b2c26b348f367ecaaa12f8f0009a1c7a87)

The questions this pass asked, the traces that answered them, and the items left for Landings 2 and 3. Settled facts live in the corpus artifact [session-setup.md](../../comprehension/session-setup.md).

## Open Questions

Every question this pass opened is resolved. None carry forward as an input to another comprehension iteration.

| # | Question | Status | Resolution | Deep-Dive Section |
|---|----------|--------|------------|-------------------|
| Q1 | Does occupancy belong on [writeSessionFile](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/store.ts#L422)? | Resolved | No. GitNexus CRITICAL; six direct callers. Occupancy is [createSessionFile](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/store.ts) plus the promote existence check | [Persist cut](#persist-cut--2026-09-11) |
| Q2 | How does the handler tell a named folder from a derived slug? | Resolved | `planning_folder` present is named (resume). `working_directory` present and `planning_folder` omitted is derived (`FOLDER_OCCUPIED`) | [Named versus derived](#named-versus-derived--2026-09-11) |
| Q3 | Does [sessionFileExists](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/store.ts#L875) detect an unreadable session? | Resolved | No. It only stats. Readable versus unreadable is [verifySeal](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/store.ts#L474) in the handler, before [createSessionFile](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/store.ts) | [Occupancy control flow](#occupancy-control-flow--2026-09-11) |
| Q4 | Where does git run, and on which path? | Resolved | New `src/utils/session/derive-working-directory.ts`. Invert presentation first, then `git -C` | [Derivation](#derivation--2026-09-11) |
| Q5 | What is the inverse of [presentPathToAgent](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/path-presentation.ts#L109) named? | Resolved | Add `receivePathFromAgent` beside it. Do not change the existing function | [Path invert](#path-invert--2026-09-11) |
| Q6 | Is an open decision a throw? | Resolved | No. Successful tool JSON, no `session_index`, fields `decision`, `candidates`, `recommendation` | [Open decisions](#open-decisions--2026-09-11) |
| Q7 | Does any test assert the wipe? | Resolved | No test writes twice onto an occupied promote folder. A comment in `variable-seeding.test.ts` restates #429 | [Test surface](#test-surface--2026-09-11) |

## Deep-Dive Sections

### Persist cut — 2026-09-11

Query: `rg 'writeSessionFile\('` on the worktree.

Production call sites:

| Caller | Path | Role |
|--------|------|------|
| Fresh `start_session` | [resource-tools.ts](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/tools/resource-tools.ts#L365) | Create when `session.json` is absent |
| Transient `dispatch_child` | [resource-tools.ts](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/tools/resource-tools.ts#L563) | Promote write; no existence check |
| [migratePlanningFolder](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/migration.ts#L347) | migration | Legacy folder with no `session.json` yet |

Test files that keep calling the unconditional persist: `session-store.test.ts`, `session-scope.test.ts`, `session-concurrency.test.ts`, `mcp-server.test.ts`.

GitNexus `impact({ target: "writeSessionFile", direction: "upstream", repo: "workflow-server" })`: **CRITICAL**, 6 direct, 8 processes in this index, 5 modules. Do not edit the function. `createSessionFile(folder, state)` throws `SessionStoreError('FOLDER_OCCUPIED')` when [sessionFileExists](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/store.ts#L875) is true, then calls [writeSessionFile](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/store.ts#L422). That keeps one persist implementation.

### Occupancy control flow — 2026-09-11

Query: `rg 'sessionFileExists\('` in `src/`.

Hits: [findPlanningFolderBySlug](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/store.ts#L738), [migratePlanningFolder](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/migration.ts#L281), `start_session` peek at [line 231](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/tools/resource-tools.ts#L231), resume-versus-create at [line 255](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/tools/resource-tools.ts#L255). The promote branch at [line 491](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/tools/resource-tools.ts#L491) does not call it.

Promote shape after Landing 1:

1. [ensurePlanningFolder](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/store.ts#L770) (mkdir remains safe; it does not touch `session.json`).
2. If [sessionFileExists](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/store.ts#L875): [verifySeal](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/store.ts#L474). Readable → `FOLDER_OCCUPIED` with folder and stored `sessionIndex`. Unreadable (`SEAL_MISMATCH`, missing seal, schema-invalid) → that code; message names key rotation; files untouched.
3. Else [createSessionFile](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/store.ts).

Persistent-parent append at [line 584](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/tools/resource-tools.ts#L584) stays on [saveSessionForTool](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/resolver.ts). Occupancy does not fire.

Child index on promote is [computeEmbeddedSessionIndex](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/derivation.ts#L122) of the durable folder plus `triggeredWorkflows.0.state`. Slot zero is why a wipe returns the same identifier.

### Named versus derived — 2026-09-11

[start_session](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/tools/resource-tools.ts#L124) today: any [sessionFileExists](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/store.ts#L875) hit resumes. [findPlanningFolderBySlug](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/store.ts#L710) is that hit.

Landing 1 split:

| Caller input | Existing `session.json` | Action |
|--------------|-------------------------|--------|
| Absolute `planning_folder` | Readable | Resume (pin test 6) |
| `working_directory`, no `planning_folder`, dated slug collides | Readable | `FOLDER_OCCUPIED` (test 5) |
| Neither `working_directory` nor `planning_folder`, workflow `meta` | n/a | Transient tmp, unchanged |

`working_directory` is optional on this landing. Bare and relative values are rejected, same rule as `planning_folder` at [line 141](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/tools/resource-tools.ts#L141).

### Derivation — 2026-09-11

Agent technique [resolve-host-repo](https://github.com/m2ux/workflow-server/blob/workflows/meta/techniques/version-control/resolve-host-repo.md) binds the outermost superproject. Landing 1 binds the checkout under work: `git -C {toplevel} remote get-url origin` of the working directory's own toplevel. Host ascent still runs, and emits `host_repo` / `component_path` as facts when they differ.

New file `src/utils/session/derive-working-directory.ts`. `src/` currently has no `child_process` import. Use `execFile` with `git` and `-C`, not a shell string. Parse origin through [normalizeRepoPath](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/config.ts#L274).

Infrastructure submodule paths, from `version-control.infrastructure-submodule-paths`: `workflows`, `.engineering`, or a path starting with `.engineering/`. Test 10 needs two non-infrastructure submodule sections.

Not a git checkout: refuse, no mkdir. No origin: open decision `unbound-repo`. Basename of toplevel disagrees with the repo segment: `binding-mismatch`. Caller `repo` disagrees with derivation: `binding-mismatch`. Several unnamed component submodules: `component-choice`. Path outside every search root: `unmapped-root`.

[resolveSessionRoot](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/scope.ts#L237) still tells the agent to run `resolve-host-repo`. Rewrite that sentence against `working_directory` in the same landing.

### Path invert — 2026-09-11

[presentPathToAgent](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/path-presentation.ts#L109) rewrites the longest matching server root to the corresponding host root, then optionally collapses `owner/repo` to basename. Tests live in `tests/path-presentation.test.ts`.

Inverse: match the longest host root, rewrite onto the server root, return `resolve` of the rest. Do not attempt to un-collapse `owner/repo`; the agent already holds the basename layout. No map: identity `resolve`. Name it `receivePathFromAgent`. GitNexus rates [presentPathToAgent](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/path-presentation.ts#L109) CRITICAL (4 direct). Adding a sibling is the cut.

Call `receivePathFromAgent` before `git -C`.

### Open decisions — 2026-09-11

[withSessionStoreErrors](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/tools/resource-tools.ts#L69) turns `SessionStoreError` into a failed tool call. An open decision is a normal return: JSON with `decision`, `candidates`, `recommendation`, and the derivation already done. No `session_index`. Not a checkpoint. Occupancy is the opposite kind of outcome: a throw with code `FOLDER_OCCUPIED`.

[describeSessionStoreError](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/resolver.ts#L340) needs a `FOLDER_OCCUPIED` arm: folder already holds a run; nothing was written; pass that `session_index` to continue it, or pass a distinct `planning_folder`. Extend the `SEAL_MISMATCH` arm so an unreadable occupancy refuse names key rotation. GitNexus: CRITICAL, 3 direct (`withSessionStoreErrors` in both tool modules, plus `session-concurrency.test.ts`).

[SessionStoreError](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/store.ts#L88) code union gains `FOLDER_OCCUPIED`. GitNexus: CRITICAL, 12 direct. The add is a new variant; existing arms stay.

### Test surface — 2026-09-11

Harness pattern: `tests/variable-seeding.test.ts` (`call('start_session' | 'dispatch_child')` against `createHarness`). Store pattern: `tests/session-store.test.ts` (real folder, real seal). No test in this tree runs `git init`. Tests 1–4 and 10 need a fixture checkout with `origin`. Tests 5–9 can use the existing store plus harness.

[variable-seeding.test.ts](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/tests/variable-seeding.test.ts#L314) comments that a transient re-dispatch replaces the child (#429). It does not perform a second promote onto an occupied folder. Spec: a test that asserts the wipe is asserting the defect.

Published wipe sentences on this landing: [dispatch_child description](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/tools/resource-tools.ts#L439), [docs/dispatch-model.md](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/docs/dispatch-model.md#L43), [generate-site-data.ts](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/scripts/generate-site-data.ts#L362). Agent-facing "derive `repo`" copy is Landing 2.

### Landing 1 edit map — 2026-09-11

Do not edit:

- [writeSessionFile](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/store.ts#L422) — contract stays unconditional
- [presentPathToAgent](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/path-presentation.ts#L109) — add a sibling
- [sessionFileExists](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/store.ts#L875) — keep as stat
- Persistent-parent append in [dispatch_child](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/tools/resource-tools.ts#L584)
- [migratePlanningFolder](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/migration.ts)'s call to [writeSessionFile](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/store.ts#L422)
- Corpus / `workflows/` (Landing 2)
- Transient deletion (Landing 3)

Add:

- `FOLDER_OCCUPIED` on [SessionStoreError](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/store.ts#L88)
- `createSessionFile` in `store.ts`
- `FOLDER_OCCUPIED` arm on [describeSessionStoreError](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/resolver.ts#L340); key-rotation wording on unreadable
- `src/utils/session/derive-working-directory.ts`
- `receivePathFromAgent` in `path-presentation.ts`
- `working_directory` on `start_session` (optional)
- Occupancy check on transient promote; switch that write to `createSessionFile`
- Fresh `start_session` with `working_directory`: derive, durable folder, `createSessionFile`
- Wipe sentences in the three published surfaces above
- Tests 1–10 against the real store

[registerResourceTools](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/tools/resource-tools.ts#L83) is CRITICAL (35 upstream symbols). The start_session and dispatch_child closures live inside it; that is the intended edit, not a reason to skip.

## Challenge Lenses

### Pedagogy — 2026-09-11

A reader who meets `createSessionFile` next to [writeSessionFile](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/store.ts#L422) will assume the new function is a second persist. It is not: it is an exists-then-delegate wrapper. The corpus and this log both state that, because a later implementer who "just adds a guard to writeSessionFile" would take the CRITICAL blast.

`sessionFileExists` sounding like "readable session" is the other trap. The name is a stat. The pedagogy pass marks Q3 resolved by putting verifySeal on the handler, not inside the probe.

Open-decision-as-success is easy to implement as `throw new Error`. Pedagogy: occupancy throws; derivation disagreement returns.

### Rejected-paths — 2026-09-11

Reattach (continue the child found in the folder) is rejected. Six hazards sit in the session-reattach companion. Occupancy-refuse is the path this landing takes.

Occupancy inside [writeSessionFile](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/store.ts#L422) is rejected. Migration and the test suites need unconditional persist.

Binding the host superproject, as [resolve-host-repo](https://github.com/m2ux/workflow-server/blob/workflows/meta/techniques/version-control/resolve-host-repo.md) does, is rejected for `session.json#repo`. The checkout under work is the bind; the host is a fact on the response.

Auto-resuming a derived dated slug is rejected. That would continue yesterday's work package when the caller wanted a new one.

## Follow-up items (out of scope)

- Landing 2: bootstrap procedure, `discover-session` / `initialize-session` / `resolve-target`, agent-facing "derive `repo`" sentences, `create-session` no longer passing an agent-derived `repo`.
- Landing 3: delete transient folders, the process-local registry, and the promote-to-empty-folder branch.
- Reattach on the append-only session record.
- `O_EXCL` create for a race between exists-false and persist. Spec occupancy is `sessionFileExists` then persist, not exclusive-create.
