# Implement mode

Makes a specified change: a work item, a finding, or a defect with a location. A finding is closed with the Fix its entry states. The surface is the specification, not the diff.

## Procedure

1. **Resolve to files.**
   - Resolve the specification to files, then add the I/O-contract closure and consumers per Audit mode's [Scope](audit-mode.md#scope).
   - Confirm the specification still holds against the tree: the construct is where it says, the count is what it says, the absence is an absence.
   - What has moved is reported first. Where nothing remains to change, that is the finding.
2. **Read what binds.**
   - Read as [Draft](draft-mode.md) does.
   - When the change answers a finding, follow that entry's Fix and Do not flag.
3. **Preserve.**  Name what the entries require the change to preserve.
4. **Walk the draft, then write.**
   - Walk the prescribing entry, then every unit the destination file kind routes to, splitting [compound headings](walk-rules.md#order).
   - Rewrite while an entry still fires.
   - Then run the [checks](commands.md#checks).
5. **Audit.**
   - [Audit](audit-mode.md) from the branch point, each touched file whole.
   - A finding here means the draft walk was skipped or the entry was misread.
