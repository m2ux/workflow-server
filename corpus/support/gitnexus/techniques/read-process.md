---
metadata:
  version: 2.0.0
---

## Capability

Take one execution flow's step-by-step trace from the graph.

## Inputs

### process_name

Process identifier — the end-to-end name a flow inventory lists, or the graph identifier a context answer carries.

## Outputs

### process_trace

The flow's ordered steps, each naming the symbol it runs, that symbol's kind, and the file the symbol sits in. Where the reading could not be taken, the statement of what could not be taken stands in place of the steps.

## Protocol

### 1. Take the Flow's Steps

- Call `gitnexus_cypher { statement: "MATCH (s)-[r:CodeRelation]->(p:Process) WHERE r.type = 'STEP_IN_PROCESS' AND (p.label = $process_name OR p.id = $process_name) RETURN r.step AS step, s.name AS symbol, label(s) AS kind, s.filePath AS file ORDER BY r.step", params: { process_name: process_name }, repo: repo_name }` and record the rows in `step` order as the `{process_trace}`.
   > A flow answers to either spelling, so a `{process_name}` taken from an inventory and one taken from a context answer both reach it: `label` is the end-to-end name, `id` the graph identifier.

### 2. Read an Empty Answer as a Reading Not Taken

- Read a bare empty answer as a reading the graph could not give rather than as a flow of no steps, and record that statement as the `{process_trace}`: no flow is held under `{process_name}`. The name is misspelt, it belongs to another graph, or the chain was never traced — and a trace is recovered by naming the flow from an inventory of this graph rather than by asking again.

### 3. Read the Trace as the Chain the Parser Followed

- Read the steps as the call chain the parser could follow end to end. A step whose call site sits inside a macro body or runs through a type-level reference is absent from the chain and from the graph, per `edges-the-parser-cannot-see`, so a trace is evidence of what the graph holds and never of every hop the flow runs.
