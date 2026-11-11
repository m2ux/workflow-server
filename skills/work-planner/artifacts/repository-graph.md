# Repository Graph

The indexed symbols, relationships and ordered flows for a repository revision.

## Operations

### Measure Repository Change

Current graph evidence for the supplied change.

#### 1. Read Index Status

Run [Index Status](#index-status "ƒ") in the [review checkout](#review-checkout).

#### 2. Refresh Absent or Stale Index

- If the repository is unindexed or behind [Requested Revision](#requested-revision):
- Run [Index Repository](#index-repository "ƒ") in the review checkout.
- Confirm freshness.

#### 3. Measure Change Surface

- Run [Merge Base](#merge-base "ƒ") in the review checkout for the requested revision and the supplied [base commit](#base-commit).
- Run [Change Surface](#change-surface "ƒ") in the review checkout against that comparison base.

#### 4. Measure Changed Symbols

For each changed symbol, Run [Symbol Context](#symbol-context "ƒ") in the review checkout.

#### 5. Measure Reported Flows

For each reported flow, Run [Flow Trace](#flow-trace "ƒ") in the review checkout.

#### 6. Check Response Freshness

Inspect the staleness block on every response.

##### When the Index Is Behind

- Discard that response’s measurements.
- Run [Index Repository](#index-repository "ƒ") in the review checkout for the verified head, and confirm freshness.
- Run [Change Surface](#change-surface "ƒ") again for any discarded surface against the same [comparison base](#comparison-base) in the review checkout.
- Run [Symbol Context](#symbol-context "ƒ") again for each affected changed symbol in the review checkout.
- Run [Flow Trace](#flow-trace "ƒ") again for each affected reported flow in the review checkout.

#### 7. Provide Current Measurements

Provide [Graph Measurements](#graph-measurements) only when current with the supplied head and meeting [Fields](#fields), or a freshness blocker.

## Commands

### Index Status

Report whether the repository is indexed and how far behind the index sits, and provide [Index State](#index-state "●") to the requester.

Compare the indexed commit with [Requested Revision](#requested-revision "○").

Run in the [Review Checkout](#review-checkout "○").

<big><pre>
gitnexus status
</pre></big>

### Index Repository

Index the repository and provide [Index State](#index-state "●") to the requester. An unindexed or behind repository needs indexing before any measurement.

It writes the index alone and no AGENTS.md, CLAUDE.md or skill file, so the review checkout stays clean and a later run can reuse it.

Compare the indexed commit with [Requested Revision](#requested-revision "○").

Run in the [Review Checkout](#review-checkout "○").

<big><pre>
gitnexus analyze --index-only
</pre></big>

### Merge Base

Fetch the base commit, print the commit the pull request's change starts from, and provide [Comparison Base](#comparison-base "●") to the requester.

The review head's fetch brings only the head's history, so a base that moved on after the project checkout's last fetch is fetched here.

Run in the [Review Checkout](#review-checkout "○").

<big><pre>
git fetch origin '[**&lt;base-commit&gt;**](#base-commit "○")' && &#92;
  git merge-base '[**&lt;requested-revision&gt;**](#requested-revision "○")' '[**&lt;base-commit&gt;**](#base-commit "○")'
</pre></big>

### Change Surface

Report the symbols touched by the pull request's diff and their flows against its comparison base, and provide [Changed Symbols](#changed-symbols "●") to the requester.

Run in the [Review Checkout](#review-checkout "○").

<big><pre>
gitnexus detect-changes --scope compare --base-ref '[**&lt;comparison-base&gt;**](#comparison-base "○")'
</pre></big>

### Symbol Context

Report one symbol's callers, callees and containing flows with their file locations, and provide [Symbol Relationships](#symbol-relationships "●") to the requester.

Run in the [Review Checkout](#review-checkout "○").

<big><pre>
gitnexus context '[**&lt;symbol-identity&gt;**](#symbol-identity "○")'
</pre></big>

### Flow Trace

Report one flow's symbols in step order and provide [Flow Traces](#flow-traces "●") to the requester. The sequence diagram is drawn from that ordered structure.

Run in the [Review Checkout](#review-checkout "○").

<big><pre>
gitnexus query --query '[**&lt;flow-identity&gt;**](#flow-identity "○")' --limit 1
</pre></big>

## Fields

### Revision

The graph identifies its worktree and indexed commit. Measurements describe the supplied pull request head and its difference from its [comparison base](#comparison-base).

### Freshness

Graph responses carry a JSON `staleness` block. A behind index is not current with the requested head; measurements from it are invalid.

### Changed Symbols

The surface identifies symbols touched by the diff and the flows containing them. It compares with the comparison base, so it holds the pull request's own change alone, whether its base branch has since moved on or the pull request has merged.

### Symbol Relationships

Each changed symbol has callers, callees, containing flows and file locations. Files group into component areas; their measured relationships determine edges between areas.

### Flow Traces

Each flow contains symbols in step order. Each `process_symbols` entry includes `step_index`, file and lines. Those ordered measurements supply sequence-diagram participants and interactions. A manually inferred call order does not establish a graph trace.

### Review Checkout

The supplied checkout in which graph commands run.

### Requested Revision

The verified head commit supplied for measurement.

### Base Commit

The pull request's base commit, `base.sha` in its [Pull Request Record](pull-request.md#pull-request-record). eg `1ec2a4745a6e`

### Comparison Base

The merge base of [Requested Revision](#requested-revision) and [Base Commit](#base-commit): the commit the pull request's change starts from. It stays fixed as the base branch moves on, through the pull request's own merge. eg `1ec2a4745a6e`

### Symbol Identity

One symbol identity provided by the supplied change surface. eg `reserveRow`

### Flow Identity

One flow identity provided by the supplied change surface. eg `Queue Placement`

### Graph Measurements

The measured revision, freshness, changed symbols, relationships and ordered flow traces, or a freshness blocker.

### Index State

The index status and indexed revision reported for the checkout.
