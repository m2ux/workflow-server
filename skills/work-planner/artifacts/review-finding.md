# Review Finding

One evidenced problem and its proposed solution.

## Operations

### Report Review Finding

The verified findings presented for resolution.

#### 1. Populate Verified Findings

- For each item in [Finding Set](#finding-set):

- Verify the problem against the source in [Finding Evidence](#finding-evidence).

- If evidence is missing or contradictory, provide that finding for the caller to resolve.

- Populate the finding with its source quotation.
- It must meet [Finding Content](#finding-content) and [Decision State](#decision-state).

- Retain [Finding Result](#finding-result) with the finding and any pending decision.

##### Verified Finding Set

- Resolve any evidence gap before reporting a finding.
- After all items are verified, group the findings by area.

#### 2. Resolve Pending Decisions

- Put each pending decision to the user, one question at a time.
- Wait for the answer.
- Record the confirmed answer on the finding, meeting [Decision State](#decision-state).
- Provide [Finding Result](#finding-result) with each confirmed resolution for application to its selected issue kind. A pending decision is provided without applying a change.

## Fields

### Finding Content

Each finding has an area, severity, one problem/solution pair and a source quotation with file and line. The source establishes the stated problem. Findings are grouped by area when presented together.

### Decision State

A finding identifies whether it needs a user decision and records any supplied answer. An unanswered decision remains pending.

### Finding Evidence

The supplied area, severity, problem, proposed solution, source text and file:line, decision requirement and any confirmed answer.

### Finding Set

The supplied findings with their area, severity, problem, proposed solution and source evidence.

### Finding Result

The verified findings and their confirmed resolutions or pending decisions, retaining evidence gaps.
