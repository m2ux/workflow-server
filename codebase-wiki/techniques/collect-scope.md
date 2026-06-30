---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
---

## Capability

Establish the run's foundation from the user's request: resolve the wiki tree root, pin the citation baseline commit, capture what this build pass should cover, and derive the ordered ingest plan from that scope. This is the producer for the rest of the run — it lands `wiki_path` and `raw_baseline_commit` (inherited as inputs across the other techniques) along with `ingest_scope` and `ingest_plan`.

## Outputs

### wiki_path

Root of the wiki tree — the directory holding `index.md`, `log.md`, `overview.md`, and the typed-page subfolders. Resolved from the user request as an existing wiki to augment or a new directory to create.

### raw_baseline_commit

The pinned source commit every citation is relative to — the current HEAD of the target source tree unless the user names a specific commit. The raw baseline is the source at this commit, referenced in place; there is no physical copy.

### ingest_scope

The free-form description of what this build pass should cover — the source areas, and any task-derived knowledge, to ingest into the wiki.

### ingest_plan

The ordered list of areas to ingest, derived from `{ingest_scope}` — one entry per module, package, subsystem, or file set named in the scope. This is the collection the build-wiki loop iterates.

## Protocol

### 1. Resolve The Wiki Target

- Resolve `{wiki_path}` from the user request — an existing wiki to augment or a new directory to create. It holds `index.md`, `log.md`, `overview.md`, and the typed-page subfolders.

### 2. Pin The Citation Baseline

- Pin `{raw_baseline_commit}` to the source commit every citation will be relative to — the current HEAD of the target source tree unless the user names a specific commit. The raw baseline is the source at this commit, referenced in place; there is no physical copy.

### 3. Capture The Ingest Scope

- Capture `{ingest_scope}` as the free-form description of what this build pass should cover — the source areas, and any task-derived knowledge, to ingest into the wiki.

### 4. Derive The Ingest Plan

- Derive `{ingest_plan}` from `{ingest_scope}` as an ordered list, one entry per module, package, subsystem, or file set named in the scope. This is the collection the build-wiki loop iterates.

## Rules

### baseline-pinned-before-ingest

The baseline is pinned here, before any ingest reads raw source, so every citation resolves against one immutable commit for the whole run.

### plan-derives-from-scope

The ingest plan is derived from the captured scope, not invented — every planned area traces back to a source area or task-derived knowledge named in the scope.
