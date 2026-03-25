# Step Completion Manifest

## Problem

Activities contain ordered steps that agents execute sequentially. Currently the agent receives all steps from `get_activity` and is expected to follow the sequence on its own. There is no server-side validation that steps were executed in order or that none were skipped.

## Approach

When an agent transitions to the next activity (calling `get_activity` or `validate_transition`), it must include a **step completion manifest** — a structured summary of what was done at each step of the previous activity. The server validates the manifest's structure against the expected step sequence.

## Manifest Format

The manifest is passed as a parameter on the transitioning tool call:

```json
{
  "step_manifest": [
    { "step_id": "resolve-target", "output": "Target verified at /home/user/project" },
    { "step_id": "initialize-target", "output": "Checked out main, pulled latest" },
    { "step_id": "detect-project-type", "output": "project_type=other" }
  ]
}
```

## Server Validation

When receiving a manifest, the server:

1. Loads the previous activity definition (from token.act)
2. Extracts the expected step sequence (required steps only)
3. Validates:
   - All required step IDs are present
   - Step IDs are in the correct order
   - Each entry has a non-empty output description
   - No unexpected step IDs are included
4. Returns validation result in `_meta.validation`

## Design Constraint: No Optional Steps

All steps within an activity are required. Optionality is handled exclusively at the activity level via transition conditions. This simplifies manifest validation to a straightforward check: all step IDs present, in correct order, with non-empty outputs.

Three existing optional steps need refactoring to separate activities:
- `post-impl-review` → `architecture-summary` step → new `architecture-review` activity
- `smart-pass` → `fill-knowledge` step → conditional activity or always-run
- `smart-pass` → `run-dispute` step → conditional `smart-dispute` activity

This is a separate work package — the manifest validator assumes all steps required.

## Limitations

- The server cannot verify that the agent *actually* executed each step — only that it accounted for each step in the manifest
- The output descriptions are agent-generated and unverifiable without filesystem access
- This is a behavioral constraint, not a cryptographic guarantee

## Implementation Notes

- The manifest parameter is optional initially (backward compatibility)
- When present, validation is performed; when absent, a warning is returned
- The HMAC-signed token prevents the agent from fabricating the token.act field, so the server can trust which activity the manifest refers to
- Future: step outputs could be cross-referenced against artifacts on disk for stronger verification

## Relationship to Token Validation

| Layer | What it validates | How |
|-------|------------------|-----|
| Token HMAC | Token integrity (not fabricated/tampered) | Cryptographic signature |
| Token fields | Cross-activity consistency (workflow, transition, skill) | Field comparison |
| Step manifest | Intra-activity completeness (all steps in order) | Structure validation |
