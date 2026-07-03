# substrate-node-security-audit — Design Session

**Created:** 2026-07-02
**Mode:** Update (remediation of a reviewed workflow)
**Status:** Planning

---

## 🎯 Executive Summary

This session remediates the `substrate-node-security-audit` workflow (v4.16.0) against the findings of its compliance review. The review surfaced 23 findings; an adversarial verification pass recalibrated the High tier (7 → 1 confirmed High, one dropped as a false positive, five reframed down). This update applies the verification-recalibrated finding set as its change specification.

---

## Design Decisions

Update-mode requirements refinement (activity 03) captured the five update-mode design dimensions against the verification-recalibrated change spec. Purpose, activity list, checkpoints, and artifacts are unchanged by the remediation; only rules and the structural enforcement of gates are materially touched.

| Dimension | Captured requirement (update mode) |
|-----------|-------------------------------------|
| Purpose | Unchanged — fully automated multi-phase AI security audit for Substrate-based blockchain node codebases. No purpose/domain/value change. |
| Activity list | Unchanged set — 7 main-flow + 7 sub-agent activities; no activity added, removed, or renamed. F-10 splits `dispatch-sub-agents` into per-phase technique ops (new technique files, not new activities); F-15 addresses the 08/09 numbering gap by renumber-or-document. Transition graph and `initialActivity` (`scope-setup`) preserved. |
| Checkpoints | Unchanged — zero user checkpoints; the workflow stays FULLY AUTOMATED by design. F-05/F-06/F-08 add STRUCTURAL enforcement (`condition` / `validate`), NOT user decision gates. |
| Artifacts | Unchanged — audit report + gap analysis. F-20 relocates resource *content* between files but produces no new run artifact and removes none. |
| Rules | Heavily touched: F-02 dedupe to one authoritative home; F-03 state invariant-only + rationale to CHANGELOG + de-CAPS; F-04 regroup flat prefix-shaped keys into keyed arrays; F-18 affirmative slugs. Enforcement RECLASSIFIED: F-05/F-06/F-08 promote the three HARD-STOP gates from text-only prose to structural `condition`/`validate`. |

**Version bump:** minor (4.16.0 → 4.17.0). No schema or contract break — every fix is a content/structure refactor within the existing schema; no activity add/remove/rename, no transition-graph change, no variable-contract break (F-08 prunes only genuinely-unread variables). See assumption RS-4.

**Requirements confirmed** across all five update-mode dimensions; the change spec was pre-confirmed at intake, so dimension confirmations were resolved from the spec under delegated authority (internal technical gates, not material outward-facing decisions).

---

## Compliance Findings

Recalibrated set (authoritative source: `08-quality-review-verification.md` for the High tier; `08-quality-review.md` for Medium/Low first-pass judgements). F-01 dropped as a verified false positive.

| Severity | Finding | Location | Fix |
|----------|---------|----------|-----|
| High | F-05 — HARD-STOP gates (coverage / dispatch-completeness / finding-count-reconciliation) are text-only | `workflow.yaml` l.23/25/31; `05-report-generation.yaml` | Wire the gates to structural `condition`s or `validate` actions |
| Medium | F-02 — cross-level rule duplication | `workflow.yaml:36`↔`apply-checklist.md` (DEFENSE-IN-DEPTH); `workflow.yaml:37`↔`apply-checklist.md` (weights.rs) | Dedupe to one authoritative home each; drop the severity-resource cites (category slip) |
| Medium | F-03 — UPPERCASE imperative rule prose with rationale tails | `workflow.yaml:19-41` | State invariant only; move rationale to CHANGELOG; convert CAPS prefixes to grouped rule keys |
| Medium | F-04 — flat prefix-shaped rule keys should be grouped arrays | `workflow.yaml:16-31` | Regroup `PREREQUISITE:` and `... GATE` rules into keyed arrays (AP-26) |
| Medium | F-06 — FULLY-AUTOMATED phase-gate claim unenforced | `workflow.yaml:19` | Implement flags structurally + gate transitions, or downgrade the claim to accurate linear sequencing |
| Medium | F-08 — gate variables declared but read by no structural condition | `workflow.yaml:82-117` | Wire each gate into a downstream condition, or delete unused gate variables |
| Medium | F-09 — routing duplicated as both `decisions[]` and `transitions[]` | `05-report-generation.yaml:40-76`; `06-ensemble-pass.yaml:24-46` | Keep one construct (the `decisions[]` set); drop the duplicate conditional transitions |
| Medium | F-10 — `dispatch-sub-agents` bound 13× (phase-unroll, not monolith-masking) | `02-reconnaissance.yaml`, `03-primary-audit.yaml` | Reclassify as phase-unroll; consider splitting per-phase ops (roster exception may shield the two `dispatch-*-agent` bindings) |
| Medium | F-12 — role-prescriptive prose in README/description | `README.md:20-27`; `start-here.md:13` | Move role constraints to `rules`; README links, not restates |
| Medium | F-13 — binding gap: `map-vulnerability-domains` inputs have no producer | `map-vulnerability-domains.md:16-41`; `02-reconnaissance.yaml:30-32` | Align canonical ids / dotted-path read against `architectural_analysis` |
| Medium | F-14 — `score-severity` per-call rename bridges a name mismatch | `05-report-generation.yaml:19-23` | Decide single scoring home; canonicalize producer/consumer id |
| Medium | F-16 — missing subfolder READMEs | `activities/`, `techniques/`, `resources/` | Add orientation READMEs to each subfolder (prism style) |
| Medium | F-20 — 117KB `audit-prompt-template.md` holds procedure/rules (AP-85) | `resources/audit-prompt-template.md` | Relocate §2/§3/§5 operative content into owning techniques; keep §4 + taxonomy as reference; drop the AP-83 angle |
| Medium | F-21 — guide-wrapper ceremony; two overlapping severity resources | `severity-rubric.md`, `severity-calibration.md`, others | Merge the two severity resources; drop `## Overview` wrappers restating the title |
| Low | F-07 — phase-gate `set` actions use `message` not `target`+`value` | `02/03/04/05` finalize steps | Express as `set` with `target`+`value` (schema hygiene; AP-67(c)-exempt, no functional gate) |
| Low | F-11 — same-activity repeat bindings (`verify-sub-agent-output` 7×, `merge-findings` 6×) | `03-primary-audit.yaml`, `05-report-generation.yaml` | Narrow to same-activity repeats; collapse/verify-distinct-outputs review |
| Low | F-15 — activity-file numbering gap (no 08/09) | `activities/` | Renumber sub-agents contiguous, or document the band split |
| Low | F-18 — non-affirmative / process-narration rule slugs | technique rule names | Review `every-protocol-executed-mechanically`, `orchestrator-reads-files-not-return-values` for positive form |
| Low | F-19 — resource `NN-` numeric index prefixes are legacy addressing | `README.md:289-301`; sub-static-analysis inputs | Reference resources by bare slug; drop the `NN` index column |
| Low | F-22 — README artifact-list / step-mermaid enumerations restate YAML | `README.md` per-activity `**Artifacts:**` | Replace artifact enumerations with a link to the synthesized contract; keep flow diagrams |
| Low | F-23 — `execute-sub-agent` protocol narrates delivery mechanism | `execute-sub-agent.md:26` | Borderline / likely-accept (bootstrap loop is in-domain) |
| Low | F-24 — retired-check tombstones violate documentation-as-it-is voice | `static-analysis-patterns.md:172,198` | Delete tombstones and renumber; record merge in git/CHANGELOG |
| — | F-01 — *dropped (verified false positive)* | `workflow.yaml:37-40` | Rules already correctly in `rules.activity`; no action |

---

## Scope Manifest

Confirmed and drafted during scope-and-draft (v4.16.0 → 4.17.0). All edits in the worktree only.

**Modify (18):**
- `workflow.yaml` — version 4.17.0; F-02 dedupe; F-03 de-CAPS + rationale→CHANGELOG; F-04 regroup prefixes/gates; F-05/F-06 structural gate wording; F-08 prune `agents_assigned`/`agents_dispatched`.
- `activities/02-reconnaissance.yaml` — F-07 finalize set; F-10 rebind 6 dispatch bindings to group ops.
- `activities/03-primary-audit.yaml` — F-07 finalize set + set `dispatch/verification/merge_complete`; F-10 rebind 7 dispatch bindings; F-11 collapse 4 redundant merge/verify re-bindings.
- `activities/04-adversarial-verification.yaml` — F-07 finalize set.
- `activities/05-report-generation.yaml` — F-05 `enforce-report-gates` + `write-report` condition; F-07 finalize set; F-09 drop duplicate transitions; F-11 collapse `verify-elevation-completeness`; F-14 drop `findings: merge_table` rename.
- `activities/06-ensemble-pass.yaml` — F-09 drop duplicate transitions.
- `activities/11-sub-static-analysis.yaml` — F-19 `resource_id` bare slug (×2).
- `resources/audit-prompt-template.md` — F-20 thin to §1+§4+taxonomy stubs (117KB→~13KB), anchors preserved.
- `resources/severity-rubric.md` — F-21 absorb calibration (scales + 13-row benchmark + crosscheck + bias correction).
- `resources/static-analysis-patterns.md` — F-24 delete Check 8/12 tombstones; F-21 drop `## Overview`.
- `techniques/score-severity.md` — F-14 input `findings`→`merge_table`; F-21 repoint 5 calibration refs to severity-rubric.
- `techniques/map-vulnerability-domains.md` — F-13 read `architectural_analysis.{...}` via dotted path.
- `techniques/map-codebase.md` — F-18 affirmative slug.
- `techniques/search-pattern-catalog.md` — F-19 bare-slug example.
- `README.md` — F-12 role prose→rules/link; F-19 drop NN column + severity-calibration row; F-22 drop `**Artifacts:**` ×7; dispatch-sub-agents group link.
- `CHANGELOG.md` — v4.17.0 entry (F-03 rationale tails land here).

**Create (10):**
- `activities/README.md`, `techniques/README.md`, `resources/README.md` (F-16).
- `techniques/dispatch-sub-agents/` group (F-10): `TECHNIQUE.md`, `assign-roster.md`, `route-leads.md`, `dispatch-concurrent.md`, `collect-results.md`, `verify-output-files.md`.

**Remove (2):**
- `resources/severity-calibration.md` (F-21/R4, merged into severity-rubric).
- `techniques/dispatch-sub-agents.md` (F-10, superseded by the group folder).

Dropped: F-01 (verified false positive). Discretionary/no-change: F-15 (numbering gap left as band-split), F-23 (in-domain, accepted), start-here.md:13 (no role-prescriptive sentence present).

---

## 📊 Activity Progress

| # | Activity | Mode | Status |
|---|----------|------|--------|
| 01 | Intake and Context | All | ✅ Complete |
| 03 | Requirements Refinement | Create, Update | ✅ Complete |
| 04 | Impact Analysis | Update | ✅ Complete |
| 06 | Scope and Draft | Create, Update | ✅ Complete |
| 08 | Quality Review | All | ✅ Complete |
| 09 | Validate and Commit | All | ✅ Complete |
| 10 | Post-Update Review | Update | ✅ Complete |
| 11 | Retrospective | All | ✅ Complete |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| Target workflow (worktree) | `../../../../../work/workflow-server/substrate-node-security-audit-remediation/substrate-node-security-audit/` |
| Compliance report | [08-quality-review.md](08-quality-review.md) |
| Verification addendum | [08-quality-review-verification.md](08-quality-review-verification.md) |
| Review-pass intake | [01-intake-and-context.md](01-intake-and-context.md) |

---

**Status:** Post-update review complete — verdict CLEAN. The committed diff (`a3479f81`, draft PR [#159](https://github.com/m2ux/workflow-server/pull/159) vs `workflows`) fully and correctly implements the verification-recalibrated change spec: all 20 remediated findings (F-05/F-02/F-03/F-04/F-06/F-08/F-09/F-10/F-11/F-12/F-13/F-14/F-16/F-18/F-19/F-20/F-21/F-22/F-24/F-07) landed, F-01 correctly dropped, and **0 new findings** were introduced. No dangling refs, no orphaned template anchors (~37 deep links all resolve to retained stubs), no half-done relocations (F-20 §2/§3/§5 de-dup non-lossy; R4 severity merge preserved in full). Scope-discipline: committed file set matches the manifest with no drift; discretionary no-changes (F-15/F-23/start-here.md) respected. Guards re-confirmed: `validate-workflow-yaml` all-PASS against the committed worktree (v4.17.0, 14 activities, 25 technique files); `check-all-refs` 0 unresolved and `check-binding-fidelity` 40/40/0-NEW (validate-and-commit run). Snapshot: [10-post-update-review.md](10-post-update-review.md). Session complete — close-out and retrospective recorded in [COMPLETE.md](COMPLETE.md); no further activities.
