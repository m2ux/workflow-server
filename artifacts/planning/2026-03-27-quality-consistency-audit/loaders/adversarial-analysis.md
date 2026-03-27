---
target: src/loaders/ (8 files, ~1,034 LOC)
analysis_date: 2026-03-27
lens: L12 adversarial
prior_artifact: structural-analysis.md (ANALYSIS 1)
graph_verification: skipped (repo not indexed in GitNexus)
---

# L12 Adversarial Analysis: src/loaders/

The structural analysis proposes a conservation law ("Validation Consistency × Validation Flexibility = Constant"), a meta-law ("Validation Timing × Schema Evolvability = Constant"), and classifies 5 of 18 bugs as structural/unfixable. This adversarial pass systematically breaks those claims.

---

## WRONG PREDICTIONS

### WP-1: Bug #6 complexity is wrong

**Claim**: "O(n²) when the index was already available during the loading loop" (`workflow-loader.ts:64-69`).

**What actually happens**: `Array.sort()` performs O(n log n) comparisons. Each comparison calls `files.find()` twice, each O(m) where m = number of files. Actual complexity: **O(n · m · log n)**, not O(n²). For the typical case where every file produces an activity (n ≈ m), this is O(n² log n), which is actually *worse* than the analysis claims. The analysis understated the problem while getting the complexity class wrong.

**Line range**: `workflow-loader.ts:64-69`
```typescript
return activities.sort((a, b) => {
  const aIndex = files.find(f => parseActivityFilename(f)?.id === a.id);
  const bIndex = files.find(f => parseActivityFilename(f)?.id === b.id);
  return (aIndex ?? '').localeCompare(bIndex ?? '');
});
```

The sort compares raw filenames (`aIndex` is a filename string like `"01-foo.toon"`, not a parsed index), which accidentally works because filenames begin with the index. But the analysis correctly identifies that `activity.artifactPrefix` (set at line 56) already holds the index. The fix is even simpler than the analysis suggests: sort by `a.artifactPrefix.localeCompare(b.artifactPrefix)`.

---

### WP-2: Bug #14 — TypeScript enforces the undefined check

**Claim**: "Function names don't signal optionality… Callers must know to null-check, but the API doesn't enforce it" (`workflow-loader.ts:160-167`).

**What actually happens**: `getActivity` has an explicit return type annotation `Activity | undefined` (line 160). TypeScript's type system *does* enforce the null-check at compile time. Any caller that uses the result without narrowing will get a type error with `strictNullChecks` (which this project uses — `tsconfig.json`). The analysis's claim that "the API doesn't enforce it" is **false for TypeScript**. The only issue is the naming convention inconsistency between Result-returning and undefined-returning functions, which is a style concern, not a correctness bug.

**Line range**: `workflow-loader.ts:160-162`
```typescript
export function getActivity(workflow: Workflow, activityId: string): Activity | undefined {
  return workflow.activities.find(a => a.id === activityId);
}
```

---

### WP-3: Bug #16 — "Doubles the I/O" is overstated

**Claim**: "`readActivityIndex` first calls `listActivities` to enumerate all activity files, then calls `readActivity` for each entry — re-reading and re-parsing every file from disk. Doubles the I/O during index building."

**What actually happens**: `listActivities` → `listActivitiesFromWorkflow` performs `readdir` (directory listing) and `parseActivityFilename` (regex on filenames) but **never reads file contents**. Then `readActivity` → `readActivityFromWorkflow` performs `readdir` AGAIN (duplicate directory listing) and THEN reads + parses the file content. The directory listing is doubled, but file content I/O happens exactly once. On modern filesystems, directory listings are cached at the OS VFS layer, making the actual performance cost near-zero.

The analysis converts "redundant readdir" into "doubles the I/O," which is a significant overstatement.

**Line range**: `activity-loader.ts:188` (listActivitiesFromWorkflow readdir), `activity-loader.ts:105` (readActivityFromWorkflow second readdir)

---

### WP-4: Conservation law "predicts" Bug #5, but the prediction is a false dichotomy

**Claim**: Bug #5 (`workflow-loader.ts:156`, empty `catch {}` in `listWorkflows`) is classified as **structural** because "conservation law: uniform error handling requires choosing between informative failures and graceful degradation."

**What actually happens**: This is a false dichotomy. You can both log the error AND return an empty array:

```typescript
} catch (e) {
  logError('Failed to list workflows', e instanceof Error ? e : undefined, { workflowDir });
  return [];
}
```

This provides informative failure (logged error with context) AND graceful degradation (empty array). No trade-off is required. The conservation law predicts a constraint that does not exist. This is a straightforward fixable bug, not a structural impossibility.

**Line range**: `workflow-loader.ts:156`

---

## OVERCLAIMS

### OC-1: "Conservation Law" is unfalsifiable as stated

**Claim**: "Validation Consistency × Validation Flexibility = Constant" — all 5 structural bugs are predicted by this law.

**Why it's an overclaim**: The law is stated so broadly that any engineering trade-off can be cast as evidence for it. The "product equals constant" formulation implies a precise mathematical relationship, but no units, metrics, or measurement procedure are defined. You cannot measure "validation consistency" or "validation flexibility" independently, which makes the product-equals-constant claim unfalsifiable. An unfalsifiable "law" is not a finding — it's a tautology dressed as physics.

**Alternative design that violates the "law"**: Use a structured `LoadResult<T>` type:

```typescript
type LoadResult<T> =
  | { status: 'valid'; data: T }
  | { status: 'invalid'; data: T; errors: ValidationError[] }
  | { status: 'failed'; error: Error }
```

Every loader returns the same result structure (consistency: every validation failure is surfaced identically). Every caller decides what to do with `invalid` results (flexibility: bulk loaders can skip, individual reads can warn, strict callers can reject). This increases BOTH consistency and flexibility simultaneously. The "conservation law" is not conserved — it is an artifact of the current implementation lacking a unified result type, not a property of the problem space.

---

### OC-2: Bugs #8 and #9 are fixable, not structural

**Claim**: Bugs #8 (`activity-loader.ts:79-86`) and #9 (`skill-loader.ts:119-128`) are classified as **structural** because "cross-workflow search requires either a global uniqueness constraint or an explicit priority system, both of which reduce flexibility."

**The fix**: Sort the workflow IDs before iterating.

```typescript
const workflowIds = (await findWorkflowsWithActivities(workflowDir)).sort();
```

One line. Deterministic order. No global uniqueness constraint. No explicit priority system. No flexibility lost. The analysis presents three options (nondeterministic, uniqueness constraint, priority system) and declares all three structural. But deterministic-by-sorting is a fourth option the analysis didn't consider. The current nondeterminism is a bug caused by not sorting, not a conservation law consequence.

**Line range**: `activity-loader.ts:79` and `skill-loader.ts:120`

---

### OC-3: Bug #4 is fixable, not structural

**Claim**: Bug #4 (using raw decoded object on validation failure, `workflow-loader.ts:50-55` / `activity-loader.ts:121-125`) is classified as **structural** because "consistency requires rejecting, flexibility requires accepting."

**The fix**: The conservation law presents a false binary. The real fix is at the interface level: make the caller aware of the validation status so it can decide:

- `loadActivitiesFromDir` (bulk loader): Skip invalid activities, log a warning. Consistent: invalid = not loaded.
- `readActivity` (individual read): Return validation errors in the Result. Flexible: caller sees what happened and decides.

This is not "choosing between consistency and flexibility" — it is giving each call site the information it needs. The structural analysis's classification of this as structural rests entirely on the false dichotomy in its conservation law.

**Line range**: `workflow-loader.ts:48-55`, `activity-loader.ts:120-125`

---

### OC-4: Bug #14 severity and classification are wrong

The analysis classifies Bug #14 as **structural** ("naming convention inconsistency between Result-returning functions and undefined-returning functions") at **Low** severity. But as established in WP-2, TypeScript enforces the undefined check via the type system. This is not a bug at all — it's a code style preference. Reclassifying a non-bug as "structural" inflates the structural count and strengthens the conservation law claim artificially.

---

### OC-5: Meta-law presents a solved problem as unsolvable

**Claim**: "Validation Timing × Schema Evolvability = Constant" — validating early makes schema changes require migrations; validating late makes consistency impossible.

**Why it's an overclaim**: This ignores standard practices used throughout the industry:

1. **Backward-compatible schema evolution**: Add new fields as optional with defaults. JSON Schema's `additionalProperties: true` (which these schemas likely use for extensibility) enables this by design.
2. **Schema versioning**: Each TOON file includes a `version` field. Loaders can branch behavior by version.
3. **Codemods/migration scripts**: Adding a required field + running a migration script is routine engineering. The analysis treats migration as an impossibility ("grows linearly with content volume"), but linear-cost migration is a well-understood, automatable operation. The `.engineering/scripts/` directory in this very repo already has scripts for exactly this kind of operation.

The meta-law conflates "requires effort" with "impossible." Schema evolvability and validation timing are managed simultaneously by every database system, API framework, and configuration system in production use. This is not a conservation law — it is a description of work that needs to be done.

---

## UNDERCLAIMS

### UC-1: `readSkillIndex` has the same double-readdir bug as Bug #16

`readSkillIndex` (skill-loader.ts:237-306) calls `listUniversalSkills` (line 242), which does `readdir` + `parseSkillFilename`. Then for each entry, it calls `readSkill(entry.id, workflowDir)` (line 244), which calls `tryLoadSkill` → `findSkillFile`, which does ANOTHER `readdir` + `parseSkillFilename` on the same directory. Same wasteful pattern the analysis caught for activities (Bug #16) but completely missed for skills.

Similarly, the workflow-specific skill path (lines 260-287) calls `listWorkflowSkills` (readdir) then `readSkill` (readdir again).

**Line range**: `skill-loader.ts:242-254` (universal), `skill-loader.ts:266-281` (workflow-specific)

---

### UC-2: `readResource` has format-priority nondeterminism

`readResource` (resource-loader.ts:91-107) iterates `files` from `readdir` and returns on the FIRST match by index. If a directory contains both `01-guide.toon` and `01-guide.md`, whichever `readdir` returns first wins. There is no priority between TOON and Markdown formats. The analysis discusses dual-format support conceptually (Improvement 1, point 2) but never flags this as a concrete bug.

**Line range**: `resource-loader.ts:91-107`

---

### UC-3: `readActivity` outer catch converts all errors to "not found"

`readActivityFromWorkflow` (activity-loader.ts:92-151) has a catch-all at line 149 that converts ANY error — including `decodeToon` parse failures, file permission errors, and out-of-memory — into `ActivityNotFoundError`. If an activity file EXISTS but contains corrupt TOON, the caller sees "activity not found" when the activity IS found but unreadable. This is the same class of bug as Bug #2 (skill silently returns null), but the analysis missed it for activities.

**Line range**: `activity-loader.ts:149-151`
```typescript
} catch {
  return err(new ActivityNotFoundError(activityId));
}
```

---

### UC-4: `listWorkflows` fully loads every workflow just for manifest data

`listWorkflows` (workflow-loader.ts:131-157) calls `loadWorkflow` for every discovered workflow. `loadWorkflow` reads the file, decodes TOON, loads ALL activity files from disk, validates the complete workflow with schema validation — all to extract four fields: `id`, `title`, `version`, `description`. For a directory with 10 workflows each having 20 activities, this reads and parses 210 files (10 workflow + 200 activity files) just for a listing operation.

This is a far more severe performance issue than Bug #16 (redundant readdir), yet the analysis missed it entirely.

**Line range**: `workflow-loader.ts:131-157`, especially lines 143 and 149 where `loadWorkflow` is called

---

### UC-5: `findWorkflowsWithActivities` does NOT filter `META_WORKFLOW_ID`, unlike `findWorkflowsWithSkills`

`findWorkflowsWithSkills` (skill-loader.ts:63) explicitly excludes `META_WORKFLOW_ID`:
```typescript
if (entry.isDirectory() && entry.name !== META_WORKFLOW_ID) {
```

But `findWorkflowsWithActivities` (activity-loader.ts:49-54) does NOT:
```typescript
if (entry.isDirectory()) {
```

Consequence: When `readActivity` is called without a `workflowId`, the meta workflow is included in the cross-workflow search. When `readSkill` is called without a `workflowId`, meta is excluded from the cross-workflow search (it's searched separately as "universal"). This creates an asymmetry:

- **Skills**: universal search (meta) → cross-workflow search (non-meta) — meta is searched exactly once
- **Activities**: cross-workflow search (all workflows including meta) — meta activities appear alongside all others with no priority

The analysis describes the resolution order for skills (Bug #9) but never notices this meta-workflow inclusion asymmetry between loaders.

**Line range**: `activity-loader.ts:49-54` vs `skill-loader.ts:63`

---

### UC-6: `readResource` and `readResourceRaw` have inconsistent error handling within the same file

`readResource` (resource-loader.ts:108-110) logs errors:
```typescript
} catch (error) {
  logError('Failed to read resource', error instanceof Error ? error : undefined, { workflowId, resourceIndex });
}
```

`readResourceRaw` (resource-loader.ts:150-152) silently swallows them:
```typescript
} catch {
  // Fall through to error
}
```

The analysis catches the `readResourceRaw` empty catch (Bug #10) but misses that the SAME FILE has two parallel functions with contradictory error handling policies. This is the intra-file form of the cross-loader inconsistency the analysis describes — and it directly refutes the claim that each loader is internally consistent while inconsistency only appears across loaders.

**Line range**: `resource-loader.ts:108-110` vs `resource-loader.ts:150-152`

---

### UC-7: `loadWorkflow` passes potentially-invalid activities into workflow validation

`loadActivitiesFromDir` (workflow-loader.ts:48-55) uses raw decoded objects when activity validation fails. These potentially-invalid activity objects are then embedded into `rawWorkflow['activities']` (line 108) and passed to `safeValidateWorkflow(rawWorkflow)` (line 118). If the workflow schema validator does not re-validate nested activities deeply, an invalid activity object can survive into the validated `Workflow` — a validation bypass that the analysis's conservation law specifically claims to describe but doesn't identify as a concrete bug.

**Line range**: `workflow-loader.ts:48-55`, `108`, `118`

---

### UC-8: `readSkill` with `workflowId` searches fewer locations than without

When `workflowId` is provided, `readSkill` searches exactly two locations: workflow-specific → universal (skill-loader.ts:102-116). If neither has the skill, it returns `SkillNotFoundError`.

When `workflowId` is NOT provided, `readSkill` searches universal → ALL workflow skill directories (skill-loader.ts:112-128).

So a caller who provides a `workflowId` gets a SMALLER search space than one who doesn't. If a skill exists in workflow "B" but the caller asks with `workflowId: "A"`, the skill is not found. If the same caller omits `workflowId`, the skill IS found. Providing MORE information yields FEWER results. The analysis describes the 3-level resolution order but doesn't flag this inversion as a semantic problem.

**Line range**: `skill-loader.ts:97-131`

---

### UC-9: Resource index normalization breaks for indices > 2 digits

`readResource` normalizes the query index with `padStart(2, '0')` (resource-loader.ts:86) and normalizes each file's index identically (line 95). But since `parseResourceFilename` accepts `\d+` (any digit count), a file named `001-guide.toon` has index `"001"`. The normalized query for `"1"` produces `"01"`. The normalized file index for `"001"` is `"001"` (unchanged by `padStart(2, '0')` since it's already ≥ 2 chars). `"01" !== "001"`, so the match fails. However, the fallback check `parsed.index === resourceIndex` on line 96 saves it IF the query was `"001"` (exact match). But querying `"1"` for a file indexed `"001"` fails. The analysis identifies the `\d+` vs `\d{2}` regex difference (Bug #7) but doesn't trace through the normalization logic to find this concrete failure mode.

**Line range**: `resource-loader.ts:86`, `95-96`

---

### UC-10: `schema-preamble.ts` and `SCHEMA_IDS` have different ordering

The analysis correctly identifies two sources of truth (Bug #17) but doesn't flag the ORDER inconsistency:

- `SCHEMA_IDS` (`schema-loader.ts:16`): `['workflow', 'activity', 'condition', 'skill', 'state']`
- `buildSchemaPreamble` (`schema-preamble.ts:30-34`): workflow, activity, **skill**, **condition**, state

`skill` and `condition` are swapped. If consumers rely on schema ordering (e.g., for UI display or documentation generation), these produce different outputs. This is a concrete divergence beyond "adding a schema won't auto-include" — the existing schemas are already listed in different orders.

**Line range**: `schema-loader.ts:16` vs `schema-preamble.ts:30-34`

---

## REVISED BUG TABLE

| # | Location | What Breaks | Sev | Original Class | Revised Class | Why |
|---|----------|-------------|-----|----------------|---------------|-----|
| 1 | `workflow-loader.ts:25` + `activity-loader.ts:22` | `parseActivityFilename` duplicated verbatim; drift risk on update | Med | Fixable | **Fixable** | Agree — extract to shared utility |
| 2 | `skill-loader.ts:85-87` | Corrupt skill TOON silently returns `null`; caller sees "not found" | High | Fixable | **Fixable** | Agree — log or return Result |
| 3 | `rules-loader.ts:47` | Parse error logged at `logInfo` instead of `logWarn`/`logError` | Med | Fixable | **Fixable** | Agree — severity mismatch |
| 4 | `workflow-loader.ts:50-55`, `activity-loader.ts:121-125` | Raw decoded object used on validation failure; potential type unsafety | High | Structural | **Fixable** | Use `LoadResult<T>` with status field; each call site gets both validation info and data. No conservation law prevents this. |
| 5 | `workflow-loader.ts:156` | Empty `catch {}` in `listWorkflows`; errors invisible | Med | Structural | **Fixable** | Add `logError` + return `[]`. Logging AND graceful degradation are not mutually exclusive. False dichotomy. |
| 6 | `workflow-loader.ts:64-69` | Sorting re-scans files array; O(n·m·log n) not O(n²) | Low | Fixable | **Fixable** | Agree fixable; analysis got complexity class wrong (understated it) |
| 7 | `resource-loader.ts:35` vs `activity-loader.ts:22` / `skill-loader.ts:22` | Regex `\d+` vs `\d{2}` inconsistency | Low | Fixable | **Fixable** | Agree — align or document |
| 8 | `activity-loader.ts:79-86` | Cross-workflow activity search order is nondeterministic | High | Structural | **Fixable** | Sort `workflowIds` before iterating. One line fix. No flexibility cost. |
| 9 | `skill-loader.ts:119-128` | Cross-workflow skill search order is nondeterministic | High | Structural | **Fixable** | Same fix as #8: sort workflow IDs |
| 10 | `resource-loader.ts:150-152` | `readResourceRaw` empty catch swallows all errors | Med | Fixable | **Fixable** | Agree — add logging or propagate |
| 11 | `schema-loader.ts:39-41` | Outer try/catch is effectively dead error handling | Low | Fixable | **Fixable** | Agree — defensive but unreachable. Could remove or keep as safety net. |
| 12 | `workflow-loader.ts:209, 211, 213` | `conditionToString` casts without Array.isArray guard | Med | Fixable | **Fixable** | Agree |
| 13 | `activity-loader.ts:11` | `DEFAULT_ACTIVITY_WORKFLOW` defined but never used | Low | Fixable | **Fixable** | Agree — dead code |
| 14 | `workflow-loader.ts:160-167` | `getActivity`/`getCheckpoint` return `undefined` on miss | Low | Structural | **Not a bug** | TypeScript return type `Activity \| undefined` enforces null-check. Naming is a style preference. |
| 15 | `resource-loader.ts:222-237` | `parseFrontmatter` returns `''` for missing id/version | Med | Fixable | **Fixable** | Agree — use `undefined` or discriminated union |
| 16 | `activity-loader.ts:239-240` | `readActivityIndex` duplicates directory reads | Low | Fixable | **Fixable** | Agree fixable, but impact overstated — only directory listings are doubled, not file content I/O |
| 17 | `schema-preamble.ts:30-34` | Schema list hardcoded separately from `SCHEMA_IDS`; ordering differs | Med | Fixable | **Fixable** | Agree — import from schema-loader |
| 18 | `activity-loader.ts:192` vs `106-108` | `index` activities filtered from listing but loadable by direct read | Med | Fixable | **Fixable** | Agree — apply consistent filter |
| **19** | `skill-loader.ts:242-254, 266-281` | `readSkillIndex` double-readdir (same pattern as Bug #16) | Low | *Not found* | **Fixable** | Analysis found this for activities but missed it for skills |
| **20** | `resource-loader.ts:91-107` | Dual-format resource (`.toon` + `.md`) priority is nondeterministic | Med | *Not found* | **Fixable** | Prefer TOON over MD, or sort files before matching |
| **21** | `activity-loader.ts:149-151` | Catch-all converts ALL errors to `ActivityNotFoundError` | High | *Not found* | **Fixable** | Same class as Bug #2; return specific error types |
| **22** | `workflow-loader.ts:131-157` | `listWorkflows` loads every workflow fully (all activities, validation) just for 4 manifest fields | High | *Not found* | **Fixable** | Read only workflow.toon, decode, extract manifest fields without loading activities |
| **23** | `activity-loader.ts:49-54` vs `skill-loader.ts:63` | `findWorkflowsWithActivities` includes meta; `findWorkflowsWithSkills` excludes it | Med | *Not found* | **Fixable** | Align the meta-filtering policy across loaders |
| **24** | `resource-loader.ts:108-110` vs `150-152` | `readResource` logs errors; `readResourceRaw` swallows them — same file, same operation, contradictory policy | Med | *Not found* | **Fixable** | Add logError to readResourceRaw |
| **25** | `workflow-loader.ts:48-55, 108, 118` | Invalid activity objects embedded into workflow then passed to workflow validation; potential validation bypass | High | *Not found* | **Fixable** | Filter out activities that fail validation before embedding, or re-validate post-merge |
| **26** | `skill-loader.ts:97-131` | Providing `workflowId` searches fewer locations than omitting it; more info yields fewer results | Med | *Not found* | **Fixable** | After workflow-specific + universal, fall back to cross-workflow search even when workflowId is provided |
| **27** | `resource-loader.ts:86, 95-96` | Index normalization with `padStart(2, '0')` breaks for 3+ digit file indices | Low | *Not found* | **Fixable** | Normalize both to same digit count, or use numeric comparison |
| **28** | `schema-loader.ts:16` vs `schema-preamble.ts:30-34` | Schema ordering differs (skill/condition swapped) | Low | *Not found* | **Fixable** | Covered by Bug #17 fix — import and iterate SCHEMA_IDS |

### Revised Summary Statistics

- **Total findings**: 28 (was 18)
- **High severity**: 6 (bugs #2, #4, #8, #9, #21, #22, #25)
- **Medium severity**: 10 (bugs #1, #3, #5, #10, #15, #17, #18, #20, #23, #24, #26)
- **Low severity**: 11 (bugs #6, #7, #11, #13, #16, #19, #27, #28)
- **Not a bug**: 1 (bug #14 — TypeScript enforces the type contract)
- **Fixable**: 27
- **Structural**: 0
- **Previously classified as structural, now reclassified**: 5 → 0

### Verdict on the Conservation Law

All five bugs the analysis classified as structural are fixable. The conservation law "Validation Consistency × Validation Flexibility = Constant" is not a physical law — it is a description of the current implementation's lack of a unified result type. Introducing `LoadResult<T>` with validation status violates the "law" by increasing both consistency and flexibility. The meta-law similarly conflates engineering effort with impossibility. Both are overclaims that dressed standard design tensions as conservation laws to justify classifying fixable bugs as structural.

### What the structural analysis got right

The analysis correctly identifies all 18 bugs in the code — no false positives on bug existence. The transformed claim (conflation of filesystem access with domain logic) is a genuine insight. The concealment mechanism (domain logic interleaving) is real and well-described. The BaseLoader thought experiment produces legitimate insights about why naive abstraction fails. The analysis's *observations* are strong; its *classifications* and *laws* are where it overclaims.
