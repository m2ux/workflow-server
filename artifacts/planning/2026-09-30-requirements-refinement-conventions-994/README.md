# Requirements refinement conventions — #994

Corpus branch `workflow/requirements-refinement-conventions`, based on `workflows` at `4662d88d`.

## Decisions

| Question | Choice |
|---|---|
| Move or copy a transcript into the meetings folder | Copy. The original stays where the user left it, so a redacted passage can be restored from it and a revise pass re-reads the named path. |
| A document outside the repository | Copied into `.engineering/artifacts/documents/`, unredacted. A document already inside the repository is cited where it sits. |
| Technique split | Two new techniques: `store-sources` (copy, reuse by file name) and `redact-transcripts` (redact, list redactions). |
| Where the redactions are listed | A Redactions table in the intake record, linked from `sources-confirmed`. It names the passage, never its words. |

## Scope manifest

| File | Change | Issue item |
|---|---|---|
| `activities/01-intake.yaml` | Bind store-sources and redact-transcripts; declare `redactions`; checkpoint names the redactions | 1, 2 |
| `techniques/store-sources.md` | New | 1 |
| `techniques/redact-transcripts.md` | New | 2 |
| `techniques/record-intake.md` | Read `redactions` into the intake record | 2 |
| `techniques/resolve-inputs.md`, `techniques/intake-sources.md` | `intake_correction` covers a redaction | 2 |
| `techniques/TECHNIQUE.md` | Rule: every artifact path is relative to that artifact | 3 |
| `techniques/update-specification.md` | Rationale in the specification's own words; open questions as the note; a status icon in the target reads back as its `Status:` line | 5, 6, 7 |
| `techniques/finalize-specification.md` | Stage the final specification in its final form | 5 |
| `techniques/README.md` | Index the two techniques | 1, 2 |
| `resources/transcript-redaction.md` | New: redacted conversation, marker, rules | 2 |
| `resources/specification-protocol.md` | Section Structure (1, 4, 2.4), Requirement Entry Format (no priority, own-words rationale, note), Status Conventions (icon and meaning), Final Specification Form, Source Reference Format (relative href, stored copies) | 3–9 |
| `resources/validation-rubric.md` | Section content, rationale wording, open questions, transcript href checks | 3, 6, 7, 8, 9 |
| `resources/intake-record.md` | Redactions table | 2 |
| `resources/README.md` | Index transcript-redaction | 2 |
| `README.md`, `activities/README.md` | Intake holds and redacts the sources | 1, 2 |
| `workflow.yaml` | Version | — |

## Known limit

A stored file of the same name is reused as the same source. Two different meetings exported under one file name would collide.

## Delivery

- PR #998, commits `dca097db` (intake) and `6772e1ce` (citations and entry conventions).
- Guards: 236 of 236 pass from `main` at `a59870c7`. Engine suite against the branch: 2200 pass, none fail. Option-coverage sweep not run.
- `redactions` was renamed `transcript_redactions` to meet the qualified-identifier guard.
