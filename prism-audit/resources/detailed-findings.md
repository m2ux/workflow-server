---
name: detailed-findings
description: Creation guide for bare filename `DETAILED-FINDINGS.md` — an expanded write-up for every finding, organised by severity and grouped under audit-domain sub-headings, with every field taken from the findings contract rather than re-derived.
---

# Detailed Findings Guide

Creation guide for bare filename `DETAILED-FINDINGS.md`. Every finding gets a write-up here, not just the severe ones. The fields are fixed because they are copied from the findings contract the analysis produced — this document reformats and groups, it never re-derives.

## Template

```markdown
# Detailed Findings — {target}

## Critical

### {domain name}

### {ID}: {title}

**Description:** {what is wrong}
**Impact:** {what it costs}
**Location:** {file and symbol}
**Recommendation:** {what to do}
**Adversarial confirmation:** {how the challenge pass held up, when the finding came from one}

#### Graph Evidence

{Blast-radius metrics and execution-flow participation, when the contract recorded a blast radius.}

## High

## Medium

## Low
```

## Rules

- **Five fields, plus one conditional sixth.** Description, Impact, Location, Recommendation and Adversarial confirmation appear on every finding; Graph Evidence appears when the findings contract recorded a blast radius. None is recomputed.
- **Severities are inherited verbatim.** They are the contract's post-reconciliation assignments. Re-grading a finding — including by intuition — is a formatting violation, not a judgement call.
- **IDs pass through unchanged.** They are the analysis report's own IDs, and the summary report and trade-off analysis cite them.
- **Severity first, domain second.** Findings group by severity, then under audit-domain sub-headings inside each severity.
- **A finding heading is `### ID: Title`.** The level and the ID-then-title order are what make a finding addressable from the summary report.
- **Every finding appears.** Omitting the Medium and Low write-ups leaves the document a second summary.
- **Line budget:** ~40 lines per finding. A write-up past that is carrying evidence the analysis artifacts own.
