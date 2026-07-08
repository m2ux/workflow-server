# Payload Measurements — Repeat Pass (Post-#166)

Date: 2026-07-08. Part of the repeat-pass review (see `evaluation-report.md`). Baseline: the 2026-07-03 review's `payload-measurements.md`.

## Methodology

- Same instrument as the original: the repo's e2e harness (`tests/e2e/harness.ts` + `walker.ts`) driving the **real server** over an in-memory MCP transport against a throwaway temp workspace; every tool response's exact char count recorded. `discover` + `list_workflows` included for parity.
- **Walks:** `work-package` under `full-workflow` policy, robot mode (15 activities, `finalStatus: completed`); `ponytail` under default policy with `autoAdvance` (4 of 5 activities). Each walk run twice: default **fresh** delivery, and **`context_mode: "persistent"`** (#166 B1 reference delivery).
- **Comparability caveats vs 2026-07-03:** (a) the walker now evaluates step gates and fetches only executed technique steps, and dedupes `get_technique` per step id per activity visit — the original wrapper fetched *every* technique step; so `get_technique` call counts are lower (114 vs 161) independent of any fix. (b) The corpus advanced (B7/B9/B10 sweeps, new research loop). Cross-review deltas are therefore indicative, not exact; **the fresh-vs-persistent comparison within this pass is exact** (same walker, same corpus, same policy).
- chars ≈ tokens×4. Raw per-call data was collected in a session-local scratch and is fully summarized here.

## 1. Whole-walk totals: fresh vs persistent

| Walk | calls | fresh chars (≈tokens) | persistent chars (≈tokens) | Δ |
|---|---|---|---|---|
| work-package (full) | 202 | 998,700 (≈250k) | 724,819 (≈181k) | **−27.4 %** |
| ponytail | 22 | 139,455 (≈34.9k) | 89,261 (≈22.3k) | **−36.0 %** |

Call count is identical in both modes — B1 shrinks payloads, not turns.

## 2. Per-tool decomposition (work-package)

| Tool | n | fresh total | persistent total | Δ |
|---|---|---|---|---|
| get_technique | 114 | 592,358 (mean 5,196) | 524,902 (mean 4,604) | −11 % |
| get_activity | 15 | 331,552 (mean 22,103) | 125,095 (mean 8,340) | **−62 %** |
| get_workflow | 1 | 55,059 | 55,059 | 0 % |
| checkpoints (y/r/r ×18) | 54 | 11,859 | 11,859 | 0 % |
| next_activity | 15 | 1,503 | 1,503 | 0 % |
| discover+list+start | 3 | 6,369 | 6,401 | ~0 |

Ponytail: get_activity 76,290 → 26,064 (−66 %); get_technique unchanged (no refetches); get_workflow 32,903 both modes.

## 3. F1 verdict — inherited get_activity bundle

- **Fresh mode (default):** the repeated bundle is still delivered in full every call — 15,285–20,430 chars per get_activity, cross-call repeated-line overhead **15,652 chars/call** (wp) / **17,667** (ponytail). Byte-for-byte this is the 2026-07-03 F1, unchanged for any session that does not opt in.
- **Persistent mode:** bundle collapses to `{ unchanged: true, content_hash }` markers after first delivery — bundle preamble 15,660 chars on call 1, **~800 chars every call after**; repeated-line overhead drops to 1,034 chars/call (wp) / 602 (ponytail). Two mid-walk get_activity payloads re-delivered full rule variants (14.1k, 0.9k) because the rule *set* changed with the activity — correct behavior, content-keyed ledger working as designed.

**F1 is fixed exactly when the option is exercised, and typical sessions do not exercise it** (see evaluation report §2, discoverability/topology).

## 4. F2 verdict — technique refetches (delta mode)

- Fresh walk: 10 of 114 get_technique calls re-delivered byte-identical content (70,120 chars, 12 % of technique delivery). Much lower than the original 39 %/49 % figure — partly real (corpus restructuring), mostly methodological (per-visit dedup in the walker; cross-activity repeats like `review-assumptions::reconcile` remain).
- Persistent walk: those repeats arrive as ~266-char `{ delivery: unchanged, content_hash }` stubs (10 markers, 2,664 chars total) — **−67k chars (−11 % of technique delivery)**, `full: true` escape available.

## 5. The residual repetition channel: composition re-delivery inside get_technique

The B1 ledger hashes **whole payloads** (per technique id). The composed `inherited_inputs` / `rules` / `inherited_outputs` blocks differ per technique (per-step provenance, per-technique rule merges), so they never hash-match and are re-delivered inside every distinct technique payload. Measured across the 104 distinct full technique payloads of the persistent wp walk:

| Block | payloads carrying it | total chars | distinct variants | unique chars | **repeated chars** |
|---|---|---|---|---|---|
| inherited_inputs | 104 | 111,277 | 47 | 50,396 | **60,881** |
| rules | 93 | 92,227 | 32 | 31,543 | **60,684** |
| inherited_outputs | 31 | 15,546 | 12 | 5,877 | **9,669** |

≈ **131k chars (~33k tokens, 25 % of technique delivery) of cross-payload duplicate composition content per walk that reference delivery structurally cannot touch** — the successor to the original F1 as the largest unaddressed repetition channel. Block-level ledger keys (hash the inherited_inputs/rules block independently of the payload that carries it) would collapse it under the same opt-in semantics.

## 6. Envelope

Per-call get_technique envelope (lines in ≥80 % of full responses): **914 chars, 0.18 of mean payload** — up from 572/0.12 in 2026-07-03. The growth is the B2/B3 scaffolding (`inherited_inputs.note`, `provenance_note`, root-contract input list). The comprehension gain was deliberate; the byte cost lands on every fetch in every mode.

## 7. Fixed-cost payloads untouched by any option

- `get_workflow`: 55,059 chars (wp) / 32,903 (ponytail), always full, explicitly outside the delivery ledger (`docs/api-reference.md`). Paid once per session — and once per *resume*.
- Activity YAML body (incl. B10-materialized checkpoint fragment bodies): always full in every get_activity; fragment materialization slightly increases body size and is not reference-eligible.
- Checkpoint/next_activity/start envelopes: lean (≈100–300 chars), no action needed.

## 8. Policy model implications

- Persistent-context walks: measured −27 % (wp) / −36 % (ponytail) from B1 alone; +~13 % more available from block-level composition dedup (§5); combined ceiling ≈ −40 % without touching granularity.
- Disposable-worker walks (the documented default): 0 % — every option is correctly inert. The remaining lever for that topology is B11 bundling (fewer turns, dedup within an activity payload), which has **zero corpus adoption** (no `bundleTechniques` anywhere in `workflows/`), so its projected 161→40 fetch-call reduction remains unrealized.
