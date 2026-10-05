# Binding-fidelity re-affirmation

Stamp `7062aa0a1c4206620ca6b30551103cd043bb29ea`. Thirteen entries cite a file that changed after that stamp. The corpus guard suite on this tree is 52 pass, so each entry still matches a live finding. The cited construct is still the one the rationale names.

| Site | Output or step | Rationale | Still holds |
| --- | --- | --- | --- |
| codebase-wiki/techniques/query.md | `wiki_answer` | shared-op-return-contract | yes |
| meta/techniques/harness-compat/spawn-concurrent.md | `results` | shared-op-return-contract | yes |
| meta/techniques/orchestration-patterns/execute-plan-step.md | `step_result` | shared-op-return-contract | yes |
| meta/techniques/orchestration-patterns/invoke-as-tool.md | `tool_result` | shared-op-return-contract | yes |
| meta/techniques/verify-artifact-conforms.md | `artifact_conformance` | shared-op-return-contract | yes |
| meta/techniques/workflow-engine/finalize-activity.md | `activity_result` | shared-op-return-contract | yes |
| meta/techniques/workflow-engine/start-session.md | `opening_candidates`, `opening_decision`, `opening_recommendation` | shared-op-return-contract | yes |
| meta/techniques/workflow-engine/yield-checkpoint.md | `yielded_checkpoint` | shared-op-return-contract | yes |
| workflow-design/techniques/TECHNIQUE.md | `workflow_files` | container-contract-shape | yes |
| canon/techniques/reformat-doc.md | `reformatted_document` | agent-applied-result | yes |
| work-package/activities/06-plan-prepare.yaml[reconcile-research-candidates] | `research/reconcile` | group-technique-path | yes — `techniques/research/reconcile.md` is on disk |
