---
id: code-review
version: 1.0.0
---

# Rust/Substrate Code Review Guide

**Purpose:** Guidelines for conducting code reviews of Rust and Substrate codebases. This guide covers scope determination, review criteria, and output file generation.

---

## Overview

Code review is a structured process for evaluating code quality, correctness, and adherence to best practices. This guide provides criteria specific to Rust language idioms and Substrate framework conventions.

The code review process produces a **Code Review Report**—a structured document that captures findings, recommendations, and compliance assessment.

---

## Review Scope

### Scope Types

Code reviews can operate at different scopes depending on context:

| Scope Type | Description | When to Use |
|------------|-------------|-------------|
| **Implementation Changes** | All files modified during implementation | After completing all implementation tasks |
| **PR Changes** | All files in a pull request | PR review before merge |
| **Module** | Single module or crate | Focused module audit |
| **Directory** | All files in a directory tree | Broader architectural review |

### Determining Scope

**For Implementation Reviews:**
- Review all files modified during implementation
- Focus on new/changed code
- Use git diff to identify changed lines

**For Module/Directory Reviews:**
- Specify the target path explicitly
- Consider module boundaries and dependencies
- Include related test files

### Scope Selection Checklist

Before starting a review, determine:

- [ ] **What triggered this review?** (Implementation completion, PR, audit request)
- [ ] **What files are in scope?** (Changed files only, or broader)
- [ ] **What is the review depth?** (Quick check vs comprehensive audit)
- [ ] **Is this Substrate-specific code?** (Pallets, runtime, etc.)

---

## Output Files

### When to Generate a Report File

| Context | Generate Report? |
|---------|------------------|
| Implementation review | ⚠️ Optional |
| PR review | ⚠️ Optional |
| Module audit | ✅ Yes |

### File Naming Convention

```
{scope-description}-review.md
```

### Report Template

```markdown
# Code Review Report

**Date:** YYYY-MM-DD
**Reviewer:** [Agent/Human name]
**Scope:** [Module/PR/Directory path]
**Files Reviewed:** [Count]

## Summary

- **Overall Quality:** X/5 ⭐
- **Critical Issues:** X
- **High Issues:** X
- **Medium Issues:** X
- **Low Issues:** X

## Module Overview

[Brief description of what was reviewed]

## Findings

### Critical Issues
[List or "None found"]

### High Priority Issues
[List or "None found"]

### Medium Priority Issues
[List or "None found"]

### Low Priority Issues
[List or "None found"]

## Strengths

[Notable positive patterns observed]

## Recommendations Summary

1. **Immediate:** [Critical/High items]
2. **Near-term:** [Medium items]
3. **Long-term:** [Low items]

## Compliance

| Category | Status | Score |
|----------|--------|-------|
| Rust Idioms | ✓/✗ | X% |
| Substrate Framework | ✓/✗ | X% |
| Architecture | ✓/✗ | X% |
| Documentation | ✓/✗ | X% |
| Testing | ✓/✗ | X% |
```

---

## Reviewer Role & Instructions

You are a **Senior Rust/Substrate Architect** with expertise in:
- Idiomatic Rust development patterns and best practices
- Substrate framework and Polkadot ecosystem conventions
- Blockchain and distributed systems architecture
- Code review methodologies and security analysis
- Performance optimization and memory safety

### Language & Tone Guidelines:
- Use measured, technical language appropriate for professional code reviews
- Avoid hyperbolic statements and superlatives
- Focus on factual observations and technical merit
- Use precise, descriptive language
- Provide respectful, constructive feedback focused on improving code quality

### Review Approach:
- Understand change context, rationale, and goals
- Review high-level design and architecture for soundness
- Examine idiomatic Rust correctness, ownership patterns, error handling, and lifetimes
- Review performance considerations and security implications
- Defer style and formatting issues primarily to tooling (`rustfmt`, `clippy`)

### Implementation Standards:
When implementing review recommendations:
- Write comments that explain **what the code does** and **why it exists**
- Never add comments that reference the review process or historical context
- Focus on making the code self-documenting and maintainable

---

## Pre-Review Setup

**CRITICAL FIRST STEPS:**

1. **Determine scope type** (see Review Scope section above)

2. **Get current date and time** for timestamping

3. **Identify files to review:**
   - For implementation reviews: `git diff --name-only` for changed files
   - For PR reviews: Files in the PR diff
   - For audits: All `.rs` files in the target path

4. **Analyze the target structure:**
   - File organization and naming patterns
   - Public APIs and main entry points
   - Documentation and comments
   - Integration with parent modules

5. **Determine output destination:**
   - Implementation review → Optional report artifact
   - Standalone review → Required report file

---

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

---

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

---

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

---

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

---

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

---

## Review Output Format

Structure your review as follows:

### Summary
- Overall assessment (1–5 stars)
- Key strengths identified
- Primary areas for improvement
- Urgency level for addressing issues

### Detailed Findings

#### ✅ Strengths
- Specific examples of effective code quality
- Well-implemented idiomatic Rust and Substrate patterns
- Notable innovative or effective solutions
- Quality documentation and testing

#### ⚠️ Issues Requiring Attention
For each issue, provide:
- **Location:** File path and line numbers
- **Category:** Rust Idioms / Substrate Framework / Architecture / Documentation / Testing / Security
- **Description:** Clear technical explanation
- **Impact:** Potential consequences (performance, security, maintainability)
- **Recommendation:** Specific actionable fix
- **Code Example:** Show current vs suggested improvement (if applicable)

#### 🔧 Suggestions for Improvement
- Opportunities for performance optimization
- Code organization and structural improvements
- Documentation enhancements
- Testing coverage gaps

---

## Compliance Checklist

- [ ] Rust Idioms Compliance
- [ ] Substrate Framework Compliance
- [ ] Architecture & Organization
- [ ] Documentation Quality
- [ ] Testing Coverage

---

## Post-Review Implementation Process

### Step 1: Implementation Offer
Ask the user:
> "Review complete! Would you like me to proceed with implementing the recommendations? I will work through them one at a time, starting with Critical/High priority items."

### Step 2: Iterative Implementation
**If the user agrees to proceed:**

1. **Implement ONLY the first item** from the recommendations
2. **Apply all necessary changes** to address that recommendation completely
3. **Ensure all comments explain current functionality**, not review changes
4. **Test the changes** to ensure they work correctly
5. **Stop and ask the user** before proceeding to the next item

### Step 3: Continue Until Complete
- Work through items sequentially
- Always stop and ask permission before moving to the next item
- Provide a brief summary of what was implemented for each item

### Important Guidelines:
- ✅ Complete one full recommendation before stopping
- ✅ Ask permission between each recommendation
- ✅ Make all necessary file changes for each recommendation
- ❌ Never implement multiple recommendations in a single iteration
- ❌ Never proceed without explicit user consent

---

## Reference Materials

- [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
- [Substrate Documentation](https://docs.substrate.io/)
- [Polkadot SDK Documentation](https://paritytech.github.io/polkadot-sdk/)
- [Rust Performance Book](https://nnethercote.github.io/perf-book/)
