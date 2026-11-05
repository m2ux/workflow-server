# Review Finding

One evidenced problem and its proposed solution.

## Operations

### Populate Review Finding

One finding verified against its supplied source.

**Inputs:** [Finding Evidence](#finding-evidence).

**Outputs:** [Finding Result](#finding-result).

#### 1. Verify Supplied Problem

Verify the problem against the supplied source.

#### 2. Return Evidence Gaps

If evidence is missing or contradictory, return that finding for the caller to resolve.

#### 3. Populate Verified Finding

- Populate the finding with its source quotation.
- It must meet [Finding Content](#finding-content) and [Decision State](#decision-state).

#### 4. Return Finding Decision

Return the finding and any pending decision.

### Report Review Finding

The verified findings presented for resolution.

**Inputs:** [Finding Set](#finding-set).

**Outputs:** [Finding Result](#finding-result).

#### 1. Populate Verified Findings

- Apply [Populate Review Finding](#populate-review-finding) with the area, severity, problem, solution and source evidence.
- Resolve any evidence gap before reporting it.
- Group the returned findings by area.

#### 2. Resolve Pending Decisions

- Put each pending decision to the user, one question at a time.
- Wait for the answer.
- Record the confirmed answer on the finding, meeting [Decision State](#decision-state).
- Return each confirmed resolution to the caller for application to its selected issue kind. A pending decision returns without applying a change.

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
