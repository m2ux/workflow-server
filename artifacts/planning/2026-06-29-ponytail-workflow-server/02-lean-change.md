# Lean Change — apply-ladder over workflow-server

> Activity: `apply-ladder` · step `climb-ladder` (technique `apply-ladder`) · session `OGMQAL` · artifact prefix `02`
> Mode: **report-only** — `lazy_intensity = ultra`, `pass_scope = repo`. No source edits. This artifact records the rung selection and the lean change that WOULD be applied; the tree is unchanged.

---

## Understood problem

There is no concrete feature/bugfix in scope — the deliverable is the audit itself. So the ladder is climbed against the single highest-value lean target the traced flow surfaces: **dead and near-duplicate code in the session-store layer** that no present concrete need justifies.

The [traced flow](01-lean-brief.md#traced-flow-the-real-end-to-end-path-the-audit-touches) confirmed the live load→mutate→save path is:

```
loadSessionForTool → resolveSessionLocation (+ verifySeal + schema-validate)
                   → advanceSession → saveSessionForTool (writeSessionFile)
```

Everything the live path touches is load-bearing. Two symbols sit *beside* it carrying no live weight.

---

## Findings — verified by caller search

| # | Symbol | File | Live callers (`src/`) | Test-only callers | Rung | Verdict |
|---|---|---|---|---|---|---|
| F1 | `resolveSessionIndex` | `src/utils/session/store.ts:551-666` | **none** | `tests/session-store.test.ts` (8 refs) | 1 (YAGNI) | Delete — near-duplicate of the live `resolveSessionLocation` walker |
| F2 | `withSession<R>` | `src/utils/session/resolver.ts:207-216` | **none** | **none** | 1 (YAGNI) | Delete — dead load→mutate→save wrapper; tools inline the three calls |
| — | `redirectTransientToWorkspace` | `store.ts:847` | resource-tools.ts:445 | — | — | **Keep** — live, index-repointing; floor-adjacent |
| — | `navigatePath` / `replacePath` | `resolver.ts:20,63` | live (loadSessionForTool / saveSessionForTool) | — | — | **Keep** — load-bearing embedded-child addressing, no redundancy |
| — | `canonicaliseJson` | `store.ts:118` | live (writeSessionFile) | — | — | **Keep** — deterministic seal input; stdlib `JSON.stringify` is non-deterministic on key order, so this is not a hand-roll-over-stdlib finding |
| — | `_setRenameForTests` / `_writeAtomicForTests` / `_writeSealFromDiskForTests` | `store.ts` | — | tests | — | **Keep** — narrow test seams for the EXDEV/atomic-write floor; cheap, justified |

### F1 — `resolveSessionIndex` is production-dead

The brief assumed it was a live convenience wrapper feeding `verifySeal`. Caller search refutes that: `verifySeal(folderAbsPath)` takes a folder, and the live resolver (`loadSessionForTool`) calls `resolveSessionLocation`, never `resolveSessionIndex`. The only thing keeping `resolveSessionIndex` alive is `tests/session-store.test.ts`.

It is a ~115-line second copy of the same recursive planning-tree walker as `resolveSessionLocation` (lines 470-521 vs 600-647): identical `readdir`/`stat`/`readSessionFile` walk, identical `INVALID_INDEX`/`NOT_FOUND`/`COLLISION`/`WORKSPACE_INVALID` handling. The only difference is the return shape — a bare folder string vs `{ folder, jsonPath }`. Rung 2 (reuse) collapses to Rung 1 (delete) because the value it returns is `resolveSessionLocation(...).folder`.

### F2 — `withSession<R>` is fully dead

Zero references in `src/` and `tests/`. Its own doc comment claims "most authenticated tools fit this shape," but every registered tool inlines `loadSessionForTool` → mutate → `saveSessionForTool` directly (so they can interleave validation, checkpoint, and trace writes between load and save — the wrapper's rigid `fn → {next, result}` shape never fit them). This is `no-scaffolding-for-later` debt: a convenience built for a caller that never arrived.

---

## Lean change (the diff that WOULD be applied — NOT applied here)

Highest reachable rung is **Rung 1 (does it need to exist? — delete)** for both. `take-higher-rung` + `deletion-over-addition`: removing the symbol beats refactoring `resolveSessionIndex` into a thin wrapper over `resolveSessionLocation`, because no live caller needs even the wrapper.

**F2 — delete `withSession` (`resolver.ts:202-216`).** Pure deletion, no replacement. No test references it; nothing to migrate.

**F1 — delete `resolveSessionIndex` (`store.ts:540-666`) and its test block.** Its test (`session-store.test.ts:251` `describe('resolveSessionIndex', …)`) tests a function that no production path reaches; deleting the function deletes the reason for the test. The behaviours that block exercises (collision, not-found, index-regex validation, absolute-workspace guard) are already covered for the live path by `resolveSessionLocation`'s own tests. If any collision/regex assertion is found to be exercised *only* through `resolveSessionIndex`, the lean move is to re-point that one assertion at `resolveSessionLocation`, not to keep the duplicate alive.

Net: roughly -120 LOC in `store.ts`, -10 LOC in `resolver.ts`, minus the dedicated `resolveSessionIndex` test block — zero production behaviour change, since neither symbol is on a live path.

### Ponytail markers — none warranted

Deletion sets no ceiling, so no [`ponytail:` marker](ponytail-marker-convention#convention) is added. A marker records where a lazy solution *stops short*; removing dead code stops short of nothing. (Adding a marker here would itself be the over-engineering the lens hunts for.)

### Runnable assert-based check (floor obligation)

The change is deletion of unreached code, so the floor's "one runnable check for non-trivial logic" is satisfied by the **existing** suites staying green:

```
npm test        # session-store.test.ts + mcp-server.test.ts must pass with F1/F2 removed
npm run typecheck
```

The smallest thing that fails if the deletion is wrong: a `tsc` "cannot find name `withSession`/`resolveSessionIndex`" error, or a red test referencing the deleted symbol. No new test is written — `correct-on-edge-cases` is preserved because `resolveSessionLocation` already owns the collision/not-found edge cases the deleted duplicate also covered.

---

## Safety floor — walked, clear

| Obligation | Status against F1/F2 |
|---|---|
| Problem understood | ✅ Live flow traced; both symbols confirmed off the live path by caller search |
| Input validation at trust boundaries | ✅ Untouched — `session_index` regex + zod validation live in `resolveSessionLocation` / `loadSessionForTool`, which stay |
| Error handling / no data loss | ✅ Untouched — atomic write, seal ordering, EXDEV fallback all in `writeAtomic` / `writeSessionFile`, which stay |
| Security | ✅ Untouched — HMAC seal, `timingSafeEqual`, slug-traversal guards stay |
| Accessibility / calibration | n/a (no user-facing UI, no hardware) |
| Anything explicitly requested | ✅ The whole-tree audit was requested; this artifact reports it |
| One runnable check | ✅ Existing `npm test` / `npm run typecheck` are the check (see above) |

Nothing on the floor is thinned. The deletions sit strictly above it.

---

## ultra-intensity challenge to the requirement (same breath)

Shipped the leanest finding set — two dead/near-duplicate symbols, F1/F2, deletion-only, zero floor cost. The rest of the brief's Rung 3/7 candidates (`canonicaliseJson`, `navigatePath`/`replacePath`) were **dismissed on inspection, not deferred**: each is the minimum correct code for a present need (deterministic seal bytes; embedded-child JSON addressing) with no stdlib that preserves the determinism, so flagging them would be lazy-as-careless, not lazy-as-efficient. Want the audit widened past the session-store layer (loaders, trace store, tools registration) before debt-harvest? Say so — otherwise the over-engineering review proceeds on F1/F2 as the apply-ladder yield.

---

## Variables changed

None set by this step. `safety_floor_cleared` is set by the `safety-floor-cleared` checkpoint (the user decision gate), not here.

## Next

Step 2 of the `climb-until-safe` loop is the blocking `safety-floor-cleared` checkpoint — yield it so the user confirms the minimal solution (F1/F2 deletions) clears the safety floor before the over-engineering review.
