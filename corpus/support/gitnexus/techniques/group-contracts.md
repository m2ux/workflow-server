---
metadata:
  version: 2.1.0
---

## Capability

Read a repository group's contract registry — the contracts each member publishes, the cross-links joining a publisher to its consumer, and how complete the registry is.

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

Each contract the registry holds with the member publishing it and its kind, the cross-links joining publishers to consumers, and the provenance that bounds both.

#### contracts

The contracts, each with the `repo` path of the member publishing it, its `type` and its `contractId`.

#### crossLinks

The joins the registry drew, each carrying the `contractId` shared and a `from` and `to` end. Each end is a mapping rather than a member's name: the member's `repo`, the `symbolUid` the join lands on, and a `symbolRef` naming that symbol's file and name. A read addressed at an end expecting a name finds the mapping.

A member the registry could not read still appears at an end. Its contracts come from the group's declared manifest links rather than from a graph, so a member named under `missingRepos` publishes contracts and carries joins at the same time, and the two readings describe different things about it rather than contradicting each other.

#### missingRepos

The members the sync that built the registry found no registry entry for.

#### unreadableRepos

The members that sync could not extract from — absent where the sync never recorded which members it read, empty where it measured none, populated where it names them.

#### suppressedMatchStages

The matching stages that sync was asked to skip, in the same three states; a populated list makes the cross-links a lower bound by request.

## Protocol

### 1. Take the Contract Report

- Read the MCP resource `gitnexus://group/{group_name}/contracts`, carrying `{contract_type}` as its `type` query parameter, `{member_path}` as `repo` and `{unmatched_only}` as `unmatchedOnly`, and record the document as the `{contract_report}`.
   > - `{member_path}` names a member's path inside the group, which is a different address from the graph name every other operation here takes as `{repo_name}`.
   > - An error arrives in place of a document where the group has no registry yet, and names the sync that builds one.

### 2. Read It as of Its Sync

- Read the registry as of the sync that built it: it is extracted from the members' own graphs, so a contract added since a member was last indexed is absent, and one deleted since is present. Where `{contract_report}.unreadableRepos` is absent or populated, the cross-links are a floor rather than the set.

### 3. Read an Unmatched Contract

- Read an unmatched contract as one whose counterpart the registry did not find — a publisher with no consumer in the group, a name the match did not reach, or a member the sync could not read — rather than as one nothing consumes.
