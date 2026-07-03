# Compliance Review: substrate-node-security-audit

**Date:** 2026-07-02
**Workflow:** substrate-node-security-audit v4.16.0 ("Security Audit Workflow")
**Files audited:** 47 (workflow.yaml, 14 activities, 18 techniques + TECHNIQUE.md base, 11 resources, README.md, CHANGELOG.md)
**Mode:** REVIEW (compliance audit; no target modification)
**Yardstick:** 15 design principles, AP-1..AP-85 catalog, schema-construct-inventory, 5 JSON schemas

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High     | 6 |
| Medium   | 10 |
| Low      | 7 |
| Pass     | (schema-validation, ref-resolution, binding-fidelity all green) |

**Total findings: 23.** No Critical findings. The workflow is schema-valid, all `step.technique` refs resolve, and binding-fidelity introduces no new drift (its 40-entry baseline is pre-existing, and the substrate entries are output-template slots in `write-report.md`, correctly accepted). The dominant defect families are: **step-purity / bound-step descriptions do not apply** (this workflow already keeps steps `id`+`technique`-only — good), but **multi-binding of coarse techniques (AP-73)**, **activity-level prose rules (AP-62)**, **worker/orchestrator rule mis-filing and UPPERCASE rule prose (AP-71, rule hygiene)**, **binding gaps / unstructured `set` gate flags (AP-67, schema expressiveness)**, **role prose in README/description (AP-40)**, and **resource guide-wrapper + procedure-shaped content (AP-83/AP-85)**.

---

## Principle Compliance Findings

| # | Principle | Verdict | Evidence |
|---|-----------|---------|----------|
| P1 | Internalize before producing | Pass | N/A in review; conceptual model respected. |
| P4 | Maximize schema expressiveness | **Partial** | Phase-gate flags set via prose `action: set` with only a `message` (no `target`/`value`) — F-07. Role-prescriptive prose in README/description — F-12. |
| P5 | Convention over invention | **Partial** | Activity-file numbering gap (no 08/09) — F-15. Resource `NN-` index prefixes in README table diverge from bare-slug convention — F-19. |
| P9 | Modular over inline | Pass | Modular layout respected. |
| P10 | Encode constraints as structure | **Partial** | Many HARD STOP / MUST gates live only as workflow/activity rule text with no structural backing (checkpoint/condition/validate) — F-05, F-06. The workflow is self-declared FULLY AUTOMATED with 0 checkpoints, so gates are enforced only by worker-read prose. |
| P14 | Complete documentation structure | **Partial** | No subfolder READMEs in activities/, techniques/, resources/ (root README exists) — F-16. README transcribes agent-group tables/artifact lists that partially restate YAML — F-17 (AP-76). |
| P15 | Output economy | **Partial** | 117KB `audit-prompt-template.md` + guide-wrapper ceremony in resources — F-20, F-21 (AP-83). |
| Others (P2,3,6,7,8,11,12,13) | N/A / Pass | Update-mode-only enforcement (impact/preservation) not exercised in this automated read-only audit target. |

---

## Schema Expressiveness Findings

### F-07 (High) — Phase-gate flags are prose `set` actions, not structured variable assignments
- **Files:** `activities/02-reconnaissance.yaml:44-45`, `03-primary-audit.yaml:59-60`, `04-adversarial-verification.yaml:20-21`, `05-report-generation.yaml:38-39`
- **Rule:** Design principle 4 / schema-construct-inventory ("Track whether X" → `variable` wired to a structured `set`); AP-13.
- **Evidence:** every finalize step uses `- action: set` with only `message: reconnaissance_complete=true` — the `set` action has **no `target` and no `value`**; the assignment lives entirely in the message string. The engine cannot evaluate `reconnaissance_complete` from this. The variable IS declared in `workflow.yaml` but is never structurally assigned.
- **Fix:** replace each with `action: set`, `target: reconnaissance_complete`, `value: true` (and likewise for `primary_audit_complete`, `adversarial_complete`, `report_complete`).

### F-08 (Medium) — Gate variables declared but never read by any structural condition
- **Files:** `workflow.yaml:82-117` (`reconnaissance_complete`, `primary_audit_complete`, `adversarial_complete`, `report_complete`, `dispatch_complete`, `verification_complete`, `merge_complete`, `agents_assigned`, `agents_dispatched`).
- **Rule:** AP-13 / design principle 10 — a variable that gates a phase must be read by a `when`/`condition`/`transition`; these are set (or intended to be) but no transition or step gate references them. The main-flow transitions are unconditional defaults; the gates exist only as descriptive "Phase N gate" variables.
- **Fix:** either wire each gate into the downstream transition/step `condition`, or (if the automation is genuinely linear) delete the unused gate variables and rely on step ordering. This is the structural half of the FULLY-AUTOMATED claim: right now the gate enforcement is 100% rule-text.

### F-09 (Medium) — `has_reference_report` / `ensemble_enabled` branch duplicated as both `decisions[]` and `transitions[]`
- **Files:** `activities/05-report-generation.yaml:40-76`, `06-ensemble-pass.yaml:24-46`.
- **Rule:** schema-construct-inventory — activity-level routing is expressed once. Both files declare a `decisions[]` block AND a parallel `transitions[]` block with the identical `ensemble_enabled==true` / `has_reference_report==true` conditions.
- **Fix:** keep one construct. The `decisions[]` branch set (with its `isDefault: complete`) already covers routing; the duplicate conditional `transitions[]` is redundant and can drift.

---

## Convention Conformance Findings

### F-15 (Low) — Activity-file numbering gap (no 08/09)
- **Files:** `activities/` — main flow is `01`..`07`, sub-agent activities jump to `10`..`16`.
- **Rule:** Convention over invention (design principle 5); `NN-name.yaml` sequential numbering.
- **Assessment:** intentional band-separation (main flow vs sub-agent). Low severity — the loader does not require contiguity, but it diverges from the sibling-workflow convention of contiguous numbering. Recommend either renumbering sub-agents to `08`..`14` or documenting the band split.

### F-16 (Medium) — Missing subfolder READMEs
- **Files:** `activities/`, `techniques/`, `resources/` (no `README.md` in any).
- **Rule:** Design principle 14 / activity-rule "Every workflow must include a README.md at the root and in each subfolder (activities/, techniques/, resources/)."
- **Fix:** add orientation READMEs to each subfolder (purpose + file index + links), per the prism-workflow style.

### F-19 (Low) — Resource `NN-` numeric index prefixes are a legacy addressing convention
- **Files:** `README.md:289-301` resource table (`00`..`10`), and technique inputs that reference `resource_id: 05-static-analysis-patterns` (`activities/11-sub-static-analysis.yaml:12,18`), `resource_id: 05-static-analysis-patterns` in `search-pattern-catalog`.
- **Rule:** AP resources are addressed by text-only slug; the numeric-index form is deprecated (per `operational-discipline-resources-via-tool`). The files on disk are bare slugs (`static-analysis-patterns.md`), but the workflow refers to them by `05-...` id.
- **Fix:** reference resources by bare slug (`static-analysis-patterns`); drop the `NN` index column from the README resource table.

---

## Rule Hygiene Findings (AP-24..29, AP-71, AP-60(4))

### F-01 (High) — Worker-facing rules mis-filed in `rules.workflow` (orchestrator-only bucket) — AP-71
- **File:** `workflow.yaml:14-31` (`rules.workflow`).
- **Rule:** AP-71 — `rules.workflow` is surfaced ONLY via `get_workflow` (orchestrator) and never reaches a worker. Several entries command the *sub-agent/worker*, not the orchestrator, so they are silent no-ops for the actor they govern:
  - `"MANDATORY WEIGHTS.RS READ: ... the sub-agent MUST read weights.rs"` — this is worker-directed (belongs in `rules.activity` or the `apply-checklist` technique; it is in fact already duplicated in `apply-checklist.md:40`).
  - `"CONFIGURATION-VARIANT PANIC TRIAGE: ... the reviewing agent MUST enumerate ALL valid configuration variants"` — worker-directed; duplicated in `apply-checklist.md:41`.
  - `"GENESIS PARSING PATH COVERAGE: The node startup agent (A3) MUST trace ..."` — worker-directed.
  - `"ENSEMBLE TARGETED BLIND-SPOTS: The ensemble agent verifies items 1-4 ..."` — worker-directed (belongs with `execute-ensemble-pass`).
- **Fix:** classify each rule by the actor it commands; move worker rules to `rules.activity` (or the owning technique), keep orchestrator gates (dispatch completeness, merge/verification gate) in `rules.workflow`, split any rule that commands both. These live in `rules.activity` — several of the `activity`-bucket rules ARE correctly placed (e.g. severity scoring, DEFENSE-IN-DEPTH); the defect is the worker rules sitting under `workflow`.

### F-02 (High) — Cross-level rule duplication (workflow rule ↔ technique/activity) — AP-27
- **Files:** multiple.
  - Severity rubric gate: `workflow.yaml:33` (activity rule) ↔ `score-severity.md:53-63` (`rubric-required`/`under-rating`/`over-rating`) ↔ `merge-findings.md:107` (`calibration-is-bidirectional`) ↔ `severity-rubric.md`/`severity-calibration.md`. The Impact×Feasibility mandate is stated at four levels.
  - `"DEFENSE-IN-DEPTH VALIDATION"` (`workflow.yaml:36`) ↔ `apply-checklist.md:39,54` (item 6). Same constraint, two homes.
  - `weights.rs` read: `workflow.yaml:37` ↔ `apply-checklist.md:40`.
  - `"OBSERVATION ELEVATION"` (`workflow.yaml:41`) ↔ `merge-findings.md:44` protocol step 3 + `merge-findings.md:99` (`no-finding-silently-dropped`).
- **Rule:** AP-27 — a rule lives in exactly one authoritative location; the worker-visibility carve-out permits per-technique duplication ONLY when workers need it and it is not orchestrator-only. For orchestrator-only gates (finding-count reconciliation, dispatch completeness) the workflow-root copy is right; for worker constraints (weights.rs, defense-in-depth) the technique copy is right and the `workflow.yaml` copy should go.
- **Fix:** for each duplicated constraint, decide the single authoritative level and delete the others (respecting the AP-27 worker-visibility carve-out).

### F-03 (Medium) — Rule prose is heavy UPPERCASE imperative with rationale tails (rule-hygiene / AP-36)
- **File:** `workflow.yaml:19-41`.
- **Evidence:** rules like `"NODE BINARY SCOPE SPLIT: ... This addresses prompt saturation that historically caused config struct invariant validation ... to be deprioritized."` and `"MERGE AGENT GATE: ... inline merge under context saturation is the primary cause of finding regression across runs."` carry historical rationale ("historically caused", "primary cause of ... across runs") — this is process-narration/justification (AP-36) inside a rule, and the ALL-CAPS prefix is doing the job a grouped rule key should do (AP-26).
- **Fix:** state the invariant only; move the rationale to CHANGELOG/planning; convert the CAPS prefixes into grouped rule keys (e.g. `dispatch.completeness-gate`, `merge.fresh-context`).

### F-04 (Medium) — Flat prefix-shaped rule keys should be grouped arrays — AP-26
- **File:** `workflow.yaml:16-31` — several rules share the `PREREQUISITE:` prefix (three of them) and the `... GATE` suffix (COVERAGE GATE, DISPATCH COMPLETENESS GATE, VERIFICATION AGENT GATE, MERGE AGENT GATE, FINDING COUNT RECONCILIATION). These are unkeyed strings in a flat array.
- **Rule:** AP-26 — rules sharing a prefix belong in a grouped array under a descriptive key using the `z.union([z.string(), z.array(z.string())])` format.
- **Fix:** regroup: a `prerequisite:` group and a `gate:` group whose keys supply the shared context.

### F-18 (Low) — Non-affirmative / process-narration rule slugs — AP-60(4)
- **Files:** technique rule names such as `dispatch-sub-agents.orchestrator-reads-files-not-return-values`, `verify-sub-agent-output.every-protocol-executed-mechanically`, `map-codebase.enumerate-explicitly-never-summarize`.
- **Rule:** AP-60(4) — prefer positive invariant assertion. `enumerate-explicitly-never-summarize` mixes an affirmative with a negation; `orchestrator-reads-files-not-return-values` narrates a mechanism.
- **Assessment:** borderline; most carry irreplaceable clarity (the negation is meaningful). Recommend reviewing only `every-protocol-executed-mechanically` and `orchestrator-reads-files-not-return-values` for a crisper positive form. Low severity.

---

## Rule Enforcement Findings (design principle 10 / AP-19)

### F-05 (High) — Critical HARD-STOP gates are text-only, not structurally enforced
- **File:** `workflow.yaml` — `"COVERAGE GATE IS A HARD STOP"` (l.23), `"DISPATCH COMPLETENESS GATE ... This is a HARD STOP"` (l.25), `"FINDING COUNT RECONCILIATION: ... Unaccounted MUST equal zero ... This is a HARD STOP — report generation MUST NOT begin with Unaccounted > 0"` (l.31).
- **Rule:** Design principle 10 / AP-19 — a critical constraint must be backed by a checkpoint, condition, or validate action, not text alone.
- **Evidence:** these gates gate the report-generation transition but there is NO `condition` on the `report-generation` step/transition that reads a `coverage_gate_passed` / `dispatch_complete` / `unaccounted_zero` variable. The `verify-sub-agent-output` technique produces the gap report in prose; nothing structurally blocks report generation on it. The workflow relies entirely on the orchestrator reading and obeying the rule text.
- **Fix:** introduce boolean gate variables (some already declared: `dispatch_complete`, `verification_complete`, `merge_complete`) set by the verify/merge steps, and gate the `write-report` step (or the report-generation entry transition) with a `condition` on them; or, since this is a FULLY-AUTOMATED workflow with no checkpoints, use `validate` actions that fail the step when the gate is unmet.

### F-06 (Medium) — FULLY-AUTOMATED "phase gate" claim is unenforced
- **File:** `workflow.yaml:19` — `"FULLY AUTOMATED: ... Phase gates are set by each activity's completion step (a set flag on its final step)."`
- **Rule:** Design principle 10.
- **Evidence:** the claim is a rule, but (per F-07/F-08) the `set` flags are prose messages and no transition reads them. The stated mechanism does not exist structurally. This is the seed observation confirmed: the zero-checkpoint automation is faithfully *described* but not *enforced*.
- **Fix:** implement the flags as structured `set`s (F-07) and gate transitions on them (F-08), OR downgrade the rule to accurately describe linear sequencing.

---

## Anti-Pattern Findings

### F-10 (High) — `dispatch-sub-agents` is a monolith bound 12× across activities — AP-73(c) / AP-64 split
- **Evidence:** `dispatch-sub-agents` is bound by 12 distinct step definitions that do materially different things distinguished only by step id / an `expected_output_files` input:
  - `02-reconnaissance.yaml`: `dispatch-reconnaissance-agent`, `verify-reconnaissance-files`, `dispatch-security-architecture-agent`, `verify-security-architecture-file`, `assign-agent-groups`, `route-reconnaissance-leads` (6 bindings).
  - `03-primary-audit.yaml`: `dispatch-all-agents`, `collect-all`, `verify-agent-output-files`, `dispatch-verification-agent`, `act-on-gap-report`, `dispatch-merge-agent`, `preserve-verification-report` (7 bindings).
- **Rule:** AP-73(c) monolith-masking / AP-64 split. The same coarse technique is sliced by step id and an input, so the descriptions/ids silently do the work distinct operations should. "Assign roster", "route leads", "dispatch concurrently", "collect", "verify files", "preserve output" are separate capabilities the technique bundles into one 6-phase protocol, then re-binds per phase.
- **Fix:** split `dispatch-sub-agents` into a group with one named op per phase (`assign-roster`, `route-leads`, `dispatch-concurrent`, `collect-results`, `verify-output-files`), bind each step to the matching op, and delete the artificial re-bindings. Note some bindings (`assign-agent-groups`, `route-reconnaissance-leads`) invoke phases 1 only, while `verify-*` invoke phase 6 only — clear evidence the monolith cannot express the steps.

### F-11 (High) — `verify-sub-agent-output` (bound 6×) and `merge-findings` (bound 5×) are also multi-bound monoliths — AP-73
- **Evidence:**
  - `verify-sub-agent-output` bound at `verify-checklist-prompt-coverage`, `verify-dispatch-completeness`, `validate-reconciliation`, `verify-checklist-completeness` (primary-audit), `coverage-gate` (report-generation), `verify-output` (sub-output-verification). Its 11-step protocol is a checklist of independent checks; steps re-invoke it to surface individual checks.
  - `merge-findings` bound at `extract-table-derived-findings`, `preserve-merge-output` (primary-audit), `integrate-adversarial-results` (via `merge_strategy: integrate`), `verify-elevation-completeness` (report-generation), `union-merge` (ensemble). The `merge_strategy` free-text input selects a sub-mode — the textbook AP-73(c) monolith-masking signal.
- **Rule:** AP-73(a/c). `extract-table-derived-findings` and `verify-elevation-completeness` re-run the whole 7-phase merge just to surface one of its already-produced outputs (AP-73(a) redundant re-execution).
- **Fix:** for `verify-sub-agent-output`, split into per-check ops (dispatch-completeness / coverage-gate / mandatory-tables / table-findings) OR collapse the primary-audit re-invocations that only want one output. For `merge-findings`, either split by `merge_strategy` into named ops or collapse the re-bindings that only read an already-computed output.

### F-12 (Medium) — Role-prescriptive prose in README design-principles and description — AP-40
- **Files:** `README.md:22` (`"The orchestrator coordinates and dispatches — sub-agents perform deep crate-level review"` — the literal AP-40 example), `README.md:20-27` design-principles bullets ("Dedicated verification sub-agent (V) validates ..."). `start-here.md:13` similar.
- **Rule:** AP-40 — role-prescriptive sentences are rules, not description/README prose. (Note: README is orientation, so a *diagram* of roles is fine, but the "X coordinates only / Y performs Z" sentences are rules restated in prose.)
- **Fix:** these role constraints belong in `rules` on the workflow/activity; the README should link to them, not restate them.

### F-13 (Medium) — Binding gaps: `map-vulnerability-domains` inputs have no producer in the reconnaissance activity — AP-58 / signature-is-the-contract
- **Files:** `techniques/map-vulnerability-domains.md:16-41` declares required inputs `interaction_model`, `privilege_map`, `candidate_points`, `crate_map`; the `reconnaissance` activity binds it at `map-vulnerability-domains` (`02-reconnaissance.yaml:30-32`) with no `technique.inputs` deviation. The producing technique is `analyze-architecture` (output `architectural_analysis` with `#### interaction_model` etc. as sub-fields), run by the `sub-architectural-analysis` sub-agent, which lands `architectural_analysis` — not top-level `interaction_model`/`privilege_map`/`candidate_points`.
- **Rule:** `signature-is-the-contract` / AP-58 unbound-local. The consuming technique reads `{interaction_model}` but the bag holds `architectural_analysis.interaction_model`. There is a name/shape mismatch across the sub-agent boundary that no binding bridges. (The check-binding-fidelity guard does not catch this because these are sub-agent-produced JSON files read via the planning folder, not bag variables — but the I/O contract still mismatches.)
- **Fix:** align the canonical ids (declare `analyze-architecture` outputs at the same level the consumer reads, or have `map-vulnerability-domains` read `architectural_analysis.interaction_model` via dotted path / a `technique.inputs` rename). This is a genuine cross-technique coupling gap, not merely cosmetic.

### F-14 (Medium) — `score-severity` input rename bridges a name mismatch that should be canonicalized — AP generic-not-overfit
- **File:** `05-report-generation.yaml:19-23` binds `score-severity` with `inputs: { findings: merge_table }` (rename), and `merge-findings` at `apply-severity`.
- **Rule:** `generic-not-overfit` / canonical-rename-over-args. `score-severity` declares input `findings`; the producer's canonical output is `merge_table`. The per-call rename bridges them. Additionally, `merge-findings` step 5 (`Score With Calibration`) ALREADY scores every finding with calibration — so `score-severity` at report-generation partly duplicates the merge agent's scoring (AP-73(a) overlap).
- **Fix:** decide the single scoring home (the merge agent already does bidirectional-calibration scoring). If `score-severity` stays, align the producer/consumer id rather than a per-call rename.

### F-22 (Low) — README enumerates artifact lists and agent-group tables that partly restate YAML — AP-76
- **File:** `README.md:77-166` (Agent Groups table, dispatch mermaid, per-sub-agent step mermaids), `README.md:178,186,194,...` (`**Artifacts:**` lines per activity).
- **Rule:** AP-76 — diagrams STAY (the mermaids are fine and valuable), but the per-activity `**Artifacts:**` enumerations restate the techniques' `#### artifact` outputs (server-synthesized), and the step-by-step sub-agent mermaids that mirror `steps[]` will drift.
- **Assessment:** the flow diagrams are exempt/kept. The `**Artifacts:**` prose lists are the driftable part. Low severity — recommend replacing artifact enumerations with a link to the synthesized contract, keeping diagrams.

### F-23 (Low) — `execute-sub-agent` protocol narrates the delivery mechanism — AP-47 (mild)
- **File:** `techniques/execute-sub-agent.md:26` — `"load its bound technique via get_technique and read that technique's ## Capability ... and ## Protocol"`.
- **Rule:** AP-47 — protocol describing how the server delivers techniques. This one is borderline because `execute-sub-agent`'s whole purpose IS the bootstrap/execution loop (like the workflow-engine exception), so describing `get_technique` is arguably in-domain. Flag as Low / likely-accept.

---

## Resource Findings (AP-83 guide-wrapper, AP-85 procedure-in-resource, AP-44)

### F-20 (High) — `audit-prompt-template.md` (117KB / 1017 lines) is a procedure-and-rules document living as a resource — AP-85 + output economy (AP-83)
- **File:** `resources/audit-prompt-template.md`.
- **Evidence:** the file's §2 sections contain executable grep/cargo commands and procedures (`### 2.1 Panic Path Detection` with shell blocks, `### 2.7.1 Storage Lifecycle Pairing Scan`), §3 contains PASS/FAIL decision criteria the audit ops classify against, and §5 (`Execution Model Requirements §5.1-§5.15`, `Multi-Agent Execution Strategy`, `AI Agent Limitations and Mitigations`) is protocol/rules. Per AP-85, a resource section shaped as procedure/rules/decision-criteria is a technique in the wrong file — invisible to guards, unaddressable, and prone to dual-homing. It IS already dual-homed: `static-analysis-patterns.md` re-encodes the §2 grep catalog, `apply-checklist.md` re-encodes §3 PASS/FAIL criteria, `execute-ensemble-pass`/`analyze-architecture` re-encode §5.
- **Rule:** AP-85 (procedure/rules in resource) + AP-83 (guide-wrapper token tax — this single file is ~45% of the resource corpus by size and is loaded into agent context).
- **Fix:** the honest structure is: keep `audit-template-reference.md` as the addressable `§` index (it already is), migrate the operative §2/§3/§5 procedure+criteria into the owning techniques (`search-pattern-catalog`, `apply-checklist`, `execute-ensemble-pass`), and reduce `audit-prompt-template.md` to the template/reference material that is genuinely consulted-not-executed — or dissolve it if nothing template-shaped remains. This is the single highest-leverage output-economy fix.

### F-21 (Medium) — Guide-wrapper ceremony in resources — AP-83
- **Files:** `severity-rubric.md` vs `severity-calibration.md` (two overlapping severity resources — rubric scales appear in both; `severity-calibration.md:13 ## Scoring Rubric Scales` duplicates `severity-rubric.md`), `static-analysis-patterns.md:11 ## Overview`, `sub-agent-output-schema.md:11 ## Overview`, `start-here.md ## Overview`.
- **Rule:** AP-83 — Purpose/Overview sections restating the title; two severity resources that should be one; each Good/Bad or duplicated scale folds to one rule bullet.
- **Fix:** merge `severity-rubric.md` + `severity-calibration.md` into one severity resource; drop the `## Overview` wrappers that restate the title.

### F-24 (Low) — Retired-check tombstones violate documentation-as-it-is voice
- **File:** `static-analysis-patterns.md:172` (`### Check 8: (Retired — merged into Check 3)`), `:198` (`### Check 12: (Retired — merged into Check 3)`).
- **Rule:** `.engineering` documentation-voice ("no longer", "formerly", "retired"). A reader who never saw the earlier version should notice nothing missing.
- **Fix:** delete the tombstone headings and renumber, or omit them; record the merge in git/CHANGELOG.

---

## Schema Validation Results

| Check | Result |
|-------|--------|
| `validate-workflow-yaml.ts` (all 47 YAML) | **PASS** — workflow.yaml + 14 activities + 19 technique files all valid; no unanchored protocol references. |
| `check-all-refs.ts` | **PASS** — `[substrate-node-security-audit] OK — 1 ref all resolve`; 0 unresolved across all workflows. |
| `check-binding-fidelity.ts` | **PASS** — 40 total baselined, 0 NEW, 0 fixed. The substrate baseline entries (11 in `write-report.md`) are output-template slots (`{impact}`, `{feasibility}`, `{level}`, `{average}`, `{category}`, `{file}`, `{lines}`, `{justification}`) inside `finding_block_format` — correctly accepted per AP-53 (output-template slots are not invocation args / variable reads). No action. |

No Critical (schema-invalid / structurally broken) construct found. `has_critical_finding = false`.

---

## Tool-Technique-Doc Consistency Findings (AP-30..35)

- **Tool-name accuracy (AP-32):** Pass — `get_technique`, `next_activity`, `start_session`, `get_resource` used consistently; `harness-compat::spawn-agent`/`spawn-concurrent` referenced canonically in `dispatch-sub-agents`.
- **Return-value fidelity (AP-30/34):** Pass — no technique claims a tool returns content it does not.
- **Bootstrap completeness (AP-31):** Pass — `execute-sub-agent` protocol gives the full `start_session → next_activity → get_technique` path.
- **Behavioural-guidance duplication (AP-33):** overlaps with F-02 (severity/weights.rs rules duplicated across techniques) — see Rule Hygiene.
- **Redundant tool surface (AP-35):** N/A (no custom tools declared).

---

## Recommended Fixes (prioritized)

**High (6):**
1. F-10 — split the `dispatch-sub-agents` monolith into per-phase ops (12 mis-bindings).
2. F-11 — split/collapse `verify-sub-agent-output` (6×) and `merge-findings` (5×) multi-bindings.
3. F-01 — move worker rules out of `rules.workflow` (AP-71 silent no-op).
4. F-02 — resolve cross-level rule duplication to one authoritative home each.
5. F-05 — back the HARD-STOP gates (coverage / dispatch-completeness / reconciliation) with structural conditions or validate actions.
6. F-07 — make the phase-gate `set` actions structural (`target`+`value`), and F-20 — decompose the 117KB procedure-resource into its owning techniques.

**Medium (10):** F-03, F-04, F-06, F-08, F-09, F-12, F-13, F-14, F-16, F-21.

**Low (7):** F-15, F-17→merged into F-22, F-18, F-19, F-22, F-23, F-24.

All fixes are non-destructive refactors; none require a schema change (design principle 6 respected — every finding is a content fix, not a "modify upward"). If the user opts to remediate, this report becomes the change specification for update mode.
