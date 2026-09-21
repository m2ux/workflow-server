---
metadata:
  version: 1.1.0
---

## Capability

Read a repository group's contract registry — the contracts each member publishes, and the cross-links joining a publisher to its consumer.

## Inputs

### group_name

Name of a configured repository group.

### member_path

*(optional)* Restricts the answer to one member, named by its path within the group such as `app/backend`.

### contract_type

*(optional)* Restricts the answer to one kind of contract, such as `http` or `topic`.

### unmatched_only

*(optional)* Whether the answer carries only the contracts the registry found no counterpart for.

## Outputs

### contract_report

Each contract the registry holds with the member publishing it, its kind, and the member it cross-links to.

## Protocol

### 1. Take the Contract Report

- Call `gitnexus_group_contracts { name: group_name, repo: member_path, type: contract_type, unmatchedOnly: unmatched_only }` and record the `{contract_report}`.
   > `{member_path}` names a member's path inside the group, which is a different address from the graph name every other operation here takes as `{repo_name}`.

### 2. Read It as of Its Sync

- Read the registry as of the sync that built it: it is extracted from the members' own graphs, so a contract added since a member was last indexed is absent, and one deleted since is present.

### 3. Read an Unmatched Contract

- Read an unmatched contract as one whose counterpart the registry did not find — a publisher with no consumer in the group, or a name the match did not reach — rather than as one nothing consumes.
