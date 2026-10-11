# Git Pin Conformance Activities

> Part of the [Git Pin Conformance Workflow](../README.md)

The authoritative definition of each activity — its steps, technique bindings, routine references, transitions and outcomes — lives in the linked `.yaml` file and is served by `get_activity`. The entries below are orientation only.

---

### 01. Materialise Checkouts

Names two paths beneath the planning folder and stands a worktree of the host repository at each, on a branch of its own, via [`01-materialise-checkouts.yaml`](./01-materialise-checkouts.yaml). Two fixed targets rather than a loop, because each is addressed by name for the rest of the run. Leads to [Plan Pins](#02-plan-pins).

Definition: [`01-materialise-checkouts.yaml`](./01-materialise-checkouts.yaml)

---

### 02. Plan Pins

Names the roster via [`02-plan-pins.yaml`](./02-plan-pins.yaml): the default branch and an unresolvable name for the first checkout, the newest tag and a commit for the second. Leads to [Pin Checkouts](#03-pin-checkouts).

Definition: [`02-plan-pins.yaml`](./02-plan-pins.yaml)

---

### 03. Pin Checkouts

Refers to the git library's [`ready-checkouts`](/git/routines/ready-checkouts.yaml) run via [`03-pin-checkouts.yaml`](./03-pin-checkouts.yaml). The roster travels under the run's own name and the answer is bound under it too, so the reference carries no argument beyond that one output binding. Leads to [Report Conformance](#04-report-conformance).

Definition: [`03-pin-checkouts.yaml`](./03-pin-checkouts.yaml)

---

### 04. Report Conformance

Reads the roster beside the run's answer, reads the refused checkout's head back, and writes the one document the run leaves behind, via [`04-report-conformance.yaml`](./04-report-conformance.yaml). Terminal.

Definition: [`04-report-conformance.yaml`](./04-report-conformance.yaml)
