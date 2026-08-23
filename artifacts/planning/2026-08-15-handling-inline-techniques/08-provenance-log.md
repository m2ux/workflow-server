# Provenance Log

| Task ID | Assistant | Model | Prompt Class | Context Scope | Description |
|---|---|---|---|---|---|
| T0 | claude | claude-opus-5[1m] | mixed | mixed | Merged `origin/main` forward into the feature branch at `e5b12b48` and provisioned the `workflows` corpus submodule at `7f37a2bd`, clearing both plan blockers |
| T1 | claude | claude-opus-5[1m] | mixed | mixed | Added `src/utils/reference-grammar.ts` publishing the ten counting terms with a shape-keyed link classifier and call-site extractor, delegated `src/utils/resource-ref.ts` claiming to it, and added `tests/reference-grammar.test.ts` |
| T2 | claude | claude-opus-5[1m] | mixed | mixed | Pointed all three ancestor-resolution sites in `src/loaders/technique-loader.ts` at the callee's source workflow, with cross-workflow and both-doors parity cases in `tests/technique-loader.test.ts` |
| T4 | claude | claude-opus-5[1m] | refactoring | repo-only | Resolved all three Protocol-section intra-group calls in `workflows/meta/techniques/atlassian-operations/` into their callers, taking the group from 3 logical call sites to 0 and leaving the seven rule-borne references in `TECHNIQUE.md` intact |
| T5 | claude | claude-opus-5[1m] | docs | repo-only | Cited `version-control.infrastructure-submodule-paths` by dotted address at both sites that addressed it as a qualified operation, taking residual container-targeting call sites from 2 to 0, and corrected the `create-pr` path in `workflows/prism-update/techniques/submit-update.md` to resolve inside the corpus root |
