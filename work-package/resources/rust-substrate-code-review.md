---
name: rust-substrate-code-review
description: Guidelines for conducting code reviews of Rust and Substrate codebases. Covers scope determination, review criteria, and report generation.
metadata:
  version: 1.1.0
  order: 16
  legacy_id: 16
---

# Rust/Substrate Code Review Guide

Produces a **Code Review Report** capturing findings, recommendations, and compliance assessment.

## Review Scope

| Scope Type | Description | When to Use |
|------------|-------------|-------------|
| **Implementation Changes** | All files modified during implementation | After completing all implementation tasks |
| **PR Changes** | All files in a pull request | PR review before merge |
| **Module** | Single module or crate | Focused module audit |
| **Directory** | All files in a directory tree | Broader architectural review |

For implementation reviews: review all files modified during implementation, focus on new/changed code, use git diff to identify changed lines. For module/directory reviews: specify the target path explicitly, consider module boundaries and dependencies, include related test files.

## Output Files

Report file: optional for implementation and PR reviews; required for module audits. Naming: `{scope-description}-review.md`.

### Report Template

The report header links back to this guide so readers know the methodology used.

```markdown
# Code Review Report

> code-review · [Module/PR/Directory path] · YYYY-MM-DD · [N] files reviewed · methodology: [Rust/Substrate Code Review](https://github.com/m2ux/workflow-server/blob/workflows/work-package/resources/rust-substrate-code-review.md)

## Summary

**Overall Quality:** X/5 — Critical: X · High: X · Medium: X · Low: X

## Module Overview

[Brief description of what was reviewed]

## Findings

[One subsection per severity — Critical / High / Medium / Low. Omit severity levels with no findings; if there are no findings at all, state that in one line.]

### [Severity] Issues
[List]

## Strengths

[Notable positive patterns observed]

## Recommendations Summary

1. **Immediate:** [Critical/High items]
2. **Near-term:** [Medium items]
3. **Long-term:** [Low items]

## Compliance

[Exception-only: if all 5 categories (Rust Idioms, Substrate Framework, Architecture, Documentation, Testing) pass, state "All 5 compliance categories met." in one line. Otherwise list rows only for divergent categories:]

| Category | Status | Score |
|----------|--------|-------|
| [Divergent category] | ✗ | X% |
```

## Reviewer Role & Instructions

You are a **Senior Rust/Substrate Architect** with expertise in: idiomatic Rust patterns, Substrate framework and Polkadot ecosystem conventions, blockchain and distributed systems architecture, code review methodology and security analysis, performance optimization and memory safety.

Language & tone: measured, technical, professional; no hyperbole or superlatives; factual observations and technical merit; precise, descriptive language; respectful, constructive feedback focused on improving code quality.

Review approach:
- Understand change context, rationale, and goals
- Review high-level design and architecture for soundness
- Examine idiomatic Rust correctness, ownership patterns, error handling, and lifetimes
- Review performance considerations and security implications
- Defer style and formatting issues primarily to tooling (`rustfmt`, `clippy`)

When implementing review recommendations: write comments that explain what the code does and why it exists; never add comments referencing the review process or historical context; make the code self-documenting and maintainable.

## Pre-Review Setup

1. **Determine scope type** (see Review Scope): what triggered the review, which files are in scope, review depth (quick check vs comprehensive audit), whether it is Substrate-specific code (pallets, runtime, etc.)
2. **Get current date and time** for timestamping
3. **Identify files to review:** implementation reviews → `git diff --name-only`; PR reviews → files in the PR diff; audits → all `.rs` files in the target path
4. **Analyze the target structure:** file organization and naming patterns, public APIs and main entry points, documentation and comments, integration with parent modules
5. **Determine output destination:** implementation review → optional report artifact; standalone review → required report file

## Review Criteria

### 1. Rust Language Idioms & Best Practices

**Ownership & Borrowing:**
- [ ] Appropriate use of owned vs borrowed types (`String` vs `&str`, `Vec<T>` vs `&[T]`)
- [ ] Minimal cloning and unnecessary allocations; scrutinize `clone()` usage
- [ ] Proper lifetime annotations where required
- [ ] Smart pointer usage (`Rc`, `Arc`, `Box`) only when appropriate

**Error Handling:**
- [ ] Consistent use of `Result<T, E>` for fallible operations
- [ ] Appropriate error types (custom errors vs standard library)
- [ ] Proper error propagation using `?` operator
- [ ] Meaningful error messages and contextual information

**Type System & Generics:**
- [ ] Appropriate use of traits vs concrete types
- [ ] Generic constraints and bounds correctly applied
- [ ] Use of associated types vs generic type parameters where appropriate
- [ ] Phantom types where applicable for zero-cost abstractions

**Pattern Matching & Control Flow:**
- [ ] Exhaustive pattern matching
- [ ] Use of `if let` vs `match` appropriately for clarity
- [ ] Iterator patterns favored over imperative loops
- [ ] Early returns and guard clauses applied for readability

**Memory Safety & Performance:**
- [ ] Zero-cost abstractions used effectively
- [ ] Appropriate collection types and optimal sizing
- [ ] Lazy evaluation where beneficial for performance
- [ ] CPU cache-friendly data structures considered

**Unsafe Code:**
- [ ] All `unsafe` blocks include a **documented safety contract**
- [ ] Justify necessity of `unsafe`; prefer safe Rust alternatives
- [ ] Verify testing and audit coverage of unsafe code paths

### 2. Substrate Framework Compliance

**Pallet Structure:**
- [ ] Correct pallet configuration traits
- [ ] Storage item definitions and types well defined
- [ ] Dispatchable functions with appropriate origin validation
- [ ] Clear event and error definitions
- [ ] Genesis configuration implemented if needed

**Runtime Integration:**
- [ ] Proper trait implementations as per Substrate conventions
- [ ] Benchmarking setup present and accurate
- [ ] Migration patterns for storage upgrades correctly handled
- [ ] Integration with other pallets correctly modularized

**Substrate Types & Traits:**
- [ ] Use of substrate-specific types consistent
- [ ] Proper codec implementations (`Encode`, `Decode`) present
- [ ] Scale info included for runtime metadata generation
- [ ] Runtime API implementations where applicable

**Security Considerations:**
- [ ] Strict origin validation in all dispatchable functions
- [ ] Accurate and reviewed weight calculations
- [ ] Protection against overflow/underflow vulnerabilities
- [ ] Checks for denial-of-service vectors

### 3. Architecture & Module Structure

**File & Folder Organization:**
- [ ] Logical hierarchical structure of modules
- [ ] Files kept to reasonable size (preferably < 500 lines)
- [ ] Clear separation of concerns among files and modules
- [ ] Public vs private API boundaries clearly defined

**Module Design:**
- [ ] Adherence to single responsibility principle
- [ ] Appropriate abstractions and clear interfaces
- [ ] Use of dependency injection or modular patterns for testability
- [ ] Consider testability in structure and design

**Code Organization:**
- [ ] Related functionality grouped together logically
- [ ] Centralized constants and configuration
- [ ] Helper functions and utilities appropriately encapsulated
- [ ] Clear separation of integration vs unit tests

### 4. Documentation Quality & Style

**Documentation Coverage:**
- [ ] All public APIs documented with `///` comments
- [ ] Module-level documentation using `//!` comments
- [ ] Clear explanations for complex algorithms and logic
- [ ] Usage examples included where appropriate

**Documentation Style:**
- [ ] Concise but complete descriptions
- [ ] Proper grammar and professional tone
- [ ] Consistent terminology throughout
- [ ] Links to relevant external documentation/resources

**Code Comments:**
- [ ] Inline comments explain *why* something is done, not *what*
- [ ] Complex logic sections are well documented
- [ ] TODO/FIXME comments contain context and clear instructions
- [ ] Comment density is balanced

### 5. Testing & Quality Assurance

**Test Coverage:**
- [ ] Unit tests for all public functions and critical paths
- [ ] Integration tests covering interactions across modules/pallets
- [ ] Edge case and error condition testing included
- [ ] Performance and benchmarking tests where applicable

**Test Quality:**
- [ ] Tests have clear, descriptive names and are well organized
- [ ] Proper use of test data and fixtures
- [ ] Mocks and dependency isolation used appropriately
- [ ] Tests are readable and maintainable with minimal duplication

## Review Output Format

**Summary:** overall assessment (1-5 stars), key strengths, primary areas for improvement, urgency level for addressing issues.

**Strengths:** specific examples of effective code quality, well-implemented idiomatic Rust and Substrate patterns, notable solutions, quality documentation and testing.

**Issues requiring attention** — for each issue provide:
- **Location:** File path and line numbers
- **Category:** Rust Idioms / Substrate Framework / Architecture / Documentation / Testing / Security
- **Description:** Clear technical explanation
- **Impact:** Potential consequences (performance, security, maintainability)
- **Recommendation:** Specific actionable fix
- **Code Example:** Current vs suggested improvement (if applicable)

**Suggestions for improvement:** performance optimization opportunities, code organization and structural improvements, documentation enhancements, testing coverage gaps.

## Reference Materials

- [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
- [Substrate Documentation](https://docs.substrate.io/)
- [Polkadot SDK Documentation](https://paritytech.github.io/polkadot-sdk/)
- [Rust Performance Book](https://nnethercote.github.io/perf-book/)
