# Post-Implementation Review — Work Package Transition Folder Defect

**Reviewed commit:** `e5c323d` on `fix/work-package-transition-folder-defect`
**Scope:** Single-pass focused review (user direction: keep it simple).
**Pipeline:** Manual diff + code review + test review, combined into one artifact. Full prism analysis skipped.

---

## Summary verdict

The change is correct, contract-conforming, and well-contained. Tests pass (322/322), typecheck clean. **No Critical, Major, or Minor findings.** One Informational architectural observation about the `transition-` slug-detection deviation is recorded below for future consideration; it does not block merge.

`needs_code_fixes = false`
`needs_test_improvements = false`

---

## Change scope

```
src/tools/resource-tools.ts  | +43 / -15   (description string + transient branch rewrite)
tests/mcp-server.test.ts     | +62 / -25   (two existing tests flipped to assert documented contract)
2 files, +105 / -40
```

Three logical edits, no surprise blast radius:

1. `dispatch_child` tool description string updated to describe the promotion behaviour.
2. Transient-parent branch (`resource-tools.ts:283-336`) rewritten end-to-end.
3. Two test cases in `tests/mcp-server.test.ts` updated to assert meta-on-top / child-embedded / tmp-discarded.

---

## Code review

### Contract conformance (the load-bearing check)

The new transient branch mirrors the persistent-parent branch (`:338-371`) structurally, with two intentional deltas:

| Step | Persistent (`:338-367`) | New transient (`:283-331`) | Match? |
|---|---|---|---|
| Compute child `sessionIndex` | `computeEmbeddedSessionIndex(parentFolder, [...jsonPath, 'triggeredWorkflows', N, 'state'])` | `computeEmbeddedSessionIndex(promotedWorkspaceFolder, ['triggeredWorkflows', 0, 'state'])` | Yes — `jsonPath` is `[]` for the promoted root, so the explicit `[triggeredWorkflows, 0, state]` is equivalent. |
| Build `childInitial` | `createInitialSessionFile({ ... })` with no `parentSession` | Same, no `parentSession` | Yes — matches the documented invariant that embedding under `triggeredWorkflows[].state` is the canonical parent-link mechanism, not `parentSession`. |
| Append child entry + history | `advanceSession(loaded.state, draft => { push triggeredWorkflows + history })` | Identical primitives, identical fields | Yes. |
| Persist | `saveSessionForTool(loaded, parentNext)` | `writeSessionFile(promotedWorkspaceFolder, parentNext)` | Equivalent for a freshly-promoted folder (no prior seal to reconcile; the new file is the first write under the slug). |
| Cleanup | (none) | `discardTransient(parentFolder)` last, after the durable write | Correct ordering — the tmp folder is only dropped after the workspace file is on disk. |

The ordering — `ensurePlanningFolder` → `computeEmbeddedSessionIndex` → `createInitialSessionFile` → `advanceSession` → `writeSessionFile` → `discardTransient` — is correct. If the write fails, the tmp folder is preserved (crash safety; the user can retry). The registry entry for the transient slug is cleaned up inside `discardTransient` (`store.ts:807-820`), which also reaps any orphan `transientFolderByIndex` entries pointing at the discarded folder. Nothing leaks.

**Question worth flagging (but not a defect):** the persistent branch calls `saveSessionForTool`, which I'd expect to do seal-update + token write; the transient branch uses the lower-level `writeSessionFile`. Confirmed by reading `writeSessionFile` callers in `start_session` (`:185, :197`) — it does perform the full seal write for new folders, so this is correct for the promotion case. The asymmetry is intentional: persistent has an existing seal to advance; transient has no prior seal at the destination folder.

### Slug-derivation logic (the deviation)

```ts
const registrySlug = lookupTransientSlugByFolder(parentFolder);
const promotedSlug = (registrySlug && !registrySlug.startsWith('transition-'))
  ? registrySlug
  : `${new Date().toISOString().slice(0, 10)}-${workflow_id}`;
```

This works correctly and the comments explain why. The deviation from the plan (the bare `??` fallback would never fire because `start_session` always registers *some* slug — the synthetic `transition-<uuid>` when none was supplied) is documented in `README.md` § Implementation Notes.

The string-prefix check `registrySlug.startsWith('transition-')` couples this call site to the slug-minting convention at `resource-tools.ts:113`. **See architectural observation below.**

### Other code-quality checks

- **No process attribution / no narrating comments.** Comments explain *why* (e.g. lines `:284-297` explain the two deltas from the persistent branch and the synthetic-slug rationale), not *what*.
- **No unrelated drift.** The diff is exactly the transient branch + tool description + two tests.
- **No new imports or helpers.** Re-uses `ensurePlanningFolder`, `computeEmbeddedSessionIndex`, `createInitialSessionFile`, `advanceSession`, `writeSessionFile`, `discardTransient` — all already imported and exercised by the persistent branch.
- **Error handling parity.** The transient branch still throws via `withSessionStoreErrors` for filesystem failures; no new try/catch needed.
- **Return shape parity.** Both branches return `{ session_index, workflow: { id, version } }`; transient additionally surfaces `planning_slug`, which is appropriate context for the caller (the persistent branch's planning_slug is already known to the caller because they own the parent's folder; transient callers don't, so surfacing it is useful, not noise).

---

## Test review

### What changed

Two existing tests were flipped from asserting the buggy shape to asserting the documented contract:

1. **`meta sessions live in os.tmpdir() (not the workspace) and are discarded when a child captures them`** — now asserts:
   - Promoted file at `<slug>/session.json` has `workflowId === 'meta'`, no `parentSession`, `triggeredWorkflows.length === 1`, child entry's nested `state.workflowId === 'work-package'`, child entry's `sessionIndex` matches the returned session index.
   - `triggeredWorkflows[0].status === 'running'` (regression guard on the state machine).
   - Tmp folder is gone after dispatch (set-difference check on `os.tmpdir()` listings before/after; tolerant of pre-existing orphans, which is the right call given `discardTransient` is documented as best-effort).

2. **`three-level dispatch (A → B → C → D) records the full chain in D's session.json`** — chain is now `meta → work-package → remediate-vuln → prism-update`, all four levels embedded under `triggeredWorkflows[0].state` recursively, with meta at the top and no `parentSession` anywhere. This is the right end-to-end coverage for the new contract: it confirms the transient promotion produces a top-of-tree node whose embedding shape is identical to all interior nodes.

### Test quality assessment

- **Right level of granularity.** The first test asserts the contract directly (shape of the promoted file); the second test asserts the *system property* (uniform embedding all the way down). Together they cover both unit-level correctness and architectural invariants.
- **Regression coverage preserved.** The persistent-parent tests (the documented contract pre-fix) were left untouched and continue to pass, so the persistent branch is regression-guarded by the four existing tests called out in the work-package plan.
- **No anti-patterns spotted.** No mocking of filesystem internals; no over-specified assertions on incidental fields (e.g., timestamps, UUIDs); no flaky waits.
- **Cleanup assertion is well-thought-out.** The set-difference approach on `tmpdir()` listings is more robust than asserting the listing is empty (which would fail on any developer machine with stale orphans from previous test runs). Comment at `tests/mcp-server.test.ts:1640-1644` explains the tolerance.
- **Minor observation, Nit:** The `readdirSync` dynamic import is done inline (`tests/mcp-server.test.ts:1595`) while `readFileSync` is added to the top-level destructured import. Either pattern is fine; the inline one was added later in the test and isn't worth refactoring.

---

## Architectural observation (Informational, not blocking)

### The `transition-` slug-detection deviation

The implementation deviates from the plan's `lookupTransientSlugByFolder(parentFolder) ?? <fallback>` to a prefix-check guard `(registrySlug && !registrySlug.startsWith('transition-'))`. This works and is documented, but it encodes a coupling: **the dispatch_child site has to know how `start_session` mints synthetic slugs.** If the synthetic-slug convention ever changes from `transition-<uuid>` to, say, `bootstrap-<uuid>` or `_anon-<uuid>`, this call site silently misclassifies and the symptom returns (workspace folder named after a synthetic slug, no test catches it unless the slug shape is `transition-`-prefixed).

**Cleaner alternative for future consideration:** push the "was a slug user-supplied?" signal closer to its source. Two viable shapes:

1. **Registry-level distinction.** Have `start_session` register synthetic slugs differently — either skip `transientFolderBySlug.set(slug, folder)` when the slug is server-minted (so `lookupTransientSlugByFolder` returns `undefined` for synthetic cases and the bare `??` fallback works as the plan intended), or store an `isUserSupplied: boolean` alongside the slug and expose a `lookupUserSlugByFolder` that returns `undefined` for synthetic.
2. **Slug-shape predicate co-located with minting.** Export an `isSyntheticTransientSlug(slug): boolean` from the same module that owns the `transition-<uuid>` minting convention. The check at `resource-tools.ts:299` then calls that predicate by name instead of duplicating the prefix literal.

Option 1 is the structurally cleanest (it pushes the distinction into the data model, not into a string-prefix convention). Option 2 is a one-line refactor that captures most of the benefit without a registry change.

**Why I'm flagging this as Informational, not Minor:** the current implementation is correct, well-commented, has exactly one caller, and is in a code path that — by definition — only runs during a dispatch from a meta-bootstrap session. The slug-minting convention is not under pressure to change. The cost of the coupling today is one extra mental hop when reading the code; the cost of refactoring is non-zero (touches `store.ts` and `start_session`). Recommending the refactor would inflate scope on a "simple fix" work package. Recording it here so it's discoverable when the next change in this area happens.

---

## Findings table

| ID | Severity | Type | Location | Description | Recommendation |
|---|---|---|---|---|---|
| F1 | Informational | Architecture | `src/tools/resource-tools.ts:299`, `src/tools/resource-tools.ts:113`, `src/utils/session/store.ts:779-782` | The `registrySlug.startsWith('transition-')` guard couples the dispatch_child call site to the synthetic-slug convention owned by `start_session`. Works correctly today; the coupling is the cost. | Defer. If this area is touched again, consider either (a) not registering synthetic slugs in the by-slug map at all, restoring the plan's `??` fallback semantics, or (b) extracting an `isSyntheticTransientSlug` predicate next to the minting site. Not worth a code change in isolation. |

No Critical, Major, Minor, or Nit findings.

---

## Classification flags (for activity post-conditions)

- `needs_code_fixes = false` — no findings at Minor severity or above.
- `needs_test_improvements = false` — test changes correctly encode the new contract; existing persistent-branch regression tests untouched and passing.
- `has_critical_blocker = false` — no blocker raised.

The `review-fix-cycle` loop does not run. Transition: → `validate` (default).
