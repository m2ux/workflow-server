# Requirement citation precision: analysis heading to specification href

Investigation · 15 September 2026 · **Status:** issue opened ([#732](https://github.com/m2ux/workflow-server/issues/732)); implementation not started

The specification protocol already says a markdown citation's href includes the fragment of the
nearest heading above the derived passage. A live requirements-refinement run captured those
passages in the coverage matrix and then wrote every specification link to the source file's
top-level heading. This folder is the survey behind that gap.

## What is captured today

Three artifacts talk about sources, and they do not carry the same grain.

**Coverage matrix (section → requirements).** `analyze-source` walks each source section by
section and records `{requirements_analysis.source_coverage_matrix}`. The analysis-report
template is `Source | Source section | Normative? | Covered by`. The report already says a
markdown source's Source-section cell uses the heading the specification protocol takes as the
href fragment. Direction: one section, many requirements. This is the only place analysis
records passage-level location.

**Requirements Changes (requirement → source id).** The same template's New / Updated /
Deprecated lists carry proposed identifier, title, rationale, and *target* section — the
specification section the requirement will live in. The source field on a live run is the
document identifier and optional initials (`SRC-MTG002 (CF)`). No heading, no fragment, no
path.

**Specification entry (requirement → href list).** `update-specification` on an `initial` apply
adds source references per the specification protocol. The protocol's numbered list is the
reader-facing citation. Validation checks that those references resolve to section 2 of the
specification and match the protocol's *shape*. It does not check that a fragment matches a
heading in the source file, and it does not check that the fragment is one the matrix named.

`update-specification` does not name the coverage matrix as the source of fragments. Apply can
satisfy the protocol by pointing at the file recorded in section 2 and taking that file's
title heading.

## Live run: GHSA classification specification

Planning folder
`midnight-agent-eng/.engineering/artifacts/planning/2026-09-12-midnight-ghsa-classification/`.
Specification and analysis as of `813d4ef` on `mike`.

**Specification href census (137 numbered-list hrefs):**

| Source file | Hrefs | Unique fragment | Headings in the source that a finer link could use |
|-------------|------:|-----------------|-----------------------------------------------------|
| `03-decisions.md` | 38 | `#decisions-v1-contract` (H1) | 7 H2s (Write defaults, Critical tests, Locked answers, …) |
| `08-meeting-notes-2026-09-14.md` | 32 | `#ghsa-classifier-needs-transcript` (H2) | 30 timestamp H3s (`### **00:11:07**`, …) |
| `07-diagrams.md` | 20 | `#diagrams` (H1) | 3 H2s |
| `02-discussion.md` | 19 | `#discussion-12-september-2026` (H1) | 5 H2s |
| `01-meeting-notes.md` | 14 | `#meeting-notes-9-september-2026` | timestamps in the body are not headings |
| `05-sources.md` | 9 | `#sources` | document-level |
| `04-open-questions.md` | 5 | `#open-questions` | document-level |

Seven unique fragments for seven source files. Every citation in a file shares that file's
title heading.

**14 September transcript vs its matrix:**

- Analysis matrix: 39 rows, 26 marked normative, 28 distinct timestamps in the Source-section
  cell. Cells are composed as `00:11:07 — Pull the GHSA, analyse against the codebase, …` — a
  timestamp plus an analyst gloss, not the verbatim heading `00:11:07`.
- Specification: 32 hrefs to that transcript, all `#ghsa-classifier-needs-transcript`.
- `REQ-F039` appears in five normative matrix rows (`00:11:07`, `00:12:21`, `00:16:32`,
  `00:31:56`, `00:33:59`). The specification entry cites the transcript once, at the document
  H2.
- `REQ-F041` is covered by the `00:06:28` matrix row (severity inferred from finding mechanics
  against the codebase). The specification entry cites the same document H2.

The matrix held passage-level location. The change list held a document identifier. Apply
wrote the document identifier's file title. The gloss in the matrix cell would not have been a
legal fragment even if apply had inverted the matrix: GitHub fragments slug the heading text,
and the heading in the transcript is `00:11:07`, not the gloss.

**9 September notes** have almost no linkable headings (timestamps are body text). For that
file the protocol's "nearest heading" *is* the document title. Finer fragments there need
headings in the source, which this workflow does not author.

## Contract sites (requirements-refinement on the `workflows` branch)

| Site | What it requires | Grain it actually carries |
|------|------------------|---------------------------|
| `resources/specification-protocol.md` § Source Reference Format | Markdown href includes the fragment of the nearest heading above the derived passage | The intended spec grain |
| `resources/requirements-analysis-report.md` § Template, New Requirements | `proposed REQ-ID, title, rationale, target section` | Spec destination, not source heading |
| `resources/requirements-analysis-report.md` § Template, coverage matrix | `SRC-ID \| [§n — title]` | Invites a composed label; the following prose says the cell is the protocol heading |
| `resources/requirements-analysis-report.md` rule "A change drawn from several sources cites each of them" | List both references | "Reference" is the document identifier in the live run |
| `techniques/analyze-source.md` § Create Source References | One source reference per classified document | Document, not passage |
| `techniques/analyze-source.md` § Complete Source Coverage / Record the Coverage Matrix | Section-by-section walk into the matrix | Passage → requirements |
| `techniques/update-specification.md` initial apply | Add source references per the specification protocol | No instruction to read matrix Source-section cells or change-list headings |
| `resources/validation-rubric.md` Consistency | References resolve to section 2 and conform to the protocol shape | File identity, not heading identity |
| `resources/validation-rubric.md` Source Coverage | Every normative matrix row has a covering requirement | Completeness of coverage, not precision of hrefs |

The analysis-report rule "Each change is applicable without the sources" is not in conflict
with carrying headings. That rule is about the *meaning* of the change being stated in the
analysis. The heading is a locator for the specification's numbered list, not a substitute for
the rationale.

## Can the links be improved?

Yes. The protocol already names the fragment grain. The section-by-section walk already
happens. The missing piece is a requirement-facing citation that apply can copy:

1. Each contributing passage is the source file plus the **verbatim heading** sitting above
   that passage (the same string the protocol uses as the fragment). Optional initials follow
   as they do today.
2. Two headings in the same file are two list entries. Numbering stays local to the
   requirement's list.
3. A source with no heading below the title keeps today's file-level fragment — that is the
   protocol when the nearest heading is the title.
4. Non-markdown sources stay file-only.

Inverting the matrix at apply time is a worse home: the matrix is many-requirements per
section, Source-section cells in the live run were glossed, and apply would be reconstructing
the change list's job. The matrix stays the coverage walk. The change list becomes the apply
input for citations.

## Named stages (implementation)

**Record the heading on each change.** The analysis-report New / Updated lists carry, for every
cited source, the verbatim heading of the contributing passage. The coverage-matrix
Source-section cell is that same heading (drop the `[§n — title]` composition). Analyze-source
Create Source References still assigns one document-level `SRC-*` for section 2; Complete
Source Coverage still walks every section; Compile writes both the matrix and the per-change
citation list.

**Apply writes hrefs from those headings.** The `initial` apply of update-specification
builds each numbered list from the change's citations: path from the source's section-2
record, fragment from the recorded heading. It does not invent a fragment from the file title
when a heading was recorded.

**Validate the fragment.** The rubric's consistency check: for a markdown citation, the
fragment resolves to a heading in that source file; every heading on the change appears in the
specification list. Coverage still uses the matrix for "every normative section has a
requirement."

## Scope

`corpus/requirements-refinement` on `workflows`: analysis-report template and matrix prose,
analyze-source protocol, update-specification initial apply, validation rubric. Workflow
identity bump. No engine or schema change.

## Non-goals

- Rewriting specifications already on disk. A later refinement run writes the finer lists.
- Authoring headings into source files the workflow does not own.
- Changing the numbered-list presentation in the specification protocol.
- A mechanical guard for heading resolution, unless the rubric check proves too weak after a
  first run.

## Why now is cheap

The protocol, the matrix walk, and the numbered-list presentation already exist. The GHSA run
already stored 26 normative timestamp sections that never reached 32 specification links. The
change is to stop dropping the heading between those two artifacts.
