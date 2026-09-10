# Scope Manifest — Server when-merge tail: dismissal parity, activity-rule refs, citation-grain guard

**Target:** `workflow-server` engine v0.2.0 · **Mode:** Update
**Basis:** [change brief](01-change-brief.md) · [impact analysis](01-impact-analysis.md)
**Edit surface:** `/home/mike1/projects/dev/workflow-server/.worktrees/pr2-server/` — present, on the run's branch `feat/when-merge-rule-fragments-ap134-guard` @ `3c11961f` (clean, in sync with origin)

22 files: 7 created, 15 modified, 0 removed. Preserved instead of removed: 0 (nothing inventoried).

Engine run: paths are relative to the repo root, not a `workflows/<id>/` definition directory; the template's definition kinds are adapted to `source | schema | script | config | generated | test | fixture`. Change-group letters tie each entry to its [co-change set](01-impact-analysis.md#change-constraints).

---

## File manifest

| # | Path (repo root) | Kind | Action | Set | One-line change |
|---|------------------|------|--------|-----|-----------------|
| 1 | `src/schema/activity.schema.ts` | schema | modify | A,B | Step `when`/`condition` descriptions reworded — dismissal parity, LEGACY names its removal target (next workflow-schema major); activity-file `rules` slot widens from `z.array(z.string())` to `RuleEntrySchema` entries |
| 2 | `src/schema/workflow.schema.ts` | schema | modify | B | `fragments`/`fragments.rules` descriptions name activity-file rule slots as a referencing site (`RuleEntrySchema` itself is reused unchanged) |
| 3 | `src/tools/workflow-tools.ts` | source | modify | A | `condition_not_met` dismissal gate accepts a checkpoint gated by `when` OR structured `condition`; error text names both gate forms |
| 4 | `src/loaders/workflow-loader.ts` | source | modify | B | Materialize activity-file rule `{ref}` entries at load with the same fragments lookup as workflow partitions; trace notes for activity-rule refs |
| 5 | `src/loaders/fragment-resolver.ts` | source | modify | B | Module doc extends the declared reference sites to activity-file rules; `materializeRuleEntries` reused as-is |
| 6 | `scripts/check-fragments.ts` | script | modify | B | Activity rules become ref-capable slots: `{ref}` entries validated (malformed-ref/unresolved-ref), counted toward unused-fragment, exempt from inline-duplicate tracking |
| 7 | `scripts/check-citation-grain.ts` | script | create | C | New hard-zero AP-134 guard: flag a technique file citing one resource both bare and `#`-anchored; exceptions-manifest aware; guard-protocol `--json` findings; `requireWorkflowsRoot` |
| 8 | `scripts/citation-grain-exceptions.json` | config | create | C | Seeded exceptions: `validate-specification→validation-rubric` (documented economical, permanent) + `reconcile-design-assumptions→anti-patterns` (temporary — disposition owed to the corpus PRs); stale entries reported like binding-fidelity triage |
| 9 | `scripts/guards.ts` | script | modify | C | Register GuardSpec `citation-grain` (script path, `npmScript: check:citation-grain`, `scope: corpus`, `json: true`, proves line) |
| 10 | `package.json` | config | modify | C | Add `check:citation-grain` npm script (guard-registry test requires every non-null `npmScript` to exist) |
| 11 | `schemas/activity.schema.json` | generated | modify | A,B | Regenerated (`generate-schemas`) from #1 |
| 12 | `schemas/workflow.schema.json` | generated | modify | B | Regenerated (`generate-schemas`) from #2 |
| 13 | `tests/mcp-server.test.ts` | test | modify | A | Dismissal cases for both gate forms: `when`-gated accepts, `condition`-gated still accepts, ungated still rejects (error names both forms) |
| 14 | `tests/workflow-loader.test.ts` | test | modify | B | Activity-file rule refs materialized at load: resolving ref splices rule text; unresolved ref fails load |
| 15 | `tests/fragments-guard.test.ts` | test | modify | B | Guard coverage for ref-capable activity rules: beta's unresolved activity-rule ref flagged; alpha's resolving ref clean; unused-fragment expectations hold |
| 16 | `tests/fixtures/fragments/alpha-fixture/activities/00-alpha-activity.yaml` | fixture | modify | B | Activity gains `rules` with a resolving `{ref: shared-discipline}` entry (fragment already declared in alpha's workflow.yaml) |
| 17 | `tests/fixtures/fragments/beta-fixture/activities/00-beta-activity.yaml` | fixture | modify | B | Activity gains an unresolved activity-rule ref — the guard's violation case |
| 18 | `tests/citation-grain-guard.test.ts` | test | create | C | Fixture-rooted guard coverage: flags the coexist pair, passes anchored-only, honors a seeded exception, reports a stale exception |
| 19 | `tests/fixtures/citation-grain/corpus/wf-one/techniques/cites-both.md` | fixture | create | C | Technique citing `resources/guide.md` bare AND anchored — the flagged tell |
| 20 | `tests/fixtures/citation-grain/corpus/wf-one/techniques/cites-anchored.md` | fixture | create | C | Technique citing only `#`-anchored sections — passes |
| 21 | `tests/fixtures/citation-grain/corpus/wf-one/resources/guide.md` | fixture | create | C | Multi-section resource the fixture techniques cite |
| 22 | `tests/fixtures/citation-grain/exceptions.json` | fixture | create | C | Test seed exercising the exemption path and the stale-entry report |

**Out of scope this pass:**

- `scripts/check-all.ts` — impact-analysis refinement: the suite walks the `scripts/guards.ts` registry ("adding an entry there enforces it here and in CI"), so registration needs no check-all edit
- `docs/development.md`, `site/` — describe the registry pattern generically; no guard enumeration to update
- `tests/e2e/policies.ts` — its `condition_not_met` comment describes behavior this change widens without invalidating
- `tests/guard-registry.test.ts` — walks `GUARDS` generically; the repo-scoped literal list is untouched (new guard is corpus-scoped)
- `src/schema/condition.schema.ts` / `schemas/condition.schema.json` — the LEGACY construct's body is unchanged; only its *descriptions* in activity.schema.ts move
- All 16 `workflows/` definition directories — zero definition edits ([brief, out of scope](01-change-brief.md)); corpus fixes ride PR 1/PR 3

---

## Structural design

```
(unchanged) — no workflows/<id>/ tree exists or is created; the engine repo keeps its layout.
New files slot into existing homes:
scripts/check-citation-grain.ts            # beside the other check-*.ts guards
scripts/citation-grain-exceptions.json     # precedent: scripts/binding-fidelity-triage.json
tests/citation-grain-guard.test.ts         # naming precedent: fragments-guard.test.ts
tests/fixtures/citation-grain/             # precedent: tests/fixtures/fragments/
```

**Flow:** no transition topology anywhere — no workflow definition is touched; engine behavior widens additively (dismissal acceptance, ref-capable slots, one new guard).

| Convention | This change |
|------------|-------------|
| Guard registration | Registry-driven via `scripts/guards.ts` GuardSpec; per-guard npm script in `package.json`; check-all/CI pick it up from the registry |
| Guard output | Speaks `scripts/guard-protocol.ts` finding protocol (`--json`), so `check:delta` can diff it; corpus root via `requireWorkflowsRoot` (exit 2 on unreachable corpus) |
| Exceptions manifest | JSON beside the script, entries carry a verdict/reason and go stale loudly — precedent `scripts/binding-fidelity-triage.json` |
| Schema descriptions | LEGACY marking names its removal target; descriptions state behavior, not restated schema shape |
| Generated schemas | `schemas/*.json` only ever change via `npm run generate-schemas`; `generated-schemas.test.ts` guards drift |
| Test naming | `<guard-id>-guard.test.ts` for guard tests; fixture corpora under `tests/fixtures/<area>/` |

**Drafting decisions on the brief's open judgements** (decisions are drafting facts; the judgements' canonical rows stay in the [change brief](01-change-brief.md#open-judgements)):

1. **Seed home → exceptions manifest** (`scripts/citation-grain-exceptions.json`): the suite already owns a reviewable JSON beside a guard (`binding-fidelity-triage.json`), and judgement 2 forces a second, temporary entry — an in-script constant would make that churn a guard edit.
2. **Hard-zero immediately, exceptions temporarily seeded**: mechanical scan of the baseline corpus finds exactly two coexist pairs — `requirements-refinement/techniques/validate-specification.md → validation-rubric.md` (recorded whole-resource-economical by the [prior #358 run](../2026-07-31-section-resource-grain-358-359/06-scope-manifest.md)) and `workflow-design/techniques/reconcile-design-assumptions.md → anti-patterns.md` (on no PR's fix list — anti-patterns was excluded from the top-20 measure; fixing it is a `workflows/` edit, out of scope here). Seeding both keeps `check:all` green at merge while hard-zero semantics land; the second entry is marked temporary with its disposition owed to the corpus PRs.

---

## Drafting order

1. **Schemas** (#1, #2) — the contract every loader, tool and guard consumes; widen it first so downstream drafts compile against it
2. **Engine sources** (#3, #4, #5) — dismissal gate and load-time materialization against the widened contract
3. **Guard scripts** (#6, #7, #8, #9, #10) — enforcement over the new semantics, registered through the registry
4. **Generated schemas** (#11, #12) — derived artifacts regenerated once the source schemas settle
5. **Tests and fixtures** (#13–#22) — lock the behavior: dismissal cases, loader refs, guard fixture corpus
