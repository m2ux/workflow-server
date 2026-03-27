---
target: scripts/ (6 files, ~1,095 LOC)
lens: claim (resource 07)
date: 2026-03-27
scope: portfolio — validate-workflow.ts, generate-schemas.ts, validate-workflow-toon.ts, validate-activities.ts, update.sh, deploy.sh
focus: quality and consistency audit
---

# Portfolio Claim Analysis — scripts/

## Embedded Empirical Claims

### C1: "Schema generation precedes validation" (Timing)

**Location**: `validate-workflow.ts:25-28`
```
if (!existsSync(schemaPath)) {
  console.error('Run "npm run build:schemas" first to generate JSON schemas.');
  process.exit(1);
}
```

The script checks for the *existence* of the JSON schema file but not its *freshness*. It assumes that if the file exists, it reflects the current Zod definitions. The temporal ordering claim is: "a developer who has the schema file has an up-to-date schema file."

### C2: "Ajv strict:false produces equivalent validation to strict:true" (Causality)

**Location**: `validate-workflow.ts:34`
```
const ajv = new Ajv({ allErrors: true, strict: false });
```

`strict: false` disables Ajv's strict mode, which would reject unknown keywords, unevaluated properties, and other schema constructs that are technically legal but potentially unintended. The claim: "relaxed schema compilation produces the same validation outcomes as strict compilation for our schemas." If the Zod-to-JSON-Schema generator produces constructs that strict mode would flag, disabling strict mode silently accepts potentially incorrect schemas.

### C3: "Network operations complete in bounded time" (Resources)

**Locations**: `update.sh:92-98`, `deploy.sh:230-262`, `deploy.sh:410`, `deploy.sh:486-498`

Git operations (fetch, clone, pull, push) are invoked without timeout guards, except for one instance at `deploy.sh:379` (`timeout 30 git push`). The embedded claim: "git network operations will either succeed quickly or fail with an error." In reality, DNS resolution hangs, SSH key negotiation stalls, and partial transfers can block indefinitely.

### C4: "User-supplied paths are filesystem paths" (Human Behavior)

**Locations**: `validate-workflow.ts:12`, `validate-workflow-toon.ts:16`, `validate-activities.ts:75-77`

All TypeScript scripts take `process.argv[2]` and pass it to `resolve()` → `existsSync()`. The claim: "the second CLI argument is always a filesystem path." There is no type validation, no URL detection, no glob expansion guard. A user passing a URL, a glob pattern, or a path with embedded newlines gets opaque error messages.

### C5: "Workflow directories have a canonical structure" (Causality)

**Locations**: `validate-workflow-toon.ts:30` (expects `workflow.toon`), `validate-workflow-toon.ts:45-46` (expects `activities/` dir), `validate-workflow-toon.ts:65-66` (expects `skills/` dir), `validate-activities.ts:49-52` (expects `activities/` subfolder)

The claim: "a valid workflow directory always contains `workflow.toon`, `activities/`, and optionally `skills/`." If the directory structure conventions change — e.g., activities moved to a flat list, or skills renamed to `steps/` — these scripts fail without explaining the structural expectation they violated.

### C6: "Source TypeScript imports resolve at runtime" (Timing)

**Locations**: `generate-schemas.ts:6-8` (imports from `../src/schema/`), `validate-workflow-toon.ts:10-14` (imports from `../src/`), `validate-activities.ts:19-20` (imports from `../src/`)

The claim: "the `src/` directory contains compiled or tsx-compatible modules when scripts are invoked." These scripts import directly from source using relative paths. If tsx fails to resolve these (wrong tsconfig, circular dependencies, missing type definitions), the error is a module resolution failure with no hint that the scripts depend on source compilation state.

### C7: "Loader validation is a superset of file-level validation" (Causality)

**Location**: `validate-workflow-toon.ts:35-42` (loader validation), `validate-workflow-toon.ts:44-60` (per-file validation)

```typescript
// 2. Validate each activity file (redundant if load succeeded, but reports per-file)
```

The comment explicitly states the assumption: per-file validation is redundant given loader success. The claim: "if `loadWorkflow()` succeeds, every individual activity file is also valid." But `loadWorkflow()` may apply defaults, merge fields, or normalize data during loading. An individually invalid file could be valid in the loader's composite output, or vice versa.

### C8: "Deployment is a one-time operation" (Human Behavior)

**Location**: `deploy.sh:580-581`
```bash
if [ "$KEEP_SCRIPT" = false ]; then
    rm -f "$SCRIPT_PATH"
```

The claim: "deployment happens exactly once per project. After that, the deployment script is no longer needed." This assumes: (a) deployment always succeeds completely, (b) the deployment method never needs to be inspected, (c) no second deployment to a different mode is ever needed.

### C9: "Remote repositories accept pushes" (Resources)

**Locations**: `deploy.sh:251`, `deploy.sh:379`, `deploy.sh:525`

The claim: "the user has push access to every remote repository referenced." `deploy.sh` pushes to both the target repo and the history repo. If either push fails due to permissions, branch protection rules, or authentication expiry, the deployment is left in a partial state — local branches created but not pushed, submodules added but referencing non-existent remote branches.

### C10: "TOON decode produces schema-conformant output" (Causality)

**Locations**: `validate-workflow-toon.ts:51`, `validate-activities.ts:32`

```typescript
const decoded = decodeToon(content);
const result = safeValidateActivity(decoded);
```

The claim: "`decodeToon()` returns an object whose shape is at least approximately correct for schema validation." If `decodeToon` returns a fundamentally different structure (e.g., wraps content in a metadata envelope, returns an array instead of an object), the schema validation will reject it for structural reasons, and the error message will blame the TOON file content rather than the decode step.

---

## Inversion Analysis

### Inversion 1: C1 is false — "Schema is never current"

If the JSON schema file is always stale relative to the Zod source:

**Corruption trace**: `validate-workflow.ts` compiles the stale schema → validates workflow files against outdated constraints → reports `✅ valid` for files that would fail current schema → workflows deployed to server → server rejects workflows at runtime with schema errors that the validation script said didn't exist.

The corruption is maximally invisible: the script *succeeds* (exit 0) while producing wrong results. No error is logged. The failure surfaces only when the validated file reaches the runtime, at which point the developer blames the server, not the validation script.

**Alternative design**: Eliminate the persisted JSON schema. `validate-workflow.ts` imports the Zod schema directly (like `validate-workflow-toon.ts` and `validate-activities.ts` already do) and validates at the Zod level. The JSON schema files become an *export* artifact, not a validation dependency.

**Revealed assumption**: The current design assumes JSON schema is the canonical validation format. But three of the four TypeScript validation scripts already use Zod directly. `validate-workflow.ts` is the outlier — it uses the JSON schema because it was written first, before the Zod schemas were established as the source of truth.

### Inversion 2: C3 is false — "Network is never available"

If every git network operation fails or hangs:

**Corruption trace**: `update.sh` → `git fetch origin --quiet 2>/dev/null || true` (line 92) — the fetch failure is *silently swallowed* by `|| true`. The script continues to `git checkout workflows --quiet 2>/dev/null || true` (line 95) — also silently swallowed. Then `git pull origin workflows --quiet` (line 98) — this one IS checked, but by now the local state may be corrupt from the failed checkout. The function reports `⚠ Failed to pull workflows` but the main script continues to the metadata section.

For `deploy.sh`: `git clone --depth 1 "$TARGET_REPO" "$TEMP_DIR" 2>/dev/null` (line 486) fails → falls through to `git init` + `git remote add origin` in the error handler (lines 488-490) → creates an empty repo with a remote pointing to an unreachable URL → subsequent `git push` fails → temp directory left behind → no cleanup.

**Alternative design**: Pre-flight connectivity check before any git operations. All network operations wrapped in `timeout` with exponential backoff. Cleanup traps registered via `trap ... EXIT` at function scope, not just success path.

**Revealed assumption**: The scripts assume network failure is *exceptional* rather than *normal*. The error handling is designed for a world where failure is rare and human-observable, not for CI/CD pipelines where failure is common and must be machine-parseable.

### Inversion 3: C7 is false — "Loader validation and file validation disagree"

If `loadWorkflow()` accepts files that `safeValidateActivity()` rejects:

**Corruption trace**: `validate-workflow-toon.ts` first calls `loadWorkflow()` (line 35), which succeeds. The script prints `✅ workflow.toon valid`. Then it validates individual activity files (lines 49-60), and one fails. The script prints `❌ activity-x.toon`. But the loader already said the workflow is valid. The developer sees contradictory output: the whole is valid but a part is not. They don't know which to trust.

The deeper problem: if the loader applies defaults or normalization that the per-file validator doesn't, the loader result is *technically correct* (the loaded workflow works) but the per-file result is *also correct* (the file alone is invalid). The scripts don't distinguish "valid as loaded" from "valid in isolation."

**Alternative design**: Single validation path. Either validate only via the loader (and report per-file by decomposing the loader's merged output) or validate only per-file (and trust that if all parts are valid, the whole is valid). The current dual approach creates an irreconcilable semantic gap.

**Revealed assumption**: Validation is treated as a property of individual files, but the system's actual correctness depends on *composite* validity (how files combine). The scripts conflate two different questions: "is this file well-formed?" and "does this file work in context?"

---

## The Core Impossibility

These scripts try to simultaneously be:

1. **Developer-friendly tools** — minimal arguments, auto-detection, emoji output, self-destructing deployment
2. **Reliable automation components** — consistent exit codes, deterministic behavior, CI/CD compatibility
3. **Canonical validation gates** — the source of truth for whether workflows, schemas, and deployments are correct

These three properties cannot coexist. Developer friendliness requires *assumptions* about context (schemas are current, network is available, paths are valid). Reliable automation requires *explicit* context (timeouts, retries, machine-parseable output). Canonical validation requires *freshness guarantees* (schema matches source, validation paths agree).

The scripts optimize for (1) at the expense of (2) and (3). They are pleasant to use manually but untrustworthy as automation and potentially misleading as validation.

---

## Prediction: Slowest, Most Invisible False Claim

**C7: "Loader validation is a superset of file-level validation."**

This claim fails the slowest because:

1. The disagreement only manifests when the loader's normalization behavior diverges from the raw file format — this requires a specific kind of schema evolution (adding optional fields with defaults, changing merge semantics).
2. When it fails, both validation paths report results — one says valid, one says invalid. The developer sees *contradictory output* but has no framework for interpreting it. They're likely to trust the loader (because it's the runtime path) and ignore the per-file errors.
3. The failure compounds over time: as more fields get defaults, more files become "valid via loader but invalid per-file." Engineers learn to ignore per-file failures, defeating the purpose of the dual validation.
4. The failure is invisible to automated systems because the script's exit code reflects the *per-file* failures, not the loader success. A CI system sees exit code 1 (failure) while a human sees `✅ workflow.toon valid` — mixed signals from the same run.

This claim's falsification is the archetype of slow-invisible failure: the system continues to function, outputs become contradictory rather than wrong, and the contradiction is interpreted as noise rather than signal.
