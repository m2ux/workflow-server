# A taint anchor that names a file at the tree's root either resolves to that file's symbols or matches nothing

**Repository:** abhigyanpatwari/GitNexus
**Version:** 1.6.12

## What happens

`explain` decides whether its `target` is a file or a symbol by looking at the string: a value holding a path separator, or ending in a known source extension, is treated as a file, and everything else is resolved as a symbol name.

A documentation file at the tree's root — `AGENTS.md`, `README.md` — satisfies neither test. It resolves as a symbol, and because a markdown file's headings are indexed as symbols carrying the file's name, the answer is an ambiguity listing those headings.

The documented way out makes it worse. Leading the value with a separator does make it file-ish, but the file match is `filePath = target OR filePath ENDS WITH '/' + target`, and neither holds for `/AGENTS.md` against a stored path of `AGENTS.md`. The call then matches nothing and returns a well-formed empty answer:

```
explain({ repo: "<name>", target: "AGENTS.md" })
→ { message: "Found 4 symbols matching 'AGENTS.md'. Re-call explain with the file path…", totalCandidates: 4 }

explain({ repo: "<name>", target: "/AGENTS.md" })
→ { anchor: { file: "/AGENTS.md" }, findings: [], totalFindings: 0 }
```

The second answer is indistinguishable from a file that was examined and found clean.

## Where it comes from

`looksLikeFilePath` in `src/mcp/local/local-backend.ts` returns true for a value containing a separator or ending in a source extension. The file anchor built beside it sets `targetPath` to the target as given and `targetSuffix` to `'/' + target`. A leading separator therefore satisfies the first function and defeats the second: `/AGENTS.md` is file-ish, `targetPath` is `/AGENTS.md`, `targetSuffix` is `//AGENTS.md`, and the stored path is `AGENTS.md`.

## Why it matters

The two answers fail in opposite directions and neither says so. The bare name resolves to something that is not the file asked for. The separator form resolves to nothing while reporting an anchor, so a caller iterating a change set — reading findings for each changed file in turn — records a clean result for every root-level documentation file it passes.

A caller cannot distinguish either outcome from the correct one without a second call to establish what the anchor reached.

## Suggested resolution

Normalise a leading separator off the target before the file match, so `/AGENTS.md` and `AGENTS.md` reach the same file. That alone makes the documented remedy work.

Beyond that, two smaller things would help a caller: reporting how the target was classified, so file-anchored and symbol-anchored answers are distinguishable; and reporting when a file anchor matched no indexed file, so an empty finding list from an unmatched anchor is not read as an examined file.
