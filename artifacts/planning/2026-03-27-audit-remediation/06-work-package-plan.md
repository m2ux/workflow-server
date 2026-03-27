# Implementation Plan — WP-01: Security Hardening

## Solution Overview

The state tools currently accept arbitrary filesystem paths from agents and store an encryption flag in a forgeable namespace. This plan adds fail-closed path validation and moves the encryption flag to a tamper-resistant schema field. Both fixes are additive — no existing API signatures change, and backward compatibility is preserved for saved state files.

The fix touches two source files (`state-tools.ts`, `state.schema.ts`) and one test file (`state-persistence.test.ts`). No new dependencies are introduced.

## Tasks

### Task 1: Add `sessionTokenEncrypted` to `StateSaveFileSchema`

**File:** `src/schema/state.schema.ts`

Add an optional boolean field to the `StateSaveFileSchema` object:

```typescript
sessionTokenEncrypted: z.boolean().optional(),
```

This field defaults to `undefined` (absent), which is treated as `false`. Existing TOON files without this field will parse successfully since the field is optional.

Update the `StateSaveFile` type (auto-derived via `z.infer`).

**Acceptance:** `StateSaveFileSchema.safeParse()` accepts objects with and without the new field.

---

### Task 2: Add `validateStatePath` helper to `state-tools.ts`

**File:** `src/tools/state-tools.ts`

Add a path validation function:

```typescript
function validateStatePath(inputPath: string): string {
  const root = process.cwd();
  const resolved = resolve(inputPath);
  if (!resolved.startsWith(root + sep) && resolved !== root) {
    throw new Error(
      `Path validation failed: "${inputPath}" resolves outside the workspace root`
    );
  }
  return resolved;
}
```

Import `resolve` and `sep` from `node:path` (already partially imported).

**Design notes:**
- Uses `root + sep` prefix check to prevent `/workspace-evil` matching `/workspace`.
- `resolved === root` allows the workspace root itself as a valid target.
- Throws a descriptive error — the agent sees the rejection reason.
- Does NOT use `fs.realpath()` (would reject valid symlinked planning folders).

**Acceptance:** Function correctly resolves and validates paths.

---

### Task 3: Apply path validation in `save_state`

**File:** `src/tools/state-tools.ts`

Before the `join()` call on L59, validate the planning folder path:

```typescript
const validatedFolder = validateStatePath(planning_folder_path);
const filePath = join(validatedFolder, STATE_FILENAME);
```

The `mkdir` and `writeFile` calls then use the validated, resolved path.

Also update the `planningFolder` field in the save file to use the validated path for consistency.

**Acceptance:** `save_state` rejects `../` traversal and absolute paths outside workspace; accepts workspace-relative paths.

---

### Task 4: Apply path validation in `restore_state`

**File:** `src/tools/state-tools.ts`

Before `readFile` on L91, validate:

```typescript
const validatedPath = validateStatePath(file_path);
const content = await readFile(validatedPath, 'utf-8');
```

**Acceptance:** `restore_state` rejects paths outside workspace; accepts valid state file paths.

---

### Task 5: Update `save_state` encryption flag handling

**File:** `src/tools/state-tools.ts`

Move the encryption flag from `variables` to the `StateSaveFile` envelope:

```typescript
// Before (L43-47):
state.variables['_session_token_encrypted'] = true;

// After:
// Set flag on the save file, not in variables
// Also clean up the underscore-prefixed variable
delete state.variables['_session_token_encrypted'];
```

Then set `sessionTokenEncrypted: true` on the `saveFile` object:

```typescript
const saveFile: StateSaveFile = {
  id: generateSaveId(),
  savedAt: new Date().toISOString(),
  description,
  workflowId: state.workflowId,
  workflowVersion: state.workflowVersion,
  planningFolder: validatedFolder,
  sessionTokenEncrypted: true,  // new field
  state,
};
```

When no session token is present, omit the field (or set to `false`/`undefined`).

**Acceptance:** Saved TOON files contain `sessionTokenEncrypted` at the top level, not `_session_token_encrypted` in variables.

---

### Task 6: Update `restore_state` with backward-compatible flag read

**File:** `src/tools/state-tools.ts`

Check the new schema field first, then fall back to the legacy `variables` location:

```typescript
const isEncrypted = restored.sessionTokenEncrypted
  ?? restored.state.variables['_session_token_encrypted'];

if (isEncrypted && typeof restored.state.variables['session_token'] === 'string') {
  const key = await getOrCreateServerKey();
  restored.state.variables['session_token'] = decryptToken(
    restored.state.variables['session_token'] as string, key
  );
}
// Always clean up legacy flag if present
delete restored.state.variables['_session_token_encrypted'];
```

**Acceptance:** Restores both old-format (flag in variables) and new-format (flag in schema) state files correctly. Legacy flag is always cleaned from variables on restore.

## Task Ordering

Tasks can be implemented in sequence (1 → 2 → 3 → 4 → 5 → 6) in a single commit, or split into two logical commits:
- **Commit A** (QC-003): Tasks 1 is a prerequisite; Tasks 2–4 fix path traversal
- **Commit B** (QC-004): Tasks 5–6 fix encryption flag forgery (depends on Task 1 for schema field)

Recommended: single commit for simplicity given the small scope.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Path validation rejects legitimate planning folders | Low | Medium | Uses `process.cwd()` which is the project root by convention; relative paths resolve against it |
| Old state files can't restore | None | High | Backward-compatible: checks both new field and legacy `variables` location |
| Tests break | Low | Low | Existing tests don't exercise tool handlers; schema tests pass because new field is optional |
