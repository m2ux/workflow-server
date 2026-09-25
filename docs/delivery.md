# Delivery

A workflow's instructions are too much to hand an agent all at once. They are split into **techniques**, each one way of doing a single thing, and **resources**, the reference material a technique points at. An **activity** names the techniques its steps need. A **reference** is that name. When the run reaches the step, the server loads the file and sends it, because that is the instruction for the work in hand.

An **orchestrator** tracks one workflow. A **worker** carries out one activity. **Conduct** is the rules every worker is held to. What the server sends them together is a **bundle**: what the workflow names, a **core set** (the instructions always added for that role), and anything added only when the workflow can reach it.

A **context** is the working memory one agent holds from start to finish. A **window** is how much of that one activity may spend on content the worker did not ask for. A **batch** is several activities continued by one worker. A **gate** is a pause for a person. Steps placed in the response are **inlined**; the rest are fetched later. A **prefix** is the leading digits of an activity file, put in front of each document it writes.

The first send of a file is in full. A later send to the same context is a short **marker**, and that way of sending is **reference delivery**. The **ledger** records what the context was already sent. A **dispatch** is one worker being sent an activity, and each one is counted. Which file a reference reaches is [resolution](resource-resolution.md). The [calls](api-reference.md#workflow-navigation) that ask for a delivery are in the tool catalog.

<a id="what-a-role-receives"></a>

## What Agents Are Sent

A bundle is assembled and handed to an agent, so the agent does not go looking up files itself (Figure 1). A bundle is what the workflow names, what the server always includes, and what is added only when the workflow can reach it (Figure 2).

```mermaid
sequenceDiagram
  participant Server
  participant Agent
  Server->>Server: Assemble the role's bundle
  Server->>Agent: Hand it over
```

*Figure 1. A Bundle Is Assembled and Handed Over.*

```mermaid
classDiagram
  class DeclaredReferences {
    named by the workflow
  }
  class CoreSet {
    included for every role
  }
  class ConditionalExtras {
    added only when reachable
  }
  class Bundle {
    what the agent is handed
  }
  DeclaredReferences --> Bundle : gathered in
  CoreSet --> Bundle : gathered in
  ConditionalExtras --> Bundle : gathered in when reachable
```

*Figure 2. Declared References, Core Set (orchestrator's walk, state, dispatch, or worker's role, finish, conduct), and Conditional Extras.*

<a id="the-orchestrator-bundle"></a>

### Orchestrator Bundle

An orchestrator receives the techniques it is to carry out, and the workflow it drives (Figure 3). Those are the techniques, the shared contracts, and the workflow metadata (Figure 4).

```mermaid
sequenceDiagram
  participant Server
  participant Orchestrator
  Server->>Orchestrator: Techniques, with their bodies
  Server->>Orchestrator: Workflow metadata, below the separator
```

*Figure 3. An Orchestrator Receives Its Techniques and the Workflow.*

```mermaid
classDiagram
  class Techniques {
    one capability each, body included
  }
  class Contracts {
    shared rules and inputs
  }
  class RoleRules {
    govern the agent
  }
  class WorkflowMetadata {
    graph, activities, variable names
  }
  class OrchestratorBundle {
    what the orchestrator is handed
  }
  Techniques --> Contracts : names what it inherits
  RoleRules --> OrchestratorBundle : rides once
  WorkflowMetadata --> OrchestratorBundle : rides below the separator
  Techniques --> OrchestratorBundle : rides with its body
```

*Figure 4. Techniques, Shared Contracts, Role Rules, and Workflow Metadata.*

<a id="the-worker-bundle"></a>

### Worker Bundle

A worker receives the activity it was sent to do, plus the conduct every worker is held to (Figure 5). That is the activity and that conduct (Figure 6).

```mermaid
sequenceDiagram
  participant Server
  participant Worker
  Server->>Worker: The activity's own techniques
  Server->>Worker: The conduct every worker is held to
```

*Figure 5. A Worker Receives Its Activity and Its Conduct.*

```mermaid
classDiagram
  class ActivityTechniques {
    named by the activity's steps
  }
  class WorkerConduct {
    held to by every worker
  }
  class WorkerBundle {
    what the worker is handed
  }
  ActivityTechniques --> WorkerBundle : gathered in
  WorkerConduct --> WorkerBundle : gathered in
```

*Figure 6. Activity Techniques and Worker Conduct.*

<a id="how-documents-are-named"></a>

### Document Names

A worker names each document with the activity's prefix, so the folder sorts by activity (Figure 7). That is the activity, that prefix, and the list of expected documents (Figure 8). Where the folder sits is the [planning folder](state.md#the-planning-folder).

```mermaid
sequenceDiagram
  participant Activity
  participant Worker
  participant Folder
  Activity->>Worker: A numeric prefix, and the documents expected
  Worker->>Folder: Each document, prefixed
```

*Figure 7. Each Document Takes the Activity's Prefix.*

```mermaid
classDiagram
  class ActivityFile {
    leading digits are the prefix
  }
  class Prefix {
    put in front of each document
  }
  class ExpectedDocuments {
    built from the step techniques
  }
  class PlanningFolder {
    sorts by activity name
  }
  ActivityFile --> Prefix : read from the filename
  Prefix --> PlanningFolder : names each document
  ExpectedDocuments --> PlanningFolder : written there
```

*Figure 8. The Activity, Its Prefix, and the Documents Expected.*

<a id="asking-for-one-by-name"></a>

### Asking for One by Name

An agent asks for one technique that was not in the bundle (Figure 9). It names that technique by the step, or by the technique itself (Figure 10).

```mermaid
sequenceDiagram
  participant Agent
  participant Server
  Agent->>Server: Ask for one technique by name
  Server-->>Agent: That technique, if this session's definitions name it
```

*Figure 9. One Technique, Asked for by Name.*

```mermaid
classDiagram
  class StepName {
    the step that binds the technique
  }
  class TechniqueName {
    role technique, not bundled
  }
  class SessionDefinitions {
    only this session's names
  }
  StepName --> SessionDefinitions : asks for one
  TechniqueName --> SessionDefinitions : asks for one
```

*Figure 10. A Step Name, or an Technique Name.*

<a id="the-three-budgets"></a>

## Delivery Budgets

The window limits what one activity may add that the worker did not ask for. The batch limits what one context accumulates across a run. A **handover** is one tool result, and its limit is what that result may weigh.

They answer different questions and stay set apart (Figure 11). An activity, a run, and a result are what they bound (Figure 12). The numbers are in [configuration](configuration.md#delivery-budgets).

```mermaid
sequenceDiagram
  participant Delivery
  participant Window
  participant Run
  participant Result
  Delivery->>Window: What one activity may add unasked
  Delivery->>Run: What one context may accumulate
  Delivery->>Result: What one handover may weigh
```

*Figure 11. Separate Limits, Each on a Different Question.*

```mermaid
classDiagram
  class WindowBudget {
    unasked text, one activity
  }
  class BatchBudget {
    how much one context may accumulate
  }
  class ResultBound {
    how much one handover may weigh
  }
  class OneActivity
  class OneRun
  class OneHandover
  WindowBudget --> OneActivity : limits
  BatchBudget --> OneRun : limits
  ResultBound --> OneHandover : limits
```

*Figure 12. One Activity, One Run, and One Handover.*

<a id="the-window-budget"></a>

### Window Budget

A single activity spends a share of the worker's window on content the worker did not ask for, and stops when that share is gone (Figure 13). That is the window, the steps that may still be skipped, and the content that rides anyway (Figure 14).

```mermaid
sequenceDiagram
  participant Activity
  participant Window
  Activity->>Window: Spend on content not yet asked for
  Window-->>Activity: Stop at the first piece that would overflow
```

*Figure 13. One Activity Spends a Share of the Window.*

```mermaid
classDiagram
  class Window {
    the worker's context for one activity
  }
  class UnconditionalContent {
    the definition and the role contract
  }
  class SpeculativeSteps {
    steps a gate may still skip
  }
  UnconditionalContent --> Window : rides whatever the budget says
  SpeculativeSteps --> Window : spends the share, then stops
```

*Figure 14. Content That Rides, and Content That Spends the Share.*

<a id="the-batch-budget"></a>

### Batch Budget

One worker walks several activities, pauses at a commit and at a gate, and continues as the same worker (Figure 15). That run has a character limit and an activity limit (Figure 16). How the chain of agents is shaped is [dispatch](dispatch.md). What the numbers come to on a real corpus is in [benchmarks](../benchmark/README.md).

```mermaid
sequenceDiagram
  participant Orchestrator
  participant Worker
  Orchestrator->>Worker: Several activities, one identity
  Worker->>Orchestrator: Pause at a commit or a gate
  Orchestrator->>Worker: Continue as the same worker
```

*Figure 15. One Worker Walks a Run, and Continues after a Pause.*

```mermaid
classDiagram
  class Run {
    several activities, one worker
  }
  class CharacterLimit {
    text one context may hold
  }
  class ActivityLimit {
    activities one context may take
  }
  Run --> CharacterLimit : stops when either binds
  Run --> ActivityLimit : stops when either binds
```

*Figure 16. A Run, Bounded by Characters and by Activities.*

<a id="what-one-tool-result-may-carry"></a>

### One Tool Result

A handover goes out whole, and a log line is written when it has outgrown one result (Figure 17). That is the result and that log (Figure 18).

```mermaid
sequenceDiagram
  participant Server
  participant Agent
  Server->>Agent: The whole result
  Server->>Server: Log when it has outgrown one handover
```

*Figure 17. A Result Goes Out Whole, and Is Logged When It Is Too Large.*

```mermaid
classDiagram
  class ToolResult {
    goes out whole
  }
  class LogLine {
    work outgrew one handover
  }
  ToolResult --> LogLine : logged past the bound
```

*Figure 18. The Result, and the Log That Says to Split the Work.*

<a id="eager-technique-bundling"></a>

## Eager Bundling

Small steps are placed in the activity response until the window budget runs out, so those steps need no later fetch (Figure 19). That is the activity, the inlined steps, and the steps left to fetch (Figure 20).

```mermaid
sequenceDiagram
  participant Server
  participant Worker
  Server->>Worker: Small steps, inlined, until the window is spent
  Worker->>Server: Fetch a step the window left out
```

*Figure 19. Small Steps Ride with the Activity until the Window Is Spent.*

```mermaid
classDiagram
  class Activity {
    response for this dispatch
  }
  class InlinedSteps {
    small steps placed in that response
  }
  class LazySteps {
    left for a later fetch
  }
  Activity --> InlinedSteps : carries, until the window is spent
  Activity --> LazySteps : names, but does not carry
```

*Figure 20. Inlined Steps, and Steps Left to Fetch.*

<a id="resources-bodies-only-under-reference-delivery"></a>

### Resource Bodies

A linked resource arrives as a body only when a later delivery can collapse it, and as a name otherwise (Figure 21). Reference mode carries the body, and full mode carries the name (Figure 22).

```mermaid
sequenceDiagram
  participant Server
  participant Worker
  alt The context can collapse a repeat
    Server->>Worker: The resource body
  else Nothing to collapse against
    Server->>Worker: The resource's name
  end
```

*Figure 21. A Body When a Repeat Can Collapse, a Name Otherwise.*

```mermaid
classDiagram
  class ReferenceMode {
    a repeat can collapse
  }
  class FullMode {
    nothing yet to collapse against
  }
  class ResourceBody {
    the reference material itself
  }
  class ResourceName {
    ask for the body later
  }
  ReferenceMode --> ResourceBody : sends
  FullMode --> ResourceName : sends
```

*Figure 22. Reference Mode Carries Bodies. Full Mode Carries Names.*

<a id="reference-delivery"></a>

## Reference Delivery

A first delivery is in full, and a later delivery to the same context is a short marker (Figure 23). That is the context and its ledger (Figure 24). Two workers that share a session are two contexts.

```mermaid
sequenceDiagram
  participant Server
  participant Context
  Server->>Context: The payload, in full
  Context->>Server: Ask again
  Server->>Context: A marker for what this context already holds
```

*Figure 23. Full the First Time, a Marker When the Context Already Holds It.*

```mermaid
classDiagram
  class Context {
    one agent, spawn to finish
  }
  class Ledger {
    what this context was already sent
  }
  class Marker {
    stands for bytes already held
  }
  Context --> Ledger : records each delivery
  Ledger --> Marker : same bytes, sent again
```

*Figure 24. A Context, Its Ledger, and a Marker.*

<a id="token-usage-is-reported-not-derived"></a>

## What Gets Measured

Each dispatch and each fetch is recorded, and the agent reports what a turn cost (Figure 25). That is the history, the ledger, and that report (Figure 26). Coverage of a bundled step counts for [fidelity](workflow-fidelity.md#layer-5-the-step-manifest).

```mermaid
sequenceDiagram
  participant Server
  participant Agent
  Server->>Server: Record the dispatch and each fetch
  Agent->>Server: Report what the turn cost
```

*Figure 25. Dispatches Are Counted, and Cost Is Reported.*

```mermaid
classDiagram
  class History {
    one record per dispatch
  }
  class Ledger {
    full size, sent or saved
  }
  class UsageReport {
    turn cost, agent reported
  }
  class Dispatch
  class Fetch
  class Activity
  History --> Dispatch : counts
  Ledger --> Fetch : counts
  UsageReport --> Activity : one row each
```

*Figure 26. History, the Ledger, and the Agent's Report.*
