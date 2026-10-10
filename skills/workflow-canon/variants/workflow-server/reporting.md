# Report Delivery

Project workflow runs supply their own artifact templates and persistence steps.

## Workflow Reports

That run's guide owns the layout:

| Artifact | Guide, on the corpus tree |
|----------|---------------------------|
| `findings-register.md` | `corpus/workflow-authoring/resources/findings-register.md` |
| `compliance-review.md` / `post-update-review.md` | `corpus/workflow-design/resources/compliance-report.md` |
| per-pass `*-findings.md` | `corpus/workflow-design/resources/findings-satellite.md` |

Fetch the guide's `## Template` and fill it. Persist through the activity's `manage-artifacts::write-artifact` step.
