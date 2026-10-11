---
name: detailed-findings
description: Creation guide for bare filename `DETAILED-FINDINGS.md` — an expanded write-up for every finding, organised by severity and grouped under audit-domain sub-headings, with every field taken from the findings contract.
---

# Detailed Findings Guide

Creation guide for bare filename `DETAILED-FINDINGS.md`. Every finding gets a write-up here, not just the severe ones. The fields are fixed: each one is copied from the findings contract the analysis produced, and this document's work is to reformat and group them.

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

- **Five fields, plus one conditional sixth.** Description, Impact, Location, Recommendation and Adversarial confirmation appear on every finding; Graph Evidence appears when the findings contract recorded a blast radius. Each field holds what the contract holds.
- **Every finding carries its source severity.** A severity arrived at any other way is a formatting error in this document, not an assessment of the finding.
- **Every finding carries its source ID.** The summary report and the trade-off analysis cite findings by those IDs.
- **Severity first, domain second.** Findings group by severity, then under audit-domain sub-headings inside each severity.
- **A finding heading is `### ID: Title`.** The level and the ID-then-title order are what make a finding addressable from the summary report.
- **Every finding appears.** Omitting the Medium and Low write-ups leaves the document a second summary.
- **Line budget:** ~40 lines per finding. A write-up past that is carrying evidence the analysis artifacts own.
