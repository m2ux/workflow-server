# A resource's trailing comment reports a total that disagrees with the graph

**Repository:** abhigyanpatwari/GitNexus
**Version:** 1.6.12

## What happens

The processes resource returns a capped page and closes with a comment naming the total it was capped from. That total is not the number of execution flows the graph holds.

```
gitnexus://repo/<name>/processes
→ …twenty entries…
  # Showing top 20 of 50 processes. Use the query tool for deeper search.
```

The same graph, asked directly:

```
MATCH (p:Process) RETURN count(p)          → 611
gitnexus://repo/<name>/context → stats.processes: 611
```

Fifty against six hundred and eleven, on one graph, read seconds apart.

The cluster resource carries the same shape of problem from the other direction: `gitnexus://repo/<name>/cluster/Loaders` lists twenty members, closes with `# ... and 10 more`, and reports `symbols: 253` in the same document. Ten and two hundred and thirty-three cannot both be the remainder.

## Why it matters

A capped page is fine, and a comment saying what it was capped from is the right thing for it to carry — that is the number a caller uses to decide whether to page further, to report coverage, or to weigh how much of a graph an answer represents. Here that number is the only part of the answer that is wrong, and nothing distinguishes it from the fields that are right.

The practical failure is a caller that reads the resource for the page and the comment for the total, which is the obvious way to use it. It reports having seen 20 of 50 flows when it has seen 20 of 611 — an answer that overstates its own coverage by an order of magnitude while looking complete.

## Suggested resolution

Take the comment's total from the same count the context resource reports, so the page and its denominator describe one graph. The cluster resource's `and N more` needs the same treatment against its own `symbols` field.

Where the two numbers legitimately measure different populations — if the fifty are, say, the flows clearing some relevance floor rather than every flow recorded — then saying which population the comment counts would resolve it just as well, and a caller could then read both numbers correctly instead of picking one.
