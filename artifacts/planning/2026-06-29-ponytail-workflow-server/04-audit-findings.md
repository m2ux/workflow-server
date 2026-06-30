# Audit Findings — repo-audit over workflow-server

> Activity: `repo-audit` · step `audit-repo` (technique `audit-repo`) · session `OGMQAL` · artifact prefix `04`
> Lens: `lazy_intensity = ultra`, `pass_scope = repo`. **Report-only** (`report-only-no-apply` + project CLAUDE.md boundary) — no source edits.
> Scope: **repo-level / structural** over-engineering — abstraction layers, indirection on the live path, dependency/config bloat, duplicated structures across modules, speculative generality, layering that earns nothing. The symbol-level dead-export pass is [03-review-findings.md](03-review-findings.md); findings already booked there are NOT re-derived (only cross-referenced where a structural cut overlaps).

Whole-tree pass. Every finding is **caller-verified** (`grep` across `src/`, `scripts/`, `tests/`) before tagging. Live MCP-request-path code is left alone even at `ultra`. Where a structural cut and a symbol cut from 03 touch the same lines, the overlap is named and the lines are NOT double-counted in this scoreboard.

## Findings (one line each — `<tag> <what to cut>. <replacement>. [path]`, biggest-cut-first)

### Speculative generality / dead structure

1. **yagni** the `code: ErrorCode` field + `ERROR_CODES` map + `ErrorCode` type on the five custom error classes — no path reads `.code` and nothing does `instanceof` on these classes; the only consumed member is `message` (thrown, propagated via `Result.err`, surfaced to the agent). The classification layer is built for a `switch (err.code)` dispatcher that never arrived (`no-scaffolding-for-later`). Keep each `class XError extends Error` (the named throw IS used); drop the `code` field, the `ERROR_CODES` const, and the `ErrorCode` export. **−12** [`src/errors.ts:1-9` + one `readonly code` line ×5]

2. **delete** the `src/tools/index.ts` re-export barrel — zero importers; `server.ts` imports `registerWorkflowTools` / `registerResourceTools` from the two tool files directly. Same dead-barrel class as 03's findings 16-18 (`loaders/index.ts`, `utils/index.ts`, `resources/index.ts`); this fourth barrel was missed there. **−2** [`src/tools/index.ts:1-2`]

### Indirection layer that earns nothing

3. **yagni** the `src/types/` re-export layer (`index.ts` + `workflow.ts` + `state.ts`) — three files (40 LOC) that only re-export `src/schema/*.schema.ts` symbols. Every internal `src/` consumer (`tools/`, `loaders/`, `utils/`) already imports the schema modules *directly* (`from '../schema/activity.schema.js'`); the layer's sole importer is `src/index.ts`, the package's public barrel — which on adjacent lines (6-8) ALREADY re-exports the same schema modules directly. So `types/` is a second, parallel public-surface re-shuffle with no internal reader. Collapse: have `src/index.ts` re-export the `.schema.js` modules it needs (it does most of it already) and delete the `types/` directory. No internal import path changes (none route through `types/`). **−40** [`src/types/index.ts`, `src/types/workflow.ts`, `src/types/state.ts`]

### Duplicated structure across modules (scripts-scope — dev tooling, outside core `src/`)

4. **shrink** the hand-rolled workflow-tree walk duplicated across all six wired `check:*` scripts — each of `check-binding-fidelity`, `check-bound-step-purity`, `check-identifier-qualification`, `check-artifact-description`, `check-self-provisioned-input`, `check-activity-technique-overlap` independently re-implements `readdirSync(ROOT).filter(isDirectory)` → per-workflow `activities/` `readdirSync(...).filter('.yaml')` enumeration plus the same `existsSync`/`statSync` guards. Extract one `forEachActivityYaml(root, fn)` (and a sibling `forEachTechniqueFile`) helper in `scripts/` and call it from each script. Reuse rung (Rung 2), not delete — the six checks are live (`npm run check:*`). Roughly 6–10 lines saved per script after the shared helper lands. **~−40** [`scripts/check-*.ts`]

## Confirmed NOT structural over-engineering (verified live or floor — left alone at `ultra`)

- **`Result<T,E>` Either type** (`src/result.ts`, 3 LOC) — genuinely load-bearing across the loader composition chain, not pure ceremony. It is *propagated*, not only unwrapped-at-boundary: `technique-loader.ts:635` returns `base` unchanged on failure, `resource-loader.ts:102/216` thread `rawResult` through, and the tool layer unwraps with `if (!result.success) throw result.error` only at the MCP boundary. Removing it would push `try/catch` into every loader caller — a larger diff, not a smaller one. Keep.
- **The 8-file loaders layer** (`workflow` / `technique` / `markdown-technique` / `resource` / `schema` / `activity` / `core-ops` / `filename-utils`) — not a one-implementation abstraction stack. `markdown-technique-loader` is consumed only by `technique-loader`, but that is a parse-vs-compose split with all live members used; its dead members are already booked in 03 (findings 2-3). `activity-loader.ts` as a *whole-file* dead parallel loader is 03's finding 1 — a symbol/file cut, not re-counted here.
- **The two-tool-file split** (`workflow-tools.ts` 869 LOC, `resource-tools.ts` 635 LOC) — every registered tool in both is on the live MCP request path (confirmed in 03). Size is inherent to the tool surface, not layering bloat.
- **`withAuditLog` / `withSessionStoreErrors` wrappers** — two distinct cross-cutting concerns (trace/audit emission; SessionStoreError→message mapping) applied uniformly to every handler. This is genuine shared behaviour, not a delegating wrapper. Floor-adjacent (error mapping). Keep.
- **Trace subsystem** (`trace.ts` + `TraceStore` + `createTraceToken`/`decodeTraceToken`) — a live feature: `get_trace` reads the store back and `next_activity` emits HMAC trace tokens for cross-handoff segment reconstruction. Not speculative. (`TraceStore.listSessions` is dead — 03 finding 15, symbol-level.)
- **Dependencies** (`@modelcontextprotocol/sdk`, `yaml`, `zod`, `zod-to-json-schema`) — four runtime deps, each on the live path: MCP transport, definition parsing, schema validation, JSON-schema generation. No removable dependency; no hand-rolled reimplementation of any of them. No `native`/`stdlib` finding at the dependency level.
- **`schemas/` JSON vs `src/schema/` zod** — not duplicated source: the JSON files are *generated* from the zod schemas (`build:schemas` → `generate-schemas.ts`) and served as the `workflow-server://schemas` resource. Generator + generated output, not two hand-maintained copies.
- **`origin/`** — empty and untracked (not in `git ls-files`); not committed cruft.

## Scoreboard

```
net: -94 lines, -0 deps possible.
```

`src/`-scoped structural cuts: finding 1 (−12), finding 2 (−2), finding 3 (−40) = **−54 lines**, zero dependencies. Plus scripts-scope finding 4 (~−40) for **~−94** across the tree. No dependency is removable and nothing hand-rolls the standard library or a platform primitive (`canonicaliseJson`, the atomic-write/seal machinery, and the `Result` Either are each minimum-correct for a present need — see 02/03 and the NOT-over-engineering list above). The structural verdict matches the symbol-level one: **the workflow-server is lean where it is live**; its over-engineering is concentrated in *re-export indirection* (`types/`, the dead `tools/` barrel) and *one speculative classification field* (`ErrorCode`), with the only genuine repo-wide duplication living in the dev-tooling `check:*` scripts, not the server. The dominant structural cut is the parallel `types/` layer (−40).
