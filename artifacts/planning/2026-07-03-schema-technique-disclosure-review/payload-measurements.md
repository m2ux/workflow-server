# Payload Measurements — Progressive-Disclosure Economics (Phase 3)

Date: 2026-07-03. Part of the schema/technique/disclosure review (see `evaluation-report.md`).

## Methodology

- **Instrument:** the repo's own e2e harness (`tests/e2e/harness.ts` + `walker.ts`) driving the **real server** (`createServer`) over an in-memory MCP transport against a **throwaway temp workspace** (no repo writes). The MCP client was wrapped so every tool response's exact char count and raw text were recorded; after every `get_activity`, the wrapper issued `get_technique { step_id }` for **each `kind: technique` step** (including loop bodies), mimicking a worker that loads each bound technique when it reaches the step.
- **Walks:** `work-package` under the `full-workflow` policy, robot mode (15 activities entered, 19 checkpoints resolved, `finalStatus: completed`); `ponytail` under a generic default-option policy with `autoAdvance` (4 of 5 activities, 2 checkpoints).
- **Caveat:** the wrapper fetched techniques for *all* technique steps in each entered activity, not only gate-passing ones. Corpus-wide, ~18–22 % of technique steps carry a `when`/`condition` gate (80 `condition` + a share of 17 `when` on 441 technique steps), so per-step totals here are an upper bound that overstates lazy fetching's cost and understates its selectivity advantage — the comparison is conservative *against* the current design.
- chars ≈ tokens×4. Raw per-call data: scratchpad `measure/index.json` + one file per response (session-local; summarised fully here).

## 1. Per-tool payload sizes (chars)

### work-package, full walk (252 tool calls, 1,147,844 chars ≈ 287k tokens)

| Tool | n | total | mean | median | min | max |
|---|---|---|---|---|---|---|
| get_technique | 161 | 742,822 | 4,613 | 3,790 | 1,143 | 11,086 |
| get_activity | 15 | 332,079 | 22,138 | 20,800 | 18,271 | 33,840 |
| get_workflow | 1 | 53,513 | — | — | — | — |
| yield/respond/resume_checkpoint | 57 | 12,451 | 218 | — | 124 | 333 |
| next_activity | 15 | 1,503 | 100 | — | 82 | 114 |
| discover + list_workflows + start_session | 3 | 5,476 | — | — | — | — |

### ponytail, walk (23 tool calls, 141,716 chars ≈ 35k tokens)

| Tool | n | total | mean |
|---|---|---|---|
| get_activity | 4 | 76,502 | 19,126 |
| get_workflow | 1 | 32,821 | — |
| get_technique | 5 | 25,226 | 5,045 |
| everything else | 13 | 7,167 | — |

### get_resource samples (work-package session)

| resource_id | chars |
|---|---|
| assumption-reconciliation | 2,616 |
| assumption-reconciliation#integration-with-assumptions-log | 1,682 |
| design-framework | 6,458 |
| codebase-comprehension | 12,371 |
| complete-wp | 2,768 |
| meta/bootstrap-protocol (cross-workflow) | 2,258 |

Section anchors work and cut payloads (full file 2,616 → section 1,682). Resource payloads are lean; no repeated envelope beyond a ~60-char header.

## 2. Envelope vs unique content

**"Envelope" = lines appearing in ≥80 % of same-tool responses** (fixed protocol overhead: session fields, structural keys, inherited-contract content repeated per call).

### get_technique

| | work-package (161 calls) | ponytail (5 calls) |
|---|---|---|
| envelope chars/call (median) | **572** | **2,589** |
| unique chars/call (median) | 3,285 | 2,355 |
| overhead ratio (envelope ÷ mean total) | **0.12** | **0.51** |

The work-package envelope is the session header plus the workflow-root `TECHNIQUE.md` contract (6 inherited inputs: `planning_folder_path`, `requirements`, `problem_statement`, `target_path`, `branch_name`, `pr_number`) merged into every composed technique. Ponytail's root contract is much heavier relative to its techniques (4 defaulted inputs + 7 rules ≈ 2.6k chars re-delivered in every one of its composed techniques), which is why its ratio hits 0.51: **the "envelope" is dominated by composition re-delivery, not MCP framing.** The true per-call protocol framing (session_index line, key scaffolding) is ~100–150 chars.

### get_activity — the dominant repetition

Each response = `techniques:` bundle + `rules:` bundle, a `---` separator, then the activity body. Decomposition (work-package):

| component | mean chars/call | repeated across calls? |
|---|---|---|
| bundle: resolved activity-audience techniques | ~7,100 | **yes, near-identical every call** |
| bundle: rules (workflow `rules.activity` + `universal` + technique rules) | ~8,200 | **yes, near-identical every call** |
| activity body (id, steps, transitions, outcome, artifacts) | 5,762 | no — the actual per-activity content |

Cross-call repeated lines: **16,528 chars/call mean (work-package), 17,843 (ponytail)**. Over the work-package walk that is ≈ **233k chars (≈ 58k tokens) of byte-identical content delivered 15 times**; for ponytail the repeated bundle is **89 % of every get_activity payload** (19.1k mean, 2.1k body). This — not the get_technique envelope — is the largest fixed overhead in the protocol.

`get_workflow` (orchestrator bundle) is also heavy: 53.5k chars (≈ 13k tokens) for work-package, 32.8k for ponytail, paid once.

## 3. Refetch analysis (same session)

Of 161 get_technique calls in the work-package walk, only **99 were distinct payloads**; **62 calls (39 %) re-delivered byte-identical content** — 363,790 chars (≈ 91k tokens), **49 % of all technique-delivery volume**. Refetches are driven by the same operation bound in multiple activities (e.g. `review-assumptions::reconcile` fetched 7×, `reconcile-iteration` 7×, checkpoint-adjacent ops likewise) — cross-activity reuse, not loop iteration. Ponytail (5 distinct steps): zero refetches.

## 4. Policy models (technique-delivery chars; walk-measured)

Unique-content and envelope figures from §2; same walk, same technique set.

### work-package

| Policy | chars | technique-fetch calls | Δ vs current |
|---|---|---|---|
| (i) current per-step | 742,805 | 161 | — |
| (ii) per-activity bundling (distinct techniques per activity ride get_activity) | 454,503 | 0 | −39 % |
| (iii) hybrid, bundle ≤2k unique | 513,419 | 103 | −31 % |
| (iii) hybrid, bundle ≤4k unique | 477,383 | 40 | −36 % |
| (iii) hybrid, bundle ≤8k unique | 458,507 | 7 | −38 % |
| (iv) delta mode (full first fetch, ~200-char reference on repeat) | 391,415 | 161 | **−47 %** |

### ponytail

| Policy | chars | Δ |
|---|---|---|
| (i) current | 25,226 | — |
| (ii) bundling | 12,254 | −51 % |
| (iv) delta | 25,226 | 0 % (no refetches) |

### Whole-walk totals (work-package, all tools)

| Policy | walk chars | ≈ tokens | tool calls |
|---|---|---|---|
| (i) current | 1,147,844 | 287k | 252 |
| (ii) per-activity bundling | 859,525 | 215k | 91 |
| (iv) delta mode | 796,437 | 199k | 252 |
| (iv) + get_activity bundle delivered once (deliver inherited techniques/rules bundle at get_workflow/first get_activity, reference thereafter: −14 × ~15.5k) | ≈ 579,000 | **≈ 145k** | 252 |

## 5. Crossover analysis

Let `E` = per-call envelope (572 chars wp), `U` = mean unique technique content (4,045 wp / 2,842 median), `p_skip` = probability a bundled technique would never be used (gated step skipped), `p_re` = probability a fetch is a repeat.

- **Per-step lazy vs per-activity bundling (token side):** lazy wins per technique when `E < p_skip × U` → break-even at `p_skip ≈ E/U ≈ 14 %` (median-basis 20 %). Corpus gating is ~18–22 % of technique steps, i.e. **the two policies are near break-even on tokens for work-package-shaped content; bundling's measured −39 % comes almost entirely from deduplicating cross-activity repeats within an activity payload, not from the envelope.**
- **Delta mode attacks the same waste without changing granularity:** measured `p_re = 39 %`, saving 47 % of technique delivery with zero fidelity change at fetch time.
- **Where current per-step clearly wins:** large techniques behind rarely-true gates (e.g. `analyze-failure` 4.6k fetched only on build failure); ponytail-class small workflows have zero refetch waste — their loss channel is the get_activity bundle, not disclosure granularity.
- **Where current clearly loses:** turn count — 161 fetch round-trips per full walk (each a worker turn); and small techniques (min 1,143 chars ≈ envelope×2, of which ~50 % is the composed root contract, i.e. content the agent has already seen 160 times).
- **Composition re-delivery is a second refetch channel:** the root/group contract arrives inside *every* composed technique (0.12–0.51 of payload). A worker that has executed 10 steps has received the root contract 10×.

## 6. Turn/latency accounting

Per technique fetch: 1 tool round-trip. Current wp walk: 252 calls ≈ 178 more than per-activity bundling (91). At ~1–3 s per MCP round-trip plus model turn overhead, per-step disclosure costs on the order of **3–8 minutes of pure protocol latency per full work-package walk**; bundling removes ~64 % of calls; delta mode removes none (but each repeat response shrinks ~20×); hybrid ≤4k removes 75 % of fetch calls (161→40).

## 7. Fidelity side (Phase 3c evidence)

- **Design intent** (architecture record 2026-05-22, `get_technique` tool description, feedback record): one-technique-at-a-time is deliberate — attention on the current step, no premature read-ahead; `get_activity` deliberately does not bundle step techniques.
- **Server-side fidelity audit is impossible today:** session history records activity-level events only (verified on a live session file: 18 events, no step/technique events); step manifests are warn-only and name-based. Whether a worker fetched the bound technique before acting is not observable server-side.
- **Silent degradation observed** (e2e smoke-run findings, tests/e2e/README.md): unresolved operation refs and resource refs returned "not found" and the worker **completed the walk anyway** — the missing content was compensated by step self-description. Disclosure failures degrade silently rather than blocking.
- **Refetch-as-fidelity-feature:** the 39 % refetch rate partly *is* the fidelity mechanism — re-reading `reconcile` at each of 7 binding sites guarantees fresh attention. Delta mode must preserve an explicit "re-send full content" escape (stale/summarised-away context), and bundling forfeits the per-step attention anchor entirely — see report §3 for the verdict.
