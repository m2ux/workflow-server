# Draft mode

Authors a definition from scratch, and self-checks it against the units that bind its file kind before it is saved.

## Procedure

1. **Read what binds.**
   - Read the units that bind the file kind, per the [canon map](canon-map.md#which-units-bind-a-file-kind), and follow them.
   - Schema fields are `docs/schemas.md`.
2. **Open a live sibling.**  Conformance compares against those files.
3. **Write.**
4. **Self-check, then save.**
   - Re-walk the units from step 1, then run the [checks](commands.md#checks).
   - A self-check writes no findings register.
   - A change that will commit takes [Audit](audit-mode.md).
