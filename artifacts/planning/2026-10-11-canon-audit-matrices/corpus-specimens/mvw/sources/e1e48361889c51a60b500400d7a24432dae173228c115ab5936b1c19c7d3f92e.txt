# Git Pin Conformance Techniques

> Part of the [Git Pin Conformance Workflow](../README.md)

The technique library for the git pin conformance run. Each technique is one capability a step binds via `step.technique`; the authoritative capability, inputs, outputs, protocol and rules live in the per-technique `.md` file. This file orients readers to the library layout and points to those authoritative sources.

The cross-cutting meta strategy technique [`variable-binding`](/meta/techniques/variable-binding.md) is declared at `workflow.techniques.activity`, not bound per step.

---

## How the library divides

**The two techniques here sit either side of the run under test.** [`plan-pins`](./plan-pins.md) names the roster — a branch, the newest tag and a commit of the host repository, each assigned to one of the two checkouts, and one name nothing holds. [`report-pin-conformance`](./report-pin-conformance.md) reads what the roster asked beside what the run answered and writes the document.

**The technique under test is not here.** The pin itself is the git library's [`pin-revision`](/git/techniques/pin-revision.md), reached through the library's [`ready-checkouts`](/git/routines/ready-checkouts.yaml) run, and the worktrees the pins move are the library's [`create-worktree`](/git/techniques/create-worktree.md). What this specimen owns is the roster and the reading, so the evidence is about the library's answer rather than about anything authored beside it.
