# Rules

- **Linked sections.**
  Read a heading-linked section and its subsections, stopping before the next heading of equal or higher level. Read that file's Prerequisites first; reading prerequisites does not execute procedures. A mode named in another mode's Prerequisites is read as a document, and its own Prerequisites load only where a step runs it. Preserve boundaries in batched reads and recover truncated output. Reuse complete prerequisites already read at the same revision. Explicit whole-document requirements still apply.
- **Decisions.**
  Ask one at a time, following the [interview rules](guidelines.md#modes). A decision the run's [allowance](artifacts/plan-change.md#allowance) covers is taken with its recommended option rather than asked. Record each decision in the affected issues and, when there is one, the planning record.
- **Layers.**
  Modes, protocols, artifacts. A mode aggregates protocol calls, as an application calls services; a protocol runs artifact operations and other protocols; an artifact runs neither. A call goes down the stack, never up. A mode reaches an artifact operation directly only where no protocol owns that change.
- **Execution.**
  A call passes its named inputs. A protocol is one change that lands in several artifacts together, and is run whole. Run another mode, a protocol, or a named subsection only where the procedure calls it; finish that call and return its result before continuing, unless the procedure explicitly dispatches concurrent work.
