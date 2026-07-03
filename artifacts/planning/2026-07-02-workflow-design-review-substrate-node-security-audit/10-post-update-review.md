# Post-Update Review — substrate-node-security-audit (v4.17.0)

**Date:** 2026-07-02
**Session:** CED3DG · **Activity:** post-update-review
**Mode:** UPDATE / post-implementation review (holistic confirmation of the committed state)
**Committed as:** `a3479f81` on `workflow/substrate-node-security-audit` (parent = `origin/workflows` tip `2778287e`), pushed; draft PR [#159](https://github.com/m2ux/workflow-server/pull/159) vs `workflows`.
**Baseline reviewed against:** the verification-recalibrated change spec (`08-quality-review-verification.md` for the High tier; `08-quality-review.md` Medium/Low; scope manifest + R1–R12 content-removal list in `05-impact-analysis.md` / README).

## Verdict

**CLEAN.** The shipped diff fully and correctly implements the approved change spec. Every finding in the remediation set landed, no regression was introduced, and no loose ends remain (no dangling refs, no orphaned anchors, no half-done relocations). Version bumped 4.16.0 → 4.17.0. No schema/contract/phase/checkpoint break — every change is a content/structure refactor within the existing schema.

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High     | 0 (new) |
| Medium   | 0 (new) |
| Low      | 0 (new) |
| New findings introduced by the update | **0** |

## Finding-by-finding confirmation (committed state)

| Finding | Fix landed? | Evidence in committed diff |
|---------|-------------|----------------------------|
| F-05 (High) — HARD-STOP gates text-only | ✅ | `05-report-generation.yaml`: new `enforce-report-gates` action step with 3 structured `validate` actions gating `dispatch_complete`/`verification_complete`/`merge_complete` + 2 `validate`s for coverage & reconciliation; `write-report` carries a `type: and` `condition` on all three gate vars. Gates set structurally in `03-primary-audit.yaml` finalize. |
| F-02 (Med) — cross-level rule dup | ✅ | `workflow.yaml`: DEFENSE-IN-DEPTH + weights.rs copies removed from `rules.activity`; authoritative home remains `apply-checklist.md` (unchanged). |
| F-03 (Med) — UPPERCASE + rationale tails | ✅ | `workflow.yaml`: rules de-CAPS'd to invariant statements; rationale tails ("historically caused", "primary cause…") gone (relocated to CHANGELOG). |
| F-04 (Med) — flat prefix-shaped keys | ✅ | `workflow.yaml`: 3 `PREREQUISITE:` → one grouped prerequisite bullet; 5 `… GATE` rules → one grouped hard-stops bullet. |
| F-06 (Med) — FULLY-AUTOMATED claim unenforced | ✅ | `workflow.yaml`: automation rule reconciled — "report generation is entered only when the phase-1b dispatch, verification, and merge gates are all true" (matches the now-structural F-05 wiring). |
| F-08 (Med) — unread gate vars | ✅ | `workflow.yaml`: `agents_assigned`/`agents_dispatched` pruned; the three retained gate vars are now read by F-05 conditions (wired, not pruned — the F-05↔F-08 interaction respected: each var is wired OR pruned, never both). |
| F-09 (Med) — routing dup (decisions[] + transitions[]) | ✅ | `05-report-generation.yaml` + `06-ensemble-pass.yaml`: duplicate conditional `transitions[]` removed; `decisions[]` retained. |
| F-10 (Med) — dispatch-sub-agents phase-unroll (13×) | ✅ | Monolith `dispatch-sub-agents.md` deleted; new group folder (`TECHNIQUE.md` + 5 ops); 13 bindings rebound (`dispatch-concurrent`×6, `verify-output-files`×4, `assign-roster`×1, `route-leads`×1, `collect-results`×1). Roster exception preserved (2 distinct `dispatch-*-agent` → `dispatch-concurrent`). |
| F-11 (Low) — same-activity repeat bindings | ✅ | `03-primary-audit.yaml`: 4 redundant re-bindings collapsed (`extract-table-derived-findings`, `validate-reconciliation`, `verify-checklist-completeness`, `preserve-merge-output`); `05-report-generation.yaml`: `verify-elevation-completeness` removed. Technique files needed no change (collapse = remove re-bindings). |
| F-12 (Med) — role-prescriptive README prose | ✅ | `README.md`: role-split bullets removed from design list; role split re-expressed once as a workflow invariant with a link to `workflow.yaml` rules. |
| F-13 (Med) — map-vulnerability-domains binding gap | ✅ | `map-vulnerability-domains.md`: single `architectural_analysis` input; protocol reads `{architectural_analysis.interaction_model/.privilege_map/.candidate_points/.emergent_domains}` via dotted path. Cross-sub-agent gap closed. |
| F-14 (Low→Med) — score-severity per-call rename | ✅ | `score-severity.md`: input canonicalized `findings` → `merge_table` (matches producer); `05-report-generation.yaml` `apply-severity` now bare-string (rename dropped). |
| F-16 (Med) — missing subfolder READMEs | ✅ | New `activities/README.md`, `techniques/README.md`, `resources/README.md` — prism-style orientation maps, no protocol restatement. |
| F-18 (Low) — non-affirmative slugs | ✅ (2 of 3, as scoped) | `map-codebase.md` → `enumerate-every-component-explicitly`; `dispatch-sub-agents` → `orchestrator-reads-persisted-files`. `verify-sub-agent-output`'s `every-protocol-executed-mechanically` left as-is (F-18 disposition was "review", Low; defensible retention). |
| F-19 (Low) — NN- resource slugs | ✅ | `11-sub-static-analysis.yaml` (×2) + `search-pattern-catalog.md` example → bare slug; `README.md` resource table dropped the `Index`/NN column. |
| F-20 (Med) — audit-prompt-template AP-85 | ✅ | Template thinned 1017→302 lines; §1 Setup + §4 Reporting Format kept in full; §2/§3/§5 reduced to taxonomy stubs that point to the owning technique/resource (operative content already dual-homed in `static-analysis-patterns`/`apply-checklist`/`execute-ensemble-pass` — de-dup, non-lossy). |
| F-21 (Med) — guide-wrapper + two severity resources | ✅ | `severity-calibration.md` deleted, merged into `severity-rubric.md` (R4 preservation confirmed: I/F scales, Average block, Required Output Format, 13-row benchmark table, crosscheck, bias correction; labels reconciled). `## Overview` wrappers dropped. |
| F-22 (Low) — README artifact enumerations | ✅ | All 7 per-activity `**Artifacts:**` lists removed, replaced by a link to the synthesized contract; mermaid flow/dispatch diagrams kept. |
| F-24 (Low) — retired-check tombstones | ✅ | `static-analysis-patterns.md`: Check 8 + Check 12 tombstone headings deleted. |
| F-07 (Low) — finalize `set` message not target+value | ✅ | `02/03/04/05` finalize steps: `set` now uses `target`+`value` (`reconnaissance_complete`/`primary_audit_complete`/`adversarial_complete`/`report_complete`); `03` also structurally sets the three gate vars. |
| F-01 | Correctly DROPPED | Verified false positive (rules already in `rules.activity`); no change made. Confirmed absent from the diff. |

## Scope-discipline audit (no drift)

Committed file set (27 files: 16 modified / 9 created / 2 removed — the CHANGELOG.md modify is the 17th change entry beyond the manifest's "18 modify" which counted CHANGELOG) matches the confirmed scope manifest. Discretionary no-changes from the manifest are respected:

- **F-15** (08/09 numbering gap): left as band-split, documented in the new `activities/README.md`. No forced renumber. ✅
- **F-23** (execute-sub-agent delivery narration): accepted as in-domain; no change. ✅
- `start-here.md:13`: no role-prescriptive sentence present; not touched. ✅
- Files verified untouched (per impact analysis "NOT touched" list): confirmed no changes to `01-scope-setup`, `07-gap-analysis`, sub-agent activities `10/12/13/14/15/16`, and the unaffected techniques/resources.

**No files were changed outside the manifest.** **No manifest item was left unaddressed.**

## Dependency-ripple / loose-end checks (all clean)

- **audit-template-reference.md anchors (largest ripple, ~37 deep links):** every `audit-prompt-template.md#…` anchor (§1.1–§1.4, §2.1–§2.11 incl. §2.7.1, §3.1–§3.14, §4 `#finding-entry`/`#severity-scoring`, §5 `#execution-model-requirements`/`#phase-order`/`#multi-agent-execution-strategy`/`#component-priority-order`/`#ai-agent-limitations-and-mitigations`) resolves to a retained stub heading. No orphaned anchor.
- **write-report.md §4 anchor:** `audit-prompt-template.md#4-reporting-format` survives (§4 kept in full). ✅
- **severity-calibration.md deletion:** no reference points at the deleted file. The 3 residual `severity-calibration` string matches are legitimate — a CHANGELOG history mention and two `target-profile.md#severity-calibration-benchmark` anchors (a section, not the file). R6 repointing of score-severity's 5 links → `severity-rubric.md` confirmed.
- **dispatch-sub-agents monolith deletion:** zero leftover bare `dispatch-sub-agents` bindings; all 13 are `::op`-qualified and resolve to the 5 existing ops. README + techniques-README links repointed to the group `TECHNIQUE.md`.
- **New group-op relative link depths:** correct for the new nesting (`../../resources/`, `../../../meta/`).

## Guard re-validation (committed state)

| Check | Result |
|-------|--------|
| `validate-workflow-yaml.ts` (re-run against the committed worktree) | **PASS** — workflow.yaml v4.17.0, all 14 activities PASS, 25 technique files, no unanchored protocol references. |
| `check-all-refs` (validate-and-commit run) | PASS — 0 unresolved. |
| `check-binding-fidelity` (validate-and-commit run) | PASS — 40/40, 0 NEW drift. |

No new compliance debt introduced by the update. The committed state is clean.
