# Checkpoints

A workflow sometimes has to stop and ask a person. Which directory to use, whether a change is ready, which of two readings was meant: the run cannot settle these from what it already knows, and a wrong guess produces work nobody wanted. A checkpoint is that pause, written into the steps, and it holds the run until someone answers.

The agent that reaches the pause is not the agent that can ask. Work travels down a [chain](dispatch.md) of agents. The ones at the bottom run in the background and cannot speak to the person, so the question travels up to the agent that can, and the answer travels back down. The pause begins when a worker reaches it, through the [calls](api-reference.md#workflow-navigation) that record it, show it, answer it, and continue.

## Checkpoint Flow

Figure 1 is the question traveling up to the person and the answer traveling back down. Figure 2 is the three agents and the session that holds the pause.

```mermaid
sequenceDiagram
  participant Session
  participant Worker
  participant Orchestrator
  participant Person as User-facing agent
  Worker->>Session: Record the pause and stop
  Worker->>Orchestrator: Hand up a block with no payload
  Orchestrator->>Person: Pass the block on unchanged
  Person->>Session: Read the question and record the answer
  Person->>Orchestrator: Wake, with the variable updates
  Orchestrator->>Worker: Wake
  Worker->>Session: Continue once the pause is cleared
```

*Figure 1. The Question Travels Up, and the Answer Travels Back Down.*

```mermaid
classDiagram
  class Worker
  class Orchestrator
  class UserFacingAgent
  class Session {
    the active pause
    the recorded answer
  }
  Worker --> Session : records and continues
  Orchestrator --> Worker : relays
  UserFacingAgent --> Session : shows the question and records the answer
  UserFacingAgent --> Orchestrator : wakes
```

*Figure 2. The Three Agents, and the Session That Holds the Pause.*

<a id="the-worker-pauses"></a>

### Worker Pauses

Figure 3 is the worker branching on the server's answer. Figure 4 is the worker, the session, and that answer.

```mermaid
sequenceDiagram
  participant Worker
  participant Session
  Worker->>Session: Record the pause
  alt No answer yet
    Session-->>Worker: Yielded
    Worker->>Worker: Emit an empty block and stop
  else An answer is already recorded
    Session-->>Worker: Replayed
    Worker->>Worker: Apply the answer and continue
  end
```

*Figure 3. The Worker Branches on Yielded or Replayed.*

```mermaid
classDiagram
  class Worker
  class Session {
    active pause
    recorded answer
  }
  Worker --> Session : records the pause
  Session --> Worker : yielded or replayed
```

*Figure 4. The Worker and the Session That Answers It.*

### One Pause per Session

Figure 5 is a second pause refused on a session that already has one, while a parent and a child each keep their own. Figure 6 is that slot on every session in the tree, and the answer key a replacement worker uses.

```mermaid
sequenceDiagram
  participant Worker
  participant Session
  participant Child
  Worker->>Session: Yield a pause
  Worker->>Session: Yield a second pause
  Session-->>Worker: Refused
  Child->>Child: Its own pause, held at the same time
```

*Figure 5. A Second Pause on One Session Is Refused.*

```mermaid
classDiagram
  class ParentSession {
    one pause
  }
  class ChildSession {
    one pause
  }
  class AnswerKey {
    activity and checkpoint
  }
  ParentSession --> ChildSession : embeds
  AnswerKey --> ParentSession : a replacement worker replays
```

*Figure 6. Each Session in the Tree Has One Slot.*

### Orchestrator Relays

Figure 7 is the block passing upward unchanged. Figure 8 is the orchestrator standing between the worker and the agent that can ask.

```mermaid
sequenceDiagram
  participant Worker
  participant Orchestrator
  participant Top as User-facing agent
  Worker->>Orchestrator: Checkpoint block
  Orchestrator->>Top: The same block, unread
  Orchestrator->>Orchestrator: Sleep
```

*Figure 7. The Block Passes Upward Unchanged.*

```mermaid
classDiagram
  class Worker
  class Orchestrator
  class UserFacingAgent
  Worker --> Orchestrator : emits the block
  Orchestrator --> UserFacingAgent : passes it on
```

*Figure 8. The Orchestrator between the Worker and the User-Facing Agent.*

<a id="the-user-facing-agent-presents-and-resolves"></a>

### User-Facing Agent Presents and Resolves

Figure 9 is the question shown to the person and the answer written back. Figure 10 is the agent, the session, and the two kinds of effect.

```mermaid
sequenceDiagram
  participant Agent as User-facing agent
  participant Session
  participant Person
  Agent->>Session: Read the question and the options
  Agent->>Person: Ask
  Person-->>Agent: The answer
  Agent->>Session: Record the answer and clear the pause
```

*Figure 9. The Question Is Shown, and the Answer Is Written Back.*

```mermaid
classDiagram
  class UserFacingAgent
  class Session
  class SetVariable
  class Exit
  UserFacingAgent --> Session : reads and records
  Session --> SetVariable : writes a variable
  Session --> Exit : names an outcome
```

*Figure 10. The Agent, the Session, and the Two Effects.*

<a id="three-ways-to-resolve-one"></a>

### Three Ways to Resolve One

Figure 11 is the server accepting exactly one of the three answers. Figure 12 is those three answers and the two timers.

```mermaid
sequenceDiagram
  participant Agent as User-facing agent
  participant Server
  Agent->>Server: One of the three answers
  alt The wait has not elapsed
    Server-->>Agent: Rejected
  else The wait has elapsed
    Server-->>Agent: Recorded
  end
```

*Figure 11. Exactly One Answer, after Its Wait.*

```mermaid
classDiagram
  class OptionChosen
  class AutoAdvance
  class ConditionNotMet
  class PauseTimestamp
  OptionChosen --> PauseTimestamp : three seconds
  AutoAdvance --> PauseTimestamp : the declared wait
  ConditionNotMet --> PauseTimestamp : no wait
```

*Figure 12. The Three Answers and the Timers They Wait On.*

<a id="the-resume-protocol"></a>

## Resume Protocol

Figure 13 is the agents waking in reverse, and the worker refused while the pause is still active. Figure 14 is the same three agents, with one agent playing both roles when nothing is in the background.

```mermaid
sequenceDiagram
  participant Top as User-facing agent
  participant Orchestrator
  participant Worker
  participant Session
  Top->>Orchestrator: Wake, with the variable updates
  Orchestrator->>Worker: Wake
  Worker->>Session: Continue
  alt The pause is still active
    Session-->>Worker: Hard error
  else The pause is cleared
    Session-->>Worker: The recorded effects
  end
```

*Figure 13. The Agents Wake in Reverse, or the Worker Is Refused.*

```mermaid
classDiagram
  class UserFacingAgent
  class Orchestrator
  class Worker
  class SingleAgent {
    both roles
  }
  UserFacingAgent --> Orchestrator : wakes
  Orchestrator --> Worker : wakes
  SingleAgent --> SingleAgent : switches back to the worker role
```

*Figure 14. Three Agents Waking, or One Agent Switching Role.*

## Declaring a Checkpoint

Figure 15 is one declaration reused at several sites, then shown to the worker as an ordinary checkpoint. Figure 16 is the step, the shared routine, and the sites that refer to it.

```mermaid
sequenceDiagram
  participant Author
  participant Routine
  participant Site
  participant Worker
  Author->>Routine: Declare the gate once
  Site->>Routine: Refer to it
  Routine->>Worker: An ordinary checkpoint
```

*Figure 15. Declared Once, Then Shown as an Ordinary Checkpoint.*

```mermaid
classDiagram
  class CheckpointStep
  class Routine
  class Site
  Routine --> CheckpointStep : the body
  Site --> Routine : a reference
```

*Figure 16. The Step, the Shared Routine, and the Sites That Refer to It.*

The step's fields are the [schema](../schemas/README.md#checkpoint-step).

## Where a Checkpoint Belongs

Figure 17 is a gate placed before the steps its answer steers, and a gate placed too late. Figure 18 is the checkpoint, the later steps, and the check that reports a decision read too early.

```mermaid
sequenceDiagram
  participant Run
  participant Gate as Checkpoint
  participant Later as Later steps
  Run->>Gate: Ask
  Gate->>Later: The answer is available
  Note over Later: A step before the gate reads nothing and is skipped
```

*Figure 17. The Gate Comes before the Steps Its Answer Steers.*

```mermaid
classDiagram
  class Checkpoint
  class LaterStep
  class EarlierStep
  class DecisionOrderCheck
  Checkpoint --> LaterStep : the answer applies
  EarlierStep --> DecisionOrderCheck : reported, unless exempt
```

*Figure 18. The Checkpoint, the Steps around It, and the Order Check.*

### Never the First Step

Figure 19 is a checkpoint refused as the first step, and the two places that decision can sit instead. Figure 20 is the activity and the dispatch that would otherwise pay for a pause before any work.

```mermaid
sequenceDiagram
  participant Dispatch
  participant Activity
  Dispatch->>Activity: First step is a checkpoint
  Activity-->>Dispatch: Refused
  Note over Activity: Put the decision at the previous activity's end, or before dispatch
```

*Figure 19. A Checkpoint Is Refused as the First Step.*

```mermaid
classDiagram
  class Activity
  class Checkpoint
  class PrecedingActivity
  class Orchestrator
  Activity --> Checkpoint : not the first step
  PrecedingActivity --> Checkpoint : the decision sits at its end
  Orchestrator --> Activity : or the decision is a precondition of dispatch
```

*Figure 20. The Activity, and the Two Places the Decision Can Sit.*

## What the Design Buys

Figure 21 is a question kept off a background agent and a pause that outlives the worker. Figure 22 is the channel, the session, and the timers. What those timers cannot prove is in [fidelity](workflow-fidelity.md).

```mermaid
sequenceDiagram
  participant Worker
  participant Top as User-facing agent
  participant Session
  Worker->>Top: The question, via the relay
  Note over Worker: The worker does not ask the person
  Worker->>Session: The pause and the answer
  Note over Session: A replacement worker reads the same answer
```

*Figure 21. The Question Stays with the Agent Who Can Ask, and the Pause Stays in the Session.*

```mermaid
classDiagram
  class UserFacingAgent {
    the only channel to the person
  }
  class Orchestrator {
    passes the block unread
  }
  class Session {
    pause and answer
  }
  class Timers
  UserFacingAgent --> Session
  Orchestrator --> UserFacingAgent
  Timers --> Session : an instant answer is refused
```

*Figure 22. The Channel, the Unread Relay, the Session, and the Timers.*
