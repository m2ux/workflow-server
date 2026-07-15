# Code Review — Token Use Tracking (#232)

## Manual Diff Review

**Flagged rows:** 3, 8, 9, 13 (price table / cost estimation surface)

### Block 3 — `src/config.ts`

**Stakeholder feedback (verbatim):** "The pricing table bakes in Anthropic models. I want usage metrics to be harness agnostic. This may change the design assumptions."

**Severity:** Design concern — stakeholder triage (not a code defect)

### Block 8 — `src/utils/usage.ts`

Same concern applies to `estimateCost` (L36–59), which applies Anthropic-documented cache multipliers (read ×0.1, 5m write ×1.25, 1h write ×2) when computing USD from the price table.

### Block 9 — `tests/config.test.ts`

Tests assert Anthropic-seeded `DEFAULT_PRICE_TABLE` loads correctly (PR233-TC-09). Couples test fixtures to the same vendor defaults as production config.

### Block 13 — `tests/usage.test.ts`

`estimateCost` tests use `claude-sonnet-5` as the exemplar model (PR233-TC-05/06). Correct for current defaults but reinforces Anthropic-centric fixtures.

### Harness-agnostic assessment

| Layer | Harness-agnostic? | Evidence |
|-------|-------------------|----------|
| **Usage metrics (token counts)** | **Yes** | `usageParamSchema` (`workflow-tools.ts:L46–54`) accepts generic `input_tokens`, `output_tokens`, optional cache figures, and optional `model` string — no Anthropic-specific fields. Any harness that relays native usage figures can populate the param. Token capture, roll-up, and persistence do not depend on vendor identity. |
| **Cost estimation (USD)** | **No — vendor/model-specific by nature** | Cost requires mapping `(model id → USD/MTok rates)`. `DEFAULT_PRICE_TABLE` (`config.ts:L66–71`) currently seeds four Anthropic Claude model ids. `estimateCost` returns `null` when `model` is absent or unlisted — tokens still record (SC-4/SC-6). Cache-rate derivation assumes Anthropic multiplier semantics (RS-2). |

**Recommended path forward:**

1. **Ship metrics now; treat cost as an optional layer.** Token tracking (SC-2, SC-5, SC-6) is already harness-agnostic. Cost is additive and degrades gracefully (`cost_usd: null`).
2. **Decouple default price table from Anthropic branding.** Replace `DEFAULT_PRICE_TABLE` with an empty table or a neutral `{ "example-model": … }` placeholder; document that operators supply rates via future env/file override (PL-5 deferred full-table override) or deployment-specific config.
3. **Pluggable pricing provider.** Keep `PriceTable` as `Record<string, { input, output }>` but allow injection at `loadConfig` time; consider a `PRICE_TABLE_PATH` env for operator-owned JSON independent of vendor.
4. **Cache multiplier policy.** Move multiplier constants to config or make them per-vendor profiles rather than hardcoding Anthropic semantics in `estimateCost` — or accept relayed pre-computed `cost_usd` from the harness (new optional field) so the server never prices.
5. **Stakeholder decision gate.** If harness-agnostic cost is a hard requirement, scope cost estimation out of v1 server defaults and limit v1 to token metrics + optional harness-relayed cost; revisit RS-4/DI-1 assumption that the server owns pricing.

**Rationale correction:** Block 3 rationale accurately describes Anthropic-seeded defaults; stakeholder confirms this is the concern, not a factual error in the rationale text.

---

## Lean-Coding Audit

### Initial pass

`src/utils/usage.ts:L108-113`: yagni `addWorkflowTotals` one-line alias wrapping `addToWorkflowTotal`. Inline at `sumUsageTree` call site.
`src/utils/usage.ts:L28-34`: shrink `deriveTotalTokens` dead cross-check branch — both branches return `derived`. Return `input_tokens + output_tokens` directly.
`src/utils/usage.ts:L136-149`: shrink `buildActivityUsageEntry` sequential if-assignments. Use conditional spreads in the return object.
`src/utils/usage.ts:L174-190`: shrink `recordActivityUsage` history `data` builder. Consolidate optional fields into one conditional-spread object.

net: -23 lines possible.

### Post-simplification re-score

Lean already. Ship.

---

## Code Review Findings

### Informational

| ID | Severity | File | Finding |
|----|----------|------|---------|
| CR-1 | Informational | `src/config.ts:L66–71` | `DEFAULT_PRICE_TABLE` hardcodes Anthropic Claude model ids. Stakeholder wants harness-agnostic usage metrics; cost defaults should be operator-supplied or empty. See Manual Diff Review assessment. |
| CR-2 | Informational | `src/utils/usage.ts:L48–56` | Cache cost multipliers (×0.1 / ×1.25 / ×2) embed Anthropic pricing semantics (RS-2). Non-Anthropic harnesses relaying cache token counts would get incorrect cost unless multipliers are configurable or cost is harness-relayed. |
| CR-3 | Informational | `src/tools/workflow-tools.ts:L463–470` | Usage attributed to the **exited** activity at the transition seam — checkpoint/dispatch window tokens mis-filed per IA analysis. Accepted v1 risk (DI-2 deferred). |

### Nit

| ID | Severity | File | Finding |
|----|----------|------|---------|
| CR-4 | Nit | `src/utils/usage.ts:L23–24` | `emptyWorkflowTotal()` initializes `cost_usd: 0` while unknown/unpriced activities use `null`. Semantically distinct ("zero cost" vs "not yet priced"); harmless until first usage lands but slightly inconsistent with SC-4 `null` semantics. |

### Summary

No Critical, Major, or Minor code defects found. Implementation matches the analysis spec and requirements (SC-1..SC-6 server-side). One stakeholder design concern on price-table vendor coupling — metrics path is harness-agnostic; cost path is intentionally model-keyed. Recommend stakeholder decision on whether to empty defaults, externalize pricing, or defer server-side cost to a later iteration.
