# Cargo Techniques

> Part of [support](../../README.md)

Resource-constrained operations for cargo subcommands.

The shared contract every operation here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`build-dev`](build-dev.md) | Workspace dev build |
| [`build-release`](build-release.md) | Release build |
| [`check`](check.md) | Type-check without producing binaries |
| [`clippy`](clippy.md) | Run the linter against all targets, denying warnings |
| [`doc`](doc.md) | Generate API documentation to verify inline doc comments compile |
| [`fmt-check`](fmt-check.md) | Canonical formatting verdict for the sources in scope, matching what CI enforces |
| [`fmt-fix`](fmt-fix.md) | Apply rustfmt formatting in place |
| [`preflight`](preflight.md) | The unmet system dependencies a workspace's cargo build would need — `protoc`, openssl headers, `pkg-config` and their like — as a structured environment finding |
| [`run-suite`](run-suite.md) | One validation verdict for a rust-substrate project — compilation, lints, tests and formatting — with each check's diagnostics carried beside its status |
| [`test`](test.md) | Run tests with bounded test parallelism |
