# workflow-server — Quality and Consistency Audit Report

**Project:** workflow-server (TypeScript MCP server for AI workflow orchestration)  
**Scope:** 36 source files (~3,460 LOC), 5 JSON schemas, 10 test files

---

## 1. Executive Summary

The codebase carries **15 fixable issues** (one **HIGH**, eight **MEDIUM**, six **LOW**). No structural blockers were identified.

The dominant pattern is a **validation equilibrium**: several gaps reinforce each other so that incomplete or divergent schemas rarely surface as hard failures during normal development. Addressing the recommended **P0** and **P1** items first (JSON Schema correctness for state saves, then skill validation and related schema/test alignment) breaks that equilibrium in a controlled order and avoids a long tail of surprise failures.

---

## 2. Core Finding

Validation gaps in this codebase reinforce one another in ways that limit how often they show up as obvious breakage:

1. **Skill loading has no Zod validation.** `tryLoadSkill()` returns decoded data with only a type assertion. Tests can read fields (for example `execution_pattern`) that are not part of the declared skill schema, so tests stay green while the schema stays incomplete.

2. **Activity loading falls back to raw data on Zod failure.** When validation fails, the loader still serves unvalidated data. The system keeps working, which reads as robustness rather than as a validation bypass.

3. **JSON Schema files are authoring/IDE artifacts, not runtime validators.** Drift between JSON Schema and Zod (or TypeScript) can grow without affecting runtime until an external validator or tool applies the JSON Schema.

Tightening validation in one place tends to expose the others; the **recommended fix order** below starts from the items that unblock correct validation and schema truth.

---

## 3. Findings by Severity

### HIGH (1)

| ID | Finding | Location | Fix |
|----|---------|----------|-----|
| **F-01** | `sessionTokenEncrypted` is missing from the JSON Schema `stateSaveFile` definition where `additionalProperties` is false. JSON Schema validators therefore reject all valid state save files that include this field. | `state.schema.json` (approx. lines 98–134) vs `state.schema.ts` (approx. line 162) | Add the property to JSON Schema `properties` and to `required` as appropriate. |

### MEDIUM (8)

| ID | Finding | Location | Fix |
|----|---------|----------|-----|
| **F-02** | `triggers` type mismatch: Zod accepts a single object; JSON Schema expects an array. | `activity.schema.ts` (approx. line 160); `activity.schema.json` (approx. lines 444–449) | Align Zod with array semantics (e.g. change Zod to an array). |
| **F-03** | `stateVersion` upper bound diverges: Zod has no maximum; JSON Schema caps at 1000. `addHistoryEvent` increments this per event, so long workflows can exceed the JSON Schema cap. | `state.schema.ts` (approx. line 87); `state.schema.json` (approx. line 149) | Remove the JSON Schema maximum (or align both sides on a documented rule). |
| **F-04** | Condition evaluation uses loose equality (`==`). JSON Schema documents strict equality (`===`). Effects include `0 == false → true`, `"1" == 1 → true`, `null == undefined → true`. | `condition.schema.ts` (approx. lines 64–65) | Replace `==` with `===`. |
| **F-05** | Skill validation is absent: `tryLoadSkill()` relies on a type assertion only. `safeValidateSkill` exists but is never invoked. | `skill-loader.ts` (approx. lines 77–78) | Call validation after load (or equivalent). |
| **F-06** | Activity validation fallthrough: `readActivityFromWorkflow()` catches Zod failures and continues with raw data. | `activity-loader.ts` (approx. lines 115–120) | On validation failure, return an error (same posture as `workflow-loader.ts` approx. lines 42–47). |
| **F-07** | Activity index fallthrough: `readActivityIndex()` repeats the same fallthrough pattern as F-06. | `activity-loader.ts` (approx. lines 244–245) | Skip or fail invalid activities instead of serving raw entries. |
| **F-08** | Tests depend on the skill validation bypass: `skill-loader.test.ts` reads `execution_pattern`, which is not on `SkillSchema`. Tests pass only because F-05 skips validation. | `skill-loader.test.ts` (approx. line 83) | Update tests and/or add the field to the schema (see F-09). |
| **F-09** | `ExecutionPatternSchema` is defined but not referenced by `SkillSchema`. Production TOON files use the field. | `skill.schema.ts` (approx. lines 24–32) | Wire the pattern into `SkillSchema`. |

### LOW (6)

| ID | Finding | Location | Fix |
|----|---------|----------|-----|
| **F-10** | `currentActivity` is unconditionally required in Zod but conditionally required in JSON Schema. | `state.schema.ts` (approx. line 91); `state.schema.json` (approx. lines 460–466) | Make Zod optional with a refinement matching the JSON Schema rule. |
| **F-11** | `stateVersion` mixes two meanings: described as a migration version but incremented as an event counter via `addHistoryEvent`. | — | Rename or change increment behavior so semantics match documentation. |
| **F-12** | `_meta` response shape is built ad hoc in tool handlers with no shared schema. | — | Introduce something like `MetaResponseSchema` and validate or type against it. |
| **F-13** | Stale comment in workflow schema: it states something is not in JSON Schema while JSON Schema includes and requires `activities`. | `workflow.schema.ts` (approx. lines 54–55) | Update the comment to match the JSON Schema. |
| **F-14** | Cross-process key race: two simultaneous process starts can derive different keys. | `crypto.ts` (approx. lines 24–42) | Use file locking (or another single-writer guarantee) around key materialization. |
| **F-15** | Test configuration omits `schemasDir`. | `mcp-server.test.ts` (approx. lines 20–24) | Add `schemasDir` to match runtime expectations. |

---

## 4. Recommended Fix Order

| Priority | Bugs | Rationale |
|----------|------|-----------|
| **P0** | F-01 | HIGH: JSON Schema rejects all valid state files that include `sessionTokenEncrypted`. |
| **P1** | F-05, F-08, F-09 | Skill validation is the keystone: turning it on forces test and schema alignment for `execution_pattern`. |
| **P2** | F-06, F-07, F-04 | Harden activity loading and condition evaluation behavior. |
| **P3** | F-02, F-03, F-10, F-11 | Reconcile Zod vs JSON Schema drift and naming/semantics for `stateVersion` / `currentActivity`. |
| **P4** | F-12, F-13, F-14, F-15 | Infrastructure and documentation/test hygiene. |

---

## 5. Traceability Appendix

**Source artifacts (this folder):**

- `structural-analysis.md` — original finding IDs Bug 1–14  
- `adversarial-analysis.md` — corrections and additional findings Bug 15–21  
- `synthesis.md` — reconciled set of 15 confirmed items (F-01–F-15)

**Mapping (report ID → synthesis / upstream references):**

| Report ID | Trace |
|-----------|--------|
| F-01 | Synthesis Bug 15; adversarial-analysis.md §3.1 |
| F-02 | Synthesis Bug 1; structural-analysis.md §15, Bug 1 |
| F-03 | Synthesis Bug 2/8; structural-analysis.md §15, Bug 5; adversarial §3.2 |
| F-04 | Synthesis Bug 6; structural-analysis.md §15, Bug 2 |
| F-05 | Synthesis Bug 5; structural-analysis.md §15, Bug 3 |
| F-06 | Synthesis Bug 4; structural-analysis.md §15, Bug 4 |
| F-07 | Synthesis Bug 17; adversarial-analysis.md §3.3 |
| F-08 | Synthesis Bug 19; adversarial-analysis.md §3.7 |
| F-09 | Synthesis orphan; synthesis.md §3 |
| F-10 | Synthesis Bug 3; structural-analysis.md §15, Bug 6 |
| F-11 | Synthesis Bug 8/16; structural-analysis.md §15, Bug 5; adversarial §3.2 |
| F-12 | Synthesis Bug 10; structural-analysis.md §15, Bug 10 |
| F-13 | Synthesis Bug 18; adversarial-analysis.md §3.4 |
| F-14 | Synthesis Bug 20; adversarial-analysis.md §3.5 |
| F-15 | Synthesis Bug 21; adversarial-analysis.md §3.4 |

---

*End of report.*
