# Author mode

Writes definition content: a new definition, or a specified change to existing ones, such as a work item, a finding, or a defect with a location. A finding is closed with the Fix its entry states.

## Procedure

1. **Resolve to files.**
   - List every file the change adds or edits. A new definition also edits each file that wires it in, such as `workflow.yaml` or the activity that binds it.
   - Add the I/O-contract closure and consumers per Audit mode's [Scope](audit-mode.md#scope).
   - For a specified change, the surface is the specification, not the diff. Confirm it still holds against the tree: the construct is where it says, the count is what it says, the absence is an absence.
   - What has moved is reported first. Where nothing remains to change, that is the finding.
2. **Read what binds.**
   - Read the units that bind each file kind, per the [canon map](canon-map.md#file-kinds), and follow them.
   - When the change answers a finding, follow that entry's Fix and Do not flag.
3. **Open a live sibling.**  Conformance compares against those files.
4. **Preserve.**  Name what the entries require the change to preserve.
5. **Walk the draft, then write.**
   - Walk the prescribing entry, when there is one, then every unit the destination file kind routes to, splitting [compound headings](walk-rules.md#order).
   - Rewrite while an entry still fires.
   - Then run the [checks](commands.md#checks).
6. **Audit.**
   - [Audit](audit-mode.md) from the branch point, each touched file whole.
   - A draft not yet bound for a commit stops at step 5, and writes no findings register.
   - A finding here means the draft walk was skipped or the entry was misread.
