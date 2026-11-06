# Repository Graph

The indexed symbols, relationships and ordered flows for a repository revision.

## Operations

### Measure Repository Change

Current graph evidence for the supplied change.

#### 1. Read Index Status

Apply [Index Status](#index-status "ƒ") in the [review checkout](#review-checkout "○"). Every graph command runs there.

#### 2. Refresh Absent or Stale Index

- If the repository is unindexed or behind [Requested Revision](#requested-revision "○"):
- Apply [Index Repository](#index-repository "ƒ") in the review checkout.
- Confirm freshness.

#### 3. Measure Change Surface

Apply [Change Surface](#change-surface "ƒ") in the review checkout against the supplied base using `--base-ref`.

#### 4. Measure Changed Symbols

For each changed symbol, Apply [Symbol Context](#symbol-context "ƒ") in the review checkout.

#### 5. Measure Reported Flows

For each reported flow, Apply [Flow Trace](#flow-trace "ƒ") in the review checkout.

#### 6. Check Response Freshness

- Inspect the staleness block on every response. When an index is behind, discard its measurements.
- Apply [Index Repository](#index-repository "ƒ") in the review checkout for the verified head, and confirm freshness.
- Apply [Change Surface](#change-surface "ƒ") again for any discarded surface using the same [base branch](#base-branch "○") in the review checkout.
- Apply [Symbol Context](#symbol-context "ƒ") again for each affected changed symbol in the review checkout.
- Apply [Flow Trace](#flow-trace "ƒ") again for each affected reported flow in the review checkout.

#### 7. Provide Current Measurements

Provide [Graph Measurements](#graph-measurements "●") only when current with the supplied head and meeting [Fields](#fields), or a freshness blocker.

### Index Status

Reports whether the repository is indexed, and how far behind the index sits.

#### 1. Index Status

**Acts on:** the checkout it runs in.

Run the following command using [Requested Revision](#requested-revision "○").

<big><pre>
gitnexus status
</pre></big>

#### 2. Provide Index Status

Provide [Index State](#index-state "●") to the requester.

### Index Repository

Indexes the repository, which an unindexed or behind repository needs before any measurement.

#### 1. Index Repository

**Acts on:** the checkout it runs in.

Run the following command using [Requested Revision](#requested-revision "○").

<big><pre>
gitnexus analyze
</pre></big>

#### 2. Provide Index Repository

Provide [Index State](#index-state "●") to the requester.

### Change Surface

Reports the symbols a pull request's diff touches and the flows they sit in, against the base branch.

#### 1. Change Surface

**Acts on:** the checkout it runs in.

- Run the following command using [Base Branch](#base-branch "○").

- `--base-ref` is the pull request's base, so the surface is the change rather than the branch's whole history.

<big><pre>
gitnexus detect-changes --scope compare --base-ref '[**&lt;base-branch&gt;**](#base-branch)'
</pre></big>

**Example:**

<big><pre>
gitnexus detect-changes --scope compare --base-ref main
</pre></big>

#### 2. Provide Change Surface

Provide [Changed Symbols](#changed-symbols "●") to the requester.

### Symbol Context

Reports one symbol's callers, its callees and the flows it sits in, each with the file it sits in.

#### 1. Symbol Context

**Acts on:** the checkout it runs in.

Run the following command using [Symbol Identity](#symbol-identity "○").

<big><pre>
gitnexus context '[**&lt;symbol-identity&gt;**](#symbol-identity)'
</pre></big>

**Example:**

<big><pre>
gitnexus context reserveRow
</pre></big>

#### 2. Provide Symbol Context

Provide [Symbol Relationships](#symbol-relationships "●") to the requester.

### Flow Trace

Reports one flow's symbols in step order, the structure a sequence diagram is drawn from.

#### 1. Flow Trace

**Acts on:** the checkout it runs in.

Run the following command using [Flow Identity](#flow-identity "○").

<big><pre>
gitnexus query --query '[**&lt;flow-identity&gt;**](#flow-identity)' --limit 1
</pre></big>

**Example:**

<big><pre>
gitnexus query --query "Queue Placement" --limit 1
</pre></big>

#### 2. Provide Flow Trace

Provide [Flow Traces](#flow-traces "●") to the requester.

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

### Review Checkout

The supplied checkout in which graph commands run.

### Requested Revision

The verified head commit supplied for measurement.

### Base Branch

The supplied comparison base branch.

### Symbol Identity

One symbol identity provided by the supplied change surface.

### Flow Identity

One flow identity provided by the supplied change surface.

### Graph Measurements

The measured revision, freshness, changed symbols, relationships and ordered flow traces, or a freshness blocker.

### Index State

The index status and indexed revision reported for the checkout.
