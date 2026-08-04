# Audience classification: the decision recorded for all 139 output declarations

Every `#### artifact` declaration in the corpus now carries `#### audience`. This record holds the reasoning: the rule the declarations follow, the artifacts whose substance is agent state but whose on-disk form is still markdown, and the artifacts read by both a person and a later step.

## The rule the declarations follow

An `agent`-audience artifact is JSON on disk — the technique protocol specification makes that part of the attribute's meaning, and `scripts/check-audience.ts` enforces it. So a declaration can only say `agent` where the artifact is already a `.json` file. Declaring `agent` on a markdown filename and converting the file are the same act, and that conversion is the deferred work item.

A declaration therefore states the reader of the artifact **as it exists on disk today**. Where that cannot be said honestly — a register whose only reader is a later step, still in markdown — the declaration is **absent** rather than forced to `human`. Absent already means `human` by default, so the format is unchanged either way; what changes is that no declaration claims a reader the file's form contradicts. `check-audience` deliberately checks the JSON-format convention and not presence, so the wait is not a standing failure.

## What was declared

| Audience | Declarations | Where |
|---|---|---|
| `agent` | 14 | substrate-node-security-audit 7, cicd-pipeline-security-audit 7 |
| `human` | 117 | every artifact a person reads, including the four registers reviewed and kept as prose |
| absent, pending conversion | 8 | the registers approved for conversion below |

The 14 agent declarations are the scanner, registry, reconnaissance and merge outputs of the two security-audit workflows. They were structured JSON against a declared sub-agent schema before this change; the attribute now says so, and the audience guard stops passing vacuously.

## Registers whose substance is agent state

These are read back mechanically by a later step of the same run, or by a triggering workflow, and never linearly by a person. None carries a declaration: `agent` would contradict the markdown on disk, and `human` would contradict who reads it. The conversion issue is where both settle at once.

Each was reviewed one at a time and either approved for conversion or kept as prose. The eight approved carry no declaration until they convert; the five kept carry a settled `human`.

| Artifact | Producer | Who reads it back | Call |
|---|---|---|---|
| `RUN-MANIFEST.md` | prism `emit-run-manifest` | prism-audit `read-run-manifest`; the contract a triggering workflow reads to locate results | convert |
| `provenance-log.md` | work-package `dco-provenance::append-task-row` | later task rows appended to the same register | convert |
| `evidence-log.md` | midnight-system-review `consolidate-evidence` | the adjudication pass, by evidence ID | convert |
| `structural-inventory.md` | workflow-design `intake-classification` | the impact and drafting passes | convert |
| `drafting-plan.md` | workflow-design `assemble-file-approach` | updated in place each file iteration, then read by the review pass | convert |
| `file-review-note.md` | workflow-design `review-drafted-file` | the attestation pass | convert |
| `prior-feedback-triage.md` | work-package `review-existing-feedback` | the review summary, by disposition | convert |
| `debt-ledger.md` | ponytail `harvest-debt` | the gain report | convert |
| `change-block-index.md` | work-package `review-diff` | later review steps, by block ID | keep prose |
| `assumptions-log.md` | work-package `review-assumptions::record` | later `record` and `reconcile` calls; `assess-ticket-completeness` | keep prose |
| `findings-register.md` | workflow-authoring `compile-report` | later steps of the same run, and a person — its own guide says both | keep prose |
| `findings-register.md` | midnight-system-review `register-findings` | the verdict reads the accepted subset; the adjudication trail is there to be audited | keep prose |
| `follow-ups.md`, `deferred-items.md` | many | `finalize-documentation::create-complete-doc`, for the Open Work counts, and every artifact that links here rather than restating | keep prose. Neither is a declared artifact, so neither has a declaration either way |

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

The audience guard now measures 14 real declarations instead of zero. A guard over declaration *presence* becomes checkable from the same walk, but it lands with the conversion rather than here: presence would fail on exactly the twelve registers that are waiting, so requiring it now would buy a red guard rather than a decision.
