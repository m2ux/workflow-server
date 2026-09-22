# analyze on a subdirectory indexes the parent and reports success under a different name

**Repository:** abhigyanpatwari/GitNexus
**Version:** 1.6.12

## What happens

Pointing `analyze` at a directory inside a git checkout indexes the whole enclosing checkout and registers the graph under the enclosing checkout's basename. The command exits 0 and reports the symbol and relationship counts of the parent. Nothing is registered under the name of the directory that was given, and the caller gets no signal that the target changed.

## Reproduction

A repository with a subdirectory that is not itself a checkout:

```
/path/to/Parent/          <- a git checkout
/path/to/Parent/component/   <- an ordinary directory inside it
```

Run the build against the subdirectory:

```bash
cd /path/to/Parent/component
npx gitnexus analyze --index-only
```

Observed: exit 0, counts reported for the whole of `Parent`, and `list_repos` afterwards shows a new graph named `Parent`. No graph named `component` exists. Running the same command a second time reports `Already up to date`, because the parent's graph is current.

In our case the subdirectory held roughly 40 files and the enclosing checkout held 2645, so the build wrote a 929 MB index for a target we had not named.

## Why it matters

This defeats the recovery path where a caller builds a graph because none exists. The sequence is: resolve a graph for a tree, find none, build one, resolve again. With a subdirectory target the second resolve fails exactly as the first did, because the name that was asked for still has no graph, while the build reported success. An automated caller cannot tell the difference between a build that worked and one that indexed something else, so it either loops or concludes the tree is unindexable.

The behaviour is also the one most likely to be hit, since a caller reaches for a build precisely when a tree has no graph, and a component inside a monorepo or a vendored checkout is a common shape for that.

## Where it comes from

`getGitRoot` in `src/storage/git.ts` returns the path itself when it holds a `.git`, and otherwise resolves upward via `git rev-parse --show-toplevel`. The upward resolution is correct for finding a repository, but the resulting root is then used both as the tree to walk and as the source of the registry name, with no comparison against the path the caller supplied.

## Suggested resolution

Any of these would remove the silent part, which is the harmful part:

- Report the resolved root and the registered name in the command's output, so a caller can compare them against what it asked for.
- Warn, or refuse without an explicit flag, when the resolved root differs from the supplied path.
- Register the graph under the supplied path's basename when that path was named explicitly.

The first alone would be enough for an automated caller, since it makes the outcome checkable.
