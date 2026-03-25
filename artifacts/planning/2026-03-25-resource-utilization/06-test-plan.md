# Test Plan: Resource Utilization Fix

**Issue:** [#61](https://github.com/m2ux/workflow-server/issues/61)
**Date:** 2026-03-25

---

## Scope

Verify that the `get_skill` response restructuring works correctly and that all TOON file language changes are consistent.

---

## Test Cases

### TC-1: `get_skill` response structure (automated)

**What:** Verify `get_skill` returns `{ skill: {...}, resources: {...} }` instead of a flat skill object with `_resources`.

**Steps:**
1. Run existing test suite — `mcp-server.test.ts` (updated in Task 1)
2. Verify `response.skill.id` equals the requested skill ID
3. Verify `response.resources` is an object (when skill declares resources)
4. Verify resource keys match the skill's declared `resources` array indices
5. Verify resource values are non-empty strings (raw content)

**Expected:** All assertions pass with the new response shape.

**Source:** `tests/mcp-server.test.ts` — `describe('tool: get_skill')` and `describe('resources attached to skills')`

---

### TC-2: `get_skill` without resources (automated)

**What:** Verify `get_skill` for a skill with no `resources` array returns `{ skill: {...} }` without a `resources` key.

**Steps:**
1. Call `get_skill` for a skill that has no resources declared (e.g., `state-management`)
2. Parse the response
3. Verify `response.skill.id` is present
4. Verify `response.resources` is undefined or absent

**Expected:** Skills without resources do not include an empty `resources` object.

**Source:** `tests/mcp-server.test.ts` — new test case

---

### TC-3: `get_skills` response unchanged (automated)

**What:** Verify `get_skills` response structure is not affected by the changes.

**Steps:**
1. Run existing `get_skills` tests
2. Verify `response.skills` contains skill objects keyed by ID
3. Verify `response.resources` contains resource content keyed by index

**Expected:** All existing `get_skills` tests pass without modification.

**Source:** `tests/mcp-server.test.ts` — `describe('tool: get_skills')`

---

### TC-4: Resource content integrity (automated)

**What:** Verify resource content in `get_skill` response matches what `readResourceRaw` returns.

**Steps:**
1. Call `get_skill` for `create-issue` (which declares `resources: ["03", "04"]`)
2. Verify `response.resources["03"]` is a non-empty string
3. Verify `response.resources["04"]` is a non-empty string
4. Verify content starts with expected markers (TOON frontmatter `---` or markdown heading)

**Expected:** Resource content is faithfully passed through.

**Source:** `tests/mcp-server.test.ts` — enhanced test within `describe('resources attached to skills')`

---

### TC-5: TOON language consistency (manual verification)

**What:** Verify all "Load resource" instances are replaced with "Use attached resource" and no "Load resource" instances remain.

**Steps:**
1. Run: `grep -rn "Load resource" workflows/ --include="*.toon"`
2. Verify zero matches

**Expected:** No remaining "Load resource" instances in any TOON file.

---

### TC-6: `note_resources` removal (manual verification)

**What:** Verify all `note_resources` entries are removed from skill TOON files.

**Steps:**
1. Run: `grep -rn "note_resources" workflows/ --include="*.toon"`
2. Verify zero matches

**Expected:** No remaining `note_resources` entries.

---

### TC-7: Rules addition (manual verification)

**What:** Verify `rules.toon` contains the new `resource-handling` section.

**Steps:**
1. Read `workflows/meta/rules.toon`
2. Verify `resource-handling` section exists with 3 rules
3. Verify rules mention both `get_skill` and `get_skills` response fields

**Expected:** Section present with correct content.

---

### TC-8: Full test suite passes (automated)

**What:** Run the complete test suite to verify no regressions.

**Steps:**
1. Run `npm test`
2. Run `npm run typecheck`

**Expected:** All tests pass, no type errors.

---

## Test Execution

| TC | Type | Automation | Priority |
|----|------|-----------|----------|
| TC-1 | Unit | `npm test` | High |
| TC-2 | Unit | `npm test` | High |
| TC-3 | Unit | `npm test` (existing) | High |
| TC-4 | Unit | `npm test` | Medium |
| TC-5 | Verification | `grep` | High |
| TC-6 | Verification | `grep` | Medium |
| TC-7 | Verification | Manual read | Low |
| TC-8 | Integration | `npm test && npm run typecheck` | High |
