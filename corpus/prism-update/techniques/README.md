# Prism Update Techniques

> Part of [prism update](../README.md)

Shared Inputs, Outputs, Rules, and Errors for every technique in this set.

The shared contract every operation here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`diff-upstream`](diff-upstream.md) | Diff an upstream prisms directory against current resources, producing a categorized change set (new, modified, renamed, deleted) with family classification for new prisms |
| [`submit-update`](submit-update.md) | Submit the applied changes for review on a feature branch as a pull request against the `workflows` branch, recording its URL |
| [`sync-resources`](sync-resources.md) | Apply an approved change set to the resources directory, committing each change type separately for clean git history |
| [`update-prism-docs`](update-prism-docs.md) | Rebuild prism documentation to reflect the current resource catalog, adding prompt guide entries for new prisms with concrete example prompts that align with the goal-mapping matrix |
| [`update-skill-routing`](update-skill-routing.md) | Update prism routing technique files to reflect resource changes: fix renamed references, add goal-mapping entries for new prisms, expand lens catalogs, and update resource lists |
| [`verify-prism-consistency`](verify-prism-consistency.md) | Verify consistency across prism resources, techniques, and documentation, flagging content drift, stale references, routing mismatches, count discrepancies, and duplicate indices into a… |
