# Change Block Index — Token Use Tracking (#232)

**Branches:** `main` → `feat/232-token-use-tracking-and-cost-estimation` · **13 files** · **27 hunks** · **~14 minutes**

Review the diff in your side-by-side tool (VS Code, Meld, etc.). Reply with row numbers of blocks with issues (e.g. `3, 7`) or `none`. Rationale corrections are recorded in [09-code-review.md](09-code-review.md) under Manual Diff Review.

| Row | Path | File |
|-----|------|------|
| [1](#block-1) | `schemas/` | session-file.schema.json |
| [2](#block-2) | `schemas/` | state.schema.json |
| [3](#block-3) | `src/` | config.ts |
| [4](#block-4) | `src/schema/` | session.schema.ts |
| [5](#block-5) | `src/schema/` | state.schema.ts |
| [6](#block-6) | `src/tools/` | workflow-tools.ts |
| [7](#block-7) | `src/utils/session/` | store.ts |
| [8](#block-8) | `src/utils/` | usage.ts |
| [9](#block-9) | `tests/` | config.test.ts |
| [10](#block-10) | `tests/` | mcp-server.test.ts |
| [11](#block-11) | `tests/` | session-schema.test.ts |
| [12](#block-12) | `tests/` | session-store.test.ts |
| [13](#block-13) | `tests/` | usage.test.ts |

## Block Rationale

### Block 1

Adds the `usage` object shape to the generated session-file JSON Schema: `perActivity` map of token/cost entries and a `workflowTotal` roll-up. Keeps the schema mirror in sync with the Zod source so MCP clients and external validators see the new optional field. Regenerated via `build:schemas`; no behavioural change on its own.

### Block 2

Extends the generated state schema enum with `usage_recorded` as a new history event type. Matches the Zod `HistoryEventTypeSchema` addition in `state.schema.ts`. The open `data` payload carries usage figures without further schema tightening, following the existing `technique_bundled` pattern.

### Block 3

Introduces the config price table (`PriceTable`, `DEFAULT_PRICE_TABLE`, `DEFAULT_PRICE_TABLE_VERSION`) and wires `priceTable` / `priceTableVersion` into `ServerConfig` and `loadConfig`. Mirrors the existing bundling-knob idiom with build-time defaults and a `PRICE_TABLE_VERSION` env override. Seeds Anthropic per-MTok rates captured during research; cache rates are derived at cost-estimation time, not stored in the table.

### Block 4

Defines the durable usage model on `SessionFile`: `ActivityUsageEntrySchema`, `WorkflowUsageTotalSchema`, `SessionUsageSchema`, and the optional `usage` field on the base schema and interface. Optional-with-absent preserves back-compat for existing session files. Documents that child-inclusive totals appear at workflow completion via `finalizeUsageTree`.

### Block 5

Adds `usage_recorded` to the Zod history event enum in the source schema. Shared by both `SessionFile` and legacy `WorkflowState` through `HistoryEntrySchema`; purely additive with no migration required for legacy state.

### Block 6

Declares the optional `usage` param on `next_activity` (`usageParamSchema`), captures usage at the exit-prior seam via `recordActivityUsage`, and calls `finalizeUsageTree` at terminal transition. Surfaces usage through `inspect_session` / `get_workflow_status` via new `projectUsage` projection and a `usage` view. This is the primary integration seam — orchestrator-relayed figures only, never server-fabricated.

### Block 7

Adds `'usage'` to `TOP_LEVEL_KEY_PRIORITY` after `variables` and before `history`, keeping canonical session serialization stable and predictable. One-line change; omission would not break correctness but would diverge from the house convention for top-level field ordering.

### Block 8

New pure helpers module: `estimateCost` (with derived cache multipliers), `deriveTotalTokens`, merge/roll-up utilities, `recordActivityUsage`, `sumUsageTree`, and `finalizeUsageTree`. Isolated for unit testing without session I/O. Implements the analysis-specified cost model (unknown model → `null`, re-entered activities merge, child-inclusive tree walk).

### Block 9

Unit tests for price table defaults and `PRICE_TABLE_VERSION` env override (PR233-TC-09). Confirms config loading path for the new knobs without touching unrelated config behaviour.

### Block 10

Integration tests exercising the `next_activity` usage param end-to-end: per-activity capture (TC-10), omitted param graceful path (TC-11), cache figure presence/absence (TC-12), unknown model → `cost_usd: null` (TC-15). Uses `inspect_session` with `view: 'usage'` and history type counts to assert persistence.

### Block 11

Schema round-trip tests for `SessionFile` with and without `usage` (TC-01, TC-02) and `usage_recorded` history entry validation (TC-03). Guards the Zod layer that all persistence and read paths depend on.

### Block 12

Canonical serialization test placing `usage` before `history` per `TOP_LEVEL_KEY_PRIORITY` (TC-04). Ensures HMAC-sealed session files remain deterministic after the new field lands.

### Block 13

Dedicated unit tests for `estimateCost` (base, cache multipliers, unknown model), `deriveTotalTokens`, `sumUsageTree` child roll-up (TC-08), `mergeActivityUsage` null-cost propagation, and `recordActivityUsage` re-entry merge. Covers the pure helper surface independently of MCP integration.
