---
metadata:
  version: 1.0.0
---

## Capability

Enumerate the files whose links resolve to a given documentation or definition file — blast radius for a markdown tree.

## Inputs

### repo_name

Optional. Name of the indexed graph to address. Omit only where exactly one graph is indexed.

### target_file_path

Path of the file whose referencers are wanted, spelled as the index records it — relative to the tree the index was built from, so a component folded into a containing tree carries that tree's prefix.

## Outputs

### referencing_files

Paths of the files holding a link that resolves to `{target_file_path}`.

## Protocol

1. Apply [cypher](./cypher.md) against `{repo_name}` with `MATCH (a:File)-[r:CodeRelation {type: 'IMPORTS'}]->(b:File {filePath: '{target_file_path}'}) WHERE r.reason = 'markdown-link' RETURN a.filePath` to produce the `{referencing_files}`.
   > - Where the result is empty, confirm the path spelling against the index before reading the emptiness as no referencers — a path that does not match any file yields the same empty set as a file nothing links to.
2. Take the result as the set of files that would need reading if `{target_file_path}` changed meaning.

## Rules

### links-are-the-only-references

The edges here come from links the markdown itself holds. A file that names another in prose without linking to it is connected in the reader's mind and not in the graph, so an empty or short result is evidence about links rather than about references. Where the answer bounds a change, pair it with a grep for the file's name.
