# Routine Conformance Activities

> Part of the [Routine Conformance Workflow](../README.md)

The authoritative definition of each activity — its steps, technique bindings, routine references, transitions and outcomes — lives in the linked `.yaml` file and is served by `get_activity`. The entries below are orientation only.

---

### 01. Plan Probes

Chooses the directory both passes open with, via [`01-plan-probes.yaml`](./01-plan-probes.yaml). One target rather than a list, because the measurement each pass binds is what names the target after it. Leads to [Count Pass](#02-count-pass).

Definition: [`01-plan-probes.yaml`](./01-plan-probes.yaml)

---

### 02. Count Pass

Refers to the [`measured-pass`](../routines/measured-pass.yaml) run via [`02-count-pass.yaml`](./02-count-pass.yaml), supplying the counting measurement and binding both values the run produces to names of its own. The target it opens with is left unbound, so it takes the host's value under the run's own spelling. Leads to [Size Pass](#03-size-pass).

Definition: [`02-count-pass.yaml`](./02-count-pass.yaml)

---

### 03. Size Pass

Refers to the same run via [`03-size-pass.yaml`](./03-size-pass.yaml), supplying the sizing measurement instead. Everything else about the reference is the shape the counting site has, which is what makes the pair evidence: one file, two arguments, two sets of identifiers. Leads to [Report Conformance](#04-report-conformance).

Definition: [`03-size-pass.yaml`](./03-size-pass.yaml)

---

### 04. Report Conformance

Reads what both passes produced and writes the one document the run leaves behind, via [`04-report-conformance.yaml`](./04-report-conformance.yaml). Terminal.

Definition: [`04-report-conformance.yaml`](./04-report-conformance.yaml)
