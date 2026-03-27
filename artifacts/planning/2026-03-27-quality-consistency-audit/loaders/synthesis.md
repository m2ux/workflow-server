---
target: src/loaders/ (8 files, ~1,034 LOC)
synthesis_date: 2026-03-27
lens: L12 synthesis
prior_artifacts:
  - structural-analysis.md (ANALYSIS 1)
  - adversarial-analysis.md (ANALYSIS 2)
---

# L12 Synthesis: src/loaders/

Two independent analyses examined this module — a structural analysis proposing conservation laws and a contradiction analysis systematically challenging them. This synthesis reconciles both into definitive findings.

---

## REFINED CONSERVATION LAW

### Original (ANALYSIS 1)

"Validation Consistency × Validation Flexibility = Constant" — the loaders cannot simultaneously provide consistent validation behavior across all access paths AND flexible validation policy that adapts to caller context.

### Challenge (ANALYSIS 2)

The law is unfalsifiable as stated. A `LoadResult<T>` type with `status: 'valid' | 'invalid' | 'failed'` increases BOTH consistency (uniform result structure) and flexibility (caller decides policy), violating the conservation claim. All five "structural" bugs are reclassified as fixable.

### Verification Against Code

Both analyses make partially correct observations, but both conflate two distinct layers of inconsistency visible in the code:

**Layer 1 — Representational inconsistency** (how validation outcomes are reported):
- `workflow-loader.ts:118-121`: validation failure → `WorkflowValidationError` returned via `err()`
- `workflow-loader.ts:50-52`: activity validation failure in bulk load → `logWarn`, raw `decoded` used as-is
- `activity-loader.ts:120-125`: activity validation failure in individual read → `logWarn`, raw `decoded` used
- `skill-loader.ts:85-87`: all errors → `null`, no logging
- `resource-loader.ts:150-152`: all errors → empty catch, fall through to "not found"

This layer is purely an implementation deficiency. `LoadResult<T>` eliminates it entirely. ANALYSIS 2 is correct.

**Layer 2 — Behavioral inconsistency** (what happens when validation fails):
Even with `LoadResult<T>`, `loadActivitiesFromDir` (line 34) must decide: include invalid activities in the returned array (user sees potentially broken data in the workflow) or exclude them (user sees an incomplete workflow with unexplained missing activities). `readActivity` (line 68) faces a different decision: return the invalid data with error metadata (caller can use it) or reject entirely (caller sees "not found" when the file exists). These are genuinely different decisions driven by caller context, and no result type eliminates the need to make them.

### Refined Conservation Law

**Behavioral Uniformity × Context Sensitivity = Constant (at multi-path entity access boundaries)**

A system that serves the same entity through multiple access paths — bulk listing (`listWorkflows`), individual lookup (`readActivity`), cross-workflow search (`readSkill` without `workflowId`), index building (`readActivityIndex`) — cannot simultaneously guarantee that:

**(a)** A given entity always produces the same observable behavior regardless of which access path reaches it

**(b)** Each access path responds optimally to its caller's context (bulk loaders skip invalid entries; individual reads surface validation details; index builders aggregate tolerantly)

The original law was correct at the domain level but wrong at the implementation level. The current implementation's inconsistency is needlessly *implicit and silent* — which IS fixable. But even after fixing the implementation (unified result types, consistent logging, deterministic ordering), the behavioral divergence between access paths remains because it is inherent to serving the same entities through contexts with different failure requirements.

**Why the original was incomplete**: It classified implementation-level accidental inconsistencies (empty catches, silent null returns) as evidence of the law, inflating the structural count. Five bugs that are straightforwardly fixable were classified as "conservation law consequences."

**Why the correction holds**: Even with `LoadResult<T>`, the code at `workflow-loader.ts:106-110` must choose: embed invalid-but-decoded activities into `rawWorkflow['activities']` and let `safeValidateWorkflow` catch them (current behavior), or filter them out before workflow validation (different behavior, different user-visible outcome). No result type makes this choice for you.

---

## REFINED META-LAW

### Original (ANALYSIS 1)

"Validation Timing × Schema Evolvability = Constant" — validating early (write-time) guarantees read-time consistency but makes schema changes require migrations; validating late (read-time) enables schema evolution but makes consistency impossible.

### Challenge (ANALYSIS 2)

Standard practices solve this: backward-compatible schema evolution (optional fields with defaults), schema versioning, migration scripts. The analysis conflates "requires effort" with "impossible."

### Verification Against Code

The codebase validates at read-time using Zod schemas (`safeValidateActivity`, `safeValidateWorkflow`). When validation fails, the code uses `warn-and-continue` — the raw decoded object is used anyway (`workflow-loader.ts:52`, `activity-loader.ts:125`). This is a pragmatic tolerance of schema drift: old TOON files with missing optional fields still load.

ANALYSIS 2 is correct that backward-compatible evolution, versioning, and migration scripts are standard practices. But ANALYSIS 1 identifies a real (if overstated) tension: for **non-backward-compatible** schema changes (making an optional field required, removing a field, changing a field's type), the timing question is genuine.

### Refined Meta-Law

**Content Trust × Type Safety = Constant (at the external-data boundary)**

At the point where human-authored TOON files are loaded into TypeScript's type system, the code must decide how much to trust the content:

- **High trust (current position)**: `decoded` is cast to `Activity` and used regardless of validation outcome (`workflow-loader.ts:52`). Maximum tolerance for schema drift. Minimum type safety — the `Activity` type annotation is a lie when validation fails.
- **Low trust**: reject on validation failure. Maximum type safety. Minimum tolerance — any schema change that adds a required field breaks existing content.

The original meta-law mislabeled this as "Validation Timing" (read vs. write). The actual tension is not about *when* validation happens but about *how much the code trusts* the boundary between untyped TOON content and typed TypeScript representations. This tension exists at every external-data boundary and is managed (not eliminated) by standard practices like schema versioning and optional-with-defaults.

**Concrete, testable consequence**: Add a required field to `activity.schema.json`. Observe: `safeValidateActivity` will fail for every existing activity file missing the field. The current code at `activity-loader.ts:125` will use the raw `decoded` object, which lacks the field. Any downstream code accessing the new field gets `undefined` despite the `Activity` type claiming the field exists. This is the trust boundary violation — and it is neither "impossible to fix" (ANALYSIS 1) nor "routine engineering" (ANALYSIS 2). It requires choosing a trust level and making it explicit.

---

## STRUCTURAL vs FIXABLE — DEFINITIVE

Resolution methodology: Each bug is verified against the actual source code. Where ANALYSIS 1 and ANALYSIS 2 disagree, the code is the arbiter. Classification uses the refined conservation law: "structural" means the behavioral divergence is inherent to multi-path access and cannot be eliminated by any implementation change; "fixable" means a concrete code change resolves the issue.

| # | Location | What Breaks | Sev | A1 | A2 | **Definitive** | Resolution |
|---|----------|-------------|-----|----|----|----------------|------------|
| 1 | `workflow-loader.ts:25` + `activity-loader.ts:22` | `parseActivityFilename` duplicated verbatim; drift risk | Med | Fix | Fix | **Fixable** | Extract to shared `src/loaders/filename-utils.ts` |
| 2 | `skill-loader.ts:85-87` | Corrupt skill TOON silently returns `null`; caller sees "not found" for an existing-but-corrupt file | High | Fix | Fix | **Fixable** | Add `logWarn` in catch block and/or return typed error via Result |
| 3 | `rules-loader.ts:47` | Parse error logged at `logInfo` instead of `logWarn`/`logError` | Med | Fix | Fix | **Fixable** | Change `logInfo` to `logWarn` |
| 4 | `workflow-loader.ts:50-52`, `activity-loader.ts:120-125` | Raw decoded object used on validation failure; type annotation becomes a lie | High | Struct | Fix | **Fixable** | Use `LoadResult<T>` or filter invalid entries. Both analyses agree the current implementation is wrong; they disagree on WHY. The fix is to make the invalidity explicit, not to eliminate the decision. |
| 5 | `workflow-loader.ts:156` | Empty `catch {}` in `listWorkflows`; filesystem errors invisible | Med | Struct | Fix | **Fixable** | `logError` + return `[]`. Logging and graceful degradation are not mutually exclusive. ANALYSIS 1's false dichotomy is refuted by ANALYSIS 2. |
| 6 | `workflow-loader.ts:64-69` | Sort re-parses filenames inside comparator; O(n·m·log n) | Low | Fix | Fix | **Fixable** | Sort by `a.artifactPrefix.localeCompare(b.artifactPrefix)`. ANALYSIS 2 correctly notes actual complexity is worse than ANALYSIS 1 claimed. |
| 7 | `resource-loader.ts:35` vs `activity/skill` loaders | Regex `\d+` vs `\d{2}` inconsistency | Low | Fix | Fix | **Fixable** | Align regex patterns or document the intentional difference |
| 8 | `activity-loader.ts:79-86` | Cross-workflow activity search order is nondeterministic (readdir order) | High | Struct | Fix | **Fixable** | Sort workflow IDs before iterating. Deterministic ordering is achievable without constraining flexibility. ANALYSIS 1's claim of structural impossibility is wrong — a fourth option (sort) exists. |
| 9 | `skill-loader.ts:119-128` | Cross-workflow skill search order is nondeterministic | High | Struct | Fix | **Fixable** | Same fix as #8. Sort `findWorkflowsWithSkills()` return value. |
| 10 | `resource-loader.ts:150-152` | `readResourceRaw` empty catch swallows all errors | Med | Fix | Fix | **Fixable** | Add `logError` matching `readResource`'s catch block at line 109 |
| 11 | `schema-loader.ts:39-41` | Outer try/catch is dead error handling | Low | Fix | Fix | **Fixable** | Defensive but unreachable. Remove or document as safety net. Non-urgent. |
| 12 | `workflow-loader.ts:209, 211, 213` | `conditionToString` casts without `Array.isArray` guard | Med | Fix | Fix | **Fixable** | Add `Array.isArray` guard before `.map()` |
| 13 | `activity-loader.ts:11` | `DEFAULT_ACTIVITY_WORKFLOW = 'meta'` defined but unused | Low | Fix | Fix | **Fixable** | Remove dead code |
| 14 | `workflow-loader.ts:160-167` | `getActivity`/`getCheckpoint` return `undefined` on miss | Low | Struct | Not bug | **Not a bug** | ANALYSIS 2 is correct: TypeScript's `Activity \| undefined` return type enforces null-checks at compile time with `strictNullChecks`. Naming inconsistency (Result vs undefined) is a style preference, not a defect. |
| 15 | `resource-loader.ts:222-237` | `parseFrontmatter` returns `''` for missing id/version | Med | Fix | Fix | **Fixable** | Return `undefined` for missing fields or use discriminated union |
| 16 | `activity-loader.ts:239-240` | `readActivityIndex` repeats readdir calls | Low | Fix | Fix | **Fixable** | Impact is overstated by ANALYSIS 1 (only directory listings doubled, not file I/O). Fix: pass loaded data through or cache. |
| 17 | `schema-preamble.ts:30-34` | Schema list hardcoded separately from `SCHEMA_IDS`; ordering differs (skill/condition swapped) | Med | Fix | Fix | **Fixable** | Import and iterate `SCHEMA_IDS` from `schema-loader.ts` |
| 18 | `activity-loader.ts:192` vs `106-108` | `index` activities filtered from listing but loadable by direct read | Med | Fix | Fix | **Fixable** | Apply consistent `index` filter in `readActivityFromWorkflow` |
| 19 | `skill-loader.ts:242-254, 266-281` | `readSkillIndex` double-readdir (same pattern as #16) | Low | — | Fix | **Fixable** | Missed by ANALYSIS 1. Same class as Bug #16. |
| 20 | `resource-loader.ts:91-107` | Dual-format resource (`.toon` + `.md`) priority is nondeterministic | Med | — | Fix | **Fixable** | Missed by ANALYSIS 1. Sort files before matching or establish TOON-over-MD priority. |
| 21 | `activity-loader.ts:149-151` | Catch-all converts ALL errors to `ActivityNotFoundError` | High | — | Fix | **Fixable** | Missed by ANALYSIS 1. Same defect class as Bug #2 — silently converts parse/IO errors into "not found." |
| 22 | `workflow-loader.ts:131-157` | `listWorkflows` fully loads every workflow (all activities + validation) for 4 manifest fields | High | — | Fix | **Fixable** | Missed by ANALYSIS 1. Most severe performance issue in the module. Decode only `workflow.toon`, extract manifest fields, skip activity loading. |
| 23 | `activity-loader.ts:49-54` vs `skill-loader.ts:63` | `findWorkflowsWithActivities` includes meta; `findWorkflowsWithSkills` excludes it | Med | — | Fix | **Fixable** | Missed by ANALYSIS 1. Align meta-workflow filtering policy across loaders. |
| 24 | `resource-loader.ts:108-110` vs `150-152` | `readResource` logs errors; `readResourceRaw` silently swallows them — same file, contradictory policy | Med | — | Fix | **Fixable** | Missed by ANALYSIS 1. Intra-file inconsistency directly refutes ANALYSIS 1's implicit claim that each loader is internally consistent. |
| 25 | `workflow-loader.ts:48-55, 108, 118` | Invalid activity objects embedded into workflow, passed to `safeValidateWorkflow`; potential validation bypass | High | — | Fix | **Fixable** | Missed by ANALYSIS 1. Filter activities that fail validation before embedding into workflow, or re-validate post-merge. |
| 26 | `skill-loader.ts:97-131` | Providing `workflowId` searches fewer locations than omitting it | Low | — | Fix | **Debatable** | Classified by ANALYSIS 2 as a bug. On re-examination: this may be intentional scope restriction. When a caller specifies `workflowId`, they're requesting context-scoped resolution (this workflow + universal). Omitting `workflowId` triggers a broader search. The "more info = fewer results" framing is misleading. Reclassified as **design decision**, not bug. Document the intent. |
| 27 | `resource-loader.ts:86, 95-96` | Index normalization with `padStart(2, '0')` breaks for 3+ digit file indices | Low | — | Fix | **Fixable** | Querying `"1"` for file `001-guide.toon` fails normalized match (`"01" !== "001"`). Use numeric comparison or normalize to max observed width. |
| 28 | `schema-loader.ts:16` vs `schema-preamble.ts:30-34` | Schema ordering differs (skill/condition swapped) | Low | — | Fix | **Fixable** | Subsumed by Bug #17 fix |

### Definitive Summary Statistics

- **Total distinct findings**: 27 (Bug #28 subsumed by #17; Bug #14 is not a bug)
- **High severity**: 7 (#2, #4, #8, #9, #21, #22, #25)
- **Medium severity**: 10 (#1, #3, #5, #10, #12, #15, #17, #18, #20, #23, #24)
- **Low severity**: 8 (#6, #7, #11, #13, #16, #19, #26, #27)
- **Not a bug**: 1 (#14)
- **Design decision**: 1 (#26)
- **Fixable**: 25
- **Structural**: 0

### Verdict

ANALYSIS 2 is correct that all bugs classified as "structural" by ANALYSIS 1 are fixable. However, ANALYSIS 2 overstates its case by implying the conservation law is *entirely* an implementation artifact. The refined conservation law identifies a real domain-level tension that survives implementation fixes — but none of the 27 concrete bugs in this module are instances of that tension. Every bug found is a straightforward implementation deficiency with a concrete fix.

---

## DEEPEST FINDING

### What neither analysis alone could find

ANALYSIS 1 identifies a conservation law and classifies bugs against it, treating behavioral inconsistencies as evidence of a fundamental trade-off. ANALYSIS 2 defeats the classification, showing every bug is fixable, but treats the conservation law itself as purely an overclaim.

The property visible only from having both analyses:

**The accidental inconsistency hides the essential inconsistency, making the design unknowable.**

The loaders contain two kinds of inconsistency that are currently indistinguishable in the code:

1. **Accidental inconsistency** — bugs introduced by copy-paste, missing abstractions, and inattention: empty `catch {}` blocks (#5, #10, #24), silent null returns (#2, #21), nondeterministic ordering (#8, #9, #20), duplicate code (#1, #19), dead code (#13), wrong log severity (#3). These are fixable and should be fixed.

2. **Essential inconsistency** — cases where the same entity genuinely requires different treatment in different contexts: `loadActivitiesFromDir` must choose whether to include or exclude invalid activities in the workflow; `listWorkflows` must choose how much to load for a manifest entry; `readSkill` must choose whether a scoped search should fall back to global. These are design decisions that cannot be "fixed" — they can only be made explicit and intentional.

In the current codebase, it is **impossible to tell which behavioral differences are intentional and which are bugs**. Consider `findWorkflowsWithActivities` including meta-workflow (#23) vs. `findWorkflowsWithSkills` excluding it. Is this:
- A bug (someone forgot to add the filter)? 
- An intentional design choice (activities in meta should be discoverable; skills in meta are "universal" and searched separately)?

The code provides no answer. No comments, no documentation, no test asserting the expected behavior. Both analyses make assumptions: ANALYSIS 1 assumes all behavioral differences reflect the conservation law; ANALYSIS 2 assumes all are fixable bugs. Neither has evidence to distinguish the two cases.

**This is the deepest finding**: The 25 fixable bugs are not just individually harmful — collectively, they make it impossible to reason about whether the remaining behavioral variations are bugs or intentional design. Fixing the accidental inconsistencies is a prerequisite for even *understanding* which design tensions are real and which are imaginary. The conservation law cannot be properly evaluated until the noise floor of accidental bugs is eliminated.

**Concrete, testable prediction**: Fix all 25 fixable bugs (unified result types, consistent logging, deterministic ordering, shared utilities). After the cleanup, re-examine the behavioral differences that remain. The surviving differences — how `loadActivitiesFromDir` handles validation failures, whether cross-workflow search should exist at all, whether meta-workflow should be included or excluded from enumeration — will be the genuine design decisions that the module's architecture must address. These will be few (estimated 2-4), clearly visible, and amenable to intentional design rather than accidental emergence.

---

## RECONCILED HIGH-PRIORITY FIX SEQUENCE

Based on the synthesis, the recommended fix order (by impact and dependency):

1. **Error transparency** (#2, #5, #10, #21, #24): Replace all silent error swallowing with logging + structured results. Prerequisite for understanding all other issues.
2. **Validation integrity** (#4, #25): Stop using raw decoded objects when validation fails. Either reject or surface validation status explicitly.
3. **Deterministic ordering** (#8, #9, #20): Sort workflow IDs and establish format priority. Eliminates nondeterministic behavior.
4. **Shared utilities** (#1, #17/28): Extract `parseActivityFilename` and schema ID list to shared locations. Eliminates drift risk.
5. **Performance** (#6, #22): Fix the `listWorkflows` full-load issue (#22 first — it's the most impactful) and the sort re-parse (#6).
6. **Consistency alignment** (#3, #18, #23): Align log severity, index filtering, and meta-workflow filtering policies.
7. **Cleanup** (#7, #11, #13, #15, #16, #19, #27): Low-severity issues that reduce cognitive load.
