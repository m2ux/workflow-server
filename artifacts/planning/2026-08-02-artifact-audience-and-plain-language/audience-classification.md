# Audience classification: the decision recorded for all 139 output declarations

Every `#### artifact` declaration in the corpus now carries `#### audience`. This record holds the reasoning: the rule the declarations follow, the artifacts whose substance is agent state but whose on-disk form is still markdown, and the artifacts read by both a person and a later step.

## The rule the declarations follow

An `agent`-audience artifact is JSON on disk — the technique protocol specification makes that part of the attribute's meaning, and `scripts/check-audience.ts` enforces it. So a declaration can only say `agent` where the artifact is already a `.json` file. Declaring `agent` on a markdown filename and converting the file are the same act, and that conversion is the deferred work item.

Each declaration therefore states the reader of the artifact **as it exists on disk today**. The classification of what an artifact *should* be is recorded below rather than declared, so no declaration promises a format the file does not have.

## What was declared

| Audience | Declarations | Where |
|---|---|---|
| `agent` | 14 | substrate-node-security-audit 7, cicd-pipeline-security-audit 7 |
| `human` | 125 | prism 29, work-package 22, workflow-design 19, work-packages 9, workflow-authoring 7, requirements-refinement 7, prism-audit 7, midnight-system-review 7, substrate-node-security-audit 4, ponytail 4, prism-evaluate 3, codebase-wiki 3, cicd-pipeline-security-audit 2, remediate-vuln 1, meta 1 |

The 14 agent declarations are the scanner, registry, reconnaissance and merge outputs of the two security-audit workflows. They were structured JSON against a declared sub-agent schema before this change; the attribute now says so, and the audience guard stops passing vacuously.

## Registers whose substance is agent state

These are read back mechanically by a later step of the same run, or by a triggering workflow, and never linearly by a person. Each is declared `human` because it is prose markdown today. Converting the file and flipping the declaration is one act, tracked as the conversion work item.

| Artifact | Producer | Who reads it back |
|---|---|---|
| `RUN-MANIFEST.md` | prism `emit-run-manifest` | prism-audit `read-run-manifest`; the contract a triggering workflow reads to locate results |
| `change-block-index.md` | work-package `review-diff` | later review steps, by block ID |
| `provenance-log.md` | work-package `dco-provenance::append-task-row` | later task rows appended to the same register |
| `assumptions-log.md` | work-package `review-assumptions::record` | later `record` and `reconcile` calls; `assess-ticket-completeness` |
| `evidence-log.md` | midnight-system-review `consolidate-evidence` | the adjudication pass, by evidence ID |
| `findings-register.md` | workflow-authoring `compile-report`; midnight-system-review `register-findings` | later steps of the same run — the workflow-authoring guide says so in its own words |
| `structural-inventory.md` | workflow-design `intake-classification` | the impact and drafting passes |
| `drafting-plan.md` | workflow-design `assemble-file-approach` | updated in place each file iteration, then read by the review pass |
| `file-review-note.md` | workflow-design `review-drafted-file` | the attestation pass |
| `prior-feedback-triage.md` | work-package `review-existing-feedback` | the review summary, by disposition |
| `debt-ledger.md` | ponytail `harvest-debt` | the gain report |
| `follow-ups.md`, `deferred-items.md` | many | `finalize-documentation::create-complete-doc`, for the Open Work counts |

## Artifacts read by both a person and a later step

These carry an explicit decision rather than a default. Each is declared `human` because a person reads it first and a person is the reader the format has to serve; the mechanical read is a narrow field lookup that survives a prose layout.

| Artifact | Why both | Decision |
|---|---|---|
| planning `README.md` | The human operator's entry point; `sync-progress-status` selects rows by field | `human`. The README's index role is its reason to exist, and the progress-tracking mandate stays with it. |
| `START-HERE.md` | The roadmap a person opens; `execute-package` and the triggering protocol read `current_package` out of its status table | `human`. The status table is one field read, not a register walk. |
| `work-package-plan.md`, `test-plan.md` | Design write-ups whose tables later steps consult | `human`. The prose is the payload; the tables are inside it. |
| `format-conventions.md` | Its guide asks for brevity so a person can skim it at a literacy gate | `human`, as its own guide already requires. |
| `DEFINITIVE-FINDINGS.md` | A report a person reads; prism-audit and prism-evaluate read findings out of it | `human`. It is a published report with its own contract. |
| `index.md`, `log.md` | The wiki's navigation and mutation ledger, browsed by people and traversed by `query` | `human`. Hierarchical navigation is the contract, and a person browses the same hierarchy. |

## What this unblocks

The audience guard now measures 14 real declarations instead of zero. A guard over declaration *presence* — every artifact declaration carries an audience — becomes checkable from the same walk, and lands with the enforcement work item.
