---
target: scripts/ (6 files, ~1,095 LOC)
lens: degradation (resource 10)
date: 2026-03-27
scope: portfolio — validate-workflow.ts, generate-schemas.ts, validate-workflow-toon.ts, validate-activities.ts, update.sh, deploy.sh
focus: quality and consistency audit
---

# Portfolio Degradation Analysis — scripts/

## Concrete Problems Identified

### P1: Stale Schema Validation (validate-workflow.ts)

`validate-workflow.ts:31-32` reads a pre-built JSON schema from disk. If `npm run build:schemas` was last run against an older version of the Zod definitions in `src/schema/`, the JSON schema is silently outdated. The script reports `✅ valid` against a stale contract. Lines 25-28 handle the *missing* schema case but not the *stale* schema case.

### P2: Inconsistent Shebang Lines

| File | Shebang |
|------|---------|
| validate-workflow.ts | `#!/usr/bin/env npx tsx` |
| generate-schemas.ts | `#!/usr/bin/env tsx` |
| validate-workflow-toon.ts | `#!/usr/bin/env npx tsx` |
| validate-activities.ts | `#!/usr/bin/env npx tsx` |

`generate-schemas.ts` uses `tsx` directly; the others use `npx tsx`. Under different `PATH` and npm configurations, these resolve to different tsx versions or fail differently. This inconsistency is invisible until it breaks.

### P3: Hardcoded External URLs (deploy.sh)

- Line 29: `DEFAULT_HISTORY_REPO="https://github.com/m2ux/ai-metadata.git"`
- Line 410: `https://github.com/m2ux/workflow-server.git`
- Line 506: Same URL for submodule addition

These URLs are compile-time constants with no validation, fallback, or staleness detection.

### P4: Self-Destructing Deploy Script (deploy.sh:580-581)

```bash
rm -f "$SCRIPT_PATH"
```

After successful deployment, the script deletes itself. No deployment record, no re-run capability, no audit trail. The `--keep` flag exists but is not the default.

### P5: Unguarded JSON.parse (validate-workflow.ts:31-32)

```typescript
const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
const workflow = JSON.parse(readFileSync(resolvedPath, 'utf-8'));
```

No try-catch. Malformed JSON produces an unhandled exception with a Node.js stack trace instead of a diagnostic message.

### P6: Duplicate Validation Logic

`validate-workflow-toon.ts:49-60` and `validate-activities.ts:29-46` both implement decode-validate-report for activity `.toon` files. The implementations are structurally identical but exist as separate copies. Bug fixes applied to one copy will not reach the other.

### P7: Network Operations Without Timeouts

`update.sh` performs `git fetch`, `git checkout`, `git pull` with no timeout. `deploy.sh` wraps exactly one `git push` in `timeout 30` (line 379) but leaves all other network operations — including `git clone` of external repos — unguarded. A hung network connection blocks the process indefinitely.

### P8: Temp Directory Cleanup Gaps (deploy.sh)

`ensure_history_branch()` (lines 229-262) creates a temp dir via `mktemp -d`, performs git operations, and cleans up on the success path. If `git push` fails (line 251) AND the subsequent `cd "$REPO_ROOT"` has already changed directory context, `rm -rf "$temp_dir"` runs correctly — but if the function is interrupted between `cd "$temp_dir"` and the cleanup, orphan directories persist.

### P9: Input Sanitization Gaps in Shell Scripts

`deploy.sh:306` reads a URL from the user via `read -p` and passes it directly to `git clone "$ORPHAN_REPO"`. While git itself handles most injection vectors, a URL containing unexpected characters could produce confusing failures. `update.sh:69-71` derives `PROJECT_NAME` from a directory basename and uses it in branch names without sanitizing special characters.

### P10: Inconsistent Exit Code Semantics

TypeScript scripts consistently exit 0 on success and 1 on failure. Shell scripts mix `exit 1` for argument errors, `return 1` from functions (which propagates differently depending on caller context), and implicit success returns. `update.sh` functions `update_workflows()` and `update_metadata()` return 1 on failure, but the main body checks this with `if update_workflows; then` — correct, but `update_metadata` calls `git fetch origin master` (line 139) without `--quiet`, and a failed fetch followed by a successful checkout still reports success.

### P11: No Validation of Workflow Loader Consistency

`validate-workflow-toon.ts:35` calls `loadWorkflow()` (the runtime loader) to validate the composite workflow, then validates individual files separately (lines 44-60). The comment on line 44 acknowledges this is "redundant if load succeeded." But if the loader applies transformations (defaults, merges) that paper over per-file errors, the two validation paths silently disagree. There is no assertion that per-file validation and loader validation produce equivalent results.

### P12: Emoji-Dependent Output Parsing

All scripts use emoji characters (✅, ❌, ⚠, 📁) as the primary success/failure indicators in output. CI systems, log aggregators, or terminals with limited Unicode support may render these incorrectly or strip them, making output unparseable for automated consumers.

---

## Decay Timeline

### 6 Months — Early Drift

| Problem | Degradation |
|---------|-------------|
| P1 (stale schema) | Schema definitions evolve in `src/schema/`; JSON schema files not regenerated → `validate-workflow.ts` validates against an outdated contract. Passes files that should fail. |
| P2 (shebangs) | Node.js minor version update changes `npx` resolution behavior → `generate-schemas.ts` works but `validate-workflow.ts` fails, or vice versa. |
| P3 (URLs) | GitHub repo renamed or access changed → `deploy.sh` fails on `git clone` with an opaque "repository not found" error. |
| P6 (duplicate logic) | Bug found in `decodeToon` handling → fixed in `validate-activities.ts` but not in `validate-workflow-toon.ts`. |

### 12 Months — Silent Corruption

| Problem | Degradation |
|---------|-------------|
| P1 (stale schema) | Multiple schema revisions have occurred. JSON schema files are 3+ versions behind. `validate-workflow.ts` is now actively misleading — it validates successfully against a schema that no longer matches what the server expects. Engineers trust it and deploy invalid workflows. |
| P4 (self-destruct) | New team members cannot understand how `.engineering/` was created. The deployment script is gone. Recreating the setup requires archaeology. |
| P7 (no timeouts) | CI pipeline added that runs `update.sh` before tests. Intermittent network issues cause CI to hang for hours — no timeout, no retry, no alerting. |
| P11 (loader inconsistency) | The loader has been updated to handle new schema fields with defaults. Per-file validation now fails on files the loader accepts. Engineers stop trusting the per-file output and only check the loader result. |

### 24 Months — Structural Failure

| Problem | Degradation |
|---------|-------------|
| P3 (URLs) | Hardcoded URLs are dead links. `deploy.sh` and `update.sh` are non-functional for new deployments. Only existing deployments (created before URL death) survive. |
| P6 (duplicate logic) | The two validation scripts now have materially different behavior. One accepts files the other rejects. Engineers don't know which is canonical. |
| P5 (JSON.parse) | After 2 years of unhelpful stack traces from malformed JSON, someone wraps the call in try-catch — but only in one script, deepening the inconsistency of P6. |
| P2 (shebangs) | Node.js LTS has rotated. `npx tsx` behavior has changed. Some scripts require `--yes` flag, others don't. The inconsistency is now a hard failure for some developers. |

---

## Degradation Model — Where Brittleness Increases

The scripts have two orthogonal fragility axes:

**Axis 1: External Reference Decay** (shell scripts)
Every hardcoded URL, branch name, and remote repo structure is an assertion about the external world. These assertions have a half-life measured in months. The decay is monotonic — external references never become *more* valid over time.

**Axis 2: Schema Drift** (TypeScript scripts)
The validation scripts validate against schemas that evolve in `src/schema/`. The JSON schema files are point-in-time snapshots. As the Zod schemas evolve, the gap between the JSON snapshots and the canonical schemas widens monotonically.

These axes compound: schema drift means validation gives false confidence, while external reference decay means deployment/update tooling fails. The result is that the scripts become simultaneously *more critical* (they're the only validation/deployment gatekeepers) and *less reliable* (their assumptions are increasingly wrong).

---

## Predictive Breakage Tests

Tests that break these scripts *by only waiting* — no new problems introduced:

1. **Stale schema test**: Run `generate-schemas.ts`, modify a Zod schema in `src/schema/` to add a required field, then run `validate-workflow.ts` on a file missing that field. Expected: validation passes (incorrectly) because JSON schema is stale.

2. **Shebang divergence test**: Install a different version of tsx globally vs locally. Run each script. Expected: `generate-schemas.ts` uses the global tsx; others use the local one via npx. Behavior diverges.

3. **URL decay test**: Change the GitHub repo visibility to private or rename it. Run `deploy.sh --orphan`. Expected: opaque failure at `git clone` with no diagnostic about URL staleness.

4. **Timeout hang test**: Run `update.sh` with network blocked (e.g., firewall rule). Expected: script hangs indefinitely — no timeout, no error.

5. **Duplicate drift test**: Fix a bug in `validate-activities.ts` validation logic. Run both `validate-activities.ts` and `validate-workflow-toon.ts` on the same files. Expected: different results from duplicated code paths.

---

## The Degradation Law

**The property that worsens monotonically with neglect: assumption-reality divergence.**

Every script encodes assumptions about the external world (URLs exist, schemas are current, shebangs resolve correctly, network is available). These assumptions were true at authoring time. Each assumption has an independent decay rate, and none has a staleness detection mechanism. The divergence between what the scripts assume and what reality delivers increases monotonically with time.

The conservation law: **Assumption freshness × script reliability = constant.** As assumptions age, reliability degrades at the same rate. The scripts contain no self-healing mechanism — no runtime schema regeneration, no URL health checks, no shebang normalization. The only reset mechanism is a human noticing failure and manually updating, but the failures are predominantly *silent* (stale schema validation, duplicate logic drift) rather than *loud* (network timeout, missing file).

This means the degradation is not just monotonic but *accelerating*: silent failures accumulate trust in wrong results, which delays the human intervention that would reset the decay.
