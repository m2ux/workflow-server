---
name: target-profile
description: The sections a target profile fills for one audited Substrate node.
metadata:
  order: 6
  legacy_id: 6
---

# Target Profile

The sections a target fills with its own assignments, paths, structs, and benchmarks.

## Agent Dispatch Assignments

Each entry names an agent, the batch it belongs to, and the paths it owns. The batches are concurrent primary, reconnaissance, and post-collection.

```markdown
- **<agent>:** <what it owns> (`<path>`)
```

## File Coverage Obligations

Each row names a `.rs` file over 200 lines in a priority-1 or priority-2 crate, the agent that owns it, and why it is listed. A file in that set that no agent output names is a coverage gap.

```markdown
| File | Agent | Notes |
|------|-------|-------|
| `<path>` | `<agent>` | `<why this file is listed>` |
```

## Supplementary File Assignments

Each row names an agent and the paths outside its primary assignment that its checks still read.

```markdown
| Agent | Supplementary files |
|-------|---------------------|
| `<agent>` | `<path>` |
```

## Node Agent Scope Split

When one binary covers more than one security surface, one block per agent names the paths it owns and the checks that are its job.

```markdown
### <agent> — <surface>

**Files:** `<path>`

**Primary checks:**

- <check this agent owns>
```

## Consensus-Critical Configuration Structs

Each row names a struct, where it is declared, and the invariants its constructor holds.

```markdown
| Struct | Location | Required invariants |
|--------|----------|---------------------|
| `<Struct>` | `<path>` | `<invariant>` |
```

## Cross-Chain Pallets

Each entry names a pallet that consumes inherent data from another chain.

```markdown
- `<pallet>` — <which external data it consumes>
```

## Target-Specific Ensemble Blind-Spot Items

Each row names a check this target adds, the question it asks, and the files that hold the answer.

```markdown
| # | Item | What to check | Key files |
|---|------|---------------|-----------|
| `<n>` | `<item>` | `<question>` | `<path>` |
```

## Vulnerability Domain Hints

Optional. Each row names a class, where it shows up, and the pattern to recognize. Omit the section when the target has none.

```markdown
| Class | Trigger location | Pattern |
|-------|------------------|---------|
| `<class>` | `<path>` | `<pattern>` |
```

## Severity Calibration Benchmark

Each row is one finding from a prior audit of this target: the pattern, impact, feasibility, severity, and why that severity holds. How a score uses the row is the [calibration benchmark table](./severity-rubric.md#calibration-benchmark-table).

```markdown
| Finding pattern | I | F | Avg | Severity | Reasoning |
|-----------------|---|---|-----|----------|-----------|
| `<pattern>` | `<1-4>` | `<1-4>` | `<avg>` | `<level>` | `<why>` |
```
