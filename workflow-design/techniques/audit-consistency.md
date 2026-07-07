---
metadata:
  version: 1.0.0
---

## Capability

Audit the tool / technique / bootstrap-resource / doc boundary for consistency: tool-name accuracy, return-value fidelity, bootstrap completeness, cross-technique consistency, behavioural-guidance duplication, tool-surface overlap, and doc parity (AP-30 through AP-35).

## Protocol

### 1. Audit Tool-Technique-Doc Consistency

- Verify every tool name in technique tools/protocol sections exists as an actual tool
- Verify return-value descriptions in techniques and bootstrap resources match actual tool behaviour
- Verify bootstrap sequences provide a complete path from session start to first meaningful action — no gaps
- Verify multiple techniques describing the same tool action use the same tool name (canonical name only)
- Verify behavioural guidance is not duplicated across techniques and tool descriptions
- Verify no tool's output is a strict subset of another's (redundant tool detection)
- Verify docs (workflow READMEs, technique protocols) use current tool names and descriptions; cross-check against anti-patterns 30-35
