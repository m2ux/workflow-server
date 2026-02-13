---
id: test-review
version: 1.0.0
---

# Test Suite Review Guide

**Purpose:** Guidelines for reviewing and evaluating test suites. This guide covers test quality assessment, coverage analysis, anti-pattern detection, and improvement recommendations.

---

## Overview

Test suite review is a structured process for evaluating test quality, effectiveness, and alignment with business requirements. This guide provides criteria for identifying low-value tests, detecting anti-patterns, and recommending improvements.

The review process produces a **Test Review Report**—a structured document that captures findings, anti-patterns detected, and prioritized recommendations.

---

## Reviewer Role

You are a **Senior Test Architect** with expertise in:
- Test strategy design and implementation best practices
- Unit testing, integration testing, and end-to-end testing methodologies
- Test-driven development (TDD) and behavior-driven development (BDD)
- Test automation frameworks and CI/CD pipeline integration
- Code quality assessment and test coverage analysis
- Risk-based testing and quality assurance processes

---

## Pre-Review Setup

**CRITICAL FIRST STEPS:**

1. **Get current date and time** for timestamping your review

2. **Analyze the target module structure:**
   - Test file organization and naming patterns
   - Production code being tested
   - Test types (unit vs integration vs end-to-end)
   - Testing framework and tools used

3. **Determine review scope:**
   - Recent test changes (if git history available)
   - Module complexity and test coverage
   - Dependencies and external integrations
   - Critical business logic being tested

4. **Analyze cross-crate test coverage patterns:**
   - Asymmetric distribution of tests across crates/modules
   - Crates with excessive test volume vs. minimal coverage
   - Potential test coverage imbalances

5. **Analyze dependency stack and test boundaries:**
   - External dependencies and their testing responsibilities
   - Wrapper vs library functionality testing boundaries
   - Appropriate test layer placement within dependency hierarchy

---

## MANDATORY: Systematic Individual Test Analysis

**CRITICAL REQUIREMENT:** You MUST systematically evaluate EVERY individual test function in the specified file.

**Required Process:**

1. **Enumerate All Test Functions**: Create a complete list of every test function

2. **Individual Test Anti-Pattern Check**: For EACH test function, check against ALL anti-patterns:
   - Constructor + immediate field validation tests
   - Type name equality checks
   - Always-true assertion tests
   - Empty collection validation tests
   - Default configuration tests
   - Pure mock interaction tests
   - Mock-only passthrough tests
   - Misleading happy-path tests
   - Manual business logic implementation in tests
   - Validation Theater (accepts both success and failure as valid)

3. **Individual Test Evaluation**: For EACH test, evaluate:
   - Test relevance and business alignment
   - Coverage completeness
   - Test effectiveness
   - Salience and risk focus

4. **No Test Left Behind**: Verify you have reviewed every single test function

---

## Review Criteria

### 1. Test Relevance & Business Alignment

**Business Logic Coverage:**
- [ ] Core business rules and domain logic validation
- [ ] Critical user workflows and use cases
- [ ] Public API contracts and expected behaviors
- [ ] External dependency and integration boundaries

**Test Focus Quality:**
- [ ] Happy path scenarios for normal operations
- [ ] Edge cases and boundary conditions
- [ ] Error conditions and failure recovery
- [ ] Performance characteristics and resource constraints
- [ ] Security considerations and input validation

**Test Scope Appropriateness:**
- [ ] Integration tests validate end-to-end workflows, not external API responses
- [ ] Unit tests cover client-side logic: validation, error handling, data transformation
- [ ] No integration tests that primarily validate third-party library behavior
- [ ] Clear separation between testing our code vs testing external dependencies

**Production Alignment:**
- [ ] Tests reflect actual production usage patterns
- [ ] Requirements validation that matters to end users
- [ ] No tests for deprecated or non-existent functionality
- [ ] Behavior-focused rather than implementation-focused testing

### 2. Test Coverage & Completeness

**Functional Coverage:**
- [ ] All public functions and methods tested
- [ ] State transitions and state machine testing
- [ ] Configuration variations and edge cases
- [ ] Input data variations and boundary testing

**Technical Coverage:**
- [ ] Adequate code coverage metrics (line/branch/function)
- [ ] Concurrency and thread safety scenarios
- [ ] Resource management and cleanup validation
- [ ] Error handling and recovery paths

### 3. Test Effectiveness & Quality

**Test Design Quality:**
- [ ] Clear test intent with single, focused purpose
- [ ] Thorough outcome validation with proper assertions
- [ ] Test isolation and independence
- [ ] Deterministic and consistent results

**Implementation Quality:**
- [ ] Well-structured, readable test code
- [ ] Appropriate mocking and dependency isolation
- [ ] Organized and maintainable test data
- [ ] Reasonable test execution performance

### 4. Test Salience & Risk Focus

**Risk-Based Coverage:**
- [ ] Critical and complex code has comprehensive tests
- [ ] Business-critical paths are thoroughly tested
- [ ] Security-sensitive areas have appropriate test coverage
- [ ] External integration boundaries are well-tested

**Low-Value Test Identification:**
- [ ] Constructor + immediate property check tests
- [ ] Type name self-equality tests
- [ ] Always-true assertions
- [ ] Default config hardcoded validation
- [ ] Mock-only passthrough tests
- [ ] Misleading test names

### 5. Test Architecture & Organization

**Test Pyramid Balance:**
- [ ] Unit tests outnumber integration tests (typical ratio 3:1 to 5:1)
- [ ] Integration tests focus on system boundaries
- [ ] No "test pyramid inversion"
- [ ] Client logic is tested at unit level

**Test Infrastructure:**
- [ ] Robust testing framework usage
- [ ] Consistent mock/stub strategy
- [ ] Systematic test data management
- [ ] Proper test environment setup and teardown

---

## Anti-Pattern Detection

### Low-Value Test Patterns to Flag

```rust
// Pattern 1: Constructor + immediate property check
#[test]
fn test_config_creation() {
    let config = MyConfig { field1: 42, field2: true };
    assert_eq!(config.field1, 42); // <- Can only fail if language is broken
}

// Pattern 2: Type name self-equality
#[test]
fn test_type_compatibility() {
    assert_eq!(std::any::type_name::<MyType>(), std::any::type_name::<MyType>());
    // ^ Always true, cannot fail
}

// Pattern 3: Always-true assertions
#[test]
fn test_placeholder() {
    let _obj = SomeObject::new();
    assert!(true); // <- Useless assertion
}

// Pattern 4: Default config hardcoded validation
#[test]
fn test_defaults() {
    let config = Config::default();
    assert_eq!(config.timeout, Duration::from_secs(30)); // <- Just checking hardcoded default
}

// Pattern 5: Mock-only passthrough tests
#[test]
async fn test_get_transaction_success() {
    let mock_client = MockRpcClient::new();
    mock_client.set_response("get_transaction", expected_tx.clone()).await;
    let result = mock_client.get_transaction(hash).await;
    assert_eq!(result, expected_tx); // <- Just testing mock passthrough
}

// Pattern 6: Manual business logic in tests
#[test]
async fn test_balance_validation() {
    let params = get_protocol_parameters().await;
    let calculated_min = (account_size + 160) * params.coefficient; // <- Logic in test
    assert!(balance >= calculated_min); // <- Not testing actual client method
}

// Pattern 7: Validation Theater
#[test]
async fn test_functionality() {
    let result = perform_operation().await;
    if result.is_ok() {
        println!("Success");
    } else {
        println!("Failed, but that's ok too"); // <- Both outcomes accepted
    }
    Ok(()) // <- Always passes
}
```

### High-Value Test Patterns to Encourage

```rust
// ✅ Protocol compliance testing
#[test]
fn test_minimum_balance_against_protocol() {
    let calculated = processor.calculate_minimum_balance(account_size);
    let expected = (160 + account_size) * 4310;
    assert_eq!(calculated, expected, "Should follow protocol specification");
}

// ✅ Business rule enforcement
#[test]
fn test_network_mismatch_enforcement() {
    let mainnet_manager = Manager::new(Network::Mainnet);
    let testnet_address = create_testnet_address();
    let result = mainnet_manager.add(testnet_address);
    assert!(result.is_err(), "Should reject wrong network addresses");
}

// ✅ Error boundary testing
#[test]
async fn test_connection_timeout_handling() {
    let config = Config { timeout: Duration::from_millis(1) };
    let result = manager.connect_with_config(config).await;
    assert!(result.is_err(), "Short timeout should cause failure");
}

// ✅ State transition validation
#[test]
async fn test_protocol_state_flow() {
    assert_eq!(manager.state(), State::Disconnected);
    manager.connect().await.expect("connect");
    assert_eq!(manager.state(), State::Connected);
}

// ✅ Real client logic testing
#[test]
async fn test_transaction_conversion_logic() {
    let external_tx = ExternalTx { ... };
    let converted = RpcClient::convert_external_transaction(external_tx)
        .expect("Should convert");
    assert_eq!(converted.hash, expected_hash); // Tests real conversion logic
}
```

---

## Review Output Format

### Summary Assessment
- **Overall Test Quality Score:** X/5 ⭐
- **Relevance & Business Alignment:** PASS/FAIL
- **Coverage Completeness:** PASS/FAIL
- **Test Effectiveness:** PASS/FAIL
- **Critical Issues Found:** X (count)

### Individual Test Function Analysis

For EACH test function:

| Test Function | Anti-Patterns | Business Value | Issues |
|---------------|---------------|----------------|--------|
| `test_name_1` | ✓ None / ✗ Pattern X | High/Medium/Low | List or None |
| `test_name_2` | ✗ Mock passthrough | Low | No real logic tested |

### Anti-Pattern Detection Summary
- **Total Tests Analyzed:** X
- **Tests with Anti-Patterns:** Y
- **Most Common Anti-Pattern:** [Pattern name]
- **Critical Anti-Pattern Issues:** [Count and list]

### Test Redundancy Analysis

| Integration Test | Unit Test Coverage | Redundancy | Strategy |
|------------------|-------------------|------------|----------|
| test_name_1 | unit_a + unit_b | 100% | DELETE |
| test_name_2 | unit_c (partial) | 70% | ENHANCE |
| test_name_3 | none | 0% | CONVERT |

### Recommendations Summary

#### 1. Immediate Actions (Critical/High Priority):
1.1. [Specific action]
1.2. [Specific action]

#### 2. Near-term Improvements (Medium Priority):
2.1. [Specific action]
2.2. [Specific action]

#### 3. Long-term Enhancements (Low Priority):
3.1. [Specific action]

---

## Report Generation

**After completing the review, generate a markdown report:**

1. **Create report artifact** at `planning/test-suite-review-{n}.md` (the activity's `artifactPrefix` is prepended at write time; n increments on successive reviews)
2. **Include complete review content** with all sections
3. **Use professional markdown formatting**
4. **Add review metadata** (reviewer, timestamp, scope)

### Test Suite Review Report Template

When generating a test suite review report, include a reference back to this guide in the Author field. This helps readers understand the methodology used.

```markdown
# Test Suite Review Report

**Work Package:** [Name]
**Issue:** #[number] - [Title]
**Date:** YYYY-MM-DD
**Author:** [Test Suite Review](https://github.com/m2ux/workflow-server/blob/workflows/work-package/resources/17-test-suite-review.md) Agent

---

## Review Scope

| Aspect | Details |
|--------|---------|
| Module(s) Reviewed | [module names] |
| Test Files Analyzed | [count] |
| Total Tests Reviewed | [count] |
| Testing Framework | [framework name] |

---

## Summary Assessment

| Criteria | Rating | Notes |
|----------|--------|-------|
| Overall Test Quality | ⭐⭐⭐⭐☆ (X/5) | [Brief assessment] |
| Relevance & Business Alignment | PASS / FAIL | [Notes] |
| Coverage Completeness | PASS / FAIL | [Notes] |
| Test Effectiveness | PASS / FAIL | [Notes] |
| Critical Issues Found | [count] | [Brief description] |

---

## Individual Test Function Analysis

| Test Function | Anti-Patterns | Business Value | Issues |
|---------------|---------------|----------------|--------|
| `test_name_1` | ✓ None | High | None |
| `test_name_2` | ✗ Mock passthrough | Low | No real logic tested |
| `test_name_3` | ✗ Always-true assertion | None | Should be removed |

---

## Anti-Pattern Detection Summary

| Metric | Count |
|--------|-------|
| Total Tests Analyzed | [X] |
| Tests with Anti-Patterns | [Y] |
| Clean Tests | [X-Y] |
| Anti-Pattern Rate | [Y/X %] |

### Anti-Patterns Found

| Pattern Type | Count | Examples |
|--------------|-------|----------|
| Constructor + field validation | [n] | `test_config_creation` |
| Mock-only passthrough | [n] | `test_get_data_success` |
| Always-true assertions | [n] | `test_placeholder` |
| Default config validation | [n] | `test_defaults` |
| Validation theater | [n] | `test_functionality` |

---

## Coverage Analysis

### Coverage Gaps Identified

| Area | Gap Description | Priority |
|------|-----------------|----------|
| [Module/Function] | [Missing test scenarios] | High/Medium/Low |
| [Module/Function] | [Missing edge cases] | High/Medium/Low |

### Test Pyramid Assessment

| Test Type | Count | Expected Ratio | Actual Ratio | Status |
|-----------|-------|----------------|--------------|--------|
| Unit Tests | [n] | 70-80% | [x%] | OK / INVERTED |
| Integration Tests | [n] | 15-25% | [x%] | OK / INVERTED |
| E2E Tests | [n] | 5-10% | [x%] | OK / INVERTED |

---

## Test Redundancy Analysis

| Integration Test | Unit Test Coverage | Redundancy | Recommended Strategy |
|------------------|-------------------|------------|---------------------|
| `test_workflow_a` | `unit_a` + `unit_b` | 100% | DELETE integration |
| `test_workflow_b` | `unit_c` (partial) | 70% | ENHANCE unit tests |
| `test_workflow_c` | None | 0% | KEEP or CONVERT to unit |

---

## Recommendations

### 1. Immediate Actions (Critical/High Priority)

| # | Action | Affected Tests | Rationale |
|---|--------|----------------|-----------|
| 1.1 | [Specific action] | `test_name` | [Why] |
| 1.2 | [Specific action] | `test_name` | [Why] |

### 2. Near-term Improvements (Medium Priority)

| # | Action | Affected Tests | Rationale |
|---|--------|----------------|-----------|
| 2.1 | [Specific action] | `test_name` | [Why] |
| 2.2 | [Specific action] | `test_name` | [Why] |

### 3. Long-term Enhancements (Low Priority)

| # | Action | Affected Tests | Rationale |
|---|--------|----------------|-----------|
| 3.1 | [Specific action] | `test_name` | [Why] |

---

## Review Outcome

**Result:** [Acceptable / Needs Improvement / Significant Issues]

**Summary:** [1-2 sentence summary of findings and next steps]

**Deferred Improvements:** [List any improvements noted for future work]
```

---

## Post-Review Implementation Process

### Step 1: Implementation Offer
Ask the user:
> "Test suite review complete! Would you like me to proceed with implementing the recommendations? I will work through them one at a time."

### Step 2: Iterative Implementation
**If the user agrees:**

1. **Implement ONLY the first numbered item**
2. **Transform low-value tests** into high-value logic where possible
3. **Maintain test coverage** while improving quality
4. **Run tests** to ensure changes work correctly
5. **Stop and ask the user** before proceeding to next item

### Important Guidelines:
- ✅ Transform rather than remove low-value tests
- ✅ Maintain test coverage while improving value
- ✅ Complete one recommendation before stopping
- ✅ Ask permission between each recommendation
- ❌ Never implement multiple recommendations at once
- ❌ Never simply remove tests without equivalent coverage
