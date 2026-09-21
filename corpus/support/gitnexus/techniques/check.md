---
metadata:
  version: 1.0.0
---

## Capability

Structural checks over a graph — the circular file imports that force a module-initialisation order.

## Outputs

### cycle_report

The import cycles the graph holds, counted at the grain a fix acts on.

#### status

`clean` where no cycle exists, or `cycles_found`.

#### enumeration

`complete` where every elementary cycle is listed, or `component-representatives` where the enumeration passed a safety limit and `cycles` holds one representative per circular component.

#### componentCount

How many independent circular components the graph holds — present in both enumerations, and the number one cut import moves by one.

#### cycleCount

How many elementary cycles were listed under a `complete` enumeration, and null under `component-representatives`.

#### cycles

The cycles, each as the ordered files whose imports close it.

#### truncated

Whether the enumeration stopped at its limit.

## Protocol

### 1. Run the Check

- Call `gitnexus_check { cycles: true, repo: repo_name }` and record the `{cycle_report}`.
   > - A deferred import — one written inside a function body, or a dynamic `import()` — and a TypeScript type-only import close no cycle, because neither forces an initialisation order, so the graph leaves them out of the count.
   > - A graph too large to check answers with an error and `truncated` set, and no `status`; that is an unmeasured graph rather than a clean one.

### 2. Read the Verdict from Status

- Read `{cycle_report}.status` before either count: under a `component-representatives` enumeration `cycleCount` is null, and a comparison of null against zero reads the most tangled graph as clean. Report and trend `{cycle_report}.componentCount`, which one cut import moves by one where `cycleCount` swings by thousands.
