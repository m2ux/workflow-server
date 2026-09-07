# The measurements, kept runnable

Companion to [README.md](../README.md). Every figure in this folder came from a throwaway script
described in prose, which is why re-checking one meant rebuilding it. These are the scripts, kept so
a figure can be re-taken rather than reconstructed.

The folder's own convention is to carry measured numbers in the text — the plain-language mandate
says keep them, and they are the argument. What was missing beside each number was the command.

| Script | Takes | Supersedes |
|---|---|---|
| [repeated-runs.py](repeated-runs.py) | Every maximal run of steps shared by two or more activity files, at the top level and inside loop bodies | The window search behind [drift-census.md](../drift-census.md) |

Run each with `python3 <script>`, optionally `--root <workflows-dir>`; the default is the checkout
beside this repository. They read definitions only and write nothing.

## What `repeated-runs.py` found on 2026-09-07

Against `workflows` at `b5e54574`: **26 maximal shared windows across 122 activity files — 21 at the
top level and 5 inside a loop body.** The census recorded fourteen, all top level.

Three of the difference are the corpus growing. The rest is the search itself: the census reduced
only an activity's top-level step list to signatures, and recorded that gap as "known and small: the
corpus nests three deep at most, and the widest sharing found is at the top level".

**The second half of that is wrong, and it matters for stage 6.** The widest sharing in the corpus
by activity count is nested:

| Shared run | Steps | Activities | Where |
|---|---|---|---|
| `challenge` → `combine` | 2 | **7** | inside a loop body, all seven convergence sites |
| `reconcile` → `challenge` → `combine` | 3 | **6** | inside a loop body, the six identical sites |
| `assemble-one` → per-item gate → `record` | 3 | 4 | inside a `forEach`, the assumption run's inner half |
| An alternating audit-and-fix run | 5 | 2 | inside a loop body, `workflow-design` quality and post-update review |
| `handle-sub-workflow` pair | 2 | 2 | inside a loop body, the two prism analysis activities |

So both migration targets are directly measurable, at the grain a routine would carry them, and the
convergence run's two-level split — a pass shared by seven sites, wrapped in a loop by six — is
**confirmed by measurement** rather than argued from the one divergent site.

The top-level list also shows something the census could not: at `07-assumptions-review` and
`08-implement` the convergence loop and the assumption run are **one contiguous six-step window**.
Stages 5 and 6 edit adjacent steps at two of the same activities, which the delivery plan treats as
independent.
