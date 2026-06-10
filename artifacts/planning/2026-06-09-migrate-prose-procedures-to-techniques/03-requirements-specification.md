# 03 — Requirements Specification

**Workflow:** `workflow-design` · **Mode:** UPDATE (scoped to `work-package`) · **Activity:** `requirements-refinement` · **Status:** ✅ CONFIRMED — `requirements_confirmed = true`. Purpose ✅; scope ✅ (`work-package` only); binding mechanism ✅ Option (a); checkpoints ✅; artifacts ✅; rules ✅ (R6 location = `workflow-design` design-principle `rules[]`, primary placement only). All dimensions confirmed one at a time per checkpoint discipline.

This is an **UPDATE-mode refactor** of the existing workflow *definitions* (the TOON files under `workflows/`), scoped this pass to the **`work-package` workflow only, end to end**. It is not the creation of a new workflow. The target is the **anti-pattern of ordered-procedure prose embedded in `description` fields**, and the structural migration of that procedure into the technique layer, with universal per-step technique binding and elimination of activity-level `supporting[]` techniques. The **library-wide rollout to the other workflows is explicitly DEFERRED** to follow-up work (see §4).

In UPDATE mode the create-only elicitation steps (`elicit-activity-model`, `elicit-variables`, `elicit-techniques`) are gated off (`is_update_mode != true`). The active dimensions to confirm are: **purpose**, **activities** (here: the affected scope / audit surface), **checkpoints**, **artifacts**, and **rules**.

---

## 1. Purpose & domain

Refactor the workflow library so that **ordered procedures live in techniques, never in prose `description` fields**, and so that **every step is bound to a technique**. Eliminate the activity-level `supporting[]` technique array by pushing those techniques DOWN to the steps that actually invoke them. Add governance rules so the anti-patterns cannot recur. Domain: workflow-definition authoring / schema-expressiveness governance for the workflow-server itself.

Value: enforces the schema's intended division of labour — declarative `description` summaries vs. ordered imperative `protocol[]` blocks in techniques — making procedures reusable, composable, validatable, and self-documenting via each technique's `capability`.

---

## 2. Requirement set (R1–R6)

### R1 — AUDIT (anti-pattern inventory)
Find and list **every** activity/step across the workflow library whose `description` prose embeds an **ordered procedure** (sequenced imperative steps) — the anti-pattern. Distinguish:
- **True offenders:** an ordered procedure in the *activity-level* `description`, OR procedural prose in a *step* `description` that should be a technique.
- **Legitimate declarative summaries:** a non-sequenced descriptive sentence that names *what* the step covers (not *how*, step-by-step). These are NOT offenders.

Output: a per-file, per-field finding list (file, field, content excerpt, offender/legitimate classification).

### R2 — MIGRATE (procedure → technique)
For each affected step's procedure prose, migrate the procedure into a **technique**, by EITHER:
- **(a) Match + combine:** match it to an EXISTING technique and combine without loss of fidelity, OR
- **(b) Author new:** author a NEW technique fully compliant with `technique.schema.json` — `id` / `version` / `capability` required; `protocol[]` of ordered imperative step blocks; `inputs` / `output` / `rules` as needed.

**Candidate existing-technique locations (REFINED).** When deciding "merge into an existing technique" (option (a)) vs "author a new technique" (option (b)), the search for a fidelity-preserving match MUST consider candidate existing techniques in **BOTH** locations:
1. **`work-package`'s own techniques** — `workflows/work-package/techniques/...`, and
2. **`meta`'s techniques** — `workflows/meta/techniques/...`, which resolve universally via the loader's **universal-technique fallback** (so a `work-package` step may bind a `meta` technique by ID without copying it).

Both locations are analysed for a fidelity-preserving match before a new technique is authored. Option (b) is taken only when neither location yields a loss-free match.

### R3 — PER-STEP BINDING (universal)
**EVERY step must have an associated technique** — not only migrated ones. Step-level technique association becomes the **universal** pattern across the library.

**Binding mechanism — RESOLVED (Option (a)).** Each step binds its technique via the **structural `step.technique` field** at **technique-ID granularity** (schema-valid today; no schema change). For each affected step: (1) extract the procedural prose from the step `description`; (2) migrate/subsume that prose INTO a technique — a new schema-compliant technique (`id`/`version`/`capability` + ordered imperative `protocol[]`; `inputs`/`output`/`rules` as needed) OR an existing technique matched without loss of fidelity; (3) REMOVE the step `description` entirely (per R5); (4) BIND the technique under the step via `step.technique`. The technique's `capability` self-documents the step, so nothing is bound to the (removed) description. Operation-level granularity within a multi-operation group technique is NOT required for this model — each step's procedure becomes (or maps to) a whole technique. The inline-op-invocation-in-`description` idiom (`technique-id::operation-name(args)`) is NOT used for these steps, since the `description` is removed.

### R4 — ACTIVITY-LEVEL TECHNIQUE (primary only)
Each activity declares `techniques.primary` **ONLY** (a single primary technique). The `techniques.supporting[]` array is **ELIMINATED**. Former secondary/supporting techniques migrate DOWN to the step level (per R3), where they are actually invoked.

### R5 — REMOVE MOOT DESCRIPTION (subsequent phase)
After a step is bound to its technique (R3, Option (a) `step.technique`), the step's `description` becomes redundant because the technique's `capability` self-documents the step. A **subsequent phase REMOVES** the now-moot step `description` field **entirely**. (Sequenced after R3 binding; may be staged as its own phase but not performed in the same pass.) End state for an affected step: NO `description` field, plus a `step.technique` binding. Because the binding is the structural `step.technique` field (not inline-in-description), it **survives** description removal — there is no conflict between R3 and R5.

### R6 — ANTI-PATTERN GOVERNANCE RULES
Add/strengthen governance rule(s) so these anti-patterns cannot recur:
- **A1:** no ordered-procedure prose in `description` fields;
- **A2:** every step must bind a technique;
- **A3:** activities keep `techniques.primary` only — no `supporting[]`.

**Rule location — RESOLVED (authoritative, this pass).** The three anti-pattern governance rules (A1, A2, A3) go into the **`workflow-design` workflow's own design-principle `rules[]`** — i.e. `workflows/workflow-design/workflow.toon` `rules[]` — and **ONLY there** this pass. They are:
- **NOT** echoed into `work-package` (`workflows/work-package/...`) rules;
- **NOT** encoded as structural validate-actions this pass (any validator/lint enforcement is explicitly **DEFERRED / out of scope**).

**Rationale.** `workflow-design` governs all future workflow authoring and review, so placing the constraints in its design-principle `rules[]` is what prevents recurrence across the whole library — rather than patching the rules into the offender workflow alone. This is **primary placement only**: a single authoritative location, no duplication.

---

## 3. RESOLVED DECISION — the binding mechanism

**Status: RESOLVED — Option (a) chosen.** Bind each step via the structural `step.technique` field at technique-ID granularity. No schema change is pursued (Option (b)/structured `step.operation` is NOT taken; the "Never modify schemas" rule is respected). There is no remaining open decision here.

R3 (universal per-step binding) interacts with R5 (remove step `description`). The schema offers two binding idioms; the resolution selects the structural one, which survives R5:

| Idiom | Where | Operation granularity? | Survives R5? |
|-------|-------|------------------------|--------------|
| **Inline operation invocation** `technique-id::operation-name(args)` | inside `step.description` | ✅ yes (names op + args) | ❌ **no** — R5 deletes `description` |
| **Legacy `step.technique`** (+ legacy `technique_args`) | structured `step` field | ❌ no — technique-ID only, no op name | ✅ yes (structural, survives) |

Confirmed against the live schema (`schemas/activity.schema.json`): the `step` object has `description`, `technique` (LEGACY: "Technique ID to apply… Prefer inline operation invocation in description"), and `technique_args` (LEGACY). **There is NO structured `step.operation` field.** Group techniques expose multiple operations, which `step.technique` cannot target at operation granularity.

Therefore landing **R3 + R4 + R5 jointly** requires choosing:

- **✅ Option (a) — CHOSEN. Use structural `step.technique` (no schema change).** Bind each step structurally by technique ID; drop the `description`. **Limitation accepted:** cannot name an *operation* within a multi-operation group technique — binding is at technique-ID granularity only. This is acceptable because each affected step's procedure becomes (or maps to) a whole technique, so operation-level granularity within a group technique is not required. In scope for this workflow; binding survives R5 because it is structural rather than inline-in-`description`.
- **❌ Option (b) — NOT pursued. Small schema addition** (e.g. a structured `step.operation` field and/or structured args). Blocked by the workflow's own rule "Never modify schemas during workflow creation"; not taken. No schema-evolution prerequisite work item is required, because Option (a) lands R3+R4+R5 jointly without any schema change.

**Decision resolved by the user.** R3+R5 are feasible today under Option (a); this workflow executes the migration (it does not stop at planning pending a schema change).

---

## 4. Affected scope / audit surface (UPDATE-mode "activity list")

**Scope this pass = the `work-package` workflow ONLY, end to end.** Audit, inventory, migration plan, AND the **migration** file edits are all restricted to `workflows/work-package/`. The audit surface is **not** the whole library.

**TWO-LOCATION FILE SCOPE (authoritative for the downstream scope manifest).** The *migration* edits and the *governance-rule* addition land in **different** files. The scope-and-structure activity's scope manifest MUST therefore include BOTH:
- **(a) Migration edits — `workflows/work-package/`** — activity/step `description` removals, `step.technique` bindings, `techniques.primary`-only collapse, and any new/updated technique files under `workflows/work-package/techniques/`.
- **(b) Governance-rule addition — `workflows/workflow-design/workflow.toon` `rules[]`** — the A1/A2/A3 anti-pattern rules (per R6), primary placement only.

Location (b) is the ONLY file edited outside `work-package` this pass. `meta` is still read-only (technique-matching candidates per R2), not edited.

The audit scans, **within `work-package` only**: every activity `description`, every `step.description`, every `techniques.primary` / `techniques.supporting[]` declaration, and every step's technique binding (present/absent). The concrete offender inventory is produced in the AUDIT phase (R1) downstream; this spec fixes the *scope and acceptance criteria*, not the enumerated findings.

**DEFERRED — library-wide rollout.** Applying this migration to the other workflows (`cicd-pipeline-security-audit`, `meta`, `prism`, `prism-audit`, `prism-evaluate`, `prism-update`, `remediate-vuln`, `requirements-refinement`, `substrate-node-security-audit`, `work-packages`, `workflow-design`) is explicitly DEFERRED to follow-up work. No edits to those workflows are planned in this pass. `meta` is read for technique-matching candidates only (per R2), not edited.

---

## 5. Phasing (sequence of work, downstream of this spec)

1. **AUDIT (R1)** — produce the offender inventory across `work-package`.
2. **MIGRATE (R2)** — for each offender, match-or-author a technique (candidate match searched in `work-package` + `meta` per R2).
3. **BIND (R3 + R4)** — attach a technique to every step (universal); collapse `supporting[]` into per-step bindings; leave `techniques.primary` only. *Binding mechanism per the §3 decision.*
4. **REMOVE MOOT DESCRIPTIONS (R5)** — subsequent phase; delete step `description`s now covered by technique `capability`.
5. **GOVERNANCE (R6)** — add/strengthen anti-recurrence rules at the decided location(s).

R5 is explicitly a *separate, subsequent* phase from R3. §3 is resolved to Option (a), so Phases 3–5 proceed today with no schema-evolution gating; the `step.technique` binding from Phase 3 survives the description removal in Phase 4.

---

## 6. Acceptance criteria

- **AC-1 (R1):** Every activity/step with ordered-procedure prose in a `description` is listed, classified offender vs. legitimate, with file + field + excerpt.
- **AC-2 (R2):** Every offender's procedure (within `work-package`) is captured in a technique — either folded into an existing technique without fidelity loss (candidate match searched across BOTH `workflows/work-package/techniques/` and `workflows/meta/techniques/` per R2), or a new schema-valid technique (`id`/`version`/`capability`/`protocol[]`).
- **AC-3 (R3):** Every step in `work-package` has an associated technique (universal binding), via the structural `step.technique` field (Option (a), §3) at technique-ID granularity.
- **AC-4 (R4):** No `work-package` activity declares `techniques.supporting[]`; each declares `techniques.primary` only; former supporting techniques appear as step-level bindings.
- **AC-5 (R5):** In the subsequent phase, every step `description` made moot by its technique's `capability` is removed entirely; the affected step retains its `step.technique` binding and no `description` field.
- **AC-6 (R6):** Governance rule(s) exist at the decided location(s) prohibiting (i) ordered-procedure prose in `description`, (ii) un-bound steps, (iii) activity `supporting[]`; and they govern future authoring.
- **AC-7 (decision):** ✅ RESOLVED — the §3 binding mechanism is confirmed by the user as Option (a) (structural `step.technique`, no schema change). No out-of-scope schema prerequisite work item is required.
- **AC-8:** All touched TOON files validate against their schemas (`npx tsx scripts/validate-workflow-toon.ts`).

---

## 7. Confirmation log (checkpoint discipline)

One question at a time; each dimension confirmed at its checkpoint before proceeding.

| Dimension | Checkpoint | Status |
|-----------|-----------|--------|
| Purpose & domain (§1, R-set framing) | `purpose-confirmed` | ✅ confirmed |
| **Binding-mechanism decision (§3)** | resolved by user alongside `purpose-confirmed` | ✅ RESOLVED — Option (a) (structural `step.technique`, no schema change) |
| Affected scope / audit surface (§4) | `activities-confirmed` | ✅ confirmed — `work-package` only, end to end; library-wide rollout DEFERRED. R2 refined: candidate techniques searched in `work-package` + `meta` |
| Checkpoints | `checkpoints-confirmed` | ✅ confirmed |
| Artifacts | `artifacts-confirmed` | ✅ confirmed |
| Rules / governance (R6) | `rules-confirmed` (sets `requirements_confirmed: true`) | ✅ confirmed — rule location = `workflow-design` design-principle `rules[]` ONLY (A1/A2/A3, primary placement); NOT echoed in `work-package`, NOT encoded as validate-actions this pass (deferred). `requirements_confirmed = true`. |

**Activity outcome:** `requirements-refinement` COMPLETE. `requirements_confirmed = true`. Transition: `is_update_mode == true` → **`impact-analysis`**.
