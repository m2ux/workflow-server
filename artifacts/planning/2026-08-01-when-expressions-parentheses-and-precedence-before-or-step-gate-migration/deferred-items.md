# Deferred Items

> when expressions: parentheses and precedence before OR step-gate migration · #379 · updated 2026-08-01

| ID | Item | Reason deferred | Source |
|----|------|-----------------|--------|
| D-1 | Multi-agent / protocol comprehension harnesses | Issue §0 default; not required once short agent rule + fixtures cover production agent-evaluated model | Requirements elicitation §0 / out of scope |
| D-2 | Move production step-gate evaluation into MCP server tools | Architecture choice beyond unlock path; shared module may later feed a server path | Requirements Q5 / RE-6 |
| D-3 | Checkpoint `condition` → `when` with `condition_not_met` | Needs companion server track | Issue §5 |
| D-4 | Loop `while` / `doWhile` OR continuation predicates | Not step-gate surface; separate inventory | Issue §5 |
| D-5 | Exists-shaped predicates still on structured `condition:` | Deliberately retained after #374 | Issue §5 / migration register |
| D-6 | Richer comparison operators beyond `==` / `!=` | Not required by four keep-sites | RE-3 |
