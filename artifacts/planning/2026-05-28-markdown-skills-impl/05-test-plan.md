# Test Plan: Markdown Skills Migration

**ADR:** _Pending_ — five ADRs forward-referenced in [01-design-philosophy.md §Architectural Decisions Worthy of ADRs](01-design-philosophy.md)
**Ticket:** [#125](https://github.com/m2ux/workflow-server/issues/125)
**PR:** [#126](https://github.com/m2ux/workflow-server/pull/126) (source-side) + _Pending_ (content-side)

---

## Overview

This test plan validates the markdown skills migration: a new markdown skill reader replacing the TOON reader in `src/loaders/skill-loader.ts`, a workflow-local → `meta` precedence resolver, a TOON-projection delivery pass, and a markdown-only resource loader. Behaviour preservation is the success criterion — every `get_skill` / `get_workflow` / `get_activity` / `get_resource` call must produce a wire-equivalent payload to the pre-migration baseline.

Key changes validated:

1. [`tryLoadMarkdownSkill`](../../../src/loaders/markdown-skill-loader.ts) - new markdown reader that parses `SKILL.md` (single-file or folder-with-op-children) into a `Skill` object.
2. [`tryReadMarkdownSkillRaw`](../../../src/loaders/markdown-skill-loader.ts) - raw variant that returns the projected TOON wire form for `get_skill` consumers.
3. [`projectSkillToToon`](../../../src/loaders/skill-loader.ts) - shared projection function (`Skill` → TOON string), consumed by both decoded and raw read paths.
4. [`readSkill`](../../../src/loaders/skill-loader.ts) precedence body - workflow-local first, then `workflows/meta/`; replaces the cross-workflow scan-all at `:155-165`.
5. [`readSkillRaw`](../../../src/loaders/skill-loader.ts) precedence body - same precedence change at `:200-209`.
6. [`readResourceStructured`](../../../src/loaders/resource-loader.ts) format precedence - flipped from TOON-wins (`:140-160`) to markdown-only.

The strategy is two layers:

- **Baseline parity** - the new loader produces output indistinguishable from the legacy TOON loader on identical input. Implemented as projection-identity tests that compare `projectSkillToToon(loadedSkill)` against captured TOON baselines from the legacy loader.
- **New semantics** - precedence resolution (workflow-local override of meta) and op-as-child-files assembly are exercised through dedicated fixture trees that don't exist in the production `workflows/` content.

---

## Planned Test Cases

| Test ID | Objective | Type |
|---------|-----------|------|
| PR126-TC-01 | Verify `readSkill('meta/agent-conduct', WORKFLOW_DIR)` loads the rules-only technique from the new markdown layout | Unit |
| PR126-TC-02 | Verify `readSkill('meta/workflow-engine', WORKFLOW_DIR)` loads a single-file technique with operations and rules | Unit |
| PR126-TC-03 | Verify `readSkill('cargo-operations', WORKFLOW_DIR, 'work-package')` materialises op-as-child-files into a single `Skill.operations` map keyed by op basename | Unit |
| PR126-TC-04 | Verify precedence falls back to `meta` when no workflow-local override exists | Unit |
| PR126-TC-05 | Verify precedence resolves to the workflow-local override when one exists, suppressing the `meta` version | Unit |
| PR126-TC-06 | Verify malformed op-child file (missing `## Procedure`) raises a loader error rather than silently dropping the operation | Unit |
| PR126-TC-07 | Verify `readSkill` returns `SkillNotFoundError` when neither workflow-local nor `meta` has the technique | Unit |
| PR126-TC-08 | Verify `projectSkillToToon` round-trips: `decodeToon(projectSkillToToon(skill))` equals `skill` | Unit |
| PR126-TC-09 | Verify `projectSkillToToon` produces output matching the captured legacy-TOON baseline for each migrated technique (modulo whitespace) | Unit |
| PR126-TC-10 | Verify `readResourceStructured` resolves a markdown resource after the format-precedence flip | Unit |
| PR126-TC-11 | Verify `readResourceStructured` returns `ResourceNotFoundError` for a TOON-only resource (post-migration state) | Unit |
| PR126-TC-12 | Verify `resolveOperations` produces the same bundle shape from markdown source as from the legacy TOON source, for a fixture covering ops + rules + auto-rule-append behaviour | Integration |
| PR126-TC-13 | Verify `get_workflow` preamble assembly returns the expected `primary-skill\n\nops-bundle\n\n---\n\n` shape from the new loader | Integration |
| PR126-TC-14 | Verify `get_activity` preamble assembly returns the expected `ops-bundle\n\n---\n\nsession_index: ...\n\n` shape from the new loader | Integration |
| PR126-TC-15 | Verify `parseActivityFilename` is no longer imported under a `parseSkillFilename` alias in `skill-loader.ts` (regression guard for the alias removal in B2) | Unit |
| PR126-TC-16 | Verify the existing test suite at `tests/skill-loader.test.ts:11-89` continues to pass against the post-migration `workflows/meta/techniques/` layout | Unit |

*Detailed steps, expected results, and source links will be added after implementation.*

---

## Test Case Details

### Detailed Cases

| <div style="width:120px">Test ID</div> | <div style="width:350px">Objective</div> | <div style="width:400px">Steps</div> | <div style="width:350px">Expected Result</div> | <div style="width:50px">Type</div> |
|---|---|---|---|---|
| PR126-TC-01 | Verify rules-only technique loads correctly | 1. Set `WORKFLOW_DIR` to the fixture tree containing `meta/techniques/agent-conduct/SKILL.md`  <br>2. Call `readSkill('meta/agent-conduct', WORKFLOW_DIR)`  <br>3. Inspect `result.value.rules` | `result.success === true`; `result.value.id === 'agent-conduct'`; `Object.keys(result.value.rules).length >= 21`; `result.value.operations` is undefined or empty (rules-only technique has no procedure) | Unit |
| PR126-TC-02 | Verify single-file technique with operations and rules | 1. Set `WORKFLOW_DIR` to a fixture with `meta/techniques/workflow-engine/SKILL.md`  <br>2. Call `readSkill('meta/workflow-engine', WORKFLOW_DIR)`  <br>3. Inspect `result.value.operations` and `result.value.rules` | `Object.keys(result.value.operations).length >= 6`; `Object.keys(result.value.rules).length >= 3`; per-operation `errors` defined for at least one op | Unit |
| PR126-TC-03 | Verify op-as-child-files assembly | 1. Set `WORKFLOW_DIR` to a fixture with `work-package/techniques/cargo-operations/{SKILL.md, check.md, test.md}`  <br>2. Call `readSkill('cargo-operations', WORKFLOW_DIR, 'work-package')`  <br>3. Inspect `result.value.operations['check']` and `result.value.operations['test']` | Both `check` and `test` are present in the operations map with their canonical fields (`procedure`, optional `inputs`, `output`, `errors`, `rules`); SKILL.md frontmatter feeds top-level skill fields | Unit |
| PR126-TC-04 | Verify precedence falls back to `meta` | 1. Fixture: `meta/techniques/agent-conduct/SKILL.md` exists; `work-package/techniques/agent-conduct/` does not  <br>2. Call `readSkill('agent-conduct', WORKFLOW_DIR, 'work-package')`  <br>3. Inspect `result.value.description` | `result.success === true`; the loaded technique matches the meta version's `description` | Unit |
| PR126-TC-05 | Verify workflow-local override suppresses meta | 1. Fixture: both `meta/techniques/agent-conduct/SKILL.md` and `work-package/techniques/agent-conduct/SKILL.md` exist with different `description`  <br>2. Call `readSkill('agent-conduct', WORKFLOW_DIR, 'work-package')`  <br>3. Inspect `result.value.description` | The loaded technique matches the work-package override's `description`, not the meta version's | Unit |
| PR126-TC-06 | Verify malformed op-child fails loudly | 1. Fixture: `cargo-operations/check.md` is missing `## Procedure`  <br>2. Call `readSkill('cargo-operations', WORKFLOW_DIR, 'work-package')` | `result.success === false`; `result.error.name` indicates a parse error mentioning the offending file and the missing canonical section | Unit |
| PR126-TC-07 | Verify SkillNotFoundError when neither layer has the technique | 1. Fixture: neither `meta/techniques/no-such-skill/` nor `work-package/techniques/no-such-skill/` exists  <br>2. Call `readSkill('no-such-skill', WORKFLOW_DIR, 'work-package')` | `result.success === false`; `result.error.code === 'SKILL_NOT_FOUND'` | Unit |
| PR126-TC-08 | Verify projection round-trip | 1. Load a fixture skill via `readSkill`  <br>2. Call `projectSkillToToon(result.value)`  <br>3. Decode the result with `decodeToon` using `SkillSchema`  <br>4. Compare to the original `result.value` | Decoded value deep-equals the original `Skill` | Unit |
| PR126-TC-09 | Verify projection matches legacy-TOON baseline | 1. For each migrated technique, capture the current TOON output via the legacy loader and store at `tests/fixtures/markdown-skills/baselines/<skill>.toon`  <br>2. Load the same technique through the new markdown loader  <br>3. Run `projectSkillToToon` and compare to the captured baseline | Strings match modulo whitespace (use a TOON-aware equality check: decode both sides and deep-equal the resulting objects) | Unit |
| PR126-TC-10 | Verify markdown resource loads after format flip | 1. Fixture: `meta/resources/001-foo.md` exists; no `.toon` sibling  <br>2. Call `readResourceStructured(WORKFLOW_DIR, 'meta', '001')`  <br>3. Inspect `result.value.content` | Returns the markdown body with frontmatter stripped; `id` and `version` populated from frontmatter | Unit |
| PR126-TC-11 | Verify TOON-only resource returns NotFound | 1. Fixture: `meta/resources/001-foo.toon` exists; no `.md` sibling  <br>2. Call `readResourceStructured(WORKFLOW_DIR, 'meta', '001')` | `result.success === false`; `result.error.name === 'ResourceNotFoundError'` (matches the post-migration state where TOON resources have been removed) | Unit |
| PR126-TC-12 | Verify resolveOperations bundle shape parity | 1. Capture the bundle from `formatOperationsBundle(resolveOperations(['meta/agent-conduct::file-sensitivity'], WORKFLOW_DIR_LEGACY))` against the pre-migration `workflows/`  <br>2. Run the same call against `WORKFLOW_DIR_NEW` (post-migration)  <br>3. Compare the bundles | Both bundles contain the same operations, the same auto-included rules (per `resolveOperations`'s auto-rule-append behaviour at `skill-loader.ts:339-352`), and the same not-found refs | Integration |
| PR126-TC-13 | Verify get_workflow preamble shape | 1. Start a session against the new workflows tree  <br>2. Call `get_workflow` for `work-package`  <br>3. Split the response on `\n\n---\n\n` | First segment contains the primary-skill projected TOON + the ops-bundle TOON; second segment is the workflow body | Integration |
| PR126-TC-14 | Verify get_activity preamble shape | 1. Start a session against the new workflows tree  <br>2. Advance to an activity  <br>3. Call `get_activity`  <br>4. Split on `\n\n---\n\n` | First segment is the ops-bundle TOON; second is `session_index: ...\n\n` + raw activity TOON | Integration |
| PR126-TC-15 | Verify parseActivityFilename alias removed | 1. Inspect `src/loaders/skill-loader.ts` source  <br>2. Search for `parseSkillFilename` or `parseActivityFilename as parseSkillFilename` | No matches found in the file (alias was removed per Task B2) | Unit |
| PR126-TC-16 | Verify existing tests pass against post-migration content | 1. Run `npm test -- tests/skill-loader.test.ts`  <br>2. Inspect the test cases at `:11-89` (existing meta/agent-conduct, meta/workflow-engine tests) | All pre-existing tests pass without modification — the new loader satisfies the same assertions against the new on-disk layout | Unit |

---

## Running Tests

```bash
# Run all loader tests
npm test -- tests/skill-loader.test.ts

# Run only the new markdown-loader-specific cases
npm test -- tests/skill-loader.test.ts --grep "PR126-TC"

# Run resource-loader tests (covers TC-10, TC-11)
npm test -- tests/resource-loader.test.ts

# Run integration tests covering get_workflow / get_activity preambles
npm test -- tests/workflow-loader.test.ts

# Run the full suite
npm test
```

---

## Baseline capture procedure (for TC-09)

Before any source-side change merges, capture the current TOON output of `get_skill` for every migrated technique. The captured baselines pin the projection-identity contract.

```bash
# From the source-side worktree, on origin/main (pre-migration baseline)
# 1. Build
npm run build

# 2. For each technique, capture get_skill output
mkdir -p tests/fixtures/markdown-skills/baselines

# 3. Capture procedure (illustrative — actual baseline script lives at
#    scripts/migrate-skills/capture-baselines.ts):
#    For each <workflow, technique> pair on the legacy `workflows` branch:
#      - call readSkillRaw(<id>, WORKFLOW_DIR, <workflow>)
#      - write the raw TOON string to tests/fixtures/markdown-skills/baselines/<workflow>__<technique>.toon
```

The capture script is part of `scripts/migrate-skills/` (Task A1 / B6) so the baselines are regeneratable.

---

## Coverage Matrix

| Concern | Test Cases |
|---|---|
| Markdown parsing (frontmatter + sections) | TC-01, TC-02 |
| Op-as-child-files assembly | TC-03, TC-06 |
| Precedence resolver (meta fallback) | TC-04 |
| Precedence resolver (workflow-local override) | TC-05 |
| Error paths (not found, malformed) | TC-06, TC-07 |
| Projection identity (round-trip) | TC-08 |
| Projection identity (baseline match) | TC-09 |
| Resource loader format flip | TC-10, TC-11 |
| Operations bundle parity | TC-12 |
| Tool-layer preamble shapes | TC-13, TC-14 |
| Code-hygiene regression guard | TC-15 |
| Backward compatibility | TC-16 |

Every change listed in [05-work-package-plan.md](05-work-package-plan.md)'s Phase B has at least one test case mapped to it:

| Task | Test Cases |
|---|---|
| B1 (markdown reader) | TC-01, TC-02, TC-03, TC-06, TC-07 |
| B2 (refactor tryLoadSkill, remove alias) | TC-01, TC-02, TC-15 |
| B3 (projection function) | TC-08, TC-09 |
| B4 (precedence resolver) | TC-04, TC-05, TC-07 |
| B5 (resource loader flip) | TC-10, TC-11 |
| B6 (commit migration script) | covered indirectly via baseline capture |
| B7 (fixtures + new tests) | all of the above |

---

## Notes

- TC-09 is the load-bearing case for behaviour preservation. If the projection diverges from the legacy TOON shape, every consumer of `get_skill` sees a different wire payload. The baselines are captured pre-implementation and treated as an immutable contract.
- TC-12 specifically exercises the auto-rule-append behaviour in `resolveOperations` (`src/loaders/skill-loader.ts:339-352`) — when any element from a skill is resolved, all of that skill's `rules` are appended. Bundle parity against the legacy loader confirms this is preserved.
- TC-16 is a parsimonious way to confirm the migration doesn't break the existing test suite: the tests at lines 11-89 were authored against the TOON loader and pass against the markdown loader without modification only if the markdown loader produces a `Skill` object identical in shape and content. It is the cheapest end-to-end backward-compatibility check.
- The fixture tree at `tests/fixtures/markdown-skills/` is the test-controlled environment for precedence and op-as-child-files cases. The existing pattern (the test file uses `WORKFLOW_DIR = resolve(import.meta.dirname, '../workflows')` against real content) is preserved for the baseline cases.
