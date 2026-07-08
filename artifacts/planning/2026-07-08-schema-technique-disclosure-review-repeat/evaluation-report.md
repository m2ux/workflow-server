# Evaluation Report — Repeat Pass: Residual Friction & Further Optimisation Candidates

Date: 2026-07-08. Repeat of the 2026-07-03 schema/technique/disclosure review (`../2026-07-03-schema-technique-disclosure-review/`), performed after all backlog items B1–B12 of epic #166 shipped (PRs #167–#186 server-side; #168–#188 corpus-side). Supporting evidence in this folder: [fix-verification-ledger.md](fix-verification-ledger.md) (per-item F1–F16/B1–B12 verdicts), [payload-measurements.md](payload-measurements.md) (instrumented re-walks in both delivery modes), [probe-transcripts.md](probe-transcripts.md) (fresh-agent probes on the new payload shapes).

**Method:** commit-level reconstruction of everything shipped since 2026-07-03; code/doc verification of each original friction point; corpus audit of adoption (fragments, bundling, template, variable model); instrumented live walks of `work-package` and `ponytail` under fresh and `context_mode: "persistent"` delivery; two comprehension probes on captured reference-mode and provenance-annotated payloads.

---

## Executive summary

1. **The fixes work; the defaults don't move.** Reference delivery (B1) measurably removes the two dominant repetition channels — get_activity −62 %, whole-walk −27 % (work-package) / −36 % (ponytail) — but it is opt-in, the canonical worker-dispatch topology correctly forbids it, the bootstrap example omits it, and hybrid bundling (B11) has **zero corpus adoption**. A default session today pays the same F1/F2 bytes as before #166. The remaining work on disclosure economics is adoption plumbing and one structural gap, not new mechanisms.
2. **The structural gap moved down a level.** With whole-payload dedup shipped, the largest unaddressed repetition is now *inside* composed `get_technique` payloads: the inherited-contract and rules blocks differ per technique, never hash-match, and re-deliver ≈131k chars (~25 % of technique delivery) per work-package walk. The B1 ledger cannot see them; block-level keys would.
3. **Comprehension fixes transmitted; specification gaps remain at the seams.** The original probes' top failure classes (inherited-inputs-as-required, unknown provenance) did not reproduce — B2/B3 work. What remains is narrower: multi-output manifest encoding is still guesswork (F13), annotation coverage is uneven enough that absence reads as signal, and a payload-only reader still infers engine behavior for inert fields (`action: set`, auto-advance) because B6's truth lives in docs that never ride the wire.
4. **Content debt was the only register row nobody owned.** All four F15 technique defects are still present verbatim, plus one new one found by this pass's probe; 124 dead-output and 97 orphan-input findings sit baselined in check:binding.

---

## 1. Residual friction register

Severity: ▲ high / ● medium / ○ low. Pays: **A**uthor, a**G**ent, **T**okens, **U**ser. Lineage column ties each item to the original register.

| # | Friction | Lineage | Evidence | Pays | Sev |
|---|---|---|---|---|---|
| R1 | Delivery optimisations unreachable by default: bootstrap example omits `context_mode`; no guidance for inline/solo agents; `agent_id` defaults (`orchestrator`/`worker`) fragment the delivery ledger in single-context sessions; `get_technique` has no per-call reference opt-in | F1/F2 residue | payload-audit; bootstrap-protocol.md step 2; ledger keyed per agentId | T, U | ▲ |
| R2 | Composition-block re-delivery inside get_technique: inherited_inputs/rules/inherited_outputs repeat ≈131k chars/walk across distinct payloads; whole-payload ledger keys structurally cannot dedupe them | successor to F1 | measurements §5 | T | ▲ |
| R3 | B11 hybrid bundling: zero corpus adoption; worker prompt still mandates one-technique-per-step and describes a stale bundle shape; projected 161→40 fetch-call latency win unrealized | F16-adjacent (turn overhead) | corpus grep (0 `bundleTechniques`); activity-worker-prompt.md | U | ● |
| R4 | F15 content defects all unfixed (env-after-nice, RUST_TEST_THREADS mismatch, create-issue step-1, run-suite vs foreground-only) + new: design-philosophy checkpoint message interpolates `{problem_complexity}` while its default option sets `path_gating_complexity` | F15 | fidelity-audit quotes; probe A item 3 | G | ▲ |
| R5 | Multi-output step-manifest encoding unspecified; `provenance_note` cites a `destination:` usually absent; technique-protocol spec §7 silent on manifest delivery | F13 residue | probe B items 2–3 | G | ● |
| R6 | Noteworthy-only provenance: unannotated inherited inputs read as missing/ambiguous; no provenance at all on unbound fetches | F5 residue | probe B item 1; binding-provenance.ts policy | G | ● |
| R7 | Payload-level enforcement ambiguity: B6 truth (inert `actions[].set`, `blocking`, auto-advance ownership) never rides the delivered payload; payload-only probe still guessed server execution | F3 residue | probe A item 2 | G | ● |
| R8 | `when`/`condition` duality persists (17 `when` uses); `condition_not_met` accepts only structured `condition`; explicitly descoped from B12 | F6/F7 residue | schema-audit; corpus counts | A, G | ● |
| R9 | Doc drift from the fixes themselves: api-reference Enforcement Boundary contradicts B7 (defaults/types); schemas/README still lists activity `artifacts[]` rows B4 removed; worker prompt bundle shape stale | new (post-#166) | schema-audit §2; payload-audit item 12 | A, G | ● |
| R10 | Binding baseline debt: 124 dead outputs + 97 orphan inputs accepted by check:binding baseline; detected but not burned down | F5 residue | check:binding run | A | ● |
| R11 | Fragments phase-2 gaps: 2 ORCHESTRATION MODEL blocks still inline (prism, remediate-vuln); 82 long inline rules; activity-file `rules` cannot use refs; materialized checkpoint fragment bodies re-deliver in full every get_activity even in reference mode | F8 residue | composition-audit §2; fragment-resolver mechanics | A, T | ● |
| R12 | get_workflow orchestrator bundle always full (55.1k wp / 32.9k ponytail), outside the ledger, re-paid on resume | F16 | measurements §7 | T | ○ |
| R13 | B8 observability gaps: `resource_fetched` recorded but never validated; `step_started`/`step_completed` schema-defined but never emitted; fetch-coverage check ignores agentId | F12 residue | fidelity-audit §1 | U | ○ |
| R14 | Two unchanged-marker dialects (`{ unchanged: true, content_hash }` in bundles vs `{ delivery: "unchanged", ... }` in get_technique); `bundle: "reference"` on a first call returns `bundle_mode: reference` with full bodies | new (B1 surface) | payload-audit items 7–8; probe A item 1 (escape-hatch conflation) | G | ○ |
| R15 | Load-time corners: non-`NN-`-prefixed activity files silently invisible to the runtime loader; mid-session workflow version drift warns but never reconciles/re-seeds the variable bag | F9 residue / B7 edge | schema-audit §2 | A, G | ○ |
| R16 | B12 register complete but unexecuted; Initial/Final wrapping and `outputs[].artifact.action` still shipped with zero/unreachable uses | F10/F14 | fix-verification ledger | A | ○ |

## 2. Disclosure-policy verdict (updated)

**The 2026-07-03 verdict stands — per-step disclosure as default, repetition (not granularity) as the cost center — and the repetition fix is now built but not adopted.** Measured this pass:

- Persistent-context sessions: B1 alone delivers −27 % (work-package) / −36 % (ponytail) whole-walk tokens with zero granularity change and zero turn change. The content-keyed rules ledger behaves correctly when rule sets alternate mid-walk.
- Default (fresh) sessions: 0 % — correctly so for disposable workers, where the repeated bundle is load-bearing. This is not a defect; it means **the residual token cost of the default topology is a topology decision**, and the only levers that help it are B11 bundling (fewer turns, intra-payload dedup) and envelope slimming.
- The next structural prize is R2: block-level ledger keys for the composed inherited/rules blocks (~13 % more of a work-package walk under persistent mode, on top of B1's 27 %). Delta-mode fidelity semantics carry over unchanged — full content on first delivery per context, references only for byte-identical blocks, explicit escapes.
- The B2/B3 envelope grew from 572 to 914 chars/call (0.12→0.18 of mean payload). The probes show it buys real comprehension; no rollback recommended, but it strengthens the case for R2 since the scaffolding is exactly the repeated part.
- Fidelity ledger: B8 now makes fetch-before-act auditable, which was the precondition the original review set for any bolder bundling default. That precondition is met; adoption of B11 (opt-in, per-activity) can proceed on evidence.

## 3. Prioritized backlog — repeat pass

Ordered by impact-per-effort. All additive; no architectural change.

| # | Change | Removes | Evidence | Effort | Risk |
|---|---|---|---|---|---|
| **C1** | **Adoption plumbing for B1/B11** (three small moves): (a) bootstrap-protocol + ide-setup guidance telling inline/solo sessions to pass `context_mode: "persistent"` (and one canonical agent_id) — with the existing topology test stated inline; (b) adopt `bundleTechniques: { maxChars: 4000 }` on the 3–5 highest-traffic work-package activities and update `activity-worker-prompt.md` (bundle shape + "bundled steps need no fetch"); (c) per-call reference opt-in on `get_technique` for symmetry with get_activity's `bundle` param | R1, R3 | measured −27 %/−36 % sitting unused; 0 corpus bundling adoption | S | Low — guidance + authoring, mechanics already tested |
| **C2** | **Block-level delivery ledger** for composed `inherited_inputs`/`rules`/`inherited_outputs`: hash each block independently (`contract:<workflowId>`, `rules:<hash>` namespaces), replace with unchanged-markers under the same persistent/opt-in semantics and `full: true` escape | R2 | 131k chars/walk measured repetition invisible to payload-level keys | M | Low — same opt-in model as B1 |
| **C3** | **Content-defect sweep** (corpus PR): the four F15 defects + the design-philosophy `{problem_complexity}`/`path_gating_complexity` mismatch; add a lint for checkpoint-message tokens with no producer among the checkpoint's own option effects or declared variables | R4 | five concrete defects, two probe generations in a row | S | None |
| **C4** | **Output-delivery specification**: define the multi-output step-manifest encoding (JSON object keyed by output id is the natural candidate — probe B independently invented it), state it in `provenance_note`, technique-protocol spec §7, and the manifest validator's warning text; render `destination:` unconditionally or drop it from the note | R5 | probe B guesswork; spec §7 silence | S | None |
| **C5** | **Uniform provenance coverage**: annotate every declared input on step-bound fetches (explicit `ambient session context (no producer)` instead of silence); state the noteworthy-only policy in the `inherited_inputs.note` if kept | R6 | probe B ambiguity on branch_name/pr_number | S | None |
| **C6** | **Post-#166 doc-drift pass**: api-reference Enforcement Boundary (B7 reality), schemas/README `artifacts[]` rows, worker-prompt bundle shape, marker-dialect unification note (or actually unify the two marker shapes) | R9, R14 | schema-audit contradictions list | S | None |
| **C7** | **Payload-borne enforcement hints**: since every payload is server-composed, annotate (or strip) inert fields at delivery time — e.g. render `actions` with a one-line `note: agent-executed; the server applies no action verbs`, and add the auto-advance ownership line to delivered checkpoint YAML. Fixes the F3 misread where it actually happens: in the payload | R7 | probe A misreads despite B6 docs | S/M | Low — delivery-side only, no schema change |
| **C8** | **`when`/`condition` merge decision** (the deferred design call): pick the structured form, give it `when`'s inline ergonomics via a shorthand parse, extend `condition_not_met` to it, migrate 17 uses | R8 | last remaining dual declaration site of F7 | M | Medium — dialect migration, but corpus is small |
| **C9** | **Binding-debt burndown**: retire the 124 baselined dead outputs and 97 orphan inputs in themed corpus PRs; ratchet the baseline down as classes clear | R10 | check:binding baseline | M (content) | Low |
| **C10** | **Fragments phase 2**: convert the two remaining ORCHESTRATION MODEL inline copies; allow `{ ref }` in activity-file `rules`; make materialized checkpoint-fragment bodies ledger-eligible (content-keyed, like bundle rules) | R11 | composition-audit §2 | M | Low |
| **C11** | **Fidelity follow-through**: validate `resource_fetched` coverage for techniques that declare required resources; emit `step_started`/`step_completed` from manifest submission (they're already in the schema); filter fetch-coverage by agentId | R13 | fidelity-audit gaps | M | None (warn-only) |
| **C12** | **get_workflow slimming** (only if resume traffic justifies): ledger the orchestrator bundle under persistent mode so resumes reference it | R12 | 55k once per session/resume | S | Low |
| **C13** | **Execute B12** at the next schema major (register is complete; R16 items ride along) | R16 | retire-candidates register | S (flagged) → major | None now |

## 4. What this pass did *not* find

No regression in any resolved item: F9 and F11 hold under test; B4's strict schemas parse the full corpus; B9's template lint runs corpus-clean at hard zero; check:fragments runs clean. The new guards (variable-model, fragments, technique-template) police new features or markdown surfaces rather than re-opening the schema-expressiveness gap B4 closed — the guard-count trend is honest. Variable seeding (B7) behaved correctly in both measured walks (`variables_seeded` at session creation, warn-only type checks exercised).

## 5. Non-goals honored

Every recommendation above is delivery-shaping, documentation, lint, corpus content, or an already-registered flag execution; none replaces the MCP server, session model, YAML+JSON-Schema definitions, markdown techniques, or agent-side interpretation, and every delivery-behavior change stays opt-in with full-content escapes. The two architectural observations deferred by the original review (agent-side condition evaluation as an execution-model question; YAML/markdown contract split as the root cause of guard proliferation) remain deferred to the framework-vs-skills review — nothing found this pass changes their disposition, though R7 (payload-borne truth) is a cheap increment that reduces the pressure on the first.
