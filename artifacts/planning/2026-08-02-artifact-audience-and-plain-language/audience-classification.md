# Audience classification: the decision recorded for all 147 output declarations

Every `#### artifact` declaration in the corpus carries `#### audience`, and `check-audience` proves it. This record holds the reasoning: the rule the declarations follow, the registers whose substance is agent state, and the artifacts read by both a person and a later step.

## The rule the declarations follow

An `agent`-audience artifact is JSON on disk — the technique protocol specification makes that part of the attribute's meaning, and `scripts/check-audience.ts` enforces it. So a declaration can only say `agent` where the artifact is already a `.json` file. Declaring `agent` on a markdown filename and converting the file are the same act, and that conversion is the deferred work item.

A declaration therefore states the reader of the artifact **as it exists on disk**. A register that is agent state in substance and markdown in form has no honest declaration available, so each such register was decided one at a time: converted to JSON and declared `agent`, or confirmed as a document a person reads and declared `human`. `check-audience` proves both halves — presence, and JSON form for anything declared `agent`.

## What was declared

| Audience | Declarations | Where |
|---|---|---|
| `agent` | 19 | the two security-audit workflows (14), and five converted registers: `RUN-MANIFEST`, `debt-ledger`, `evidence-log`, `prior-feedback-triage`, `structural-inventory` |
| `human` | 128 | every artifact a person reads |
| undeclared | 0 | — |

The 14 security-audit declarations are the scanner, registry, reconnaissance and merge outputs of the two audit workflows. They were structured JSON against a declared sub-agent schema before the attribute existed; the declaration now says so, and the audience guard stops passing vacuously.

## Registers whose substance is agent state

These are read back by a later step of the same run, or by a triggering workflow, rather than linearly by a person. Each was reviewed one at a time. The five converted are JSON and declare `agent`; the rest are documents a person reads, and declare `human`.

The deciding evidence, where it was not obvious, was whether anything points a person at the file: a progress-inventory row with a reading estimate, or a gate message linking it. Where something does, that reader is the one the format has to serve.

| Artifact | Producer | Who reads it back | Call |
|---|---|---|---|
| `RUN-MANIFEST.json` | prism `emit-run-manifest` | prism-audit `read-run-manifest`; the contract a triggering workflow reads to locate results | converted |
| `evidence-log.json` | midnight-system-review `consolidate-evidence` | the adjudication pass, by evidence ID | converted |
| `prior-feedback-triage.json` | work-package `review-existing-feedback` | the review summary, by disposition | converted |
| `debt-ledger.json` | ponytail `harvest-debt` | the gain report | converted |
| `structural-inventory.json` | workflow-design `intake-classification` | the impact and drafting passes, to tell an intentional removal from an accidental one | converted. Its multi-target case becomes a `targets` array, replacing a convention about sectioning one markdown file |
| `provenance-log.md` | work-package `dco-provenance::append-task-row` | nothing — appending a row is the only operation after creation | `human`. A DCO attestation for a later auditor comparing rows, who may never have been in the run |
| `drafting-plan.md` | workflow-design `assemble-file-approach` | the review pass | `human`. The surface of the `file-approach-confirmed` gate, which asks whether to proceed with this approach |
| `file-review-note.md` | workflow-design `review-drafted-file` | the attestation pass | `human`. The surface of the blocking `preservation-check` gate, which asks a person to authorise deletions from a committed workflow |
| `change-block-index.md` | work-package `review-diff` | later review steps, by block ID | `human` |
| `assumptions-log.md` | work-package `review-assumptions::record` | later `record` and `reconcile` calls; `assess-ticket-completeness` | `human` |
| `findings-register.md` | workflow-authoring `compile-report` | later steps of the same run, and a person — its own guide says both | `human` |
| `findings-register.md` | midnight-system-review `register-findings` | the verdict reads the accepted subset; the adjudication trail is there to be audited | `human` |
| `follow-ups.md`, `deferred-items.md` | many | `finalize-documentation::create-complete-doc`, for the Open Work counts, and every artifact that links here rather than restating | prose. Neither is a declared artifact, so neither has a declaration either way |

Converting the structural inventory left `structural_inventory_path` with no consumer: the review-scope message linking it was the only one, and that link went with the conversion. The path output and its workflow variable are removed.

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

The audience guard measures 147 real declarations and enforces presence from the same walk, so an output that declares a filename and no reader fails. The presence half was the reason for settling every register rather than most of them: it can only be a guard once nothing is pending, and until then it would have bought a red check instead of a decision.

The catalog entry `artifact-audience-declared` is the criteria home and was refreshed to match: its fix had described recording audience in a description as a stand-in for an attribute that has since become first-class, and its example named registers this settles.
