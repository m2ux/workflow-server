---
metadata:
  version: 1.0.0
---

## Capability

Self-review of a completed implementation task: verify that every symbol introduced or referenced has provenance (populating `{uncertain_symbols}` and setting `{has_uncertain_symbols}`), then run code, test, and documentation quality checks. Catches fabricated symbols and quality regressions early.

## Inputs

### current_task

The task just implemented (description, affected files) whose changes are under review

### task_implementation

The code changes produced for `{current_task}` — the files changed and the approach taken

## Outputs

### has_uncertain_symbols

`true` when one or more symbols cannot be confirmed against the codebase, declared dependencies, or new symbols introduced by this task; `false` when every referenced symbol resolves cleanly

### uncertain_symbols

Multi-line list of uncertain symbols (one per line: symbol name + the file/line where it was seen). Empty string when `{has_uncertain_symbols}` is false.

## Protocol

### 1. Verify Symbol Provenance

- Every symbol (type, function, constant, field, etc.) introduced or referenced in code or documentation MUST have provenance — it either exists in the codebase (found via grep/search), exists in a declared dependency (verified in `Cargo.toml`, `package.json`, etc.), or is newly created and correctly defined by `{current_task}`.
- Never fabricate symbols: do not invent type/trait/struct names, reference unimplemented functions or methods, use documentation field names that do not match code, assume symbol names from patterns without verification, or rename symbols in documentation without the corresponding code change.
- Verify each class of symbol:

  | Check | How to verify |
  |-------|---------------|
  | New types/structs | Definition exists in committed code |
  | New functions/methods | Implementation exists in committed code |
  | New constants/fields | Declaration exists in committed code |
  | Referenced existing symbols | `grep` confirms the symbol exists in the codebase |
  | Symbols from dependencies | Dependency declared in the manifest AND the symbol exists in that crate/package |
  | Symbols in documentation | Every symbol mentioned in docs/ADRs/change files exists in code |

- Verify symbols in change files, ADRs, and test plans too — change files reference symbols from the actual code changes in the PR; ADRs reference symbols from the implemented architecture; test plans reference symbols from the actual test implementations. Do not describe a trait that was planned but never implemented, mention storage items that never existed, reference extrinsics that do not appear in the pallet, or rename concepts without verifying the new name exists.
- Populate `{uncertain_symbols}` with any symbol that cannot be confirmed against the codebase, declared dependencies, or the new symbols `{current_task}` introduced — one per line, with the file/line where it was seen. Set `{has_uncertain_symbols}` to `true` when that list is non-empty, otherwise `false` with an empty `{uncertain_symbols}`.
- When a symbol cannot be verified: stop, search more thoroughly (alternative patterns, git history), determine whether it is something the task needs to create, and surface the uncertainty rather than proceeding on the assumption.

### 2. Run Quality Checks

- Code quality: follows existing patterns and architecture; type-safe (compiler checks pass); error handling implemented; no hardcoded values where constants or configuration belong; documentation comments on public APIs; no debug prints in production code; no TODO comments without issue references.
- Test quality: unit tests written for new code; edge cases covered; error conditions tested; all tests passing (unit, integration, e2e).
- Documentation quality: all symbols in docs exist in code (per the provenance verification above); change file accurately describes the actual changes; no fabricated or speculative content; commit messages follow conventional commits.

## Rules

### never-fabricate-symbols

Fabricating symbols is unacceptable. Documentation must reflect actual code, not intentions. Always verify against the codebase rather than documenting from memory or pattern-matching a name.

### stop-when-unverifiable

When a symbol cannot be verified, do not proceed on the assumption that it exists. Investigate first; the symbol may not exist. Surface the uncertainty by setting `{has_uncertain_symbols}` true rather than guessing.
