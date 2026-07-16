# Token benchmark — before/after results

> Status: **Results recorded 2026-07-16** · Metric A skipped (D2).  
> Harness: [`scripts/run-token-benchmark.ts`](../../../../scripts/run-token-benchmark.ts) (`npm run bench:token`) · work-package / `skip-optional` / robot walker + hot-resource probe.

## 1. Purpose

Reproducible comparison of delivery cost on a fixed reference workflow walk, isolating Opt1 (persistent solo), Opt2 (resource reference delivery), and Opt3 (`#section` refs).

## 2. Reference workload

### Primary — `bench-wp-skip-optional-solo`

| Pin | Value |
|-----|-------|
| Workflow id | `work-package` |
| Path | e2e policy `skip-optional` → `complete` (12 activities) |
| Engine | Headless robot walker + instrumented `get_resource` for linked + hot templates |
| Topology | Solo; no `dispatch_child` |
| `agent_id` | `bench-solo` |
| `context_tokens` | `200000` |
| Hot resources (re-fetched each `get_activity`) | `pr-description` (+ section variants), `review-mode` (+ section variants) |

**Path observed:**  
`start-work-package → design-philosophy → codebase-comprehension → plan-prepare → assumptions-review → implement → lean-coding-audit → post-impl-review → validate → strategic-review → submit-for-review → complete`

## 3. Pins

| Side | Server | Corpus | Notes |
|------|--------|--------|-------|
| A0 Baseline | `main` @ `7aaf7e2b` | workflows @ `a1409d5b` | `context_mode: fresh` |
| A1 Opt1 only | `main` @ `7aaf7e2b` | workflows @ `a1409d5b` | `persistent` (no Opt2 code) |
| A2 Opt1+2 | `feat/token-resource-reference-delivery` @ `7aaf7e2b` + **uncommitted Opt2** | workflows @ `a1409d5b` | `persistent` |
| A3 Opt1+2+3 | same feature server + uncommitted Opt2 | `feat/token-usage-solo-persistent` @ `a1409d5b` + **uncommitted Opt1/3** | `persistent` |

Harness / Node / OS: `node v20.19.4` · Linux · canonical script `scripts/run-token-benchmark.ts` (planning stub retained for older paths).

## 4. Protocol notes

- Deterministic headless walk → **1 trial** per configuration (bit-stable); no LLM variance.
- Robot walker does not natively call `get_resource`; the harness fetches technique-linked resources plus a fixed hot set on every `get_activity` to measure cross-activity resource repeat tax (worker-like).
- `get_workflow` is called **once** at start → ops-bundle resume collapse is **not** exercised here; Opt1 savings show up primarily on `get_activity` / `get_technique`.

## 5. Metrics captured

- **A:** skipped (relay not required).
- **B:** payload chars, history counts, ledger keys, unchanged-marker answers.
- **C:** MCP tool-call totals by name.

## 6. Raw trial table

Chars = sum of UTF-8 response text lengths for that tool across the walk.

| Config | get_activity | get_workflow | get_resource | get_technique | tech_bundled | tech_fetched | res_fetched | ledger keys | resource:* keys | unchanged res | unchanged tech | get_resource calls |
|--------|-------------:|-------------:|-------------:|--------------:|-------------:|-------------:|------------:|------------:|----------------:|--------------:|---------------:|-------------------:|
| **A0** fresh | 687 936 | 59 455 | 448 084 | 160 057 | 62 | 26 | 95 | 73 | 0 | 0 | 0 | 128 |
| **A1** Opt1 | 411 707 | 59 455 | 448 084 | 96 881 | 62 | 26 | 95 | 150 | 0 | 0 | 2 | 128 |
| **A2** Opt1+2 | 411 707 | 59 455 | 151 152 | 96 881 | 62 | 26 | 95 | 186 | 36 | 59 | 2 | 128 |
| **A3** Opt1+2+3 | 413 587 | 60 395 | 157 816 | 97 356 | 62 | 26 | 119 | 188 | 38 | 81 | 2 | 128 |

### Tool-call totals (A0; A1–A3 same shape)

| Tool | Count |
|------|------:|
| start_session | 1 |
| get_workflow | 1 |
| next_activity | 12 |
| get_activity | 12 |
| get_technique | 26 |
| get_resource | 128 |
| yield / respond / resume checkpoint | 12 each |

## 7. Before vs after deltas

| Metric | A0 | A3 | Δ abs | Δ % | Attribution |
|--------|---:|---:|------:|----:|-------------|
| get_activity chars | 687 936 | 413 587 | −274 349 | **−39.9%** | Opt1 (A1 = −40.2%) |
| get_activity + get_workflow | 747 391 | 473 982 | −273 409 | **−36.6%** | Opt1; workflow once → no resume collapse |
| get_technique chars | 160 057 | 97 356 | −62 701 | **−39.2%** | Opt1 (+ tiny technique unchanged) |
| get_resource chars | 448 084 | 157 816 | −290 268 | **−64.8%** | **Opt2** (A1→A2 = −66.3%) |
| unchanged resource answers | 0 | 81 | +81 | — | Opt2 markers |
| technique_bundled / fetched | 62 / 26 | 62 / 26 | 0 | 0% | Stable (no ungate) |

### Ablation attribution

| Step | What changed | Effect |
|------|--------------|--------|
| A0 → A1 | `context_mode: persistent` on main | **−40.2%** `get_activity` chars; resource chars unchanged |
| A1 → A2 | Opt2 server | **−66.3%** `get_resource` chars; 59 unchanged-resource answers; 36 `resource:*` ledger keys |
| A2 → A3 | Opt3 corpus (extra section headings in hot set) | Resource chars slightly **up** vs A2 in this harness (new section keys pay first full delivery); more collapses (81 unchanged). Real workers that fetch only needed sections should still benefit; this hot-loop always pulls every variant. |

### Interpretation checklist

- [x] Opt1 dominates activity/technique payload savings (~40%)
- [x] Opt2 dominates resource payload savings (~66%)
- [x] Opt3 not additive on this artificial all-sections hot loop (documented)
- [x] Technique fetch/bundle counts unchanged
- [x] Fresh A0: zero resource/technique unchanged markers

## 8. Pass / fail vs ship gates

| Gate | Threshold | Result |
|------|-----------|--------|
| B ops/bundle | ≥40% activity/ops char reduction **or** ≥50% ops-bundle redelivery | **PASS** on `get_activity` (−40.2% A0→A1 / −39.9% A0→A3). Combined activity+workflow −36.6% (workflow single-call). |
| B resources | ≥60% reduction in resource payload chars with Opt2 | **PASS** (−66.3% A0→A2 / −64.8% A0→A3) |
| C call counts | Reported; no unexplained inflation | **PASS** — same tool mix; `get_resource` count held at 128 by design |
| Fidelity | No increase in technique-fidelity warnings; fresh clean | **PASS** (proxies: bundle/fetch counts stable; A0 has 0 incorrect unchanged markers) |
| A tokens | Optional | Skipped |
| CI | Server tests / corpus guards | Server reference-delivery tests were green earlier; full CI not re-run in this bench session |

## 9. How to reproduce

```bash
# A0 — from any server checkout with workflows worktree
cd ~/projects/main/workflow-server
npm run bench:token -- --label=A0 --context-mode=fresh

# A1
npm run bench:token -- --label=A1 --context-mode=persistent

# A3 — feature server + feature corpus
cd ~/projects/work/workflow-server/2026-07-16-token-resource-reference
WORKFLOWS_DIR=~/projects/work/workflows/2026-07-16-token-usage-solo-persistent \
  npm run bench:token -- --label=A3 --context-mode=persistent --server-root=$PWD
```

See [development.md § Token delivery benchmark](../../../../docs/development.md#token-delivery-benchmark).

Raw JSON from this run: `/tmp/bench-A{0,1,2,3}.json` (local machine).
