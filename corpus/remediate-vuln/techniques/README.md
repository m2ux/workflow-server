# Remediate Vuln Techniques

> Part of the [Security Vulnerability Remediation Workflow](../README.md)

The procedures the workflow's own start activity applies. [`TECHNIQUE.md`](TECHNIQUE.md) is the workflow-root base contract: it declares the inputs shared across techniques (`target_path`, `planning_folder_path`, `branch_name`, `sec_vuln_url`, `private_fork_url`) and the isolation rules every technique inherits (`private-remote-only`, `no-public-disclosure`).

| Technique | Capability |
|-----------|-----------|
| [security-setup](security-setup/TECHNIQUE.md) | Configure the private `security` remote, branch off the private fork, and set up the isolated planning folder |

All other activities are borrowed from the [work-package workflow](../../work-package/README.md) and apply that workflow's techniques — including the strategic-review signature scan/re-sign flow and the manage-git private-remote verification and push operations that this workflow's stealth mode enables.
