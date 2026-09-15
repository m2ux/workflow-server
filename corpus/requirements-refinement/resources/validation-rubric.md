---
name: validation-rubric
description: Validation checks and the severity and type categorization that labels each issue.
metadata:
  order: 3
---

# Validation Rubric

The checks applied to an updated specification and the scheme for categorizing each issue.

## Checks

### Structure
- All canonical sections are present and correctly ordered.
- Requirement entries conform to [Requirement Entry Format](./specification-protocol.md#requirement-entry-format).
- Markdown syntax is well-formed.

### Identifiers
- Every requirement and source identifier is unique.
- New identifiers fall in the correct category per [Identifier Schemes](./specification-protocol.md#identifier-schemes).
- Non-sequential identifiers are expected and are **not** a failure.

### Content
- Requirement statements are atomic, testable, and use `SHALL` / `SHOULD` / `MAY` as [Requirement Entry Format](./specification-protocol.md#requirement-entry-format) requires.
- Every requirement carries a complete rationale and at least one source reference.
- Status values are drawn from [Status Conventions](./specification-protocol.md#status-conventions); newly added requirements are `pending`.

### Consistency
- Source references resolve to entries listed in section 2 (Requirements Sources) and conform to [Source Reference Format](./specification-protocol.md#source-reference-format).
- No two requirements contradict one another; duplicates are flagged.

### Source Coverage
- Every normative statement in every source — a `SHALL`/`MUST`/`SHOULD`/`MAY` obligation, constraint, or rule — maps to at least one requirement in the specification. A set is covered only when each of its documents is.
- The source-coverage matrix from the analysis is the reference; a matrix row marked normative with no covering requirement is a coverage gap.
- A coverage gap is a **correctable** issue (type `content`): the verdict is `passed` only when conformance holds **and** source coverage is complete.

## Issue Categorization

Each issue is tagged with a severity and a type:

| Field | Values |
|-------|--------|
| severity | `critical`, `high`, `medium`, `low` |
| type | `irreconcilable`, `structure`, `content`, `syntax` |

**Critical / irreconcilable** issues require manual intervention:
- Fundamental requirement conflicts or contradictions.
- Essential requirement information that cannot be inferred.
- Structural damage that breaks document integrity.
- Source-traceability problems that cannot be resolved automatically.

**Correctable** issues can be completed from available context:
- Markdown and formatting errors.
- Minor wording improvements.
- Requirement-identifier collisions.
- Incomplete rationales that can be completed from available context.

## Verdict

- **passed** — no critical and no correctable issues.
- **correctable** — one or more correctable issues, no critical issues.
- **critical** — one or more critical or irreconcilable issues.
