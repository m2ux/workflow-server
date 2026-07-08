# Fix-Verification Ledger — F1–F16 and B1–B12 Status

Date: 2026-07-08. Per-item verdict against current `main` (through PR #186) and the workflows worktree (through PR #188). Verdicts: **resolved / partial / residual**. Evidence pointers are to current code/docs and this pass's measurements/probes.

## Original friction register F1–F16

| # | Original friction | Verdict | Evidence |
|---|---|---|---|
| F1 | Inherited techniques+rules bundle repeated in every get_activity | **Partial** | B1 shipped and works (get_activity −62 % wp / −66 % ponytail measured in persistent mode) — but delivery-mode is opt-in, the documented default topology (worker dispatch, `workers-need-full-delivery` rule) forbids it, the bootstrap example omits `context_mode`, and nothing tells an inline/solo agent to opt in. Typical sessions still pay full F1. |
| F2 | Byte-identical technique refetches | **Partial** | Delta mode shipped (persistent-only, ~266-char stubs, `full: true` escape). Same adoption gap as F1; also no per-call opt-in on `get_technique` (session-level only, unlike get_activity's `bundle` param). |
| F3 | Inert-but-executable-looking fields | **Partial** | B6 enforcement-model table + Zod descriptions shipped; B7 made `defaultValue` ENFORCED (seeded) and `type` warn-only-validated; `register` verb gone. Residual: `outputs[].artifact.action` still schema-visible and unreachable; probe A still misread `action: set` and auto-advance **from the payload alone** — the truth-in-docs never rides the wire. |
| F4 | Inherited inputs read as required-now; `planning_folder_path` overclaim | **Resolved (mostly)** | B2 `inherited_inputs` block + scope note; `inputs[].required` retired; corpus fix 664826b5 corrected the root TECHNIQUE.md claim. Probe B did not reproduce the misread. Residual nit: `workflow.yaml` variable description still shows a path pattern rather than server-canonical semantics. |
| F5 | Input provenance never stated; binding convention breakable | **Partial** | B3 `source:` lines on step-bound fetches (measured: 103/114 fetched payloads annotated); check:binding extended with dead-output/orphan-input detection sharing the server kernel. Residual: no provenance on unbound fetches; inherited inputs annotated only when "noteworthy" (probe B found the inconsistency confusing); **124 dead-output + 97 orphan-input findings baselined** rather than fixed. |
| F6 | Conditions agent-side while docs implied otherwise; `condition_not_met` legacy-keyed | **Partial** | B6 documents agent-side evaluation and warn-only transitions accurately. Residual: `when`/`condition` duality persists (17 `when` uses; recommendation to merge was explicitly descoped from B12), and `condition_not_met` still requires structured `condition`. |
| F7 | Duplicate declaration sites → drift | **Partial** | B4 deleted authored `artifacts[]` and closed the step/activity objects (2 guards retired); B10 gives shared rules/checkpoints one home. Residual: `when`/`condition` remains the largest surviving duality; activity-file `rules` still can't use fragment refs. |
| F8 | No structured slot for shared rules/checkpoints; 149 prose rules with drift | **Partial** | B10 shipped (7 rule + 1 checkpoint fragment, 17 refs, 5 workflows; assumption-interview converted at all 3 sites). Residual: 2 ORCHESTRATION MODEL blocks still inline (`prism`, `remediate-vuln`); 82 rule entries >100 chars remain inline; check:fragments currently clean so remaining prose is below its duplicate thresholds, i.e. drift-class rather than copy-class. |
| F9 | Generated-schema recursion loss; silent activity-load drops | **Resolved** | condition.schema.json uses `$ref`; load errors surfaced as `load_errors`/`activity_load_errors` in get_workflow/list_workflows. Residual corner: activity files without `NN-` prefix are still silently invisible to the runtime loader. |
| F10 | ~⅓ schema surface unused/single-consumer | **Flagged (by design)** | B12 register complete (R1–R12 + P1/P2 resolution); nothing removed yet — awaits the schema major. |
| F11 | Manifest validation phantom-missing gated steps / rejecting loop-body ids | **Resolved** | `validateStepManifest` requires only ungated top-level steps, accepts loop-body ids, checks subsequence order. |
| F12 | Fidelity unobservable server-side | **Resolved (core)** | B8: `technique_fetched`/`resource_fetched`/`technique_bundled` history events (per agent, per step, both delivery modes); next_activity warns on manifested-but-unfetched technique steps. Gaps: `resource_fetched` recorded but never validated; `step_started`/`step_completed` defined in schema but never emitted; fetch-coverage check ignores `agentId`; get_workflow bundle consumption unrecorded. |
| F13 | Output delivery mechanics unspecified | **Partial** | `provenance_note` names the mechanism (session bag + step-manifest `output`). Probe B still had to guess the multi-output encoding; the technique-protocol spec §7 doesn't cover manifest delivery; note references `destination:` that is usually absent. |
| F14 | Initial/Final wrapping: implemented, zero uses | **Residual (flagged)** | `wrapProtocolWithAncestors` still shipped; zero corpus uses confirmed; R11 in the B12 register. |
| F15 | Content defects found by probes | **Residual — none fixed** | All four confirmed still present verbatim: env-after-`nice` invalid shell (cargo-operations `check.md` et al.), `RUST_TEST_THREADS` budget mismatch (group rule vs check/clippy), create-issue step-1 scoping contradiction, run-suite concurrency vs `foreground-only` tension. No backlog item covered them — they fell through the B1–B12 mapping. Probe A adds a new member: design-philosophy checkpoint message interpolates `{problem_complexity}` but the default option sets `path_gating_complexity`. |
| F16 | get_workflow orchestrator payload paid up-front | **Residual** | 55.1k chars (wp) / 32.9k (ponytail), always full, documented as outside the delivery ledger. Now the largest single un-dedupable payload; also re-paid on session resume. |

## Backlog items B1–B12

| # | Shipped as | Delivered? | Post-ship gap |
|---|---|---|---|
| B1 | PR #167 | Yes — mechanics correct, tested | Discoverability/topology adoption gap; agent_id split (`orchestrator` vs `worker` defaults) fragments the ledger; no per-call opt-in on get_technique; two marker dialects (`{unchanged}` vs `{delivery: unchanged}`) |
| B2 | PR #171 | Yes | Envelope grew (914 vs 572 chars/call); inherited block re-delivered per payload (see measurements §5) |
| B3 | PR #172 | Yes | Step-bound only; noteworthy-only inherited annotation reads as missing data; UNRESOLVED warns not surfaced to authors outside check:binding baseline |
| B4 | PR #173 | Yes — 2 guards retired, corpus strict-parse clean | README rows for `artifacts[]` now stale |
| B5 | PR #174 | Yes | `NN-` prefix corner remains |
| B6 | PR #175 | Yes | `docs/api-reference.md` Enforcement Boundary now contradicts B7 (still lists defaults/types as agent-interpreted); truth stays in docs, not payloads |
| B7 | PR #182 | Yes — seeding + warn-only types + check:variable-model | Resume/legacy sessions never re-seeded; type mismatches stored anyway |
| B8 | PR #176 | Yes | Recorded-but-unvalidated resources; no step events; no per-agent filtering |
| B9 | PR #180 | Yes — corpus 100 % template-clean, hard-zero guard | — |
| B10 | PR #186 + corpus #187 | Yes | Partial corpus conversion (2 orchestration-model copies left); activity-file rules can't ref; materialized checkpoint bodies not reference-eligible |
| B11 | PR #184 | Code yes | **Zero corpus adoption**; worker-prompt guidance ("one per step, never all at once") in tension; stale bundle-shape description in `activity-worker-prompt.md` |
| B12 | register (with #175) | Yes (flag-only, as designed) | Execution awaits schema major |
