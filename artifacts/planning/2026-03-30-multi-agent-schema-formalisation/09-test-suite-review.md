# Test Suite Review — Multi-Agent Schema Formalisation

**Activity:** post-impl-review (v1.7.0)  
**Date:** 2026-03-30

---

## 1. Test Coverage Summary

| Requirement | Test Cases | Coverage |
|-------------|-----------|----------|
| FR-01: ExecutionModel field required | W2 (reject without), V1-V3 (valid with) | ✅ |
| FR-02: AgentRole schema | I3 (missing id), I4 (missing desc), I5 (extra props) | ✅ |
| FR-03: Unique role IDs | U1 (unique pass), U2 (duplicate fail) | ✅ |
| FR-04: Non-empty roles | I2 (empty array fails) | ✅ |
| FR-05: JSON Schema sync | Manual verification in code review | ✅ |
| FR-06: TOON migration | Integration tests (existing workflow-loader, schema-validation load work-package) | ✅ |
| FR-07: Summary inclusion | S1 (executionModel + roles defined in summary) | ✅ |
| NFR-07: Strict schema | I5 (role extra props), I6 (model extra props) | ✅ |

**All 7 functional and 1 non-functional requirement have test coverage.**

## 2. Test Breakdown

| Suite | Test Cases | New | Updated |
|-------|-----------|-----|---------|
| ExecutionModelSchema valid | 3 (V1-V3) | 3 | 0 |
| ExecutionModelSchema invalid | 6 (I1-I6) | 6 | 0 |
| ExecutionModel unique IDs | 2 (U1-U2) | 2 | 0 |
| WorkflowSchema (existing) | 5 | 1 (W2) | 4 (added executionModel) |
| MCP summary | 1 (S1) | 0 | 1 (added assertions) |
| makeWorkflow helper | — | 0 | 1 (added default) |
| **Total** | **17** | **12 new** | **6 updated** |

## 3. Quality Assessment

### Strengths

- **Good positive/negative ratio**: 5 positive tests, 9 negative tests, 2 boundary tests. Negative tests outnumber positive — appropriate for schema validation.
- **Shared fixtures**: `minimalActivity` and `minimalExecutionModel` reduce duplication and make tests readable.
- **Strict mode tested explicitly**: Two dedicated tests verify that unknown properties are rejected.
- **Cross-field validation tested at correct level**: Unique ID tests use `safeValidateWorkflow` (not `ExecutionModelSchema.safeParse`), which exercises the `.refine()` at the workflow level where it's defined.
- **Integration coverage**: The existing `mcp-server.test.ts` summary test and `workflow-loader.test.ts` integration test automatically exercise the TOON migration (loading real workflow files with executionModel).

### Observations

**O-01: Empty string IDs not tested**  
`{ id: '', description: 'x' }` passes validation. This is consistent with the codebase (no other schema validates against empty strings) but could be added as an edge case test if the team wants to prevent empty role IDs in the future.  
**Severity:** Informational — not a coverage gap, just an untested boundary.

**O-02: Single-element unique ID test is implicit**  
The unique ID validation is only tested with 2 roles (unique pass) and 2 duplicate roles (fail). A single-role workflow trivially passes uniqueness. This is covered implicitly by V1 and the makeWorkflow helper but could be made explicit.  
**Severity:** Informational — edge case is covered implicitly.

**O-03: No test for refinement error message**  
The duplicate ID test verifies `result.success === false` but doesn't check the error message text ("executionModel.roles must have unique IDs"). This is standard practice for schema tests in this codebase — no existing tests verify error messages.  
**Severity:** Informational — consistent with existing patterns.

## 4. Anti-Pattern Check

| Anti-Pattern | Present? | Notes |
|-------------|----------|-------|
| Tests coupled to mutable data | No | Fixtures are inline, not loaded from disk (except integration tests) |
| Over-mocking | No | No mocking at all — schema tests use direct parsing |
| Fragile assertions | No | Tests check `success` boolean, not internal error structures |
| Missing teardown | N/A | Schema tests are stateless |
| Test interdependencies | No | Each test creates its own input data |

## 5. Recommendation

**Test suite is ADEQUATE.** Coverage is comprehensive for the scope of change. The three observations are informational — consistent with existing codebase patterns and not regressions.
