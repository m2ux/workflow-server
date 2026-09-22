# GitNexus Radius Conformance Activities

> Part of the [GitNexus Radius Conformance Workflow](../README.md)

The authoritative definition of each activity — its steps, technique bindings, routine references, transitions and outcomes — lives in the linked `.yaml` file and is served by `get_activity`. The entries below are orientation only.

---

### 01. Measure Reach

Refers to the gitnexus library's [`group-radius`](/gitnexus/routines/group-radius.yaml) run via [`01-measure-reach.yaml`](./01-measure-reach.yaml). The group, the concern, its symbol identity and its home graph travel under the run's own names, and the seven values the run produces are bound under their own names too. Leads to [Report Conformance](#02-report-conformance).

Definition: [`01-measure-reach.yaml`](./01-measure-reach.yaml)

---

### 02. Report Conformance

Reads what the run settled and writes the one document the run leaves behind, via [`02-report-conformance.yaml`](./02-report-conformance.yaml). Terminal.

Definition: [`02-report-conformance.yaml`](./02-report-conformance.yaml)
