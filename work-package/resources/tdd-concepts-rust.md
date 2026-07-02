---
name: tdd-concepts-rust
description: Operative TDD practices and Rust testing idioms, adapted from 'Test Driven Development for Embedded C'.
metadata:
  version: 1.1.0
  order: 23
  legacy_id: 23
---


# Test-Driven Development for Rust

Condensed lexicon of TDD concepts from "Test Driven Development for Embedded C" (James W. Grenning), translated to Rust idioms. Stated as operative rules; apply them when planning and writing tests.

---

## Core TDD Discipline

- **Three Laws of TDD** (Bob Martin): (1) write no production code until you have a failing unit test; (2) write only enough of a test to make it fail; (3) write only enough production code to make the failing test pass.
- **Red-Green-Refactor**: failing test → minimal pass → clean up while keeping `cargo test` green. Working code is not done; working *clean* code is done. It's OK to make a mess while getting to green, but refactor it out before moving on.
- **TDD state machine**: compilation error → link/stub error → test fails → test passes → refactor. Solve one problem at a time; always watch the test fail first to prove it can detect a wrong result.
- **Fake it till you make it**: start with hard-coded return values (this tests the test), then generalize via **triangulation** — adding more tests forces the real implementation.
- **Baby steps**: add one behavior per test. If something breaks, the cause is the one small thing you just changed.
- **Test list**: before implementing, write a checklist of test scenarios (comment block or `#[ignore = "not yet implemented"]` tests); evolve it as you learn; check items off as they pass.
- **Don't let code get ahead of tests** — even in legacy code. No anticipatory validation or "obvious" improvements without a test that requires them.
- **Slow down to go fast**: TDD feels slower than Debug-Later Programming but wins overall — bugs are caught immediately and the root cause is always the code you just wrote.

---

## Test Structure and Organization

- **Four-Phase Test** (Meszaros) / Arrange-Act-Assert: Setup → Exercise → Verify → Teardown. The test case owns setup and cleanup of Depended-On Components; in Rust, teardown usually rides on `Drop`.
- **Fixtures**: extract repeated setup into helper functions or a fixture struct (with `Drop` for teardown, and assertion helper methods) so each test shows only what is unique to it.
- **Test groups**: nested `mod` blocks inside `#[cfg(test)]` group related cases (e.g. boundary conditions vs state transitions).
- **Placement**: unit tests live inline in the source file; integration tests (multiple components, public API only) live in the `tests/` directory as a separate crate.

```rust
// src/led_driver.rs — canonical layout
pub struct LedDriver { /* ... */ }

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_driver() -> LedDriver { LedDriver::new(0xFF00) }

    mod boundary_conditions {
        use super::*;
        #[test]
        fn out_of_bounds_led_is_off() { /* ... */ }
    }
}
```

- **Naming**: test names describe behavior (`led_is_on_after_turn_on_called`, `out_of_bounds_led_numbers_return_error`), never `test1` / `it_works`.
- **Clean test code**: tests deserve production-level care — descriptive names, no duplication, short and intention-revealing. Named `input` / `expected_output` locals beat magic values.

---

## Test Doubles

Test doubles replace production dependencies (hardware, OS, other modules) so the test + doubles form a fixture around the Code Under Test (CUT), driving inputs and checking outputs. Keep doubles much simpler than what they replace.

- **Dummy**: satisfies a trait bound / linker; never actually called.
- **Stub**: returns canned answers (e.g. a `TimeService` that always returns a fixed `DateTime`); no verification. A time fake may also expose a mutation method (`advance(&mut self, duration)`) so the test scripts time passage — schedule/timeout behavior is tested by advancing the fake, not by sleeping.
- **Spy**: records calls (method, args, order) for the test to inspect afterward. Rust idiom: `RefCell<Vec<...>>` inside the spy so it can record through `&self`.
- **Mock**: pre-programmed expectations on calls, args, order, and return values; verifies automatically. Use the `mockall` crate:

```rust
use mockall::*;

#[automock]
trait FlashDriver {
    fn write(&mut self, address: u32, data: u8) -> Result<(), FlashError>;
}

let mut mock = MockFlashDriver::new();
mock.expect_write().with(eq(0x1000), eq(0x42)).times(1).returning(|_, _| Ok(()));
// verification happens on drop
```

- **Fake**: working shortcut implementation (e.g. `HashMap`-backed in-memory flash/database) suitable for tests, not production.
- **Exploding fake**: panics on incorrect usage (use-before-init, invalid address) to surface misuse immediately.

---

## Breaking Dependencies (Seams)

A seam is a place where behavior can be altered without editing the code. All access to the execution environment (time, filesystem, hardware, network, randomness) must go through defined interfaces so a test double can be substituted. Rust seam mechanisms:

- **Dependency injection via traits**: generic parameter (`Service<T: TimeProvider>`) or trait object (`Box<dyn TimeProvider>`); inject fakes in tests. This is the preferred, default seam.
- **`#[cfg(test)]` / `#[cfg(not(test))]`**: swap a function or module wholesale at compile time (Rust's analogue of link-time substitution).
- **Cargo feature flags** (`#[cfg(feature = "hardware-flash")]`): platform/production vs test implementations (analogue of preprocessor substitution).
- **Function pointers** (`type RandomMinuteFn = fn() -> i32`) injected at construction — lighter than a trait when there's a single function; prefer a trait when it may grow.
- **Dependency octopus**: when the CUT drags in a transitive web of dependencies (whole system initializing inside a test), cut a trait boundary at the first-level dependency and fake it; never initialize the real tree.

---

## Test Quality Principles

- **FIRST**: **F**ast (no I/O, no sleeps), **I**ndependent (own data, any order), **R**epeatable (no real time/randomness — inject fakes), **S**elf-validating (asserts, no manual inspection), **T**imely (written before the code).
- **0-1-N pattern**: for collections/repeating behavior, test the zero case, the one case, then the many case (including interactions).
- **Boundary value testing**: empty, full, min/max valid, one-past-invalid on each side, integer overflow (`i32::MAX + 1` → error). Trivial-looking boundary tests become important validators as the implementation evolves.
- **State machine testing**: test the initial state, each legal transition, and that illegal transitions return errors.
- **Copy-paste-tweak is an anti-pattern**: don't clone a test and change values; extract fixtures/helpers so each test's unique purpose is visible.
- **Coverage is a guide, not a goal**: TDD yields the right coverage as a by-product. Don't chase 100%; chase confidence — behavior, branch, and boundary coverage. Tools: `cargo tarpaulin --out Html`, `cargo llvm-cov --html`.
- **Tests are living documentation**: they document valid inputs, error cases, and usage, and cannot go stale — they fail instead.

---

## Applying TDD to Existing (Legacy) Code

Goal: not perfect tests immediately — enough tests to refactor safely, then improve incrementally.

- **Crash-to-pass algorithm** (first test is the hardest): try to build a test → fix compilation (minimal interfaces) → fix linking (minimal stubs) → fix crashes (test doubles for problem dependencies) → make it pass → refactor.
- **Find/create seams** before testing: introduce trait boundaries or `#[cfg]` switches around direct `SystemTime::now()`, file I/O, hardware access.
- **Start with less baggage**: test simple, low-dependency functions first (pure calculations); build infrastructure and confidence before attacking entangled code.
- **Test-driven bug fixes**: first write a failing test that reproduces the bug, then fix it; the test stays as regression protection. A bug marks a prior test-effort gap.
- **Characterization tests** (before refactoring): document what the code *currently* does — including quirks — as a safety net; only later add tests that drive intentional behavior changes.
- **Change points vs test points** (Feathers): where you must change is often untestable; extract the relevant logic into a testable function, test it, then wire it back.
- **Extract testable units**: split giant functions into focused functions (validate / calculate / persist / render), each independently testable.
- **Incremental coverage**: prioritize (1) code you're actively changing, (2) high-risk/complex areas, (3) public API surface; stable simple code can wait. Apply 0-1-N when adding.
- **Learning tests**: for unfamiliar third-party crates, write tests that document and verify your assumptions about the library; they also catch behavior changes on upgrades.

---

## Assertions and Error Testing

- Core macros: `assert!`, `assert_eq!`, `assert_ne!` (all take optional format-message args).
- `Result`/`Option`: `assert!(r.is_ok())`, `assert!(matches!(result, Err(LedError::InvalidLedNumber)))` — always test both `Ok` and `Err` paths of a `Result`-returning API.
- Floats: epsilon comparison `(expected - actual).abs() < 1e-4`, never `assert_eq!`.
- Panics: `#[should_panic(expected = "substring")]`.
- Write custom assertion helpers for domain formats (e.g. hex-formatted register comparisons).

---

## Running Tests

```bash
cargo test                       # all tests
cargo test led_driver            # filter by name/module
cargo test --test integration    # one integration-test file
cargo test -- --nocapture        # show println! output
cargo test -- --show-output      # output even for passing tests
cargo test -- --ignored          # run only #[ignore] tests (--include-ignored for all)
cargo test -- --test-threads=1   # serial execution
```

Test output is quiet on success ("no news is good news"); on a crash, the last test announced in verbose output is the one that crashed.

---

## Hardware Abstraction and Dual-Targeting

- **HAL rule**: isolate all hardware access behind traits (e.g. `GpioPin { set_high/set_low/is_high }`). The better the isolation, the longer code and tests survive hardware evolution.
- Real implementations use `unsafe` volatile register access gated by `#[cfg(target_arch = "...")]` (or `#[cfg(not(test))]`); test fakes hold plain state (`Cell`, `HashMap<u32, u32>` register map).
- **Dual-targeting**: from day one, code runs on both the development host (where tests run) and the target hardware — development never blocks on scarce/unreliable hardware.

---

## Design for Testability

- A good design is a testable design; testability problems are design-problem signals. TDD forces thinking about interfaces and dependencies first, producing loose coupling and high cohesion.
- **Anti-pattern — tight coupling**: direct register/global/system access inside logic. Fix: inject a trait-bound dependency.
- **Smell — long functions** (~20+ lines, multiple responsibilities): extract focused functions and test each.
- **Test-only APIs**: expose internal state to tests with `#[cfg(test)]` methods (or `#[doc(hidden)]` if it must be public).
- Terminology: **CUT** (code under test), **DOC** (depended-on component); tests replace DOCs with doubles to isolate the CUT.

---

## Property-Based Testing

Use `proptest` to assert invariants over generated inputs (e.g. buffer count never exceeds capacity; final state matches last operation), complementing example-based tests:

```rust
use proptest::prelude::*;

proptest! {
    #[test]
    fn buffer_never_exceeds_capacity(
        values in prop::collection::vec(any::<i32>(), 0..100),
        capacity in 1usize..50,
    ) {
        let mut buffer = CircularBuffer::new(capacity);
        for v in values {
            let _ = buffer.put(v);
            prop_assert!(buffer.count() <= capacity);
        }
    }
}
```

---

## Continuous Integration

Run on every push/PR: `cargo test --all-features`, `cargo clippy -- -D warnings`, `cargo fmt -- --check`. The growing test suite is an asset as valuable as the production code; every change re-verifies all existing behavior.

---

## Conclusion and Best Practices

1. Use the built-in cargo test framework; traits (not function pointers) for abstraction; `mockall` for mocks; `proptest` for properties; `tests/` for integration; feature flags / `#[cfg]` for platform switches.
2. Leverage Rust's type system: ownership, `Option`/`Result`, and no-UB-in-safe-code eliminate whole test categories — TDD + types is stronger than either alone. Benchmarking is built into the toolchain (`cargo bench`) when performance validation is needed.
3. Test both `Ok` and `Err`; test boundaries; follow 0-1-N.
4. For legacy code, apply the crash-to-pass, seam, and characterization strategies above.
5. The mindset: write test → watch it fail → make it pass → refactor → repeat. **Red → Green → Refactor**.

### C-to-Rust Test Translation

| C Concept | C Syntax | Rust Equivalent |
| --- | --- | --- |
| Test Group | `TEST_GROUP(Name)` | `mod name_tests { }` |
| Test Case | `TEST(Group, Name)` | `#[test] fn name()` |
| Setup / Teardown | `TEST_SETUP` / `TEST_TEAR_DOWN` | helper fn or fixture struct / `Drop` impl |
| Assertions | `TEST_ASSERT_EQUAL(e, a)` etc. | `assert_eq!(a, e)`, `assert!(c)`, `assert!(opt.is_none())` |
| Mock Object | CppUMock | `mockall` crate |
| Function Pointer | `typedef int (*Fn)()` | `type Fn = fn() -> i32` or trait |
| Preprocessor / Link substitution | `#ifdef TEST` / linker flags | `#[cfg(test)]`, features, trait objects |
| Test Runner | custom main | `cargo test` |
