---
name: source-analysis
description: Creation guide for the source-analysis artifact — the audit of an existing document against the plain-language principles, produced on rewrite and audit runs.
metadata:
  order: 3
---

# Source Analysis Guide

The findings surface for a document that already exists. Answers: where does this document fail its readers, and by which guideline? Canonical home for the per-finding record a rewrite or audit run works from.

## Template

~~~~markdown
# Source Analysis — {document title}

**Document:** `{source path}` · **Findings:** {count}

[One line: the overall plain-language state of the document.]

## Findings

|| # | Passage | Principle | Guideline | Issue | Recommendation |
||---|---------|-----------|-----------|-------|----------------|
|| 1 | [quote or locate] | Relevant / Findable / Understandable / Usable | [the guideline breached] | [what the reader hits] | [the change that fixes it] |

## Strengths

[What the document already does well — preserve this in a rewrite.]
~~~~

## Rules

- **Cite the guideline.** Every finding names the principle and the guideline it breaches from [plain-language-standard](plain-language-standard.md); an unanchored complaint is not a finding. Where the run carries the ASD-STE100 overlay, a word- or sentence-level finding names the STE rule it breaches from [Writing Rules](asd-ste100.md#writing-rules) or [Approved Words](asd-ste100.md#approved-words) instead.
- **Locate the passage.** Each finding quotes or locates the passage so a reader can confirm it without re-reading the whole document.
- **Recommend, don't rewrite.** The recommendation names the change; the rewrite itself happens in the drafting pass.
- **Record strengths too.** A rewrite preserves what already works; the strengths list is its don't-break inventory.
