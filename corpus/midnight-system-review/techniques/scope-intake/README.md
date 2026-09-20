# Scope Intake

> Part of [techniques](../README.md)

Establish what is under review and what instruments are available before any investigation begins: classify the review target, assemble the authoritative changed-file inventory from….

The shared contract every operation here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`classify-review-target`](classify-review-target.md) | Classify a review target as a pull-request surface or a local change-set |
| [`detect-toolchain`](detect-toolchain.md) | Probe the availability of the three optional toolchains — the GitNexus code graph, the cargo build toolchain, and a runnable midnight-node binary — and emit one boolean gate per toolchain… |
| [`resolve-change-surface`](resolve-change-surface.md) | Assemble the review's authoritative changed-file inventory artifact from already-resolved surface data |
