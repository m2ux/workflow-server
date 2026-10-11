---
name: test-plan
description: Test plan templates and test-design principles.
metadata:
  version: 1.2.1
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

Required sections, in order: header link line (ADR — a relative path where the record lives in the same repo — Ticket, PR), Overview, Test Cases, Acceptance Criteria Matrix (when requirements exist), Running Tests.

## Rules

- **Section set** — the sections and their order are [Test Plan Structure](#test-plan-structure)'s. The Overview lists only symbols central to the change, not every modified function, one line each.
- **One table for all test types** — never split by type. Column widths follow the [Templates](#templates).
- **Test ID format** — `PR<number>-TC-<sequence>` (01, 02, …), hyperlinked to the test function's definition line (`#L<line>`, not the first assertion). Manual tests (RPC endpoints, network behaviour, UI verification) carry plain-text non-hyperlinked IDs, having no source to link. A temporarily disabled test stays in the same table with a `**` suffix after its ID — suffix, not prefix, so the link keeps working — plus a `> [!NOTE]` below the table stating the reason and the specific re-enablement condition. No separate table for ignored tests.
- **Test case content** — objectives open with "Verify…", never a vague "test the feature". Steps are numbered, atomic and verifiable, separated with `  <br>` (two trailing spaces then `<br>`, for cross-renderer compatibility). Type is one of Unit (isolated single function or method behaviour), Integration (component interactions), E2E (complete user workflows), Performance (load and latency validation), or Manual.
- **Acceptance matrix** — one row per requirement, or per acceptance criterion where a requirement has several, referencing tests by their `PR###-TC-##` IDs. Every requirement maps to at least one test case, and any gap is flagged.
- **Content boundaries** — the plan covers validation only: no ADR content and no implementation detail. Links are inline, so there is no References section, and planning-artifact content and validation results are linked rather than inlined. Running Tests commands are copy-pasteable and cover the all-tests, module and specific-test scopes, plus build verification where that is relevant.
- **Promoted naming and storage** — a plan promoted into project docs takes the file name `test-plan-<kebab-case-name>.md`, matching the ADR name where one exists, stored alongside the ADR or in the tests documentation folder.
- **Line budget:** ~120 lines. The acceptance matrix is the payload; test bodies live in the suite.
