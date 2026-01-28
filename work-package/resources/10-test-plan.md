---
id: test-plan
version: 1.0.0
---

# Test Plan Creation Guide

**Purpose:** Guidelines for creating well-structured test plans that document test cases, traceability, and validation criteria for work packages.

---

## Overview

Test plans are lightweight documents that accompany ADRs and PRs, providing structured documentation of how changes will be validated. They bridge the gap between design decisions and implementation verification.

> **Key Insight:** Test plans document *what* will be tested and *why*, with direct traceability to source code. They serve as both verification artifacts and living documentation.

### Test Plans Complement ADRs

| ADR Documents | Test Plan Documents |
|---------------|---------------------|
| What was decided and why | How decisions are validated |
| Requirements and constraints | Test cases that verify requirements |
| Trade-offs between options | Expected behaviors and edge cases |
| Design rationale | Traceability to implementation |

---

## When to Write a Test Plan

**Write a test plan when:**
- Implementing a feature with multiple testable behaviors
- Making changes that require regression testing
- The ADR has specific "Confirmation" criteria to validate
- Complex logic requires documented test coverage
- Changes affect multiple components or systems

**Skip a formal test plan when:**
- Simple bug fix with obvious test case
- Documentation-only changes
- Single test adequately covers the change
- Refactoring with existing test coverage

---

## TDD Principles for Test Design

Before writing test cases, apply these TDD principles and patterns to ensure comprehensive test coverage.

### Key Principles to Apply

| Principle | Description | Application |
|-----------|-------------|-------------|
| **Test List** | Plan tests before implementation | List all test objectives in the initial test plan |
| **0-1-N Pattern** | Test zero, one, and many cases | Include empty, single, and multiple item scenarios |
| **Boundary Values** | Test edges and limits | Cover min/max values, empty inputs, edge cases |
| **Four-Phase Test** | Arrange-Act-Assert structure | Structure each test case with clear setup, action, verification |
| **FIRST Principles** | Fast, Independent, Repeatable, Self-validating, Timely | Design tests that run quickly and independently |

### Test Categories to Consider

When planning tests, ensure coverage across these categories:

1. **Happy Path** - Normal, expected behavior
2. **Edge Cases** - Boundary conditions and limits
3. **Error Handling** - Invalid inputs, failure scenarios
4. **State Transitions** - Changes between valid states
5. **Integration Points** - Component interactions

---

## Test Plan Lifecycle

Test plans evolve through two phases:

### Phase 1: Initial Placeholder (At PR Creation)

When the PR is created with the ADR, create a **minimal placeholder** test plan. This documents *what will be tested* without implementation details (which don't exist yet).

**Initial test plan includes:**
- Header with ADR/Ticket/PR links
- Overview describing what will be validated
- Planned test cases (objectives only, no source links)
- Empty or placeholder Running Tests section

**Initial test plan does NOT include:**
- Hyperlinks to source code (tests don't exist yet)
- Specific line numbers
- Detailed steps (implementation-dependent)

**Template:**

```markdown
# Test Plan: [Feature Name]

**ADR:** [adr-feature-name](../architecture/adr-feature-name.md)
**Ticket:** [TICKET-ID](ticket-url)
**PR:** [#NNN](pr-url)

---

## Overview

This test plan validates [brief description of what the feature/change does].

Key changes to validate:
1. `PrimarySymbol` - [Description of what it does]
2. `SecondarySymbol` - [Description of what it does]

---

## Planned Test Cases

| Test ID | Objective | Type |
|---------|-----------|------|
| PR###-TC-01 | Verify [behavior 1] | Unit |
| PR###-TC-02 | Verify [behavior 2] | Unit |
| PR###-TC-03 | Verify [behavior 3] | Unit |

*Detailed steps, expected results, and source links will be added after implementation.*

---

## Running Tests

*Commands will be added after implementation.*
```

### Phase 2: Final Test Plan (After Implementation)

After implementation is complete, update the test plan with:
- Hyperlinked Test IDs pointing to actual test locations
- Detailed steps reflecting actual test implementation
- Verified Running Tests commands
- Hyperlinked symbols in Overview

> **Key Insight:** Like the ADR (which starts as "Proposed" and becomes "Accepted"), the test plan starts as a placeholder and becomes complete after implementation.

**Template:**

```markdown
# Test Plan: [Feature Name]

**ADR:** [adr-feature-name](../architecture/adr-feature-name.md)
**Ticket:** [TICKET-ID](ticket-url)
**PR:** [#NNN](pr-url)

---

## Overview

This test plan validates [brief description of what the feature/change does and why it matters].

Key changes validated:
1. [`PrimarySymbol`](path/to/file#LNN) - [Description of what it does]
2. [`SecondarySymbol`](path/to/file#LNN) - [Description of what it does]

---

## Test Cases

| <div style="width:120px">Test ID</div> | <div style="width:350px">Objective</div> | <div style="width:400px">Steps</div> | <div style="width:350px">Expected Result</div> | <div style="width:50px">Type</div> |
|---|---|---|---|---|
| [PR###-TC-01](path/to/test-file#LNN) | Verify [specific behavior being tested] | 1. [Setup or precondition]  <br>2. [Action to perform]  <br>3. [Verification step] | [What should happen] | Unit |
| [PR###-TC-02](path/to/test-file#LNN) | Verify [another behavior] | 1. [Step one]  <br>2. [Step two] | [Expected outcome] | Unit |
| PR###-TC-03 | Verify [manual test behavior] | 1. [Manual step one]  <br>2. [Manual step two] | [Expected outcome] | Manual |

---

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

---

## Test Plan Structure

### Required Sections

```markdown
# Test Plan: [Descriptive Title]

**ADR:** [Link to ADR]
**Ticket:** [Link to ticket]
**PR:** [Link to PR]

---

## Overview

[Brief description of what is being tested]

Key changes validated:
1. [Hyperlinked symbol] - [What it does]
2. [Hyperlinked symbol] - [What it does]

---

## Test Cases

[Table with Test ID, Objective, Steps, Expected Result, Type]

---

## Running Tests

[Commands to execute tests]
```

---

## Section Guidelines

### Header and Links

Always include links to related artifacts at the top:

```markdown
# Test Plan: Feature Name

**ADR:** [adr-feature-name](../architecture/adr-feature-name.md)
**Ticket:** [TICKET-ID](ticket-url)
**PR:** [#NNN](pr-url)
```

**Tips:**
- Use relative paths for ADR links (they're in the same repo)
- Include all three links when available
- Keep on separate lines for readability

### Overview

The overview should describe what is being tested and list key changes with hyperlinks to source code:

```markdown
## Overview

This test plan validates [brief description of what the feature/change does].

Key changes validated:
1. [`SymbolName`](path/to/file#L42) - [What this symbol does]
2. [`AnotherSymbol`](path/to/file#L100) - [What this symbol does]
```

**Tips:**
- Link symbols directly to their definition using `#L<line>` anchors
- Use relative paths from the test plan location
- Keep descriptions concise - one line per symbol
- Only list symbols central to the change, not every modified function

### Test Cases Table

Use a table format with fixed column widths to prevent wrapping:

```markdown
## Test Cases

| <div style="width:120px">Test ID</div> | <div style="width:350px">Objective</div> | <div style="width:400px">Steps</div> | <div style="width:350px">Expected Result</div> | <div style="width:50px">Type</div> |
|---|---|---|---|---|
| [PR###-TC-01](path/to/test-file#L42) | Verify [behavior] | 1. Step one  <br>2. Step two | Expected outcome | Unit |
```

#### Column Specifications

| Column | Width | Content |
|--------|-------|---------|
| Test ID | 120px | Hyperlinked ID pointing to test source location |
| Objective | 350px | What the test verifies (start with "Verify...") |
| Steps | 400px | Numbered steps with `  <br>` for line breaks |
| Expected Result | 350px | What should happen when test passes |
| Type | 50px | Unit, Integration, E2E, or Performance |

#### Test ID Format

Test IDs should be hyperlinks to the exact line in source code:

```markdown
[PR###-TC-01](path/to/test-file#L78)
```

**Format:** `PR<number>-TC-<sequence>`
- `PR###` - The PR number
- `TC` - Test Case
- `##` - Sequential number (01, 02, 03...)

**Tips:**
- Link to the test function definition, not the first assertion
- Use `#L<line>` to target the specific line
- Verify links work before committing

#### Steps Column Formatting

Use `  <br>` (two spaces + `<br>` tag) to force line breaks between steps:

```markdown
1. First step  <br>2. Second step  <br>3. Third step
```

**Tips:**
- Number each step
- Keep steps atomic and verifiable
- Two trailing spaces before `<br>` ensure compatibility across renderers

#### Temporarily Disabled Tests

Tests that are temporarily ignored (e.g., pending fixture regeneration, external dependencies) should be included in the main table with `**` after the Test ID. Add a note below the table explaining the marker:

```markdown
| [PR###-TC-09](path/to/test-file#L455)** | Verify behavior X | 1. Step one  <br>2. Step two | Expected outcome | Unit |

> [!NOTE]
> **\*\*** Tests marked with ** are temporarily ignored pending [reason]. These will be re-enabled once [condition].
```

**Tips:**
- Keep disabled tests in the same table for visibility
- Use `**` suffix (not prefix) to maintain link functionality
- Provide specific re-enablement conditions in the note
- Don't create a separate table for ignored tests

#### Test Types

All test cases—regardless of type—belong in a **single unified table**. Do not create separate tables for different test types.

| Type | Description | When to Use |
|------|-------------|-------------|
| Unit | Tests isolated component behavior | Single function/method testing |
| Integration | Tests component interactions | Multiple components working together |
| E2E | Tests complete user workflows | Full system behavior |
| Performance | Validates performance criteria | Latency, throughput requirements |
| Manual | Tests requiring human execution | RPC endpoints, network behavior, UI verification |

**Note:** Manual tests do not have hyperlinked Test IDs (no source code to link to). Use plain text IDs for manual test cases.

### Running Tests

Provide commands to execute the tests documented in the plan:

```markdown
## Running Tests

\`\`\`bash
# Run all tests (adapt for your project)
npm test                    # JavaScript/TypeScript
cargo test --lib            # Rust
pytest                      # Python
go test ./...               # Go

# Run specific test by name
npm test -- --grep "name"   # JavaScript/TypeScript
cargo test test_name        # Rust
pytest -k "test_name"       # Python
\`\`\`
```

**Tips:**
- Include commands for different scopes (all, module, specific)
- Use comments to explain each command
- Include build verification if relevant

---

## Naming and Storage

### File Naming

```
test-plan-descriptive-name.md
```

- Use `test-plan-` prefix followed by kebab-case descriptive name
- Match the ADR name when possible for easy pairing
- Examples: `test-plan-user-authentication.md`, `test-plan-payment-processing.md`

### Storage Location

Store test plans alongside their corresponding ADRs or in a dedicated tests documentation folder.

---

## Relationship to Other Artifacts

### Test Plan ↔ ADR

| ADR Section | Test Plan Relationship |
|-------------|------------------------|
| Confirmation | Test cases validate these criteria |
| Decision | Tests verify the chosen option works |
| Context | Tests cover scenarios from the context |

### Test Plan ↔ PR

The PR description links to the test plan:

```markdown
🎫 [Ticket](link)  📐 [ADR](link)  🧪 [Test Plan](link)
```

### Test Plan ↔ Source Code

Test IDs hyperlink directly to test implementations:
- Enables one-click navigation from documentation to code
- Provides traceability for auditing and review
- Links update if tests move (when regenerating the plan)

---

## Writing Style

### Do

- ✅ Use "Verify..." to start objectives
- ✅ Make steps atomic and numbered
- ✅ Link all test IDs to source code
- ✅ Link symbolic references in Overview to definitions
- ✅ Include commands to run the tests
- ✅ Keep the table scannable with fixed widths

### Don't

- ❌ Duplicate information from the ADR
- ❌ Include implementation details (that's in the ADR and code)
- ❌ Use vague objectives ("test the feature")
- ❌ Skip line numbers in hyperlinks
- ❌ Add redundant References section (links are inline)
- ❌ Reference gitignored planning artifacts
- ❌ Split test cases across multiple tables (use a single unified table)

---

## Examples

### Good Overview Section

```markdown
## Overview

This test plan validates the feature implementation, ensuring all requirements are met.

Key changes validated:
1. [`PrimaryComponent`](path/to/file#L34) - Core functionality implementation
2. [`MockProvider`](path/to/file#L48) - Maintains backward compatibility
3. [`IntegrationPoint`](path/to/file#L100) - External integration works correctly
```

### Good Test Case Row

```markdown
| [PR###-TC-01](path/to/test-file#L78) | Verify component returns expected default value | 1. Call `Component.getDefaultValue()`  <br>2. Verify result matches expected | Returns expected default value | Unit |
```

### Bad Test Case Row

```markdown
| TC-01 | Test the provider | Do the test | It works | Test |
```

**Problems:**
- No hyperlink on Test ID
- Vague objective
- No specific steps
- Non-descriptive expected result
- Invalid test type

---

## Checklist

Before submitting a test plan, verify:

### Required Elements
- [ ] Title clearly describes what is being tested
- [ ] ADR, Ticket, and PR links are present
- [ ] Overview describes the feature/change being validated
- [ ] Key changes are listed with hyperlinks to source code
- [ ] Test cases table uses correct column format
- [ ] All Test IDs are hyperlinks to test source locations
- [ ] Steps use `  <br>` for line breaks
- [ ] Test types are valid (Unit/Integration/E2E/Performance/Manual)
- [ ] All test cases are in a single unified table (no separate tables by type)
- [ ] Running Tests section includes executable commands

### Traceability
- [ ] Test plan name matches ADR name
- [ ] All test IDs follow `PR###-TC-##` format
- [ ] Hyperlinks point to correct line numbers
- [ ] Symbolic references in Overview link to definitions
- [ ] Temporarily disabled tests use `**` suffix with explanatory note

### Format & Style
- [ ] Table uses fixed column widths
- [ ] No redundant References section
- [ ] No references to gitignored paths
- [ ] Commands are copy-pasteable

---

## Related Guides

- [Architecture Review Guide](14-architecture-review.md)
- [Complete Guide](20-complete-wp.md)
- [Task Completion Review Guide](13-task-completion-review.md)
