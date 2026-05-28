# impact

Map upstream or downstream dependents for a symbol; assess blast radius before changes.

## Inputs

- **repo_name** — Repository name
- **target** — Symbol or file
- **direction** — `upstream` (dependents) or `downstream` (dependencies)

## Output

- **dependents** — Symbols / processes affected, grouped by depth
- **risk** — Risk classification per the depth/risk table

## Procedure

1. Call `gitnexus impact({ repo_name, target, direction })`.

## Risk classification by depth

| Depth | Risk | Recommended action |
|---|---|---|
| d=1 | WILL BREAK | Direct callers; must update synchronously |
| d=2 | LIKELY AFFECTED | Call chain at one remove; test thoroughly |
| d=3 | MAY NEED TESTING | Indirect; verify with [detect-changes](detect-changes.md) |
