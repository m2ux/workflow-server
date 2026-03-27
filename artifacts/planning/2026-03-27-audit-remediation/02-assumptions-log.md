# Assumptions Log — WP-01: Security Hardening

> **Review status:** All assumptions reviewed and accepted. Posted to [issue #67](https://github.com/m2ux/workflow-server/issues/67#issuecomment-4142074745). No stakeholder input required.

## A1: `process.cwd()` is a sufficient sandbox boundary

**Assumption:** The server's current working directory is the project/workspace root, and restricting file paths to descendants of `process.cwd()` provides adequate sandboxing.

**Basis:** MCP servers are launched from the project root by convention. The existing `PROJECT_ROOT` constant in `config.ts` is derived from `import.meta.dirname` (the `src/` parent), which is equivalent in standard installations. Using `process.cwd()` is simpler and matches the user-facing expectation that state files live inside the project tree.

**Risk if wrong:** If the server is launched from `/` or a parent directory, the sandbox is too broad. Mitigated by documenting the launch-directory requirement and by the option to add an explicit `projectRoot` config field later.

**Status:** Accepted — verified that `config.ts` already uses a project-root-relative resolution pattern.

## A2: Moving `_session_token_encrypted` to `StateSaveFileSchema` won't break restore

**Assumption:** Existing saved state files store `_session_token_encrypted` in `variables`. Adding a new top-level `sessionTokenEncrypted` field to `StateSaveFileSchema` (optional, defaults to `false`) and checking both locations on restore provides backward compatibility.

**Basis:** `StateSaveFileSchema` uses `z.object()` with `.safeParse()`, which ignores unknown keys by default. Adding an optional field is non-breaking. The legacy check in `variables` can be retained as a migration path.

**Risk if wrong:** None — Zod's default behavior accepts objects with extra or missing optional fields.

**Status:** Accepted — verified schema definition at `state.schema.ts:153-161`.

## A3: No other tools have similar path traversal issues

**Assumption:** Only `save_state` and `restore_state` accept user-supplied filesystem paths. Other tools operate on workflow IDs resolved through the loader, which uses `config.workflowDir` as a fixed base.

**Basis:** QC-003 specifically identifies these two tools. The audit covered all tool registrations.

**Risk if wrong:** Other tools may need similar hardening, but that would be a separate finding. Out of scope for WP-01.

**Status:** Accepted — audit scope covers this.

## A4: `path.resolve` + prefix check is sufficient for path validation

**Assumption:** Resolving the user-supplied path to an absolute path via `path.resolve()`, then verifying it starts with the workspace root prefix (with trailing separator), prevents all traversal attacks including symlink-based escapes at the path-string level.

**Basis:** `path.resolve()` normalizes `..`, `.`, and redundant separators. The prefix check ensures the final resolved path is a descendant. Symlink resolution (`fs.realpath`) is intentionally not used — it would reject valid symlinked planning folders, and symlink-based attacks require the attacker to have already written symlinks to the filesystem.

**Risk if wrong:** If symlinks inside the workspace point outside it, an agent could follow them. This is an acceptable residual risk for the current threat model (agents don't create symlinks; the user does).

**Status:** Accepted.

## A5: Single commit is appropriate for this scope

**Assumption:** Both fixes (QC-003 and QC-004) can ship as a single commit since they touch the same file and are logically related (hardening the state tools trust boundary).

**Basis:** Total scope is ~30 lines of new/changed code in one file plus one schema field addition. Splitting into two commits adds review overhead without meaningful bisectability benefit.

**Risk if wrong:** If one fix needs to be reverted independently, a single commit forces reverting both. Acceptable given the small, well-understood scope.

**Status:** Accepted.

## A6: `validateStatePath` should be module-private, not exported

**Assumption:** The path validation helper is specific to state tools and should not be exported for reuse. If other modules need path validation later, a shared utility can be extracted then.

**Basis:** YAGNI — only two call sites exist. Exporting prematurely couples other modules to this implementation. For testing, the function can be tested indirectly through the tool handlers, or exported as a named export from the module if direct unit testing is preferred.

**Risk if wrong:** Minor refactoring to extract later. No functional risk.

**Status:** Accepted — will export for direct unit testing but document as internal.
