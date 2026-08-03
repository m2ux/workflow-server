---
metadata:
  version: 3.7.0
---

## Capability

Shared contract for a workflow's planning-folder artifacts — prefixing, organization, and output discipline.


## Rules

### single-source-and-link

Every fact has exactly one canonical artifact. When another artifact needs it, link to the canonical home (a markdown link to the file or section) with at most a one-line pointer — never restate the content. Validation results, findings, decisions, and deferred items are the common offenders: record each once, reference everywhere else.

### canonical-home-map

The canonical home for each shared fact category. Templates carry link-only slots for every category they don't home; [verify-artifact-conforms](../../../meta/techniques/verify-artifact-conforms.md) enforces the map at the strategic-review boundary.

| Fact category | Canonical home |
|---|---|
| Problem statement, scope, success criteria | `requirements-elicitation.md` |
| Problem classification | `design-philosophy.md` (plus a 2–4 sentence ticket-derived statement — written before requirements exists, so it carries its own budgeted statement) |
| Assumptions and their outcomes | `assumptions-log.md` |
| Design decisions, alternatives, planning risks | `work-package-plan.md` (durable decisions graduate to an ADR at completion) |
| Baseline metrics, gaps, measurement strategy | `implementation-analysis.md` |
| Research findings and recommended approach | `knowledge-base-research.md` |
| Test cases and acceptance matrix | `test-plan.md` |
| Review findings (code, test, structural, lean-coding, manual-diff) | `code-review.md` and the reviews' own artifacts — consolidated surfaces reference findings by ID + disposition |
| In-task follow-ups | `follow-ups.md` (see [follow-ups](../../resources/follow-ups.md)) |
| Out-of-scope deferred items | `deferred-items.md` (see [deferred-items](../../resources/deferred-items.md)) |
| Token counts and cost estimates | `token-usage.md` — the close-out, retrospective and session trace link it and restate no figure, so one ledger produces one artifact |
| Mechanical execution record (dispatches, tool calls, durations, errors) | `session-trace.md` (see [session-trace](../../resources/session-trace.md)) |

### exception-only-reporting

Status, verdict, and alignment tables report exceptions only. When every row would be a pass, replace the table with one line ("all N criteria met") and keep rows solely for the items that diverge — the ⚠️ rows are the payload, not the ✅ rows. The same applies to null results: record "no findings" in one line, not a template's worth of empty sections.

### state-once-per-artifact

Within an artifact, each fact appears once. No summary table that re-tabulates the prose above it, no closing recap that restates the sections, no per-item outcome table following per-item sections that already carry the outcome.

### lean-header

Open an artifact with a single context line (work package · activity · date), not a metadata block plus a paragraph describing what the document is. The filename and its README index entry already identify it.

### omit-null-sections

Omit template sections whose content would be "None", "N/A", or a restatement that the section does not apply. A template defines the maximum shape of an artifact, not its required shape. Content the user explicitly requested is exempt — requested detail is given in full.

### markdown-line-breaks

In a group of consecutive bold-label lines (`**Status:** value`), every line except the last MUST end with two trailing spaces — without them the lines collapse into a single rendered paragraph. Do NOT use bullet prefixes as a substitute. Applies to all planning artifacts that use bold-label fields (assumptions logs, design philosophy documents, research documents, analyses, comprehension artifacts).

### hyperlink-conventions

Symbol and test references hyperlink to their definition line (the definition, not the first usage or assertion). Three link forms, by what the target is:

| Target | Form |
|---|---|
| A sibling artifact in the same planning folder | relative path (`NN-code-review.md#anchor`) |
| Code, a test, or a document in a repo under review | permanent blob URL at the cited commit — repository host, owner, name, `blob`, the full commit sha, the repo-relative path, and an `#L`-prefixed line anchor |
| Anything else outside the planning folder | full URL |

A path relative to a checkout is never a citation form: the checkout it resolves against is removed at close-out, so the link dies inside the run that wrote it. A resource or technique id is never a link target — ids address the loader, not the git host.

[verify-artifact-links](./verify-artifact-links.md) resolves every link at the close-out boundary against the ref the published links point at, so a folder whose links break only in the published tree is caught rather than shipped.

### code-reference-is-an-inline-link

Every reference to a named thing in the code — a function, type, trait, module, constant, test, or a specific line of one — is an inline markdown link whose visible text is that name, placed where the sentence already names it. A reader following the prose reaches the source by clicking the words they are reading.

```markdown
[resolve_cursor](https://github.com/owner/repo/blob/<sha>/src/parser.rs#L190) advances the cursor before the bounds check, so a request at the limit reads one element past the end.
```

Four shapes fail it, and each is repaired by moving the link onto the name:

| Shape | Why it fails |
|---|---|
| Coordinate-only link text — `[parser.rs#L190]` | The reader is given a location where the sentence needed a name, and the name goes unlinked. |
| A trailing parenthetical citation — `… advances the cursor ([src/parser.rs:190](…))` | The citation interrupts the sentence it is attached to and duplicates a name already in it. |
| A code span inside the link text — `` [`resolve_cursor`](…) `` | Several renderers drop the link and leave the code span, so the reference silently stops resolving. |
| No link at all | The reader has a name and no way to reach it. |

A name repeated across an artifact is linked on each mention that carries a distinct claim; consecutive mentions inside one paragraph link once.

### no-process-attribution

Artifacts describe the work, not the process that produced it: no "per user request", "AI suggested", "as discussed", or reviewer/agent attribution in artifact content.

### plain-technical-language

Human-audience artifacts are written to the [Artifact Writing Register](../../../meta/resources/writing-register.md).

### artifact-prefix

Artifact filenames are prefixed with the server-provided `artifactPrefix`. Techniques declare bare names (e.g., `code-review.md`); the prefix is applied at write time (e.g., `09-code-review.md`). This groups related artifacts and sorts them in workflow order.

### push-before-linking

Any engineering link — in a PR body (📐 Engineering), an issue, or a posted review — MUST resolve to a committed file on the remote, or the reader gets a 404. Commit and push the planning folder BEFORE writing a URL that points into it, via [manage-git](../manage-git/TECHNIQUE.md)::[artifact-commits](../manage-git/artifact-commits.md), which owns the checkout the commit lands in.
