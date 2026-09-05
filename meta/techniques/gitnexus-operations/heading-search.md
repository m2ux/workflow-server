---
metadata:
  version: 1.0.0
---

## Capability

Find sections of a documentation or definition tree by heading text — the graph's answer for markdown, which the execution-flow search does not return.

## Inputs

### repo_name

Optional. Name of the indexed graph to address. Omit only where exactly one graph is indexed.

### heading_pattern

A regular expression matched against whole heading text. Match a fragment by surrounding it — `'.*worktree.*'` finds every heading containing the word.

## Outputs

### heading_matches

Each matching heading with the file it sits in.

## Protocol

1. Apply [cypher](./cypher.md) against `{repo_name}` with `MATCH (s:Section) WHERE s.name =~ '{heading_pattern}' RETURN s.name, s.filePath` to produce the `{heading_matches}`.
   > - Where the pattern matches nothing, widen it — the match is against the whole heading, so a bare word matches only a heading that is exactly that word.
   > - Where the subject is a claim made in prose rather than a heading, this operation cannot reach it; grep the tree instead, per `query-not-grep`.
2. Read a match as a location rather than an answer: the graph holds each heading and the file beneath it, and the prose under that heading is read from the file.
