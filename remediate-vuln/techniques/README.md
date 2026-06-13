# Remediate Vuln Techniques

> Part of the [Security Vulnerability Remediation Workflow](../README.md)

The procedures the workflow's own activities apply. [`TECHNIQUE.md`](TECHNIQUE.md) is the workflow-root base contract: it declares the inputs shared across techniques (`target_path`, `planning_folder_path`, `branch_name`, `sec_vuln_url`, `private_fork_url`) and the isolation rules every technique inherits (`private-remote-only`, `no-public-disclosure`).

| Technique | Capability |
|-----------|-----------|
| [security-setup](security-setup/TECHNIQUE.md) | Configure the private `security` remote, branch off the private fork, and set up the isolated planning folder |
| [strategic-review](strategic-review/TECHNIQUE.md) | Review the fix for minimal scope, re-sign commits, and summarize the architecture, all on the private remote |
| [secure-submit](secure-submit/TECHNIQUE.md) | Verify the private remote and commit signatures, then push the fix to the `security` remote only |
| [analyze-findings](analyze-findings.md) | Assess the severity of strategic review findings and emit a recommended disposition |

The design, analysis, and implementation activities are reused from the [work-package workflow](../../work-package/README.md) and apply that workflow's techniques.
