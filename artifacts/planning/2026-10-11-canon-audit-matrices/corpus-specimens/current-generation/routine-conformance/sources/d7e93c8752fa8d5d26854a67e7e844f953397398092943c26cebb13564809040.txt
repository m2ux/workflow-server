---
name: second-pass-findings
description: Creation guide for bare filename `second-pass-findings.md` — the second independent audit pass over the priority-1/2 components, carrying the blind-spot verdicts and at least one sub-agent result.
---

# Second Pass Findings Guide

Creation guide for bare filename `second-pass-findings.md`. The artifact is the execution attestation for the second pass: its existence, and the sub-agent result inside it, are what show the pass actually ran. A reader checks two things — was every blind-spot item verified, and did an independent agent apply the checklist.

## Template

```markdown
# Second Pass Findings

**Scope:** {crates covered} · **Variation:** {different model, temperature, or system prompt} · **Sub-agents:** {n}

## Blind spot verdicts

| Item | Check | Verdict |
|------|-------|---------|
| §3.1 | weight accounting | CONFIRMED \| REFUTED \| INSUFFICIENT |

## Findings

| ID | Crate | Severity | Finding | Location |
|----|-------|----------|---------|----------|
| SP1 | crate name | High | one line | `path:line` |

## Sub-agent results

| Agent | Scope | Findings |
|-------|-------|----------|
| `{agent_id}` | crates covered | {n} |

{When scope was reduced under context pressure: one line naming what was covered and what was not.}
```

## Rules

- **Every blind-spot item gets a verdict.** The four universal items and every target-specific item carry CONFIRMED, REFUTED, or INSUFFICIENT. An item with no verdict is an unverified item, not a passing one.
- **At least one sub-agent row.** The pass is not complete without an independent sub-agent result, and the row is where a reader sees it.
- **Reduced scope is stated, never silent.** A pass scoped to the top files under context pressure records what it covered; a silent reduction reads as full coverage.
- **Finding IDs are distinct from the first pass.** The `SP` prefix keeps second-pass findings traceable when the two passes are merged.
- **Line budget:** ~60 lines.
