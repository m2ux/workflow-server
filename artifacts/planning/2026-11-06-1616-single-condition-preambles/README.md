# Single-Condition Command Preambles

> Authoring preference · Created 2026-11-06

## Executive Summary

A command specification with one prose condition or detail item places that prose alongside its preamble before the invocation, without a bullet. Related sentences may form one item, as in the user's Lane assignment example. Genuine multi-item lists remain below the invocation. The durable rule belongs in the existing Spec Layout guideline.

Apply the rule throughout the installed command specifications. The inventory identifies four single-item prose lists: Compute Dispatch Status, Check Dispatch Start, Write Lane Assignments and Sync Task Issue. Preserve every condition, role link, generic invocation, template and callable heading. No behavior, I/O contract or reading boundary changes.

## Validation

Review the four prose moves and the updated guideline. Compare invocation blocks, literal templates, heading/link identities and normalized command text with the baseline. Run the installed model and existing document/command consumer checks. No new semantic test or live tracker execution is required for this presentation change. Commit and push the current task branch and evidence; keep PR #1641 draft.

## Links

| Resource | Link |
| --- | --- |
| Draft PR | https://github.com/m2ux/workflow-server/pull/1641 |

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Inventory](inventory.json) | All single-item command detail lists and exact pre-edit prose |
| [Validation](validation.md) | Source, reviewed moves, checks and verification limits |
| [Preservation](preservation.json) | Exact invocation/template/heading/link comparison |
| [Verification script](verify.py) | Reproducible inventory-based comparison |
| [Model](model.log) | Installed model result |
| [Document tests](documents.log) | Existing document consumer result |
| [Command tests](commands.log) | Existing executable command consumer result |

## Result

Committed and pushed as `d6be48053b4d74333d742a140df5e187e6c344d9`. All four sole prose items accompany their command preambles without bullets, with the rule in the existing guideline. Twenty-eight consumer tests pass and the installed model reports zero findings. Invocation blocks, templates, headings, links and reading boundaries are preserved. PR #1641 remains draft.
