# Provenance Log

| Task ID | Assistant | Model | Prompt Class | Context Scope | Description |
|---|---|---|---|---|---|
| T0 | claude | claude-opus-5[1m] | mixed | mixed | Merged `origin/main` forward into the feature branch at `e5b12b48` and provisioned the `workflows` corpus submodule at `7f37a2bd`, clearing both plan blockers |
| T1 | claude | claude-opus-5[1m] | mixed | mixed | Added `src/utils/reference-grammar.ts` publishing the ten counting terms with a shape-keyed link classifier and call-site extractor, delegated `src/utils/resource-ref.ts` claiming to it, and added `tests/reference-grammar.test.ts` |
| T2 | claude | claude-opus-5[1m] | mixed | mixed | Pointed all three ancestor-resolution sites in `src/loaders/technique-loader.ts` at the callee's source workflow, with cross-workflow and both-doors parity cases in `tests/technique-loader.test.ts` |
