---
metadata:
  version: 1.0.0
---

## Capability

Collect the security advisory inputs from the user: the private security advisory URL, the private fork URL, and the short advisory slug used for the security branch name.

## Outputs

### sec_vuln_url

The private security advisory URL provided by the user.

### private_fork_url

The private fork URL provided by the user.

### short_id

The short advisory slug provided by the user (e.g. `cve-2026-1234`), used to name the security branch.

## Protocol

- Obtain the private security advisory URL (`{sec_vuln_url}`), the private fork URL (`{private_fork_url}`), and a short advisory slug (`{short_id}`, e.g. `cve-2026-1234`) from the user. The activity's input checkpoints prompt for any value the user did not supply up front.
