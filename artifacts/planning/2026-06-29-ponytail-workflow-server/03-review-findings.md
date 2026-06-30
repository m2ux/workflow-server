# Review Findings — over-engineering-review over workflow-server

> Activity: `over-engineering-review` · step `review-change` (technique `review-over-engineering`) · session `OGMQAL` · artifact prefix `03`
> Lens: `lazy_intensity = ultra`, `pass_scope = repo`. **Report-only** (`report-only-no-apply` + project CLAUDE.md boundary) — no source edits.
> Scope: over-engineering only. Correctness / security / performance are the [safety floor](the-ladder#safety-floor) and out of scope.

Whole-tree pass. Every finding below is **caller-verified** (`grep` across `src/`, `scripts/`, `tests/`) before tagging — a symbol is flagged only when no live `src/` path reaches it. Symbols on the live MCP request path are left alone even at `ultra`. The session-store layer findings F1/F2 from [02-lean-change.md](02-lean-change.md#findings--verified-by-caller-search) are carried into the scoreboard, not re-derived here.

## Findings (one line each — tag · location · simpler alternative · lines saved)

### Dead exported functions (no live `src/` caller; reachable only from their own unit tests, or nothing)

1. **delete** — `src/loaders/activity-loader.ts:1-201` (whole file): a parallel activity loader (`readActivity`, `readActivityFromWorkflow`, `listActivities`, `listActivitiesFromWorkflow`, `findWorkflowsWithActivities`, `getActivityDir`, `ActivityEntry`, `ActivityWithGuidance`, the `next_action` guidance shape) — the live `get_activity` path uses `readActivityRaw` in `workflow-loader.ts`; only `tests/` + the dead `loaders/index.ts` barrel reference it. Delete the file and its test. **−201**
2. **delete** — `src/loaders/markdown-technique-loader.ts:552-566` `readMarkdownTechnique` — zero references anywhere; docstring claims "Used by technique-loader.ts" but that file calls `tryLoadMarkdownTechnique` directly. **−15**
3. **delete** — `src/loaders/technique-loader.ts:220-255` `readTechniqueRaw` (+ its private helper `tryReadSkillRawInWorkflow:72-79`, and the now-orphaned `tryReadMarkdownTechniqueRaw` in markdown-technique-loader.ts:511-519) — no `src/` caller; live raw-projection uses `composeTechnique` + `projectTechniqueToYaml`. Test-only. **−40**
4. **delete** — `src/loaders/technique-loader.ts:85-114` `listMarkdownTechniqueIds` + `listWorkflowTechniqueIds` — no `src/` caller; test-only listing API. **−30**
5. **delete** — `src/utils/session/derivation.ts:133-142` `computeEmbeddedSessionIndexSync` — zero references anywhere (not even tests); the async `computeEmbeddedSessionIndex` is the live form. **−10**
6. **delete** — `src/utils/session/derivation.ts:83-87` `computeSessionIndexSync` — no `src/` caller; the async `computeSessionIndex` is live. Test-only (key-variance check could call the async form). **−6**
7. **delete** — `src/utils/session/store.ts:820-845` `discardTransient` — zero callers; `redirectTransientToWorkspace` does not invoke it (only a doc comment names it). `no-scaffolding-for-later`. **−26**
8. **delete** — `src/utils/session/store.ts:756-784` `ensureNestedPlanningFolder` — imported into `resource-tools.ts:19` but never called; no test. Dead export + dead import line. **−32**
9. **delete** — `src/loaders/resource-loader.ts:96-104` `readResource` (the content-string variant) — zero callers; live reads use `readResourceRaw` / `readResourceStructured`. **−9**
10. **delete** — `src/loaders/resource-loader.ts:137-177` `listResources` + `getResourceEntry` + `listWorkflowsWithResources:225-249` — chain has no `src/` or test caller (`getResourceEntry`/`listWorkflowsWithResources` only call `listResources`, and nothing calls them). Dead exported listing API. **−65**
11. **delete** — `src/utils/validation.ts:31-36` `validateWorkflowConsistency` — no `src/` caller; live transition guard is `validateActivityTransition`. Test-only. **−6**
12. **delete** — `src/utils/validation.ts:59-79` `validateTechniqueAssociation` — no handler wires it in; `no-scaffolding-for-later`. Test-only. **−21**
13. **delete** — `src/utils/validation.ts:210-215` `buildErrorValidation` — no `src/` caller; live path uses `buildValidation`. Test-only. **−6**
14. **delete** — `src/loaders/workflow-loader.ts:353-365` `validateTransition` (`{valid, reason}` variant) — no `src/` caller; `validateActivityTransition` (validation.ts) is the live guard and calls `getValidTransitions` itself. Test-only. **−13**
15. **delete** — `src/trace.ts:108-110` `TraceStore.listSessions` — no `src/` caller; test-only. **−3**

### Dead re-export barrels (no importer)

16. **delete** — `src/loaders/index.ts:1-6` — nothing imports the barrel; tools import each loader file directly. Removing it also drops the last non-test reference to `activity-loader`. **−6**
17. **delete** — `src/utils/index.ts:1-3` — nothing imports it; consumers import `utils/session/index.js` and `utils/validation.js` directly. **−3**
18. **delete** — `src/resources/index.ts:1` — nothing imports it; `server.ts` imports `resources/schema-resources.js` directly. **−1**

### Dead imports / fields / fallbacks

19. **delete** — `src/tools/resource-tools.ts:24` unused `planningRoot` import (the function stays — it is live inside `store.ts`; only the import here is dead). **−1**
20. **delete** — `src/loaders/resource-loader.ts:23-26` `ResourceEntry.name` field — documented "Same as id; kept for callers that previously read .name"; its only consumers are the dead `listResources`/`getResourceEntry` (finding 10). Falls with them. **−1**
21. **delete** — `src/loaders/resource-loader.ts:53-56` the `guides/` fallback in `getResourceDir` — no workflow on disk uses a `guides/` directory; every workflow uses `resources/`. Speculative backward-compat with no concrete case. **−6**

### Carried from apply-ladder (session-store layer, [02-lean-change.md](02-lean-change.md))

22. **delete** — `src/utils/session/store.ts:551-666` `resolveSessionIndex` (F1) — production-dead near-duplicate of `resolveSessionLocation`; test-only. **−115** (+ its dedicated test block)
23. **delete** — `src/utils/session/resolver.ts:207-216` `withSession<R>` (F2) — fully dead load→mutate→save wrapper; tools inline the three calls. **−10**

## Confirmed NOT over-engineering (verified live or floor — left alone at `ultra`)

- All `workflow-tools.ts` / `resource-tools.ts` tool handlers — every registered tool is on the live MCP request path.
- `canonicaliseJson`, `navigatePath`/`replacePath`, the atomic-write/seal machinery, `computeSessionIndex`/`computeEmbeddedSessionIndex` (async) — load-bearing or safety floor (dismissed on inspection per [02](02-lean-change.md#ultra-intensity-challenge-to-the-requirement-same-breath)).
- `_setRenameForTests` / `_writeAtomicForTests` / `_writeSealFromDiskForTests` — narrow seams for the EXDEV/atomic-write floor; cheap, justified (a single runnable check for non-trivial logic is floor, never a `delete`).
- `migration.ts` (`migratePlanningFolder` + helpers) — live via `start_session`; the legacy-migration path is explicitly in scope as present need. `hasLegacyArtifacts` is test-only but is a legitimate detection seam — its only debt is a misleading "and diagnostic tooling" docstring (doc nit, not a taxonomy finding).
- The `B3/B4/R4`, "pre-migration", "unchanged in shape" evolution-narration comments in `technique-loader.ts` violate the `.engineering` doc-voice rule but are a code-commentary style nit, not an over-engineering construct — out of this review's taxonomy.

## Scoreboard

```
net: -465 lines
```

Sum of the per-finding savings above (findings 1–23), plus the `resolveSessionIndex` test block (finding 22) which is additional. The dominant cut is the parallel `activity-loader.ts` (−201) and the dead resource-loader listing API (−65). Twenty-one of the twenty-three findings are `delete`; none are `shrink`/`stdlib`/`native` — the workflow-server source is tight where it is live, and its over-engineering is almost entirely **dead exported surface kept alive by its own unit tests and by-the-barrel re-exports**, not bloated live logic. No `yagni` abstraction-with-one-product was found in live code.
