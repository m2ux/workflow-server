# Test Plan: [Feature Name]

**ADR:** [adr-feature-name](../architecture/adr-feature-name.md)
**Ticket:** [{TICKET_ID}](https://{JIRA_DOMAIN}/browse/{TICKET_ID})
**PR:** [#NNN](https://github.com/{REPO_OWNER}/{REPO_NAME}/pull/NNN)

---

## Overview

This test plan validates [brief description of what the feature/change does and why it matters].

Key changes validated:
1. [`PrimarySymbol`](../../path/to/file.rs#LNN) - [Description of what it does]
2. [`SecondarySymbol`](../../path/to/file.rs#LNN) - [Description of what it does]

---

## Test Cases

| <div style="width:120px">Test ID</div> | <div style="width:350px">Objective</div> | <div style="width:400px">Steps</div> | <div style="width:350px">Expected Result</div> | <div style="width:50px">Type</div> |
|---|---|---|---|---|
| [PR###-TC-01](../../path/to/test.rs#LNN) | Verify [specific behavior being tested] | 1. [Setup or precondition]  <br>2. [Action to perform]  <br>3. [Verification step] | [What should happen] | Unit |
| [PR###-TC-02](../../path/to/test.rs#LNN) | Verify [another behavior] | 1. [Step one]  <br>2. [Step two] | [Expected outcome] | Unit |
| PR###-TC-03 | Verify [manual test behavior] | 1. [Manual step one]  <br>2. [Manual step two] | [Expected outcome] | Manual |

---

## Running Tests

```bash
# Run all tests for the package
cargo test -p package-name --lib

# Run module-specific tests
cargo test -p package-name --lib module_name

# Run a specific test
cargo test -p package-name --lib test_name

# Verify build
cargo build -p package-name
```
