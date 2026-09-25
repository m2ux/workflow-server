# Architecture

The workflow server drives agents through long engineering tasks. The task is often ambiguous, it outlasts one agent's **context**, the working memory that agent holds, and an agent that loses its place can damage a codebase. Read the sections in order. Each one is the outline of a page, and the page is the account.

A **dispatch** divides the work so that no one context holds all of it. A **checkpoint** is how a **worker**, an agent that cannot speak to the person, still gets an answer. **State** is the path already written down, so the next step is not a guess. Notes from the run live in a **planning folder**, apart from the code.

A **workflow** is the guide an operator follows. A **technique** is one capability a step names. A **routine** is a run of steps written once and spliced in wherever it is needed. A **resource** is reference material a technique cites and does not contain.

**Resolution** is how a name stands for one file. **Delivery** is that file handed over when the run needs it. **Fidelity** is the check on a claim to have followed the workflow.

## Dispatch

One agent cannot talk to a person, track a long run, and write the code. Talking, tracking, and doing stay apart, each in its own context (Figure 1). A worker that runs out of room can be replaced, and the run does not lose its place. That division is what [dispatch](dispatch.md) is (Figure 2).

```mermaid
sequenceDiagram
  participant Work
  participant Agents
  Work->>Agents: Divided, one context each
```

*Figure 1. Work Divided So No One Context Holds All of It.*

```mermaid
classDiagram
  class Work {
    task the whole
  }
  class Talk {
    person speaks to the
  }
  class Track {
    run follows the
  }
  class Doing {
    work does the
  }
  Work --> Talk : a context for talking
  Work --> Track : a context for tracking
  Work --> Doing : a context for the work
```

*Figure 2. Talking, Tracking, and Doing, Kept Apart.*

## Checkpoints

The work sometimes cannot decide, and the agent doing the work cannot ask the person. The question leaves the work (Figure 3). It comes back as an answer, and the work goes on. That leaving and returning is what [checkpoints](checkpoint.md) are (Figure 4).

```mermaid
sequenceDiagram
  participant Work
  participant Question
  Work->>Question: Cannot decide
  Question->>Work: Returns as an answer
```

*Figure 3. A Question Leaves the Work and Comes Back.*

```mermaid
classDiagram
  class Question {
    decide what the work cannot
  }
  class Answer {
    decides what the person
  }
  Question --> Answer : is answered by
```

*Figure 4. A Question, and the Answer That Returns.*

## State

Ask what to do next, and two runs of the same facts can take different paths. The next place is written down before the run reaches it, so those runs take the same path (Figure 5). Notes from the run stay in the planning folder, apart from the code. Where that folder sits is the workspace [project layout](https://github.com/m2ux/workflow-server/blob/workspace/docs/layout.md), what it holds is [state](state.md#the-planning-folder), and the path itself is [state](state.md) (Figure 6).

```mermaid
sequenceDiagram
  participant Run
  participant Path
  Path->>Run: The next place is already written
```

*Figure 5. The Next Place Is Written before the Run Reaches It.*

```mermaid
classDiagram
  class Run {
    path follows the written
  }
  class Path {
    place the next
  }
  Path --> Run : names the next place
```

*Figure 6. A Run, and the Path Written Down for It.*

## Workflow

The operator follows one guide from the first phase to the last. The guide names each phase and where each outcome leads (Figure 7). One file holds that guide. That file is what a [workflow](workflow.md) is (Figure 8).

```mermaid
sequenceDiagram
  participant Operator
  participant Guide
  Operator->>Guide: Follow it from the first phase to the last
```

*Figure 7. One Guide, Followed from the First Phase to the Last.*

```mermaid
classDiagram
  class Workflow {
    guide the operator's
  }
  class Activity {
    guide one phase of the
  }
  class Exit {
    next where the outcome leads
  }
  Workflow --> Activity : names
  Activity --> Exit : an outcome
```

*Figure 8. Workflow, Activity, and Exit.*

## Technique

A step names one way of doing a thing, written down so any step can name it (Figure 9). The file says what it does, what it needs, and the steps to follow. That file is what a [technique](technique.md) is (Figure 10).

```mermaid
sequenceDiagram
  participant Step
  participant Technique
  Step->>Technique: Name the way of doing this
```

*Figure 9. A Step Names One Way of Doing a Thing.*

```mermaid
classDiagram
  class Step {
    technique names a
  }
  class Technique {
    follow what to do and how to
  }
  Step --> Technique : names
```

*Figure 10. A Step, and the Technique It Names.*

## Routine

The same run of steps shows up in more than one phase. It is written once, and each site splices it in (Figure 11). The site supplies the arguments. That reuse is what a [routine](routine.md) is (Figure 12).

```mermaid
sequenceDiagram
  participant Site
  participant Routine
  Site->>Routine: Splice in the run written once
```

*Figure 11. A Site Splices in a Run Written Once.*

```mermaid
classDiagram
  class Routine {
    once a run written
  }
  class Site {
    arguments supplies the
  }
  Site --> Routine : splices in
```

*Figure 12. A Routine, and a Site That Splices It In.*

## Resource

A technique sometimes needs a long guide it should not contain. That guide is cited, and fetched when the step needs it (Figure 13). One section can be fetched alone. That guide is what a [resource](resource.md) is (Figure 14).

```mermaid
sequenceDiagram
  participant Technique
  participant Resource
  Technique->>Resource: Cite the guide, and fetch it when needed
```

*Figure 13. A Technique Cites a Guide and Fetches It When Needed.*

```mermaid
classDiagram
  class Technique {
    contain cites a guide it does not
  }
  class Resource {
    needed the guide, fetched when
  }
  Technique --> Resource : cites
```

*Figure 14. A Technique, and the Resource It Cites.*

## Resolution

A whole workflow's instructions are too much to hand over at once. The run names the one capability it needs now (Figure 15). That name stands for a file, and the rest stays unread. That standing-for is what [resolution](resolution.md) is (Figure 16).

```mermaid
sequenceDiagram
  participant Run
  participant Name
  participant File
  Run->>Name: The one capability needed now
  Name->>File: Stands for the file
```

*Figure 15. A Name Stands for One File.*

```mermaid
classDiagram
  class Name {
    capability asked for
  }
  class File {
    capability text of the
  }
  Name --> File : stands for
```

*Figure 16. A Name, and the File It Stands For.*

## Delivery

The named file has to reach the agent that needs it. It is handed over when it is needed, not all at once (Figure 17). A later need for the same file does not send the whole text again. That handing-over is what [delivery](delivery.md) is, and how a document in the planning folder is [named](delivery.md#how-documents-are-named) is there too (Figure 18).

```mermaid
sequenceDiagram
  participant Run
  participant File
  Run->>File: Ask for the piece needed now
  File->>Run: That piece, and not the rest
```

*Figure 17. One Piece Is Handed Over When Needed.*

```mermaid
classDiagram
  class Run {
    file agent that needs the
  }
  class File {
    agent piece handed to the
  }
  Run --> File : asks for this piece
  File --> Run : returns only this piece
```

*Figure 18. A Run, and the One Piece Handed to It.*

## Fidelity

An agent can claim it followed the workflow and be wrong. What the run claims can be set beside what was declared (Figure 19). A mismatch is visible, rather than left as a story the agent tells. That comparison is what [fidelity](fidelity.md) is (Figure 20).

```mermaid
sequenceDiagram
  participant Claim
  participant Declared
  Claim->>Declared: Set beside what was written down
```

*Figure 19. A Claim Set beside What Was Declared.*

```mermaid
classDiagram
  class Claim {
    happened says what
  }
  class Declared {
    wrote what the workflow
  }
  Claim --> Declared : compared with
```

*Figure 20. A Claim, and What Was Declared.*
