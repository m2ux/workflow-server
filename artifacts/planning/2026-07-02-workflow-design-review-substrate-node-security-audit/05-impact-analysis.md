# Impact Analysis — substrate-node-security-audit remediation

**Session:** CED3DG
**Activity:** impact-analysis
**Date:** 2026-07-02
**Mode:** UPDATE (remediation, v4.16.0 → 4.17.0)

Maps the locked, verification-recalibrated change spec (RS-1..RS-4 + confirmed Medium/Low tiers) to concrete per-file impacts, the dependency ripple, and the flagged content-removal set. Both activity checkpoints resolved `confirmed`: `impact-confirmed` (scope correct) and `preservation-confirmed` (all R1-R12 removals intentional). Edits happen in scope-and-draft, not here.

**Target root:** `work/workflow-server/substrate-node-security-audit-remediation/substrate-node-security-audit/`

---

## Files to MODIFY

### `workflow.yaml`
- **RS-4:** `version: 4.16.0 → 4.17.0`.
- **F-05 / RS-1:** wire the three HARD-STOP gates (coverage / dispatch-completeness / finding-count-reconciliation) — reuse the already-declared gate variables (`dispatch_complete`, `verification_complete`, `merge_complete`) set structurally + a `condition` on the report-generation entry; use `validate` for the coverage and Unaccounted==0 stops that lack a fitting variable.
- **F-02:** delete the `rules.activity` DEFENSE-IN-DEPTH copy (`:36`) and weights.rs copy (`:37`) — authoritative home is `apply-checklist.md`.
- **F-03:** de-CAPS rule prose; strip rationale tails (rationale → CHANGELOG).
- **F-04:** regroup flat prefix-shaped keys (`PREREQUISITE:` ×3, `... GATE` ×5) into keyed grouped arrays (AP-26).
- **F-06:** reconcile the FULLY-AUTOMATED phase-gate claim with the now-structural enforcement.
- **F-08 / RS-7:** prune gate variables that remain unread after F-05 wiring (retain any variable newly read by an F-05 condition — a variable is either wired OR pruned, never both).

### `activities/02-reconnaissance.yaml`
- **F-10 / RS-2:** rebind the 6 `dispatch-sub-agents` steps to the new per-phase ops (`dispatch-reconnaissance-agent`, `verify-reconnaissance-files`, `dispatch-security-architecture-agent`, `verify-security-architecture-file`, `assign-agent-groups`, `route-reconnaissance-leads`). Preserve the AP-73 roster exception for the two distinct `dispatch-*-agent` bindings.
- **F-07:** `finalize-activity` `set` → `target: reconnaissance_complete`, `value: true`.

### `activities/03-primary-audit.yaml`
- **F-10 / RS-2:** rebind the 7 `dispatch-sub-agents` steps to per-phase ops.
- **F-11 / RS-2:** collapse the same-activity redundant re-bindings (`extract-table-derived-findings` + `preserve-merge-output` on `merge-findings`; the repeated `verify-sub-agent-output` invocations that only surface one already-produced output).
- **F-07:** finalize `set` → `target: primary_audit_complete`, `value: true`.

### `activities/04-adversarial-verification.yaml`
- **F-07:** finalize `set` → `target: adversarial_complete`, `value: true`.

### `activities/05-report-generation.yaml`
- **F-05 / RS-1:** add the gate `condition` on the report-generation entry.
- **F-09:** drop the duplicate conditional `transitions[]` (keep the `decisions[]` construct).
- **F-11 / RS-2:** collapse the redundant `integrate-adversarial-results` / `verify-elevation-completeness` re-bindings.
- **F-14 / RS-9:** canonicalize the `score-severity` input — drop the per-call `findings: merge_table` rename by aligning ids.
- **F-07:** finalize `set` → `target: report_complete`, `value: true`.

### `activities/06-ensemble-pass.yaml`
- **F-09:** drop the duplicate conditional `transitions[]` (keep `decisions[]`).

### `activities/11-sub-static-analysis.yaml`
- **F-19:** `resource_id: 05-static-analysis-patterns → static-analysis-patterns` at both binding sites (l.12, l.20).

### `techniques/dispatch-sub-agents.md`
- **F-10 / RS-2:** split the 6-phase monolith into a group of per-phase ops (assign-roster / route-leads / dispatch-concurrent / collect-results / verify-output-files). Preserve the roster exception for the two `dispatch-*-agent` bindings.
- **F-18:** review slug `orchestrator-reads-files-not-return-values` for affirmative form.

### `techniques/verify-sub-agent-output.md`
- **F-11 / RS-2:** support the collapsed same-activity re-bindings (no split across the distinct-activity `merge_strategy` modes).
- **F-18:** review slug `every-protocol-executed-mechanically`.

### `techniques/merge-findings.md`
- **F-11 / RS-2:** support the collapse; the three `merge_strategy` modes (structured / integrate / union-merge) live in three distinct activities → documented distinct-purpose exception, NOT a split.

### `techniques/apply-checklist.md`
- **F-02:** confirmed single authoritative home for DEFENSE-IN-DEPTH + weights.rs (already present at l.39, l.40, l.54 — the `workflow.yaml` copies are what get deleted).
- **F-20 / RS-3:** receives the §3 manual-review PASS/FAIL decision criteria relocated from `audit-prompt-template.md`.

### `techniques/search-pattern-catalog.md`
- **F-20 / RS-3:** receives the §2 static-analysis grep/cargo procedures.
- **F-19:** update the `resource_id` input example (`05-static-analysis-patterns → static-analysis-patterns`, l.18).

### `techniques/execute-ensemble-pass.md`
- **F-20 / RS-3:** receives the §5 execution-model protocol/rules.

### `techniques/map-vulnerability-domains.md` (+ `techniques/analyze-architecture.md`)
- **F-13 / RS-9:** align canonical ids so `map-vulnerability-domains` reads `architectural_analysis.{interaction_model, privilege_map, candidate_points}` via dotted path (or aligned output ids on `analyze-architecture`), closing the cross-sub-agent binding gap.

### `techniques/score-severity.md`
- **F-14 / RS-9:** canonicalize the `findings` input id to match the producer output (`merge_table`), retiring the per-call rename.

### `techniques/map-codebase.md`
- **F-18:** review slug `enumerate-explicitly-never-summarize` for affirmative form.

### `resources/audit-prompt-template.md`
- **F-20 / RS-3:** RELOCATE the §2 (l.88-365), §3 (l.366-673), and §5 (l.758-1017) operative bodies out to the owning techniques. Survives THIN, holding §1 Setup (l.17-87), §4 Reporting Format (l.674-757), and the §1-§5 taxonomy. ~117KB → estimated <25KB.

### `resources/audit-template-reference.md` — LARGEST DEPENDENCY RIPPLE
- This file deep-links ~40 anchors into `audit-prompt-template.md`, spanning all §2 (`#21-...`–`#211-...`), §3 (`#31-...`–`#314-...`), and §5 (`#execution-model-requirements`, `#multi-agent-execution-strategy`, `#phase-order`, `#component-priority-order`, `#ai-agent-limitations-and-mitigations`) anchors.
- When §2/§3/§5 bodies leave the template, EITHER (a) keep the §2/§3/§5 section *headings* as taxonomy stubs so the anchors still resolve, OR (b) relink the reference table to the recipient techniques. Scope-and-draft MUST reconcile these anchors — this is a correctness dependency of RS-3, not optional cleanup.

### `resources/static-analysis-patterns.md`
- **F-24:** delete the two "(Retired — merged into Check 3)" tombstone headings — Check 8 (l.172) and Check 12 (l.198). Renumber or leave gaps per documentation-as-it-is voice.

### `resources/severity-rubric.md`
- **F-21:** merge target — absorb `severity-calibration.md`; drop `## Overview`-style wrappers. See the R4 preservation instruction below.

### `README.md`
- **F-12:** remove role-prescriptive prose (l.18-27, incl. the literal AP-40 example at l.22, "The orchestrator coordinates and dispatches — sub-agents perform deep crate-level review"); link to rules instead.
- **F-19:** drop the `Index`/NN column from the resource table (l.289-301) and the `05`/`09` references.
- **F-22:** replace the per-activity `**Artifacts:**` enumerations (l.178, 186, 194, 202, 210, 218, 226) with a link to the synthesized contract; KEEP the mermaid flow/dispatch diagrams.
- Update any `audit-prompt-template.md#…` anchors that move (l.192, 237, 238, 260).

### `CHANGELOG.md`
- Add a v4.17.0 entry; capture the F-03 rationale relocated out of the de-CAPS'd rules. The existing historical `05-static-analysis-patterns.md:` mention (l.317) stays.

### `techniques/write-report.md` — verified NO change
- References `audit-prompt-template.md#4-reporting-format` (l.31). §4 STAYS in the template per RS-3, so this anchor survives intact.

---

## Files to CREATE
- `activities/README.md`, `techniques/README.md`, `resources/README.md` — **F-16:** orientation READMEs (purpose + file index + links), prism style.
- **(F-10 split)** new per-phase technique op files under `techniques/` if the `dispatch-sub-agents` split is realized as separate files rather than a single grouped file — exact count decided in scope-and-draft. This is the only place the file set may grow beyond the three READMEs.

## Files to REMOVE
- `resources/severity-calibration.md` — **F-21 / R4:** merged into `severity-rubric.md`. The only whole-file deletion. Non-lossy content-wise (see R4 preservation instruction).

## Files NOT touched (verified no impact)
`01-scope-setup.yaml`, `07-gap-analysis.yaml`, sub-agent activities `10/12/13/14/15/16`; techniques `build-function-registry`, `decompose-safety-claims`, `execute-sub-agent`, `extract-invariants`, `scan-storage-lifecycle`, `setup-audit-target`, `write-gap-analysis`, `TECHNIQUE.md`; resources `target-profile.md`, `toolkit-checklist.md`, `sub-agent-output-schema.md`, `vulnerability-pattern-vocabulary.md`, `gap-analysis-template.md`. `start-here.md` carries a minor F-12 role line (l.13) that MAY be touched. F-15 (08/09 numbering gap) is document-or-renumber discretion — no forced change. F-23 (`execute-sub-agent` delivery narration) accepted as in-domain — no change.

---

## Dependency-ripple summary
1. **§2/§3/§5 relocation → `audit-template-reference.md` anchors** (~40 deep links) + `README.md` anchors. `write-report.md`'s §4 anchor verified safe (§4 stays). Largest ripple.
2. **`dispatch-sub-agents` split → 13 bindings** rebound across `02-reconnaissance.yaml` (6) + `03-primary-audit.yaml` (7); new per-phase op file(s).
3. **F-19 NN-slug → `05-static-analysis-patterns`** at 3 live sites (search-pattern-catalog input default/example, 2 sub-static-analysis bindings) + README resource table.
4. **F-05 gate wiring ↔ F-08 variable pruning** interact: a variable is either wired into a condition or pruned, never both.
5. **F-14 score-severity canonical id** ↔ producer `merge-findings.merge_table`.
6. **R4 severity-file deletion → reference repointing:** `score-severity.md` links `[severity-calibration]` at l.45, 49, 55, 59, 63; `severity-rubric.md:57` / `severity-calibration.md:11` cross-cite. All must repoint to the merged `severity-rubric.md`.

---

## Content-Removal List (R1-R12) — ALL CONFIRMED at `preservation-confirmed`

| # | Content | Type | Note |
|---|---------|------|------|
| R1 | `audit-prompt-template.md` §2 grep/cargo procedures | **RELOCATION** → `search-pattern-catalog.md` | Non-lossy |
| R2 | `audit-prompt-template.md` §3 PASS/FAIL decision criteria | **RELOCATION** → `apply-checklist.md` | Non-lossy |
| R3 | `audit-prompt-template.md` §5 execution protocol/rules | **RELOCATION** → `execute-ensemble-pass.md` | Non-lossy |
| R4 | `severity-calibration.md` (whole file) | **RELOCATION** → merged into `severity-rubric.md` | Non-lossy; file deleted. **MERGE RISK — see instruction below.** |
| R5 | `workflow.yaml` DEFENSE-IN-DEPTH rule (`:36`) | **DELETION (dedupe)** | Authoritative copy persists in `apply-checklist.md` |
| R6 | `workflow.yaml` weights.rs rule (`:37`) | **DELETION (dedupe)** | Copy persists in `apply-checklist.md` |
| R7 | `workflow.yaml` rationale tails (F-03) | **RELOCATION** → CHANGELOG | Non-lossy; rationale preserved in history |
| R8 | `static-analysis-patterns.md` Check 8 + Check 12 tombstones | **DELETION (true)** | Content already merged into Check 3 historically |
| R9 | `README.md` per-activity `**Artifacts:**` enumerations (F-22) | **DELETION (restatement)** | Drift-prone restatement; replaced by a link. Diagrams KEPT. |
| R10 | `README.md` role-prescriptive prose (F-12) | **RELOCATION** → rules / link | Non-lossy; constraint re-expressed as a rule |
| R11 | `README.md` resource-table `Index`/NN column (F-19) | **DELETION (legacy addressing)** | Bare slugs remain |
| R12 | Pruned unread gate variables (F-08) | **DELETION (true, conditional)** | Only variables that stay unread after F-05 wiring |

**Net:** no content is lost — every entry is a non-lossy relocation (R1-R4, R7, R10) or a true deletion of a duplicate / drift-prone restatement / genuinely-unread artifact (R5-R6, R8, R9, R11, R12).

### R4 — severity-resource merge preservation instruction (carry into scope-and-draft)
The `severity-calibration.md` → `severity-rubric.md` merge is the one removal with real preservation risk: the two files hold overlapping-but-not-identical material. The merged `severity-rubric.md` MUST retain ALL of the following — none may be dropped in the fold:

**Keep from `severity-rubric.md`:**
- Impact (I) scale with "None / Local / Node / Network" labels + Examples column.
- Feasibility (F) scale with "Extreme / Privileged / Network / Passive" labels + Examples column.
- The `Average = (I+F)/2` severity-mapping block, the Required Output Format block, and the Common Calibration Errors (Over-Rating / Under-Rating — connection-pool, config-panic, operational-hazard, and unconditional-defect floors).

**Must survive from `severity-calibration.md`:**
- The **13-row calibration benchmark table** (Connection pool shared … through Incomplete Ord implementation) — highest-value asset; do not summarize or trim rows.
- The **Severity Crosscheck** procedure for High/Critical findings (threshold rules + the I+F<6 / I+F<5 gates).
- The **Bias Correction** section (under-rating / over-rating patterns).
- **Label divergence to reconcile:** rubric Impact labels are None/Local/Node/Network; calibration Impact labels are Informational/Low/Medium/Critical. The merge must pick one canonical label set (or present both) rather than silently dropping either.

### score-severity.md reference-repointing note (carry into scope-and-draft)
When `severity-calibration.md` is deleted, repoint every reference to it to the merged `severity-rubric.md`: `score-severity.md` l.45, 49, 55, 59, 63 (and its rule bodies at l.55, 59, 63), plus the `severity-rubric.md:57` ↔ `severity-calibration.md:11` cross-cites. This repointing is part of the F-14 / F-21 edit, not a new finding.

---

## Outcome
- Drafting knows exactly which files the change touches and how, so the edit blast radius is bounded before any content is written.
- Transition chains and technique/resource references are known-intact; the ~40 `audit-template-reference.md` anchors and the R4/score-severity reference repointing are the explicit ripples to reconcile so nothing orphans.
- No content disappears by accident — every R1-R12 removal is user-approved, tagged relocation vs true deletion, with the R4 severity-merge preservation instruction attached.
