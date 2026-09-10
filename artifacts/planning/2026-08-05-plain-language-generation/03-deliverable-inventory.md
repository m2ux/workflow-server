# Deliverable inventory

What landed in the workflows corpus, how it is addressed, and what verification covered.

## Location

| Layer | Value |
|-------|-------|
| Worktree | `.worktrees/workflow/plain-language-generation` |
| Definitions path | `workflows/plain-language/` |
| Branch (workflows line) | `workflow/plain-language-generation` |
| Commit | `6036456c` — `feat(plain-language): add the plain-language workflow` |
| Pull request | [#431](https://github.com/m2ux/workflow-server/pull/431) (base `workflows`) |
| Size | 23 files, +1,364 lines |

## Tree

```
workflows/plain-language/
├── workflow.yaml
├── README.md
├── activities/
│   ├── README.md
│   ├── 01-intake-and-profile.yaml
│   ├── 02-source-analysis.yaml
│   ├── 03-draft.yaml
│   ├── 04-evaluate.yaml
│   └── 05-deliver.yaml
├── techniques/
│   ├── README.md
│   └── plain-language/
│       ├── TECHNIQUE.md
│       ├── intake-and-profile.md
│       ├── analyze-source.md
│       ├── draft-document.md
│       ├── evaluate-document.md
│       └── complete-checklist.md
└── resources/
    ├── README.md
    ├── plain-language-standard.md
    ├── asd-ste100.md
    ├── document-profile.md
    ├── source-analysis.md
    ├── evaluation-report.md
    ├── iso-checklist.md
    └── readme-seed.md
```

## Activity topology

| # | Activity | Modes | Outcome |
|---|----------|-------|---------|
| 01 | Intake and Profile | All | Classify operation; settle and persist reader profile; seed planning README |
| 02 | Source Analysis | Rewrite, Audit | Findings + strengths against the principles; audit ends here |
| 03 | Draft | Author, Rewrite | Plain-language document for its readers |
| 04 | Evaluate | Author, Rewrite | Evaluate–revise loop; ISO checklist |
| 05 | Deliver | Author, Rewrite | Write document to output path with conformance record |

## Cross-workflow technique addresses

| Bind | Capability |
|------|------------|
| `plain-language::intake-and-profile` | Classify operation; settle reader profile |
| `plain-language::analyze-source` | Audit existing document; record findings and strengths |
| `plain-language::draft-document` | Produce or revise the plain-language document |
| `plain-language::evaluate-document` | Verdict by principle; open issues |
| `plain-language::complete-checklist` | Walk Annex B checklist against the final draft |

Shared ops bound (not copied): `variable-binding`, `workflow-engine::create-readme`, `work-package::manage-artifacts::write-artifact`.

## Planning artifact → guide map

| Bare filename | Creation guide |
|---------------|----------------|
| `README.md` | meta `planning-readme` + `plain-language/readme-seed` |
| `document-profile.md` | `document-profile` |
| `source-analysis.md` | `source-analysis` |
| `plain-document.md` | Deliverable (no creation guide — the product, not a planning shape) |
| `evaluation-report.md` | `evaluation-report` |
| `iso-checklist.md` | `iso-checklist` |

## Verification

| Check | Result for this family |
|-------|------------------------|
| `workflow-yaml` / `activities` / `refs` / `resource-anchors` / `technique-template` | Pass |
| `identifier-qualification` | Pass (after renaming bare `request` → `user_request`, `checklist` → `iso_checklist`) |
| `fragments` | Pass (after rephrasing two rules that duplicated workflow-authoring verbatim) |
| `typecheck` | Pass |
| Pre-existing corpus `binding-fidelity` / `checkpoint-entry` debt | Unrelated to this additive family |

No server, schema, or other-workflow files were modified.
