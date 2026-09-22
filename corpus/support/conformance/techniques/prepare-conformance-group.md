---
metadata:
  version: 1.0.0
---

## Capability

Stand up a throwaway repository group whose members are prepared checkouts, one of them a commit behind its graph, so a case gated on a stale member enters the rebuild it exists to evidence and no group anyone configured is touched.

## Inputs

### stale_member_graph_name

Name of a prepared checkout's graph, that checkout trailing its working tree by a commit, which joins the group as its stale member.

## Outputs

### conformance_group_name

Name the group is configured under: `conformance-group`.

### current_member_graph_name

Name of the second member this operation prepares, which is the basename of its root: `conformance-current-fixture`. Its checkout stands at `/tmp/conformance-current-fixture`.

## Protocol

### 1. Stand the Current Member Up

- Make `/tmp/conformance-current-fixture` a git checkout of its own: `git init` there, write a `.gitignore` holding `.gitnexus/`, write two source files one of which calls into the other, and commit them.
   > A tree already standing at that path is the tree this phase wants.
   > The call between the files gives the graph an execution flow, which is what a group search over this member answers from.
- Run `npx gitnexus analyze --index-only` inside that checkout, so its graph stands at the commit `HEAD` names and the member reads as current.

### 2. Configure the Group

- Write `~/.gitnexus/groups/{conformance_group_name}/group.yaml` naming both members — `{stale_member_graph_name}` and `{current_member_graph_name}` — each mapped to its own registered graph name, with no declared links.
   > A member named here and absent from the graph inventory lands in the run's unrebuildable list, which is the mark of a different case. Both members carry a graph when this operation returns.

### 3. Land the Address

- Land `{conformance_group_name}` as the group the case binds, with `{current_member_graph_name}` as the member it prepared.

## Rules

### a-group-that-exists-for-the-walk-is-the-only-one-a-walk-rewrites

A group refresh rebuilds the members its freshness read names and rewrites the group's contract registry. Both are writes to configuration someone depends on where the group is one they configured, so a case evidencing either binds this group and no other.

### one-member-behind-is-what-the-rebuild-loop-needs

The loop over stale members runs a pass per member the freshness read names, and names none where every member stands at its tree's head. The stale member is what puts a pass in the loop, so it joins the group already behind — prepared before this operation, not by it.
