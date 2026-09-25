# Cicd Pipeline Security Audit Techniques

> Part of [cicd pipeline security audit](../README.md)

Shared Inputs, Outputs, Rules, and Errors for every technique in this set.

The shared contract every technique here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`execute-cicd-audit`](execute-cicd-audit.md) | Orchestrator contract for a CI/CD pipeline security audit: drive the scanner branches the graph opens, dispatch the verification and merge sub-agents, and enforce the phase,… |
| [`execute-sub-agent`](execute-sub-agent.md) | Bootstrap the workflow-server MCP from a dispatched session, load an assigned activity definition (from the activity_id passed in the spawn prompt), follow its steps sequentially with… |
