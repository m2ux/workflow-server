# Workflow Design: workflow-design / work-package — Complete

> Update · 2026-07-21 · PR [#268](https://github.com/m2ux/workflow-server/pull/268) · commits `03562c63` → `49366f9e`

## Summary

Multi-target update of `workflow-design` (v1.30.0) and `work-package` (v3.34.0) closed retrospective-driven gaps from the prior ten planning folders, then — after lap-1 post-update found three issues — iterated so post-update findings are always auto-remediated (never accept/iterate/revert). Clean post-update on `49366f9e` (`review_findings_count: 0`).

## What Was Delivered

- **Activities (modified):** `workflow-design` `post-update-review` — count-gated expressiveness/conformance persists; removed `post-update-disposition`; QR-style remedia while-loop with `needs_recommit` → `validate-and-commit` / dirty → `intake-and-context`; report snapshot via bound `write-artifact`. `quality-review` / `validate-and-commit` — compliance report binds migrated to `write-artifact`. `work-package` `complete` — AP-98 status-only `retrospective-confirm.message`.
- **Techniques (removed):** `workflow-design/techniques/persist-report.md` (writer retired after bind migration).
- **Resources:** none added.
- **Variables / rules:** `needs_recommit` for remedia→recommit path; headless rule no longer names post-update findings disposition; version bump to `workflow-design` 1.30.0.

(Lap-1 themes already on `03562c63` remain in force; this close-out emphasizes the iterate deltas on `49366f9e` — see [scope manifest](06-scope-manifest.md).)

## Design Decisions

See [README Design Decisions](README.md#design-decisions) and [assumptions log](03-assumptions-log.md). Drafting-only note with no other home: Gate 2 accepted remedia → `validate-and-commit` via `needs_recommit` (A-12 path 1) rather than embedding commit inside the remedia loop.

## Scope Outcome

All 9 manifest items delivered ([06-scope-manifest.md](06-scope-manifest.md)). Intentional removal: `persist-report.md`. No unaddressed rows.

## Known Limitations & Deferrals

- **PR #268 not merged at close-out** — catalogs committed on branch `workflow/workflow-design-planning-retrospective-findings`; merge remains outstanding.
- **Live session vs committed definition** — this run's in-memory `post-update-review` stayed on the pre-iterate shape through lap 1 (disposition still yielded); committed tree is 1.9.1 with auto-remedia. Clean lap-2 path skipped disposition via `review_findings_count == 0`.
- **D-1** — `path_gating_complexity` vs `problem_complexity` naming ambiguity deferred ([deferred-items.md](deferred-items.md)).
- **Optional polish** — parenthetical avoidance voice in activity description/outcome/README noted in [10-post-update-review.md](10-post-update-review.md); not compliance debt.

## Lessons Learned

- Post-update disposition asking accept/iterate/revert directly contradicted the prior question-minimisation mandate; the user's correction became the iterate change request and is now structural (auto-remedia), not agent judgment.
- Binding fidelity and gated persists must land in the same commit as new audit steps — lap 1 shipped the themes but left three post-update compliance gaps that forced a full second design lap.

## Workflow Retrospective

[messages: 7 total, 2 non-checkpoint · session quality: Significant issues]
[activities: 8 of 9 design activities executed across two laps (pattern-analysis skipped — create-only); retrospective this close-out]

### Observations

- [correction] "if *any* findings are present they are *always* fixed *without* asking!!! youre meant to eb doing this anyway after the previous question minimisation work package" — post-update-review / `post-update-disposition` — disposition checkpoint still asked accept/iterate/revert after findings, conflicting with question-minimisation intent
- [checkpoint anomaly] `post-update-disposition` fired on lap 1 with 3 findings (`03562c63`); user chose iterate + mandated auto-fix — gate removed in iterate delivery
- [trace-warning] UNRESOLVED binding cluster (`assumption_decisions`, `drafted_files`, `schema_type`, `selected_findings`, commit `paths`/`commit_message`/`branch`) — requirements-refinement through validate-and-commit — known binding-fidelity noise; lap-1 themes already targeted producers for several of these
- [trace-warning] Activity claims transition condition not found (`isDefault`, `operation_type == update`) — multiple activities — registration/claim mismatch pattern (also in source retrospective set)
- [trace-warning] `Resource not found: planning-readme in workflow work-package` — repeated get_resource — wrong/cross-workflow resource id in technique refs
- [trace-retry] Missing steps in manifest / create-pr without get_technique — validate-and-commit / post-update — worker step-manifest coverage gaps under disposable dispatch

### Recommendations

1. **High:** Post-update findings must never present accept/iterate/revert → keep auto-remedia while-loop + dirty→intake / clean→retrospective (and remedia-success→recommit) as shipped in `10-post-update-review.yaml` — verify on next dirty post-update that the *session-loaded* definition matches the committed catalog (hot-reload or restart after commit).
2. **Medium:** Fix `planning-readme` resource refs so workers resolve a real work-package (or shared) resource id instead of failing `get_resource` mid-activity.
3. **Medium:** Continue binding-fidelity / transition-claim registration cleanup for the UNRESOLVED and "claims transition condition not found" clusters (several already in lap-1 scope; remaining noise still fires every update run).
4. **Low:** Tighten disposable-worker step-manifest discipline (`get_technique` before every reported step; include announce-completion / create-pr in manifests when claimed).

**Key takeaway:** The only substantive user friction this session was the post-update disposition ask — now removed and replaced with mandatory auto-remedia.
**Action required:** no
