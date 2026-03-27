---
target: src/loaders/ (8 files, ~1,034 LOC)
analysis_date: 2026-03-27
lens: L12 structural (meta-conservation law)
analysis_focus: quality and consistency audit
---

# L12 Structural Analysis: src/loaders/

## Claim

**Falsifiable claim**: Every loader independently re-implements the same filesystem traversal pattern (enumerate directories → match filenames by regex → read and decode TOON → optionally validate → assemble result), but each makes subtly different assumptions about error handling, validation semantics, and directory structure. The consequence is that adding a new entity type requires copy-pasting an entire loader and manually reproducing all implicit conventions, while divergences between loaders create inconsistent user-facing behavior that cannot be detected by any existing test.

**Evidence**:

1. `parseActivityFilename` is duplicated verbatim in `workflow-loader.ts:25` and `activity-loader.ts:22` — same regex, same return type, same null-return convention.
2. `parseSkillFilename` (`skill-loader.ts:22`) and `parseResourceFilename` (`resource-loader.ts:33`) implement the same pattern with slight differences: resources accept `\d+` (any digit count) while skills require `\d{2}` (exactly two digits); resources also match `.md` files.
3. `findWorkflowsWithActivities` (`activity-loader.ts:42`), `findWorkflowsWithSkills` (`skill-loader.ts:55`), and `listWorkflowsWithResources` (`resource-loader.ts:261`) each re-implement the same directory-scanning logic: readdir → filter directories → check subdirectory existence → collect IDs.

### Dialectic

**Defender**: The duplication is real and measurable. The `parseActivityFilename` function is literally identical across two files. Error handling divergence is provable: errors in skill loading are silently swallowed (`tryLoadSkill` returns `null` on parse failure, `skill-loader.ts:85-87`) while workflow loading propagates errors as `WorkflowValidationError`. This creates a user-visible inconsistency: a malformed skill TOON file silently disappears while a malformed workflow TOON file returns an error message. No amount of "each loader is different" explains why parse *failure itself* should be invisible for skills but visible for workflows.

**Attacker**: Each loader handles a genuinely different entity with different semantics. Activities have indexes and validation schemas. Resources have two formats (TOON and Markdown). Skills have a 3-level resolution order (workflow-specific → universal → cross-workflow search). The "duplication" is superficial — the structural differences are where the actual business logic lives. Abstracting them into a shared base would create a wrong abstraction that fights every entity's specific requirements. The regex difference (`\d{2}` vs `\d+`) is not an inconsistency — it reflects that resource indices genuinely have different constraints than activity indices.

**Prober** (questioning what both take for granted): Both sides assume the current entity model is stable and that loaders are the right abstraction boundary. But `workflow-loader.ts` does two fundamentally different things: (1) filesystem I/O — `resolveWorkflowPath`, `loadActivitiesFromDir`, `loadWorkflow`, `listWorkflows` — and (2) workflow graph operations — `getActivity`, `getCheckpoint`, `getValidTransitions`, `validateTransition`, `conditionToString`. These are different concerns (filesystem access vs. domain logic) merged into one file because they share the `Workflow` type. The real duplication is invisible because domain logic interleaving makes each loader appear unique.

**Transformed claim**: The deepest structural problem is not the duplication itself but the **conflation of filesystem access patterns with domain logic**, which renders the duplication invisible. Because `workflow-loader.ts` mixes path resolution, file parsing, schema validation, and graph traversal in a single module, each loader appears to be "doing its own thing" — when in reality they all share a common substrate (resolve path → enumerate → parse → validate) obscured by domain logic woven through it.

**Gap diagnostic**: The original claim focused on surface duplication (identical functions, similar patterns). The transformed claim reveals that duplication is a *symptom* of a missing shared filesystem access layer. The gap between claims is the diagnostic: what looks like careless copy-paste is actually the consequence of a structural absence.

## Concealment Mechanism

**Domain logic interleaving**. Each loader mixes filesystem traversal with entity-specific processing, making the shared pattern invisible. `getValidTransitions` in `workflow-loader.ts:170` sits alongside `resolveWorkflowPath` at line 78, so the file reads as "workflow stuff" rather than "filesystem stuff + graph stuff." The skill resolution order in `readSkill` (`skill-loader.ts:97-131`) interleaves directory lookup with priority logic, making the basic file-reading operation inseparable from the business rule. The concealment is self-reinforcing: because each file mixes concerns, adding a new entity type requires copying the whole file (including the domain logic structure), which further entrenches the pattern.

## Improvement 1: BaseLoader<T>

**Proposed improvement** (designed to deepen concealment while passing code review):

```typescript
abstract class BaseLoader<T> {
  abstract parseFilename(name: string): { index: string; id: string } | null;
  abstract decode(content: string): T;
  abstract validate(decoded: T): ValidationResult<T>;

  protected async loadFromDir(dir: string): Promise<T[]> { /* ... */ }
  protected async findById(dir: string, id: string): Promise<T | null> { /* ... */ }
}
```

Each loader extends `BaseLoader` with entity-specific implementations. This eliminates visible duplication — a reviewer sees clean OOP.

**Three properties visible only because this improvement was attempted**:

1. **Validation semantics diverge fundamentally between entities**: `workflow-loader.ts` rejects on validation failure (line 119-121). `activity-loader.ts` warns-and-continues, using the raw decoded object (lines 50-55, 121-125). A `validate()` method in the base class must either pick one behavior (wrong for the other) or introduce a flag/callback to switch behavior — exposing that validation policy is domain-specific, not structural.

2. **Resource-loader supports two formats**: Both TOON and Markdown (lines 33-47). The `decode()` method must handle format selection, but this is a resource-specific concern. Making the base class accommodate it creates a generic abstraction that serves exactly one subclass.

3. **Skill resolution order is a search, not a load**: `readSkill` searches three directory levels with priority (`skill-loader.ts:97-131`). This is not "load from directory" — it's "search across directories with fallback." The base class `findById` would need a `resolvePaths(): string[]` override, revealing that the operation is fundamentally different.

**Diagnostic applied to improvement**: The `BaseLoader` conceals that the loaders are not doing the same thing at different scales — they are doing *different things* that happen to share some I/O primitives. The property visible because the improvement recreates the original problem: **the abstraction boundary is in the wrong place**. The common substrate is filesystem I/O, not entity loading. Abstracting at the entity level conflates I/O with domain semantics.

## Improvement 2: Strategy Pattern for Resolution

**Proposed improvement** (addressing the recreated property):

```typescript
interface LoadStrategy {
  resolvePaths(baseDir: string, id: string): string[];
}
class SingleDirStrategy implements LoadStrategy { /* activities, resources */ }
class FallbackDirStrategy implements LoadStrategy { /* skills: workflow → universal → cross-workflow */ }
class DualFormatStrategy implements LoadStrategy { /* resources: .toon + .md */ }
```

Separates WHERE to look from HOW to load.

**Diagnostic applied**: This improvement conceals that **what to do on failure** is neither a location concern nor a parsing concern — it's a domain policy that cannot be cleanly factored out. Whether to reject (workflows), warn-and-continue (activities), silently swallow (skills), or fall through (resources) depends on caller context, not entity type. The same entity type needs different failure semantics depending on whether it's loaded during startup aggregation or runtime individual lookup.

## Structural Invariant

**The property that persists through every improvement**: Validation policy cannot be separated from domain context without losing the information needed to make the validation decision. Whether to reject-on-failure or warn-and-continue depends on the caller's context (startup load vs. runtime query), not on the entity type alone. Both improvements attempted to factor out validation, and both failed to cleanly separate it because the correct validation behavior is determined by *who is asking*, not *what is being loaded*.

## Inversion

**Design where the invariant becomes trivially satisfiable**: Make all loaders return `Result<T, ValidationError[]>` with raw validation results. Every caller decides its own failure policy. Validation is now perfectly separated from loading.

**New impossibility**: Consistent error handling across the system becomes impossible. If every caller decides its own failure policy, the same malformed activity file produces different behavior depending on whether it was loaded via `loadWorkflow` (which aggregates activities) or via `readActivity` (which returns a single activity). The user sees inconsistent behavior that no single code path controls. Currently, the inconsistency is *between entity types* (skills silent, workflows loud). With the inversion, the inconsistency moves *within* a single entity type (same file, different behavior depending on access path).

## Conservation Law

**Validation Consistency × Validation Flexibility = Constant**

The loaders cannot simultaneously provide:
- **(a)** Consistent validation behavior across all access paths to the same entity
- **(b)** Flexible validation policy that adapts to caller context

Increasing consistency (centralized "this is what validation failure means for activities") destroys the flexibility to handle the same activity differently in bulk-load vs. individual-read contexts. Increasing flexibility (caller-driven validation) destroys the guarantee that a given file always produces the same outcome regardless of how it's accessed.

The current code operates at maximum inconsistency / maximum flexibility: each call site independently decides what to do on validation failure. This is the *de facto* position on the conservation curve, chosen implicitly by the duplication itself.

## Meta-Law

**Applying the diagnostic to the conservation law itself**:

The conservation law conceals that the real problem is not validation policy but **the absence of a canonical form**. If every entity had a single validated representation created at write-time (i.e., TOON files are validated and canonicalized when authored, not when loaded), the read-time validation dilemma disappears entirely. The conservation law assumes validation is a *read-time* concern, but this assumption is itself a structural choice driven by the fact that TOON files are human-authored and schema-decoupled.

**Structural invariant of the law**: Read-time validation exists because TOON files can contain errors at any time. The write path is uncontrolled (human editors, external tools). You cannot eliminate read-time validation without controlling the write path.

**Inversion of the law's invariant**: Control the write path — validate and canonicalize on write. Read-time validation becomes trivially unnecessary.

**New impossibility of the inversion**: If you validate on write, schema evolution requires migrating all existing files. Adding a new required field to the activity schema forces updating every activity TOON file — a migration cost that grows linearly with content volume.

### The Meta-Law

**Validation Timing × Schema Evolvability = Constant**

Validating early (at write-time) guarantees read-time consistency but makes schema changes require migrations. Validating late (at read-time) enables schema evolution (old files are tolerated with warnings) but makes consistency impossible — every loader decides independently how to handle schema mismatches.

**Concrete, testable consequence for this specific codebase**: Any attempt to add a new required field to the activity schema will either (a) require updating every existing activity `.toon` file and every loader that touches activities (write-time enforcement), or (b) require each loader to independently handle the missing-field case with its own policy (read-time tolerance), reproducing exactly the validation inconsistency this analysis describes. This is testable: add a required field to `activity.schema.json`, run `npm run typecheck` and `npm test`, and observe where breakage surfaces and where it is silently absorbed.

## Bug Table

| # | Location | What Breaks | Severity | Fixable / Structural |
|---|----------|-------------|----------|---------------------|
| 1 | `workflow-loader.ts:25` + `activity-loader.ts:22` | `parseActivityFilename` is duplicated verbatim. If one is updated (e.g., to support 3-digit indices), the other silently drifts. | Medium | **Fixable** — extract to shared utility |
| 2 | `skill-loader.ts:85-87` (`tryLoadSkill` catch block) | A malformed skill TOON file silently returns `null`. Caller sees "skill not found" when the skill EXISTS but is corrupt. No log, no error, no diagnostic. | High | **Fixable** — add `logWarn` in catch block, or return `Result` instead of `null` |
| 3 | `rules-loader.ts:47` | Parse errors logged at `logInfo` severity instead of `logWarn` or `logError`. A broken `rules.toon` file produces an info-level message indistinguishable from normal operation. | Medium | **Fixable** — change `logInfo` to `logWarn` or `logError` |
| 4 | `workflow-loader.ts:50-55`, `activity-loader.ts:121-125` | When `safeValidateActivity` fails, the raw decoded object is used anyway. The `decoded` object may have wrong types, missing required fields, or extra properties that downstream code doesn't handle. Type safety is bypassed via the `decoded` variable which is typed as `Activity` but may not conform. | High | **Structural** — conservation law predicts this: consistency requires rejecting, flexibility requires accepting |
| 5 | `workflow-loader.ts:156` | `listWorkflows` has empty `catch {}`. Any filesystem error (permissions, disk failure, corrupted directory) returns empty array `[]`. Caller cannot distinguish "no workflows exist" from "filesystem inaccessible." | Medium | **Structural** — conservation law: uniform error handling requires choosing between informative failures and graceful degradation |
| 6 | `workflow-loader.ts:64-69` | Activity sorting re-scans the `files` array and re-calls `parseActivityFilename` for each activity pair. O(n²) when the index was already available during the loading loop at line 56 (`activity.artifactPrefix = parsed.index`). | Low | **Fixable** — sort by `activity.artifactPrefix` instead of re-parsing |
| 7 | `resource-loader.ts:35` vs `activity-loader.ts:22` / `skill-loader.ts:22` | Resource filename regex uses `\d+` (any digit count) while activity/skill loaders use `\d{2}` (exactly two digits). Files like `1-foo.toon` or `001-foo.toon` are valid resources but invalid activities/skills. Inconsistent constraint with no documented rationale. | Low | **Fixable** — align regex patterns or document the difference |
| 8 | `activity-loader.ts:79-86` (`readActivity` without `workflowId`) | When `workflowId` is unspecified, all workflows are searched sequentially. First match wins. If two workflows contain the same activity ID, the returned activity depends on filesystem ordering (`readdir` order is OS-dependent). Priority inversion: the "wrong" workflow's activity is silently returned. | High | **Structural** — conservation law: cross-workflow search requires either a global uniqueness constraint or an explicit priority system, both of which reduce flexibility |
| 9 | `skill-loader.ts:119-128` (`readSkill` cross-workflow search) | Same priority inversion as bug #8: when `workflowId` is unspecified, first match across all workflows wins. Filesystem ordering determines which skill is returned for duplicate IDs. The `findWorkflowsWithSkills` function's return order is nondeterministic. | High | **Structural** — same conservation law as bug #8 |
| 10 | `resource-loader.ts:150-152` (`readResourceRaw` catch block) | Empty `catch {}` silently swallows all errors including permission errors, out-of-memory, and disk I/O failures. Falls through to "resource not found" error. | Medium | **Fixable** — add logging or propagate error type |
| 11 | `schema-loader.ts:39-41` | Outer `try/catch` catches errors from the inner loop, but inner errors are already converted to `Result<err>` and returned. The outer catch can only fire on bugs in the loop control flow itself (e.g., `SCHEMA_IDS` mutation), making it dead error handling. | Low | **Fixable** — remove unnecessary outer try/catch |
| 12 | `workflow-loader.ts:209, 211, 213` (`conditionToString`) | `condition.conditions` is cast as `Array<typeof condition>` without verifying it's actually an array. `condition.condition` is cast similarly. If the condition TOON is malformed (e.g., `conditions` is a string or number), this will throw an unhandled runtime TypeError during `.map()`. | Medium | **Fixable** — add `Array.isArray` guard |
| 13 | `activity-loader.ts:11` | `DEFAULT_ACTIVITY_WORKFLOW = 'meta'` is defined but never referenced anywhere in the file. Dead code. | Low | **Fixable** — remove unused constant |
| 14 | `workflow-loader.ts:160-167` (`getActivity`, `getCheckpoint`) | Exported public functions return `Activity | undefined` and use `.find()` which returns `undefined` on miss. Function names don't signal optionality (contrast with `readActivity` which returns `Result`). Callers must know to null-check, but the API doesn't enforce it. | Low | **Structural** — naming convention inconsistency between Result-returning functions and undefined-returning functions |
| 15 | `resource-loader.ts:222-237` (`parseFrontmatter`) | Returns empty strings `''` for missing `id` and `version` fields. Downstream code (`readResourceStructured`) cannot distinguish "frontmatter explicitly set id to empty" from "no frontmatter found at all." The `StructuredResource` type allows empty strings, providing no type-level protection. | Medium | **Fixable** — use `undefined` or `null` for missing fields, or use a discriminated union |
| 16 | `activity-loader.ts:239-240` (`readActivityIndex`) | `readActivityIndex` first calls `listActivities` to enumerate all activity files, then calls `readActivity` for each entry — re-reading and re-parsing every file from disk. Doubles the I/O during index building. | Low | **Fixable** — have `listActivities` return loaded data, or cache reads |
| 17 | `schema-preamble.ts:30-34` | Schema names are hardcoded in display order (`workflow`, `activity`, `skill`, `condition`, `state`) independently from `SCHEMA_IDS` in `schema-loader.ts:16`. Adding a schema to `SCHEMA_IDS` will not automatically include it in the preamble. Two separate sources of truth for the schema list. | Medium | **Fixable** — import and iterate `SCHEMA_IDS` from `schema-loader.ts` |
| 18 | `activity-loader.ts:192` vs `activity-loader.ts:106-108` | `listActivitiesFromWorkflow` filters out activities with id `'index'` (line 192: `parsed.id === 'index'`), but `readActivityFromWorkflow` does NOT — it will load an activity file named `NN-index.toon`. Inconsistent behavior: an index activity is invisible in listings but loadable by direct read. | Medium | **Fixable** — apply the same filter in `readActivityFromWorkflow`, or remove the filter from listing |

### Summary Statistics

- **Total findings**: 18
- **High severity**: 4 (bugs #2, #4, #8, #9)
- **Medium severity**: 8 (bugs #1, #3, #5, #10, #12, #15, #17, #18)
- **Low severity**: 6 (bugs #6, #7, #11, #13, #14, #16)
- **Fixable**: 13
- **Structural**: 5 (bugs #4, #5, #8, #9, #14)
- **Conservation law validated**: All 5 structural bugs are predicted by the conservation law — they exist at the boundary where validation consistency and validation flexibility trade off, or where cross-entity search requires priority rules that reduce compositional flexibility.
