# impact

Map upstream or downstream dependents for a symbol; assess blast radius before changes.

## Inputs

### repo_name

Repository name

### target

Symbol or file

### direction

`upstream` (dependents) or `downstream` (dependencies)

## Output

### dependents

Symbols / processes affected, grouped by depth

### risk

Risk classification per depth: **d=1** is WILL BREAK (direct callers; must update synchronously); **d=2** is LIKELY AFFECTED (call chain at one remove; test thoroughly); **d=3** is MAY NEED TESTING (indirect; verify via [detect-changes](detect-changes.md))

## Procedure

1. Call `gitnexus impact({ repo_name, target, direction })`.
2. Interpret `risk` per the depth bands documented in the Output above: d=1 items demand synchronous updates, d=2 items demand thorough testing, d=3 items can be verified after the fact via [detect-changes](detect-changes.md).
