---
metadata:
  version: 1.1.0
---

## Capability

Rebuild a repository group's contract registry — the HTTP contracts its members publish, and the cross-links between them.

## Inputs

### group_name

Name of a configured repository group.

## Outputs

### contract_registry_stats

What the rebuilt registry holds: the contracts extracted per member, and how many of them cross-link to another member.

## Protocol

### 1. Rebuild the Registry

- Call `gitnexus_group_sync { name: group_name }` and record the `{contract_registry_stats}` it reports.
   > The rebuild reads each member's own graph, so a member whose index is behind contributes contracts from the commit it was indexed at, and a registry built over members that are behind is behind with them.

### 2. Read a Contract with No Cross-Link

- Read a contract with no cross-link as one whose counterpart the registry did not find, which is a publisher with no consumer in the group or a name the match did not reach — not evidence that nothing consumes it.
