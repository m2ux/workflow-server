# Harness Compat

> Part of [techniques](../README.md)

Abstract sub-agent dispatch operations — harness-independent vocabulary for spawning, continuing, and concurrently dispatching agents.

The shared contract every operation here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`claude-code`](claude-code.md) | Harness-specific invoke details for `harness_kind: claude-code` |
| [`cline`](cline.md) | Harness-specific invoke details for `harness_kind: cline` |
| [`continue-agent`](continue-agent.md) | Resume an existing sub-agent, preserving accumulated context where the harness supports it |
| [`cursor`](cursor.md) | Harness-specific invoke details for `harness_kind: cursor` |
| [`generic`](generic.md) | Harness-specific invoke details for `harness_kind: generic` |
| [`resolve-harness-operation`](resolve-harness-operation.md) | Resolve harness kind plus an operation kind to the harness-specific technique file and rule slice |
| [`spawn-agent`](spawn-agent.md) | Dispatch a new isolated sub-agent with no prior context |
| [`spawn-concurrent`](spawn-concurrent.md) | Dispatch multiple independent agents in parallel |
