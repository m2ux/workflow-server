---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
  order: 4
  legacy_id: 4
---

## Capability

Read the mitigation plan and apply the accepted mitigations to the target in implementation-priority order, verifying each change at its expected location, then present the applied-change summary with the modified-target and plan paths.

## Protocol

- Apply the accepted mitigations in `{mitigation_plan.implementation_priority}` order (`T1`, then `T2`, `T3`, `T4`), producing `{modified_target}`.
- Before applying each change, verify the target text matches the expected current text.  
  > When an earlier mitigation shifted text locations and a later change no longer matches, search for the expected text elsewhere in `{modified_target}`; apply it at the new location if found, otherwise report the conflict and skip.
- After each change, verify the new text is present at the expected location; report any change that fails verification and continue with the remaining changes.
- Present the applied-change summary with the verification results, the `{modified_target}` path (`{target_path}`), and the `{mitigation_plan_path}`.
