---
metadata:
  version: 2.1.0
---

## Capability

Triage validation failures and aggregate cross-check results.

## Rules

### no-cargo-here

This technique MUST NOT invoke cargo, describe cargo invocations, or duplicate cargo command-line text. Cargo execution belongs entirely to [cargo-operations](../../../meta/techniques/cargo-operations/TECHNIQUE.md). validate-build operates on the OUTPUTS of cargo-operations operations.

### no-duplicate-review

Test suite quality was already reviewed in post-impl-review. [analyze-failure](./analyze-failure.md) focuses on root cause of execution failures, not test design.

### do-not-mask-flaky

When [analyze-failure](./analyze-failure.md) classifies a failure as flaky, surface that classification — do not silently retry; whether to retry or escalate is decided by the caller.
