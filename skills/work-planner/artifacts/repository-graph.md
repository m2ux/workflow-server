# Repository Graph

The indexed symbols, relationships and ordered flows for a repository revision.

## Operations

### *Measure* Repository Change

Current graph evidence for the supplied change.

**Inputs:** Worktree, verified head commit and base branch.

1. Run [Index Status](#index-status) in the supplied worktree. Every graph command runs in that worktree.
2. If the repository is unindexed or behind the verified head:
   - Run [Index Repository](#index-repository).
   - Confirm freshness.
3. Run [Change Surface](#change-surface) against the supplied base using `--base-ref`.
4. For each changed symbol, run [Symbol Context](#symbol-context).
5. For each reported flow, run [Flow Trace](#flow-trace).
6. Inspect the staleness block on every response. For a behind index:
   - Discard its measurements.
   - Reindex.
   - Repeat the affected measurements.
7. Return only evidence current with the supplied head, meeting [Fields](#fields), or a freshness blocker.

## Fields

### Revision

The graph identifies its worktree and indexed commit. Measurements describe the supplied pull request head and its difference from the supplied base branch.

### Freshness

Graph responses carry a JSON `staleness` block. A behind index is not current with the requested head; measurements from it are invalid.

### Changed Symbols

The surface identifies symbols touched by the diff and the flows containing them. It compares with the supplied base branch, rather than the branch's whole history.

### Symbol Relationships

Each changed symbol has callers, callees, containing flows and file locations. Files group into component areas; their measured relationships determine edges between areas.

### Flow Traces

Each flow contains symbols in step order. Each `process_symbols` entry includes `step_index`, file and lines. Those ordered measurements supply sequence-diagram participants and interactions. A manually inferred call order does not establish a graph trace.

## Commands

### Index Status

Reports whether the repository is indexed, and how far behind the index sits.

**Inputs:** Repository worktree and requested revision.

```bash
gitnexus status
```

### Index Repository

Indexes the repository, which an unindexed or behind repository needs before any measurement.

**Inputs:** Repository worktree and requested revision.

```bash
gitnexus analyze
```

### Change Surface

Reports the symbols a pull request's diff touches and the flows they sit in, against the base branch.

**Inputs:** Current indexed worktree and comparison base branch.

- `--base-ref` is the pull request's base, so the surface is the change rather than the branch's whole history.

```bash
gitnexus detect-changes --scope compare --base-ref '<base-branch>'
```

**Example:**

```bash
gitnexus detect-changes --scope compare --base-ref main
```

### Symbol Context

Reports one symbol's callers, its callees and the flows it sits in, each with the file it sits in.

**Inputs:** Symbol identity from the supplied change surface and the current graph worktree.

```bash
gitnexus context '<symbol-identity>'
```

**Example:**

```bash
gitnexus context reserveRow
```

### Flow Trace

Reports one flow's symbols in step order, the structure a sequence diagram is drawn from.

**Inputs:** Flow identity from the supplied change surface and the current graph worktree. The result meets [Flow Traces](#flow-traces).

```bash
gitnexus query --query '<flow-identity>' --limit 1
```

**Example:**

```bash
gitnexus query --query "Queue Placement" --limit 1
```
