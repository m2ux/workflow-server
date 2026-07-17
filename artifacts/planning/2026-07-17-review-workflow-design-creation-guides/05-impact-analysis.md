# Impact Analysis — pattern_analysis Output + #template cites

**Workflow:** `workflow-design` v1.24.3  
**Mode:** Update  
**Date:** 2026-07-17  
**Change source:** [design specification](03-design-specification.md)  
**Baseline:** [structural inventory](01-structural-inventory.md)

---

## Summary

Technique-markdown only: declare undeclared `{pattern_analysis}` Output and append `#template` on bare persist/compile guide cites. **No activities added, removed, or reordered.** Topology, variables, checkpoints, and resource files stay intact.

**removal_count:** 0

---

## 1. Impact classification

### Directly modified

| File | Why |
|------|-----|
| `techniques/pattern-analysis.md` | Add `### pattern_analysis` Output; bump technique version; persist cite → `#template` |
| `techniques/intake-classification.md` | Persist cite → `structural-inventory.md#template` |
| `techniques/assemble-file-approach.md` | Persist cite → `drafting-plan.md#template` |
| `techniques/review-drafted-file.md` | Persist cite → `file-review-note.md#template` |
| `techniques/review-draft-yaml.md` | Persist cite → `draft-attestation.md#template` |
| `techniques/persist-design-specification.md` | Persist cite → `design-specification.md#template` |
| `techniques/compile-report.md` | Guide/compile cites → `compliance-report.md#template` |

### Possibly touched (draft-time)

| File | Why |
|------|-----|
| `workflow.yaml` | Version bump at commit only — no structural/variable change |

### Unaffected (summary)

All 9 activity YAML files, remaining ~29 technique leaves, all 22 resources, workflow README, technique container — no planned edit. No obsolete files.

---

## 2. Integrity checks

| Check | Verdict |
|-------|---------|
| Transitions / `initialActivity` / reachability | **Pass** — activity graph unchanged |
| Technique / resource references | **Pass** — no deletes/renames; cites keep same resource paths |
| Variables / `setVariable` / step conditions | **Pass** — no variable add/remove/type change |

Side-effects: new Output lands `{pattern_analysis}` in the bag for same-name bind; gates still use `{pattern_analysis_path}`. Cite anchors do not alter binding.

---

## 3. Removals inventory

| # | Location | Removed | Preserved |
|---|----------|---------|-----------|

none — changes are additive (new Output section; `#template` appended to existing links).

---

## Decision ask

No removals flagged. Impact scope is the seven technique files above (plus optional version bump).

---

## 4. Follow-on change — quality-review auto-fix (2026-07-17, return-to-draft)

**Trigger:** User rejected pre-commit attestation and asked that the workflow automatically fix findings without presenting a checkpoint. Added to the same PR branch alongside the seven technique fixes above.

### Directly modified (this follow-on)

| File | Why |
|------|-----|
| `activities/08-quality-review.yaml` | Remove the four per-pass disposition checkpoints (`expressiveness-confirmed`, `conformance-confirmed`, `rule-hygiene-confirmed`, `enforcement-confirmed`); add a non-checkpoint flagged-findings action message per pass; rebase `classify-audit-findings`/`reassess-audit-fixes` on finding counts instead of user election; patch bump |
| `activities/README.md` | Update the Quality Review blurb — it described per-pass confirmation checkpoints that no longer exist |

### Removals inventory (this follow-on)

| # | Location | Removed | Preserved |
|---|----------|---------|-----------|
| 1 | `activities/08-quality-review.yaml` | `expressiveness-confirmed` checkpoint (options: `confirmed`/`revise`) | Zero-finding path unchanged (`expressiveness-clean`); non-zero path keeps a message, now non-blocking |
| 2 | `activities/08-quality-review.yaml` | `conformance-confirmed` checkpoint (options: `fix-all`/`selective`/`accept-as-is`) | Zero-finding path unchanged (`conformance-clean`); non-zero path keeps a message, now non-blocking |
| 3 | `activities/08-quality-review.yaml` | `rule-hygiene-confirmed` checkpoint (options: `fix-all`/`selective`) | Zero-finding path unchanged (`rule-hygiene-clean`); non-zero path keeps a message, now non-blocking |
| 4 | `activities/08-quality-review.yaml` | `enforcement-confirmed` checkpoint (options: `add-enforcement`/`accept-text-only`) | Zero-finding path unchanged (`enforcement-clean`); non-zero path keeps a message, now non-blocking |

**removal_count (this follow-on): 4** — all four intentional per the explicit user directive. None require content preservation: each removed checkpoint offered only a disposition on findings the fix cycle now always applies, not distinct content the user could otherwise lose. `review-disposition` (review mode) and the `blocker-gate` decision are unaffected — out of scope for this change.

### Integrity checks (this follow-on)

| Check | Verdict |
|-------|---------|
| Transitions / `initialActivity` / reachability | **Pass** — no activity add/remove/reorder; `audit-fix-cycle` loop and `blocker-gate` decision unchanged |
| Technique / resource references | **Pass** — no technique renamed or removed; `apply-audit-fixes` input contract unchanged |
| Variables / `setVariable` / step conditions | **Pass** — `needs_audit_fixes` and `has_critical_finding` keep their names and types; only the messages describing how an agent derives them change, plus the removal of the `add-enforcement` checkpoint's `setVariable` effect (superseded by the same-named `action: set` on `classify-audit-findings`) |

### Decision ask (this follow-on)

Removing the four disposition checkpoints is intentional and directed by the user; no content-preservation gap results. Impact scope is `activities/08-quality-review.yaml` and `activities/README.md`.
