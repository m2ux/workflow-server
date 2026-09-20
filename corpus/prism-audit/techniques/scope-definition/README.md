# Scope Definition

> Part of [techniques](../README.md)

Settles what the audit covers: the target and its structural metadata, the concerns the audit is for, and the directory its artifacts occupy.

The shared contract every operation here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`collect-inputs`](collect-inputs.md) | Extract the audit parameters — target path, audit description, and output path — from the user's request, deriving the output path from the target name and current date when the user did… |
| [`create-output-folder`](create-output-folder.md) | Materialises the audit's output directory, so the artifacts have somewhere to land |
| [`summarize-scope`](summarize-scope.md) | Gathers the settled audit scope into one summary a reader can judge in a single pass |
| [`validate-target`](validate-target.md) | Establishes that the target is a codebase an audit can analyse, and what kind of codebase it is |
