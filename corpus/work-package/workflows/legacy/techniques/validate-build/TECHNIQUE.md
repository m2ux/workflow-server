---
metadata:
  version: 2.1.1
---

## Capability

Triage validation failures and aggregate cross-check results.

## Rules

### no-cargo-here

This technique MUST NOT invoke cargo, describe cargo invocations, or duplicate cargo command-line text. Cargo execution belongs entirely to the [cargo](/cargo/techniques/TECHNIQUE.md) library. validate-build operates on the OUTPUTS of its techniques.

### failure-cause-not-test-design

[analyze-failure](./analyze-failure.md) settles why a check failed. Test-suite quality is a separate judgement and no technique here makes it.

### do-not-mask-flaky

When [analyze-failure](./analyze-failure.md) classifies a failure as flaky, surface that classification — do not silently retry; whether to retry or escalate is decided by the caller.
