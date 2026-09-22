---
metadata:
  version: 1.2.0
---

## Capability

The taint findings a graph recorded — source-to-sink data flows inside one function and across function calls, each with the sink it reaches and the hops it takes.

## Inputs

### taint_target

*(optional)* A file path, matched on its suffix, or a symbol name, which anchors the answer to that file's or that function's findings. Absent, the answer is every finding the graph holds.

### limit

*(optional)* How many findings the answer carries, from 1 to 200.

#### default

`50`

## Outputs

### taint_report

The findings matched, how many there are in full, and whether the graph holds the layer they come from.

#### findings

Each finding with its sink category — `command-injection`, `code-injection`, `path-traversal`, `sql-injection` or `xss` — and its ordered hop path. A finding inside one function carries its source and sink lines and the variable on each hop; a finding across functions carries `interprocedural` set true, the source and sink function names, and the chain of functions the taint crossed.

#### totalFindings

How many findings matched, of which `findings` holds a page.

#### truncated

Whether `findings` is shorter than `totalFindings`.

#### note

The caveats on what the layer models, carried on every answer. Where the graph holds no taint layer it says so and names the build that records one, and the answer is empty rather than clean.

## Protocol

### 1. Take the Findings

- Call `gitnexus_explain { target: taint_target, limit, repo: repo_name }` and record the `{taint_report}`.
   > - Where `{taint_target}` names several symbols the answer is the candidates, with `totalCandidates` the true count. The anchor matches a symbol name before a path suffix, so a bare filename answers with that file's symbols; lead the value with a separator — `/AGENTS.md` for a file at the tree's root — and the match falls to the suffix. This operation takes no symbol identity, so narrow a still-ambiguous path by naming more of it.
   > - Where `{taint_report}.note` states the graph holds no taint layer, a rebuild carrying the program-dependence layers is what makes this answer a measurement.

### 2. Read a Finding's Reach

- Read an absent finding as absence of evidence and not as safety: a flow through a closure or callback, through an object's field, past a guard-style check, or through a dynamic import is not modelled, and a cross-function finding matches its callee by name so one caller of two same-named callees attributes the flow to both.
