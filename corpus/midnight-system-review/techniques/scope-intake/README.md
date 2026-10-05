# Scope Intake

> Part of [techniques](../README.md)

What a review covers, and which optional instruments it can use.

The shared contract every technique here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`classify-review-target`](classify-review-target.md) | Classify a review target as a pull-request surface or a local change-set |
| [`detect-toolchain`](detect-toolchain.md) | Settle the availability of the three optional toolchains (the GitNexus code graph, the cargo build toolchain, and a runnable midnight-node binary) as one boolean gate per toolchain… |
| [`resolve-change-surface`](resolve-change-surface.md) | Assemble the review's authoritative changed-file inventory artifact from already-resolved surface data |
