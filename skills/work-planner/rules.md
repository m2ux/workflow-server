# Rules

- **Linked sections.**
  Read a heading-linked section and its subsections, stopping before the next heading of equal or higher level. Follow in-text links as their context is needed for the selected work. Preserve boundaries in batched reads and recover truncated output. Reuse complete context already read at the same revision. Explicit whole-document requirements still apply.
- **Decisions.**
  Ask one at a time, following the [interview rules](guidelines.md#modes). A decision the run's [allowance](artifacts/plan-change.md#allowance) covers is taken with its recommended option rather than asked. Record each decision in the affected issues and, when there is one, the planning record.
- **Layers.**
  Modes, protocols, artifacts. A mode aggregates protocol calls, as an application calls services; a protocol runs artifact operations and other protocols; an artifact runs neither. A call goes down the stack, never up. A mode reaches an artifact operation directly only where no protocol owns that change.
- **Execution.**
  A call identifies its selected context and refreshed evidence; its command specification owns the I/O contract. A protocol is one change that lands in several artifacts together, and is run whole. Run another mode, a protocol, or a named subsection only where the procedure calls it; finish that call and provide its result before continuing, unless the procedure explicitly dispatches concurrent work.

## Link Roles

A Markdown link title identifies its role: `○` is a command input; `●` is a command output; `ƒ` is a called command, operation, protocol or procedure. Command specifications own I/O roles; nested calls carry the transformation role and any selection or continuation.
