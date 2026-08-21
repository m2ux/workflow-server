---
name: audit-report
description: Creation guide for bare filename `AUDIT-REPORT.md` — the summary report, carrying everything the source analysis report holds except the inline detailed findings, which move to their own document behind a reference line.
---

# Audit Report Guide

Creation guide for bare filename `AUDIT-REPORT.md`. The summary a reader opens first: what was audited, what the headline findings are, and where the full write-ups live. It is the source analysis report with one section lifted out, so its shape follows that report rather than being invented here.

## Template

```markdown
# Audit Report — {target}

**Scope:** {what was audited} · **Domains:** {n} · **Findings:** {n} ({n} critical, {n} high)

## Executive Summary

{The source report's executive summary, carried through.}

## Findings by Domain

| Domain | Critical | High | Medium | Low |
|--------|---------:|-----:|-------:|----:|
| domain name | 0 | 1 | 2 | 0 |

*Detailed write-ups for all findings organised by severity are in [DETAILED-FINDINGS.md](DETAILED-FINDINGS.md).*

## Systemic Patterns

{Patterns recurring across domains or scopes.}
```

## Rules

- **One section is replaced, not summarised.** The inline detailed-findings section becomes the reference line to `DETAILED-FINDINGS.md`. A shortened paraphrase of the findings in its place defeats the split.
- **Section numbers close the gap.** Lifting a section renumbers the ones after it, and every internal cross-reference that pointed at an old number is corrected. A stale number is a broken report, not a cosmetic issue.
- **Multi-scope audits merge before writing.** Executive summaries, domain tables and systemic patterns from each scope's report consolidate into one; per-scope reports are not concatenated.
- **Severities and IDs are the findings contract's own** — see [detailed-findings](detailed-findings.md).
- **Every remediation table carries an Impact column**, as its final column, at each priority level.
- **The metadata table names the trade-off analysis**, so a reader reaches it from the report's head rather than hunting for it.
- **Paths are hyperlinks.** A path in an artifact-reference table is a link, not text a reader retypes.
- **Line budget:** ~120 lines. A summary longer than that has absorbed content the detailed-findings document owns.
