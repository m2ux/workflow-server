# Context Analysis

**Initiative:** Prism Audit Remediation — March 2026
**Analysis Date:** 2026-03-27

## Domain Context

The workflow-server is a TypeScript MCP server (~3,460 LOC across 36 source files) for AI agent workflow orchestration. It uses Zod for runtime validation and maintains parallel JSON Schema files for IDE/authoring tooling. Workflow data is authored in TOON format and loaded by a file-based loader system. The server exposes tools and resources via the MCP protocol.

A previous audit remediation (12 work packages, PRs #68–#79) addressed 140 findings. This new prism analysis ran a full 3-pass structural/adversarial/synthesis audit on the current codebase and identified 15 remaining findings.

## Work Packages Identified

| # | Package | Description | Theme |
|---|---------|-------------|-------|
| 1 | Schema Alignment | Reconcile 6 Zod/JSON Schema divergences including the HIGH-severity `sessionTokenEncrypted` omission | Schema consistency |
| 2 | Validation Enforcement | Add skill validation, fix activity loader fallthrough, wire orphaned schemas, update tests | Runtime validation |
| 3 | Behavioral & Infrastructure Fixes | Fix condition evaluation equality semantics, add `_meta` response schema, fix key race, test config | Correctness |

## Cross-Cutting Concerns

### Shared Dependencies

WP-02 depends on WP-01: tightening Zod validation in skill loading will strip fields not present in `SkillSchema`. The schema must include `ExecutionPatternSchema` (WP-01/WP-02 boundary) before validation is enforced. WP-03 is independent.

### Common Infrastructure

All three packages touch `src/schema/` (Zod schemas) and `schemas/` (JSON Schema files). WP-01 and WP-02 both modify `src/loaders/` and `tests/`. Coordinating changes to avoid merge conflicts requires WP-01 to land first.

### Ordering Constraints

| Constraint | Reason |
|------------|--------|
| WP-01 before WP-02 | Skill schema must include `ExecutionPatternSchema` before `tryLoadSkill` adds Zod validation, otherwise tests break |
| WP-03 independent | Condition evaluation, `_meta` schema, crypto, and test config are in isolated modules |

### Risk Factors

- **Self-concealing equilibrium**: The prism synthesis identified that fixing any single validation gap triggers cascading test failures. WP-01 prepares the schema, WP-02 breaks the equilibrium in controlled order.
- **Test coupling**: Several tests depend on validation bypass behavior. WP-02 must update these tests alongside the validation changes.

## External Context

- Prior remediation tracking issue: [#67](https://github.com/m2ux/workflow-server/issues/67) (complete)
- Prior PRs #68–#79 all merged
- No open issues or PRs related to these specific findings

## Recommendation

Execute in order: WP-01 → WP-02 → WP-03. WP-03 could run in parallel with WP-02 if separate branches are used, but sequential execution is simpler and the total effort is modest (~7-10 hours agentic). Each package produces its own branch and PR.
