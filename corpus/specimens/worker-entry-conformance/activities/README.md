# Worker Entry Conformance Activities

> Part of the [Worker Entry Conformance Workflow](../README.md)

Each entry below gives the activity's purpose, the entry path it exists to evidence, and a
link to its authoritative definition. The structured definition — steps, exits and technique
bindings — lives in the corresponding `NN-<id>.yaml` file.

For the activity-to-activity flow and the destination grammar the graph is written in, see
the [workflow README](../README.md).

---

## Position decides what the activity evidences

Four activities each sit on one entry path, and the fifth reads what they recorded.

What an activity on an entry path may record, and what it may reach for to record it, is held by
`an-activity-evidences-its-own-entry` and `record-cheaply` on the techniques contract.

The convergence reads every container whole and names no slot. It is the single place the
four records are compared, because a branch cannot see its sibling and the question the run
answers — whether two branches held distinct identities — is a comparison.

---

### 01. Record Entry

Opens the session. The activity a cold dispatch enters: the entering mark is published and
pushed before this activity's worker exists, and the advance onto it is the walk's first.

Definition: [`01-record-entry.yaml`](./01-record-entry.yaml)

---

### 02. Carry Batch

The second activity the run reaches, and the one a worker already holding Record Entry may
take without a fresh spawn. Its exit fans, so the worker that carried it is released rather
than continued, and the run hands off to branches in the same iteration that continued it.

Definition: [`02-carry-batch.yaml`](./02-carry-batch.yaml)

---

### 03. Note Left

One branch the fan opens, named directly by the destination. Fills a single slot and
reports the identity it was minted, which is the only evidence it was served an identity of
its own rather than its sibling's.

Definition: [`03-note-left.yaml`](./03-note-left.yaml)

---

### 04. Note Right

The other branch the destination names directly. Its obligation is its sibling's: report
its own entry and its own identity, and reach no further.

Definition: [`04-note-right.yaml`](./04-note-right.yaml)

---

### 05. Converge Entries

Where the branches converge and the run ends. Reads the four records, writes the one
document the run leaves behind, and takes the exit the walk advances onto `__terminal__`
from — the entry that publishes no mark and opens no worker.

Definition: [`05-converge-entries.yaml`](./05-converge-entries.yaml)
