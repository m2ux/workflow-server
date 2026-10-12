# Separate sessions

The dependency check reports three pairs of tasks that could share a pull
request and do not name each other in Joins: W02 and W03, W02 and W04, W03 and
W04. Each pair stays separate, and this file records why.

## Why they do not share a pull request

Each task validates one harness, and the point of the validation is that it is
independent. A single session that reported on three harnesses would carry one
deployment, one set of fixtures and one observer's reading into all three
results, so a fault common to that arrangement would pass in all three at once.
Three sessions fail independently.

The harnesses also differ in what they have to establish.

- **Codex** reaches the adapter through an installed plugin, and each
  registration is inert until a person trusts it through `/hooks`. The evidence
  includes the trust review, which the other two harnesses have no equivalent of.
- **Cursor** reaches the adapter through its Claude import, which a client
  setting governs. It sends its shell tool under a different name. Nothing in
  the workspace reports whether the import is on.
- **Claude Code** is the harness whose six registered hooks the single adapter
  replaces, and the only one where a direct single command changed hands from
  the harness's own allow list to the adapter.

A shared pull request would also mean a shared outcome: one body stating that
the policy is enforced, backed by whichever harness happened to be checked most
closely. A task each keeps the claim and its evidence in one place.

## What they deliver

Each delivers a record rather than code: its work-item file and the observed
outcomes, committed to this planning record. A task is delivered when its id
links a merged pull request or a commit, so a commit here discharges the row.
A fix that a session turns up is work for the branch under test, and lands
there rather than in the validation task.
