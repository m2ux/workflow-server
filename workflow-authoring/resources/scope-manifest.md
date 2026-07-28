---
name: scope-manifest
description: Creation guide for the scope-manifest planning artifact — file table, structural design, drafting order.
metadata:
  version: 1.0.0
  order: 12
---

# Scope Manifest Guide

The file-level decision surface for a create or update run. Answers: which files, what structural shape, and in what order are they drafted? Canonical home for the file manifest, the structural design and the drafting order ([canonical-home map](../techniques/TECHNIQUE.md#canonical-home-map)).

## Template

~~~~markdown
# Scope Manifest — {short title}

**Target:** `{workflow-id}` v{version} · **Mode:** Create | Update
**Basis:** [link the change brief] · [link the impact analysis on an update run]
**Edit surface:** `{path}` — present and on the run's branch, or not

[One line: how many files are created, modified, removed.] Preserved instead of removed: [count, on an update run].

---

## File manifest

| # | Path (under `{workflow-id}/`) | Kind | Action | One-line change |
|---|-------------------------------|------|--------|-----------------|
| 1 | `…` | activity \| technique \| resource \| readme \| root | create \| modify \| remove | … |

**Out of scope this pass:** [bullets]

---

## Structural design

```
{workflow-id}/   # the tree, or an explicit "unchanged"
├── …
```

**Flow:** [one line when the topology is unchanged; otherwise a short transition note]

| Convention | This change |
|------------|-------------|
| … | … |

---

## Drafting order

1. **Tier** — [one-line rationale]
2. …
~~~~

## Rules

- **The file table is the payload** — structural design and drafting order stay compact beside it.
- **Own facts only.** Link the change brief and the impact analysis; do not restate purpose or removals ([canonical-home map](../techniques/TECHNIQUE.md#canonical-home-map)).
- **An update may declare the layout unchanged** and must still enumerate every file it touches.
- **No implicit files.** A file the change touches and the table does not name is out of scope for the run.
- **Line budget:** ~80 lines unless the file table is long, in which case its rows are the length.
