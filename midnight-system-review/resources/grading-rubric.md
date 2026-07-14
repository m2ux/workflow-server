---
name: grading-rubric
description: The six-dimension grade tuple every finding carries — level definitions per dimension, category and validation-mode vocabularies, the accepted-issue threshold, and calibration anchors from real findings.
metadata:
  order: 3
---

# Finding Grading Rubric

Every finding candidate is graded on all six dimensions below, from these definitions — never intuitively. The tuple is complete or the finding does not pass the grade-tuple completeness gate. Grade first, disposition second: acceptance is a threshold applied to finished grades.

## The Grade Tuple

### 1. Evidence anchor

The concrete, re-checkable basis: a `file:line` location, a command invocation with its output, or a graph query result. A finding without a verifiable anchor cannot exceed low evidence confidence.

### 2. Risk / impact

What goes wrong in production if the finding is real, at its worst plausible severity.

| Level | Definition |
|-------|------------|
| high | Halts or corrupts consensus/execution, loses funds or cross-chain accounting state, or breaks validator compatibility |
| medium | Degrades a production guarantee — unpriced work, broken consumer contracts (indexer/metadata), release-integrity gaps — without direct halt or loss |
| low | Quality or hygiene concern with no near-term production consequence |

### 3. Evidence confidence

How strongly the gathered evidence supports the finding as stated.

| Level | Definition |
|-------|------------|
| high | The mechanism is directly demonstrated end-to-end at the anchor — the faulty path is exhibited, not inferred |
| medium | The mechanism is soundly inferred from source, but a step is unvalidated (often because a toolchain gate blocked execution-level confirmation) |
| low | Plausible but materially unconfirmed — anchor unverifiable, or the chain of inference has an untested link |

### 4. Production likelihood

How likely the faulty path actually executes in production.

| Level | Definition |
|-------|------------|
| high | On the default path — ordinary operation reaches it |
| medium | Reached under realistic but non-default conditions: upgrades, failures, edge configurations, adversarial-but-plausible inputs |
| low | Requires unusual coincidence of conditions |

### 5. Category

One of: `correctness` (wrong result on-chain), `integration` (cross-component contract broken — e.g. event/hash correlation, bridge accounting), `compatibility` (version/ABI/upgrade breakage), `performance` (unpriced or unbounded work), `operational` (release, automation, tooling integrity), `hygiene` (non-production quality).

### 6. Validation mode

How the evidence was obtained: `source trace` (P1/P2), `execution` (P5/P6), `hybrid` (source plus command/graph output, e.g. metadata comparison), or `blocked` (full validation needed an unavailable instrument — pairs with capped confidence and a recorded blocked validation).

## Accepted-Issue Threshold

A finding is **accepted** — able to move the verdict — when its evidence confidence is medium or high AND its anchor is verified. Below that it is an **observation**: reported, never blocking. Evidence-contradicted candidates are **dismissed** with the contradicting anchor recorded.

## Calibration Anchors

From the PR #1849 strict-run findings — grade against these:

- State-root emitted as transaction hash, breaking indexer correlation (`pallets/midnight-system/src/lib.rs`): risk high, confidence high, likelihood medium, integration, hybrid — accepted.
- New runtime cannot decode old binary's host response (`ledger/src/common/types.rs`): risk high, confidence high, likelihood medium, compatibility, hybrid — accepted.
- Bridge deletes accounting state after swallowed executor failure (`pallets/c2m-bridge/src/lib.rs`): risk high, confidence medium (failure injection not executable — blocked toolchain), likelihood medium, integration, hybrid — accepted.
- Benchmark covers ~1 MiB where configuration permits 50 MB churn (`pallets/midnight/src/benchmarking.rs`): risk medium, confidence medium, likelihood medium, performance, hybrid — accepted.
- Stale checked-in metadata needing rebuild, already known as release follow-up: non-blocking technical observation — reported as a review comment, not an accepted issue.
