Verification complete — 6 tool calls, well under budget. Here is the return value.

---

# Adversarial verification — `04-implementation-plan.md` §§0–4

Scope: sections 0, 1, 2, 3, 4. None of the prior audit's C1/H1–H10/M-a…M-m is re-reported. Corpus cites trusted from the `01-corpus-map-*` files except where a finding turns on the cite, which I re-read.

---

## Defects

### C-1 — CRITICAL — `09`'s tail is unconditional on both back edges; choosing `remediate` still commits, publishes, writes `COMPLETE.md` and deletes the worktree the next round must edit

**What fails.** §3.7's diagram (`04-implementation-plan.md:347-356`) draws `remediate ─┐` at step 5 and routes the arrow straight back to `08`, with steps 6-17 listed as if bypassed. They are not bypassed. `SRV/src/schema/activity.schema.ts:50` is explicit: `transitionTo` is *"Activity ID the orchestrator transitions to next via next_activity. **Recorded and returned, not engine-applied: selecting the option does not itself move the session.**"* So after `audit-disposition#{remediation_round}.remediate`, the worker continues linearly through the rest of `09`'s `steps[]`.

Now read the gates §1.2 actually assigns to that tail (`:115-125`):

- step 7 `verify-scope-manifest` — `when: operation_type != 'review'`
- step 8 `verify-planning-readme` — **ungated**
- step 9 `approve-to-commit#{remediation_round}` — `condition: operation_type != 'review'`
- steps 10-14 commit / verify / push / compose-PR / open-PR — `when: commit_approved == true`
- steps 15 `compose-close-out`, 16 `persist-close-out` (`COMPLETE.md`) — **ungated**
- step 17 `remove-worktree` — `when: worktree_created == true`

Nothing in the tail reads `remediation_selected`. Consequences on a round the human explicitly asked to remediate:

1. **Gate 2 is presented anyway**, immediately after the human said the findings are not acceptable. If they approve, steps 10-14 commit and open a non-draft PR (`:122`, `as_draft: false`) carrying the unfixed findings.
2. **`COMPLETE.md` is written on a non-terminal pass** (steps 15-16 ungated), contradicting §1.6's *"terminal record"* (`:191`).
3. **`remove-worktree` fires** (step 17, gated only on `worktree_created`), destroying the edit surface. The session then transitions to `quality-review`, whose step 1 is `author-fixes` / `yaml-authoring` — with no worktree. The remediation round is structurally unable to author the fix.

The same tail runs on the review-mode `fix-issues` path: `review-disposition` sets `operation_type: update` at step 4, so step 7 and Gate 2 — which the plan intends only for a completed update — become live in the *same* pass, and `COMPLETE.md` is written before the seeded update has started.

This falsifies all four properties §3.7 claims (`:362-367`). Property 3 (*"the pre-attestation gate is genuinely pre-attestation… sits between the verified finding set and the attestation at step 9"*) is true positionally and false causally: the gate is BLOCKING for the *response*, but its response has no power to prevent step 9. Property 2's *"doubly encoded"* bound is single-encoded: `remediation_round < 3` bounds only the back edge, not the commit tail, so each of the three rounds can commit.

**Evidence.** `04-implementation-plan.md:113-127` (the tail's gates), `:347-356` (the diagram asserting short-circuit), `:362-367` (the four properties); `SRV/src/schema/activity.schema.ts:50`.

**Minimal correction.** Add `when: remediation_selected != true` to steps 7-17 of `09` (or an equivalent single `and(remediation_selected != true, review_closed != true)` clause), and gate 15-17 additionally on `commit_approved == true` so close-out and worktree removal cannot run on any non-terminal pass. Then redraw §3.7's diagram to show the tail as gated rather than skipped.

---

### H-1 — HIGH — `resolve-consumer-surface` is bound at `08:3`, before the only producer of both of its inputs

**What fails.** §3.5 (`:319`) declares its Inputs as `{changed_files}` and `{target_workflow_id}`, and binds it at `08:3`, ungated. But per §1.2 (`:95-96`):

- `{changed_files}` is produced **only** by `08:6a rebind-target-baseline` (`reload-workflow`, *"extended: declare `{base_ref}`, `{surface_files}`, `{changed_files}` — today it declares no outputs at all"*), which is **inside** the `08:6` loop body.
- `{target_workflow_id}` is the `forEach` **loop variable** of `08:6` (`forEach target_workflow_id over target_workflow_ids`), undefined outside the loop.

So at `08:3` both inputs are unproduced — AP-128 `unproduced-value-read` (`AP:1688`), the entry the plan itself leans on hardest in §2.3. The consequence is not cosmetic: `{consumer_surface}` is §3.5's entire fix for the shared FATAL (*"cross-workflow dual-home and stale-claim contradictions are **in scope by contract**, not by luck"*, `:323`). Bound where its change-set input is empty, the walker resolves consumers of nothing, and the flagship cross-file finding that §6.4(3a) grades on becomes unreachable by construction.

`08:4 load-known-findings` sits in the same pre-loop band but has no such dependency; the defect is specific to `08:3`.

**Evidence.** `04-implementation-plan.md:92` (bind at `08:3`), `:95-96` (loop var and `6a`'s outputs), `:317-321` (declared Inputs), `:319`.

**Minimal correction.** Move `resolve-consumer-surface` into the `08:6` loop body, immediately after `6a rebind-target-baseline` and before `6b sweep-canon`. It stays ungated, so eager eligibility is unaffected (`collectUngated` recurses into ungated loops — `SRV/src/tools/workflow-tools.ts:716`), and it becomes per-target, which is what review mode needs anyway. Renumber the body to 6a…6e and update §3.4's *"one bind site (`08:6b`)"* row and §3.5's bind cite.

---

### H-2 — HIGH — the AP-19 assertion is false against the plan's own §3.2 Protocol, and §2.1's AP-121 assertion contradicts §3.4's AP-121 reasoning

**What fails.** Two of `audit-canon`'s three Rules restate its own Protocol phase 3 verbatim.

§3.2 phase 3 (`:284`): *"**Attribute and exclude.** Derive `Origin` per row by re-reading the cited construct at `{base_ref}` — `git show origin/workflows:<path>`. Mark rows matching `{known_finding_keys}` as `Known`."*
Rules (`:289`): `attribute-against-base`, `exclude-known-from-decision-surface`.

§2.1's AP-19 row (`:203`) asserts *"each states something no phase encodes: base attribution against `{base_ref}`, exclusion of `{known_finding_keys}` from the decision surface, and structural-evidence precedence."* Phase 3 encodes the first two, by name, with the same variables. AP-19's Detect (`AP:314`, re-read verbatim): *"A technique/activity/workflow rule restates a protocol bullet or phase without adding an invariant the steps do not already convey."* Do-not-flag (`AP:316`): *"Rules that state cross-cutting constraints the protocol does not encode."* The carve-out's stated condition is not met — the protocol does encode them. Only `structural-evidence-first` survives AP-19.

The second half is an internal contradiction the plan cannot resolve as written. §3.4 (`:308`) argues attribution belongs in Rules because *"As a Protocol phase it would be AP-121 — removing it leaves the work sequence intact."* §2.1's AP-121 row (`:217`) asserts the opposite about the same phase: *"Each of `audit-canon`'s four phases has a distinct produce/transform/persist outcome; **removing any breaks the work sequence**."* Phase 3 is either removable (so §2.1 is false and phase 3 is an AP-121 hit) or not removable (so §3.4's placement argument collapses and the Rules are AP-19 duplicates). AP-121's own do-not-flag (`AP:1572`, re-read) closes the escape: it defers back — *"Rules that restate Protocol (`no-rule-protocol-restatement`)"* — so AP-19 is the live entry, not AP-121.

**Evidence.** `04-implementation-plan.md:203`, `:217`, `:284`, `:289`, `:308`; `AP:310-320` (AP-19 entry), `AP:1562-1574` (AP-121 entry, incl. the do-not-flag deferral).

**Minimal correction.** Pick one home per duty. Keep phase 3 as the work phase (it does produce the `Origin` and `Known` column values — a real transform outcome) and **delete** `attribute-against-base` and `exclude-known-from-decision-surface` as Rules, retaining only `structural-evidence-first`. Then rewrite §3.4's two placement rows to justify Inputs (`{base_ref}`, `{known_finding_keys}`) + Outputs (the required `Origin`/`Known` columns) + phase 3 as the carriers, and drop the *"as a Protocol phase it would be AP-121"* argument. `audit-canon` then has one Rule, which is fine — AP-25 does not require three.

---

### H-3 — HIGH — `01:4 halt-on-wrong-target` cannot halt anything; a wrong-target review falls through `isDefault` and audits the wrong workflow

**What fails.** §1.2 step 4 (`:51`) is `action: validate`, `target: review_scope_confirmed`, `when: operation_type == 'review'`, and §4.5 loss 6 (`:445`) presents it as the mechanism that stops a wrong-target review: *"Gate 1's `wrong-review-target` now sets `review_scope_confirmed: false` and `01:4`'s `action: validate` **halts**, rather than looping. This *removes* a live dead end."*

`action` is one of `['log','validate','set','emit','message']` and `SRV/src/schema/activity.schema.ts:26` states: *"Action verb, **interpreted by the executing agent. The server has no action interpreter**."* There is no halt primitive. Meanwhile `01`'s declared transitions (`:61`) are `to: quality-review when and(operation_type == 'review', review_scope_confirmed == true)` and `to: scope-and-draft isDefault: true`. With `review_scope_confirmed == false` the conditional edge fails and **`isDefault` fires**, sending a review session into `scope-and-draft`.

There it is not inert. Steps 1-6 and 8 are gated `operation_type != 'review'`; step 7's loop is gated `scope_manifest_confirmed == true`, which is false because its producing checkpoint `scope-confirmed` carries `condition: operation_type != 'review'` (`:72`) and never fires. But **step 9 `verify-artifact-conforms` is ungated** (`:80`) and runs with nothing authored, and then `to: quality-review isDefault: true` (`:82`) carries the session into the full canon sweep — against the wrong target the human just rejected. The old dead end is removed and replaced by a silent wrong-target audit, which is worse: the dead end at least failed visibly.

**Evidence.** `04-implementation-plan.md:51`, `:61`, `:72`, `:80`, `:82`, `:445`; `SRV/src/schema/activity.schema.ts:26`.

**Minimal correction.** Make the halt structural, not exhortative. Add a first-listed transition on `01`: `to: __terminal__ when and(operation_type == 'review', review_scope_confirmed != true)` — legal from anywhere (`SRV/src/utils/validation.ts:42`, and the plan already relies on this at `:127`) — and keep step 4 only as the operator-facing `message`. Additionally gate `06:9 verify-artifact-conforms` on `operation_type != 'review'` so a review-mode pass through `06` is a true no-op.

---

### M-1 — MEDIUM — §4.4 deletes `pass_count`, which §1.2 `08:6c` still declares as a produced output; and `verified_findings`, read at `08:2` as an input deviation, is absent from the added-variable list

**What fails.** Two cross-section breaks between §1.2 and §4.4, both in the class §4.4 claims to have swept (*"Every deletion is atomic with its reads"*, `:436`).

1. §4.4 deletes `:89 pass_count` (`:428`). I confirmed `workflow.yaml:89` is `pass_count` and `:93` is `fail_count`. But §1.2 `08:6c` (`:98`) declares the step's outputs as *"→ `{pass_count}`, `{fail_count}`"*, and §4.2's `audit-schema-validation` extension (`:414`) only adds `--root {target_path}` and the seven guards — it does not remove the `pass_count` output. Deleting the declaration while the technique keeps the output leaves a declared output with no declaration and no reader, i.e. exactly the dead-output shape §4.4 invokes `check-binding-fidelity.ts:485` about.

2. `08:2 record-fixes` passes *"`selected_findings: verified_findings`"* (`:91`) and `09:2 compile-register` takes `{verified_findings}` (`:110`). §4.4's criterion for the added list is *"each read by a gate, message, `set` or **input deviation**"* (`:432`) — `08:2` is precisely an input deviation. `verified_findings` is not in the added ten, and grep over `workflow.yaml` shows only `verified_findings_path` (`:169`), which §4.4 deletes. So the added count is 11, not 10, and `63 + 11 + 2 − 32 − 2 = 42`, not 41. `{audit_findings}` and `{coverage_ledger}` are the same class read at technique-Input sites and need an explicit inclusion rule either way.

**Minimal correction.** Drop `{pass_count}` from `08:6c`'s output list *and* from `audit-schema-validation.md`'s Outputs in the same commit, or retain the declaration. Add `verified_findings` to §4.4's added list, restate the total as 42, and state one rule for whether variables read only as technique Inputs (`audit_findings`, `coverage_ledger`, `base_ref`, `surface_files`, `changed_files`, `known_finding_keys`, `consumer_surface`, `reference_workflows`) are declared in `workflow.yaml` or left technique-local.

---

### M-2 — MEDIUM — `review_closed` is an added variable with no reader anywhere in §1.2 or §1.4

**What fails.** §4.4 adds `review_closed` (boolean, false) under the heading *"each read by a gate, message, `set` or input deviation"* (`:432`), and `09:4 review-disposition.report-only` sets it (`:112`). No step gate, checkpoint condition, message or transition in §1.2 or §1.4 reads it. It is a write-only variable — the exact dead-variable class §4.4 deletes 32 instances of (`:428`, e.g. `:45 assumption_decisions` *"zero reads"*).

This is a symptom of C-1: `review_closed` is the variable that *should* be short-circuiting `09`'s tail on the report-only path, and the tail has no gate to put it in.

**Minimal correction.** Give it its readers as part of C-1's fix — `when: and(remediation_selected != true, review_closed != true)` on `09:7-17` — or delete it and make the report-only option effect-bearing some other way (it must keep an effect to stay inside §1.3's "all effect-bearing" claim).

---

### M-3 — MEDIUM — AP-38's per-activity `write-artifact` counts are wrong and contradict §1.6's own total

**What fails.** §2.1's AP-38 row (`:208`) states *"Per-activity `write-artifact` binds: **3 / 1 / 0 / 2**"*, and §1.6 (`:193`) states *"Max **3** binds in any one activity"*. §1.2 shows `01` with two `write-artifact` binds — step 9 `persist-change-brief` (`:56`) and step 10 `persist-impact-analysis` (`:57`); step 5 is `workflow-engine::create-readme` (`:52`), a different op, which §1.6 itself counts separately (*"plus `create-readme` ×1"*, `:193`). So the distribution is **2 / 1 / 0 / 2 = 5**, matching §1.6's own five-filename enumeration, and the maximum is 2.

Harmless in direction (it overstates the exposure it clears), but AP-38 is the one entry the plan says *"gets harder purely by concatenation"*, so its count is load-bearing for the argument, and a hand-assembled count in a compliance assertion is the AP-129 failure mode the prior audit already flagged elsewhere.

**Minimal correction.** `2 / 1 / 0 / 2`; §1.6's *"Max 3"* → *"Max 2"*.

---

### M-4 — MEDIUM — §1.2's `01` heading says 11 top-level steps; the table has 12 and §1.5 says 12

**What fails.** The heading at `:44` reads *"`01-intake-and-context.yaml` — **11** top-level steps, no loops"*, while the table below it runs #1–#12 (`:48-59`) and §1.5 (`:169`) records the after-state as *"(12/12, ~150)"*. §1.5's roll-up *"4 activities, 44/52 steps"* (`:178`) only balances with 12 (12+9+6+17 = 44; 12+13+10+17 = 52), so the heading is the error.

**Minimal correction.** `— 12 top-level steps, no loops`.

---

### M-5 — MEDIUM — re-entry from `review-disposition.fix-issues` re-runs `01:2 intake-classification` ungated, which can revert `operation_type` to `review`

**What fails.** The review→update seed sets `operation_type: update, update_seeded_from_review: true` and transitions to `intake-and-context` (`:112`). The only re-entry guard the plan names is on Gate 1: §1.3 records `design-intent-batch` as *"no (suppressed on re-entry by the `update_seeded_from_review` clause)"* (`:135`). But `01:2 classify-intake` (`:49`) is **ungated** and its whole job is to derive the operation mode from `{user_description}` — which still describes a review. A second classification pass re-emits `operation_type: review`, and the session loops `01 → 08 → 09 → 01` with the seeded update never running. `update_seeded_from_review` is not declared as an input of `intake-classification` anywhere in §4.2's reduction list (`:414`).

Confidence: high on the exposure, medium on whether a given worker actually reclassifies — but nothing in the design prevents it, and the plan asserts the re-entry path works.

**Minimal correction.** Either gate `01:2` with `when: update_seeded_from_review != true`, or declare `{update_seeded_from_review}` as an input of `intake-classification` with an explicit "preserve the incoming `operation_type`" branch. State it in §4.2's `intake-classification` row alongside the `review_scope_confirmed` addition.

---

### M-6 — MEDIUM — instance qualification and both loop bounds rest on `action: set`, which the schema documents as agent-executed and slated for removal

**What fails.** §3.7 property 4 says *"Instance qualification is **not optional**"* (`:367`), and §1.3 marks four gates instance-qualified on `#{scope_round}` / `#{remediation_round}` / `#{current_file.path}`. Three of those interpolate counters produced by `action: set` steps (`06:6`, `09:6`). `SRV/src/schema/activity.schema.ts:26` states the server has no action interpreter and that *"executing `set` is the worker's job, and its value reaches the session variable bag **when the worker reports it in the `variables_changed` its orchestrator relays on `next_activity`**"* — and adds that *"`set` is slated for removal at the next workflow-schema major (#166 B7/B12)"*.

Two consequences the plan does not name. (a) A worker that omits the bump from `variables_changed` leaves the counter at its prior value, the instance id is unchanged, and `yield_checkpoint` replays the stored response with no prompt (`workflow-tools.ts:978-1022` — the exact mechanism §1.2 `:84` cites). The bound is then only as strong as a worker's self-report, so it is not "structure" in the sense §3.7 property 2 claims against `maxIterations`. (b) The plan's four surviving `set` steps — the ones §2.1's AP-34 row defends as value-BEARING (`:207`) — are all built on a construct the schema announces for removal, which §4.4 and §1.2 should acknowledge.

**Minimal correction.** Say in §1.3 that counter visibility depends on the worker's `variables_changed` relay, and add the deterministic fallback: qualify on a value the server already holds. `#{current_file.path}` needs no counter; for the two rounds, either accept the residual risk explicitly or derive the qualifier from a technique output (both `verify-high-findings` and `audit-canon` are already declaring new Outputs, and outputs land through `variable-binding` rather than `set`). Also note the #166 deprecation next to the AP-34 defence.

---

## Checked and found sound — with the evidence

| Claim | Evidence checked | Verdict |
|---|---|---|
| §1.4's transition graph is legal, including the three edges that exist only as checkpoint effects (`09→intake-and-context`, `09→scope-and-draft`, `06→06`) | `SRV/src/loaders/workflow-loader.ts:473` — `getValidTransitions` explicitly harvests `c.options.forEach(o => o.effect?.transitionTo …)`, so effect-only targets are in the valid set; `SRV/src/utils/validation.ts:37` returns `null` on self-transition; `:42` exempts `TERMINAL_SENTINEL` from anywhere. Also confirmed `validateActivityTransition`'s return feeds `buildValidation(...)` at `SRV/src/tools/workflow-tools.ts:517`, i.e. warn-only, not blocking | **Sound.** No mode is routed into an illegal transition. My initial hypothesis that the two Gate-2 escape hatches and the review seed were undeclared-and-rejected is **wrong** and I withdraw it |
| §4 orphans no technique, and §1.2 binds no retired technique | `ls workflow-design/techniques/` = 39 files = 37 techniques + `README.md` + `TECHNIQUE.md`. All 19 retirement targets exist. The 18 survivors (`apply-audit-fixes`, `audit-schema-validation`, `commit-verification`, `compile-report`, `create-completion-doc`, `derive-workflows-target-path`, `impact-analysis`, `intake-classification`, `prepare-workflow-branch`, `publish-workflow-pr`, `readme-authoring`, `reload-workflow`, `review-drafted-file`, `scope-definition`, `scope-verification`, `verify-artifact-conforms`, `verify-high-findings`, `yaml-authoring`) are **each bound at least once** in §1.2, and the 5 new ones are too — 23 survivors, 23 bound, zero unbound, zero retired-but-bound. `37 − 19 + 5 = 23` checks out | **Sound — and tight.** This is the plan's cleanest section |
| Deleting the activity-level `techniques: [scatter-gather]` blocks orphans nothing | no `scatter-gather.md` in `workflow-design/techniques/` — it is a shared op, so §2.3's deletion removes only the overlap exposure | **Sound** |
| AP-34 / AP-33 clearance for the four surviving `set` steps | AP-33's do-not-flag (`AP:492`) reads *"(a) cross-iteration accumulator / scatter-gather gather over a `forEach`"* — covers `register_sections` at `08:6d` exactly; *"(c) value-BEARING `set` on a pure control step recording orchestration/flow state"* — covers `planning_folder_path`, `scope_round`, `remediation_round`. AP-34's Detect (`AP:498`) requires *value-LESS* sets, and all four carry values. AP-33's Detect additionally requires the step to *have* a `technique`; `08:6d` does not | **Sound.** Carve-out conditions genuinely met (see M-6 for the orthogonal `set`-deprecation caveat) |
| AP-55 two-or-three-site carve-out | Counted the sites: `{base_ref}`/`{surface_files}`/`{changed_files}` = 2 each (`reload-workflow` producer, `audit-canon` consumer); `{known_finding_keys}` = 3 (`load-known-findings`, `audit-canon`, `compile-report`); `{coverage_ledger}` = 3 (`audit-canon`, `verify-high-findings`, `compile-report`). All within *"niche inputs shared by only two or three techniques"* | **Sound** |
| §1.3's gate vocabulary and the BLOCKING/SOFT split | `SRV/src/tools/workflow-tools.ts:1167-1172` does throw on `auto_advance` with either field missing, so BLOCKING = "timer path structurally unavailable" is a correct characterisation, not a convention. §1.3's 7 rows match §1.2's 7 checkpoints exactly, with an `effect` on every option — the AP-89 exposure of the 9 deleted gates is genuinely closed, and the SOFT/BLOCKING assignment in §1.3 agrees with §1.2 row for row | **Sound** |
| Gate 1's re-entry suppression | `and(intent_needs_confirmation == true, update_seeded_from_review != true)` does evaluate false after `fix-issues` sets the flag, so `design-intent-batch` correctly needs no instance qualifier | **Sound** (the unguarded step *next* to it is M-5) |
| The create/update/review three-way covers all three modes with no hole | Walked all three: create = steps 1-6, 9, 11 of `01` → `06` full → `08` singleton loop → `09` minus the review gate; update adds 7-8, 10, 12; review = `01:1-4` → `08` N-target loop → `09:1-4`. `target_workflow_ids` as a singleton collection genuinely removes the three-clause mode gates, and every mode reaches a terminal | **Sound as a partition** — the holes I found are on the *back* edges (C-1) and the reject path (H-3), not in the forward three-way |
| §1.5's step arithmetic | 12+9+6+17 = 44 top-level; 12+13+10+17 = 52 with loop bodies. Both match `:178` | **Sound** (given M-4's heading fix) |
| AP-116's 6-of-6 mapping | §1.6's table maps a guide to every one of the 6 surviving bare filenames; the direction (filename → guide) is the one AP-116 constrains, and deletion cannot trip it | **Sound** |
| §3's honesty about the merge loss | §3.3 names five capabilities retained by bind rather than by pass, and the plan concedes the per-lens-context loss rather than hiding it. Collapsing six passes into one loses no *finding class* that survives §3.3's table: `audit-rule-hygiene` is a strict subset of the `anti-patterns.md` walk, `audit-rule-enforcement` is one entry, and Partial verdicts survive as a `Severity` value | **Sound, and candid** |

---

## Does anything block building?

**Yes — one.** C-1 must be fixed before the four YAMLs are authored: it is a wiring defect in `09`'s `steps[]` gates, and authoring the tail as §1.2 specifies produces a workflow whose remediation round deletes its own worktree and whose pre-attestation gate does not gate the attestation. It is a small fix (one `when` clause on steps 7-17) but it must land in the authored structure, not after.

H-1 (move `resolve-consumer-surface` into the loop), H-2 (delete two Rules, rewrite two §3.4 rows), H-3 (add the terminal transition), and all six Mediums are fixable during authoring without re-deciding the architecture.
