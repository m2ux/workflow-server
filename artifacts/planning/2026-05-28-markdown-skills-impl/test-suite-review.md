# Test Suite Review — Markdown Skills Migration

**Activity:** `post-impl-review` (session `SUQLKL`)
**Date:** 2026-05-29
**Reviewer:** post-impl-review worker
**Baseline:** 329 tests passing, 4 skipped (per resumption context; matches the test plan's PR126 fixture suite expansion plus existing real-content + mcp-server integration tests).

## Scope

Reviewed test files that changed in the migration plus the surrounding suites that exercise loader and tool behaviour. The migration's primary test surface is:

- `tests/skill-loader.test.ts` — rewritten (-39 lines / +132 lines). 12 tests organised in three blocks: real-content checks against `workflows/meta/techniques/*`, the PR126-TC fixture suite (TC-03..TC-08 + TC-15), and tempdir parsing edge cases.
- `tests/mcp-server.test.ts` — surface updates (+~32 lines). Five tool-level cases under `tool: get_resource` and `cross-workflow resource resolution` updated to use text-only slug ids (`github-issue-creation`, `meta/activity-worker-prompt`) plus a new negative test asserting numeric-only ids are rejected.
- `tests/fixtures/markdown-skills/{meta,work-package}/techniques/*` — 5 new fixture skills exercising precedence (TC-04, TC-05), op-as-child-files (TC-03), and malformed-ops error path (TC-06).

Tests that did **not** change but are downstream consumers of the migrated loaders:

- `tests/activity-loader.test.ts` — exercises activity loader; activity files were not migrated, so behaviour unchanged.
- `tests/workflow-loader.test.ts` — workflow.toon loading is unchanged.
- `tests/migration.test.ts`, `tests/validation.test.ts`, `tests/schema-validation.test.ts` — schema-level checks, unaffected by the loader flip.
- `tests/session-*.test.ts`, `tests/trace.test.ts`, `tests/config.test.ts` — orthogonal to the migration.

## Findings

### F-TS-01 — PR126-TC-06 (malformed-ops) accepts both error modes as passing (Minor — assertion permissiveness)

- **Status:** **Resolved** in review-fix-cycle iteration 1 — commit `c4e619a` on `feat/125-markdown-skills-migration`. Added the `error.name === 'SkillNotFoundError'` assertion under the `if (!result.success)` guard and replaced the "either path passes" comment with one that pins the closed regression gap.
- **File:** `tests/skill-loader.test.ts:114-120`
- **Evidence:** the test comment notes "Verify either: (a) the result is failed, OR (b) the operation was silently dropped (regression — should be false)" but the assertion only checks `expect(result.success).toBe(false)`. Path (a) is the contract per the loader's design (parse failure → throw → wrapper → `null` → `SkillNotFoundError`). Path (b) would also satisfy this assertion if the loader silently dropped the malformed op and returned a valid Skill with the rest. The comment acknowledges the gap.
- **Impact:** A regression that silently drops malformed ops would fail this test only if it changes the success flag — but a "drop the op, keep the skill" regression returns `{success: true, value: <skill without the bad op>}`, which would *fail this assertion in the desired direction*. The actual gap is the *opposite*: if a regression broke the technique-level resolution (e.g. malformed-ops returned `success: false` for the wrong reason), the test would still pass. The test does not distinguish the failure cause.
- **Recommendation:** Tighten to `expect(result.success).toBe(false); if (!result.success) expect(result.error.name).toBe('SkillNotFoundError')` (matches the contract that the parser surfaces parse errors as not-found). Severity: **Minor** — strengthens the regression signal without affecting current pass/fail.

### F-TS-02 — Real-content tests assume `workflows/meta/techniques/workflow-engine` has ≥ 6 operations and ≥ 3 rules (Minor — coupling to content)

- **Status:** **Resolved** in review-fix-cycle iteration 1 — commit `c4e619a` on `feat/125-markdown-skills-migration`. Applied recommendation path (b): added a four-line comment above the thresholds declaring them as deliberate lower bounds, naming the content path they couple to (`workflows/meta/techniques/workflow-engine/`), citing the current counts at time of writing, and stating that a shrink below either bound is the intentional failure signal. Recommendation path (a) — extract a fixture — is deferred as a follow-up.
- **File:** `tests/skill-loader.test.ts:52-53,55`
- **Evidence:** the magic numbers 6 and 3 are absolute thresholds against live content in `workflows/meta/techniques/workflow-engine/`. If the workflow-engine skill is restructured (operations split, rules consolidated), the test will fail for a content-only reason.
- **Impact:** Low — workflow-engine is a stable surface area, and a content change that breaks this test is precisely the signal you'd want. But the threshold is opaque.
- **Recommendation:** Either (a) introduce a `tests/fixtures/markdown-skills/meta/techniques/workflow-engine/` fixture that the test can pin against (decouples behaviour from content evolution), or (b) leave it as-is and document the dependency in a comment near the magic numbers. Severity: **Minor** — defer to a follow-up.

### F-TS-03 — No test exercises `meta/<id>` explicit-prefix resolution end-to-end (Minor — coverage gap)

- **Status:** **Resolved** in review-fix-cycle iteration 1 — commit `c4e619a` on `feat/125-markdown-skills-migration`. Added PR126-TC-05b under a new dedicated fixture pair: `tests/fixtures/markdown-skills/meta/techniques/explicit-prefix-target/SKILL.md` and `tests/fixtures/markdown-skills/work-package/techniques/explicit-prefix-target/SKILL.md`. The test asserts `readSkill('meta/explicit-prefix-target', FIXTURE_DIR, 'work-package')` returns the meta-tagged version (`/meta-version/i`) and NOT the override (`!/workflow-local override/i`). A dedicated slug is used instead of the recommendation's `agent-conduct` to avoid coupling with TC-04's no-override premise (which broke when an `agent-conduct` override was added in a first attempt). Test count: 16 → 17 in skill-loader; 329 → 330 overall.
- **File:** none.
- **Evidence:** the `readSkill` precedence ladder includes an explicit-prefix form (`{workflow}/{id}`) at branch 0 — the test plan for TC-04 covers the workflow-local → meta *fallback*, but no test exercises the *opposite* direction (an explicit `meta/<id>` ref when a workflow-local override exists, asserting that explicit-prefix wins over precedence). The fixture-based TC-04 demonstrates fallback when no override exists, not explicit-prefix forcing.
- **Impact:** A regression that broke the explicit-prefix branch (e.g. dropped the `if (skillId.includes('/'))` check) would not be caught. Real-content tests at the top of the file *do* use `meta/agent-conduct` form, but those calls do not pass a `workflowId`, so they exercise the no-workflow + explicit-prefix path, not the override-suppression path.
- **Recommendation:** Add a fixture under `tests/fixtures/markdown-skills/work-package/techniques/agent-conduct/SKILL.md` and a TC asserting `readSkill('meta/agent-conduct', FIXTURE_DIR, 'work-package')` returns the meta version even when work-package has an override. Severity: **Minor** — closes a coverage gap on a tested invariant.

### F-TS-04 — `tests/mcp-server.test.ts` does not assert the new id-only error message (Nit — assertion specificity)

- **File:** `tests/mcp-server.test.ts:504-517`
- **Evidence:** the "should reject numeric-only resource ids (numbering deprecated)" test only checks `result.isError === true`. The error message is not asserted, so a regression that changed the failure mode (e.g. silently 404'd vs explicitly rejected) would still pass.
- **Impact:** Low — `isError === true` is the wire-level contract. The granularity of the error is consumer-policy.
- **Recommendation:** Optionally assert the error text contains a notion of "not found" or the resource id echoes back. Severity: **Nit** — defer.

### F-TS-05 — Op-as-child-files tests cover the round-trip via `projectSkillToToon` but not the raw `tryReadMarkdownSkillRaw` direct call (Nit — coverage)

- **File:** `tests/skill-loader.test.ts:130-146,154-162`
- **Evidence:** the round-trip case (TC-08) decodes `projectSkillToToon(loadedSkill)` and validates. The `readSkillRaw returns projected TOON` case (lines 154-162) does the same shape — both go through the public `readSkillRaw` and confirm the toon decodes. Neither directly tests `tryReadMarkdownSkillRaw` (the leaf function in `markdown-skill-loader.ts`) — but since it has no logic beyond delegating to `tryLoadMarkdownSkill` + the projector, this is acceptable. The projector itself (`projectSkillToToon`) is only tested via the round-trip, not on field-order or shape independently.
- **Impact:** None — the round-trip is the binding contract. Direct projector tests would be redundant.
- **Recommendation:** None — informational. Severity: **Nit / informational**.

### F-TS-06 — `tests/migration.test.ts` was not extended for the migration scripts under `scripts/migrate-skills/` (Informational — orthogonality)

- **File:** `tests/migration.test.ts` (unchanged, 238 lines)
- **Evidence:** the existing migration test covers session/state schema migrations, not the markdown-content migration. The new scripts (`migrate.ts`, `translate.ts`) are one-shot utilities — no automated test exercises them.
- **Impact:** The translator's correctness is implicitly validated by (a) the live content tests against the migrated `workflows/meta/techniques/*` tree and (b) the test suite passing against the submodule pointer post-translation. A regression in `translate.ts` would not be caught by automated tests, but the script is not expected to run again.
- **Recommendation:** Informational only. If `translate.ts` will be re-used (e.g. for a future TOON-to-markdown adoption by another workflow), add a fixture-based test. Otherwise the migration scripts are appropriately positioned as one-shot tooling. Severity: **Informational**.

### F-TS-07 — Tempdir cleanup uses `force: true` and a manual `rm -rf` — relies on tmpfs cleanup semantics (Informational — test hygiene)

- **File:** `tests/skill-loader.test.ts:177` (and the fixture-test block)
- **Evidence:** `rm(tempDir, { recursive: true, force: true })` will silently swallow EBUSY or permission errors. Vitest reruns on a contributor laptop with antivirus or backup scanners may occasionally fail to clean. Not migration-specific — pre-existing pattern.
- **Impact:** None for migration correctness. Test fragility on certain platforms.
- **Recommendation:** Informational only. Severity: **Informational**.

## Coverage assessment (diff-aware)

Per the test plan's TC-01..TC-16 schedule, the migration's testable surface maps to:

| Test ID | Surface | Coverage |
|---|---|---|
| TC-01..TC-02 | Schema-driven SkillSchema validation against markdown-parsed objects | Indirect via TC-03..TC-08 (each tests passes through `safeValidateSkill`) |
| TC-03 | op-as-child-files materialisation | ✅ direct test |
| TC-04 | meta fallback | ✅ direct test |
| TC-05 | workflow-local override | ✅ direct test |
| TC-06 | malformed op-child error path | ✅ direct test (assertion is permissive — see F-TS-01) |
| TC-07 | not-found across both layers | ✅ direct test |
| TC-08 | projection round-trip | ✅ direct test |
| TC-09..TC-14 | wire-level / tool-level checks | ✅ in `tests/mcp-server.test.ts` (get_resource, cross-workflow refs) |
| TC-15 | parseSkillFilename alias guard | ✅ direct test (regex check on source file) |
| TC-16 | real-content backward compatibility | ✅ direct tests against `workflows/meta/techniques/*` |
| (none) | explicit-prefix override-suppression | ❌ gap — see F-TS-03 |

## Summary by severity

| Severity | Count | Findings |
|---|---|---|
| Critical | 0 | — |
| Major | 0 | — |
| Minor | 3 | F-TS-01 (PR126-TC-06 assertion), F-TS-02 (magic-number content thresholds), F-TS-03 (explicit-prefix coverage gap) |
| Nit | 2 | F-TS-04 (numeric-id error message), F-TS-05 (projector direct test absent) |
| Informational | 2 | F-TS-06 (migration scripts not tested), F-TS-07 (tempdir cleanup hygiene) |

## Notes

- Test suite passes 329 / 333 (4 skipped), matching the upstream-reported baseline from the F1 + remaining-workflows remediation. No regressions introduced by the migration.
- The PR126-TC fixture suite is well-positioned and exercises the canonical shape variants. The few gaps (F-TS-03 in particular) are coverage holes worth filling in a follow-up, not blockers.
