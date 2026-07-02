---
name: test-plan
description: Guidelines for creating well-structured test plans that document test cases, traceability, and validation criteria for work packages.
metadata:
  version: 1.1.0
  order: 11
  legacy_id: 11
---


# Test Plan Creation Guide

Test plans document *what* will be tested and *why*, with direct traceability to source code. They complement the ADR: the ADR records what was decided and why; the test plan records how those decisions are validated. Like the ADR (Proposed → Accepted), the plan starts as a placeholder and becomes complete after implementation.

## TDD Principles for Test Design

Apply before writing test cases:

| Principle | Application |
|-----------|-------------|
| **Test List** | List all test objectives in the initial plan, before implementation |
| **0-1-N Pattern** | Include empty, single, and multiple item scenarios |
| **Boundary Values** | Cover min/max values, empty inputs, edge cases |
| **Four-Phase Test** | Arrange-Act-Assert: clear setup, action, verification per case |
| **FIRST** | Fast, Independent, Repeatable, Self-validating, Timely |

Ensure coverage across: happy path, edge cases, error handling, state transitions, integration points.

## Templates

**Template (Initial):**

```markdown
# Test Plan: [Feature Name]

> **ADR:** `adr-feature-name` · **Ticket:** [TICKET-ID](ticket-url) · **PR:** [#NNN](pr-url)

## Overview

This test plan validates [brief description of what the feature/change does].

Key changes to validate:
1. `PrimarySymbol` - [What it does]
2. `SecondarySymbol` - [What it does]

## Planned Test Cases

| Test ID | Objective | Type |
|---------|-----------|------|
| PR###-TC-01 | Verify [behavior 1] | Unit |
| PR###-TC-02 | Verify [behavior 2] | Unit |

*Detailed steps, expected results, and source links will be added after implementation.*

## Running Tests

*Commands will be added after implementation.*
```

After implementation, update the plan with: hyperlinked Test IDs pointing to actual test locations, detailed steps reflecting the actual implementation, verified Running Tests commands, and hyperlinked symbols in the Overview.

**Template (Final):**

```markdown
# Test Plan: [Feature Name]

> **ADR:** `adr-feature-name` · **Ticket:** [TICKET-ID](ticket-url) · **PR:** [#NNN](pr-url)

## Overview

This test plan validates [brief description of what the feature/change does and why it matters].

Key changes validated:
1. [`PrimarySymbol`](path/to/file#LNN) - [What it does]
2. [`SecondarySymbol`](path/to/file#LNN) - [What it does]

## Test Cases

| <div style="width:120px">Test ID</div> | <div style="width:350px">Objective</div> | <div style="width:400px">Steps</div> | <div style="width:350px">Expected Result</div> | <div style="width:50px">Type</div> |
|---|---|---|---|---|
| [PR###-TC-01](path/to/test-file#LNN) | Verify [specific behavior being tested] | 1. [Setup or precondition]  <br>2. [Action to perform]  <br>3. [Verification step] | [What should happen] | Unit |
| PR###-TC-02 | Verify [manual test behavior] | 1. [Manual step one]  <br>2. [Manual step two] | [Expected outcome] | Manual |

## Acceptance Criteria Matrix

[Omit this section when the work package has no formal requirements (simple bug fixes, doc-only changes).]

| Requirement | Acceptance Criterion | Verifying Test Cases |
|-------------|----------------------|----------------------|
| REQ-01 | [What must hold true] | PR###-TC-01, PR###-TC-02 |

## Running Tests

\`\`\`bash
# Run all tests (adapt commands for your project's language/framework)
npm test                    # JavaScript/TypeScript
cargo test --lib            # Rust
pytest                      # Python
go test ./...               # Go

# Run specific test
npm test -- --grep "name"   # JavaScript/TypeScript
cargo test test_name        # Rust
pytest -k "test_name"       # Python
\`\`\`
```

## Test Plan Structure

Required sections, in order: header link line (ADR, Ticket, PR), Overview, Test Cases, Acceptance Criteria Matrix (when requirements exist), Running Tests.

## Rules

Header and Overview:
- Header is a single blockquote line (lean-header) with ADR, Ticket, and PR links; use relative paths for ADR links (same repo).
- Overview lists only symbols central to the change (not every modified function), one line each, hyperlinked to their definition via relative path with `#L<line>` anchor.

Test Cases table:
- Single unified table for all test types — never split by type.
- Fixed column widths via `<div style="width:...px">`: Test ID 120px, Objective 350px, Steps 400px, Expected Result 350px, Type 50px.
- Test ID format `PR<number>-TC-<sequence>` (01, 02, ...), hyperlinked to the test function definition line (`#L<line>`, not the first assertion); verify links before committing.
- Objectives start with "Verify..." — never vague ("test the feature").
- Steps are numbered, atomic, and verifiable, separated with `  <br>` (two trailing spaces + `<br>` for cross-renderer compatibility).
- Type is one of: Unit, Integration, E2E, Performance, Manual.
- Manual tests (RPC endpoints, network behavior, UI verification) use plain-text non-hyperlinked Test IDs — no source to link.
- Temporarily disabled tests stay in the same table with a `**` suffix after the Test ID (suffix, not prefix, to keep the link working), plus a `> [!NOTE]` below the table stating the reason and the specific re-enablement condition. No separate table for ignored tests.

Acceptance Criteria Matrix:
- One row per requirement (or per acceptance criterion when a requirement has several); reference tests by their `PR###-TC-##` IDs.
- Every requirement maps to at least one test case; flag any gaps.

Content boundaries:
- Don't duplicate ADR content or implementation details — the plan covers validation only.
- No References section (links are inline); don't inline planning-artifact content or validation results — link the source artifact instead (single-source-and-link).
- Running Tests commands must be copy-pasteable, covering all-tests and specific-test scopes; include build verification if relevant.

## Naming and Storage

- File name: `test-plan-<kebab-case-name>.md`, matching the ADR name when possible (e.g. `test-plan-user-authentication.md`).
- Store alongside the corresponding ADR or in a dedicated tests documentation folder.
- The PR description links to the test plan on its artifact link line.
