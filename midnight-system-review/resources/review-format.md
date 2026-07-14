---
name: review-format
description: The canonical structure of the rendered review — verdict header, findings sections with the grade-tuple line, review comments for observations, per-area accounting, and the Review Details block the reconciliation gate checks.
metadata:
  order: 5
---

# Review Format

The rendered review — both `review-report.md` and the posted `review_summary` — follows this structure. The summary is the report's publishable body, byte-for-byte; posting never re-renders it.

## Structure

```markdown
## System Review - Merge Readiness {verdict}/5

### {N} issues found - {verdict phrase}

{Narrative: the accepted-set profile driving the verdict, worst findings first.}

Final review: {What was investigated (the areas), which probe classes ran,
and which could not run and why (blocked validations).}

### Review Comments

{Only when there are non-blocking observations. One per observation:}

- **{Observation title}**

  {What was observed and why it is non-blocking.}

  Evidence:
    - {anchor or command observation, one per line}

  Related files: `{path}`, `{path}`

### Issues

{With zero accepted findings, exactly:}
No medium/high-confidence issues were found.

{Otherwise, split by anchoring:}

#### Inline comments posted

{Findings with a file:line anchor. One per finding:}

- **{Finding title}**

  _Location: `{file}:{line}`; Risk / impact: {level}; Evidence confidence: {level};
  Production likelihood: {level}; Category: {category}; Validation: {mode}_

  {The mechanism: what the code does, why it is wrong, what happens in production.}

#### File-level or unanchored issues

{Findings whose anchor is a file or flow, not a single line — same entry format.}

### Areas Investigated

- **{Area title}** - {n} task(s), {m} issue(s) found
{One line per investigation area, in plan order.}

### Review Details

- Status: {ready | warned | issues found}
- Areas investigated: {count}
- Tasks/probes performed: {count}
- Issues found: {accepted count}
- Observations: {count}
- Inline comments: {count}
- File-level comments: {count}
- Blocked validations: {count}
- Commit: {head SHA}
- Changed files: {count}
```

## Accounting Rules

The Review Details block is the reconciliation surface the accounting gate validates:

- `Areas investigated` equals the approved plan's area count and the number of Areas Investigated lines.
- `Tasks/probes performed` equals the sum of per-area executed probes in the evidence log.
- `Issues found` equals the findings register's accepted count; per-area `issue(s) found` sum to it.
- `Inline comments` + `File-level comments` equals `Issues found` — every accepted finding is presented exactly once, anchored where possible.
- `Blocked validations` equals the evidence log's blocked-validation count.
- Every accepted finding's grade-tuple line carries all five graded dimensions plus its location anchor.

## Verdict Phrases

Use the phrase for the computed verdict: 5/5 "Ready to merge", 4/5 "Merge with follow-ups", 3/5 "Fix before merge", 2/5 "Do not merge", 1/5 "Strongly do not merge".
