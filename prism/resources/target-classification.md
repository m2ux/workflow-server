---
name: target-classification
description: Vocabulary for classifying an analysis target — the scope values a target resolves to, the project markers that separate a codebase from a module, and the target-type inference that follows.
metadata:
  order: 68
  type: reference
---

# Target Classification

## Scope values

What a target resolves to, and what each value admits.

| Scope | The target is |
|-------|---------------|
| `file` | A path pointing at a single file |
| `codebase` | A directory carrying a project marker at its root |
| `module` | A directory inside a project, carrying no marker of its own |
| `document-set` | A directory of non-code files |
| `query` | Inline text, a question, a concept, a strategy, or any non-path input |

A target that could be a path or query text is settled by the filesystem: where it exists, it takes the file or directory scope; where it does not, it is a `query`.

## Project markers

The files whose presence at a directory root separates a `codebase` from a `module`:

`package.json` · `Cargo.toml` · `go.mod` · `pyproject.toml`

A directory holding none of them, and no code files, is a `document-set`.

## Target type

`code` where the target's extension is a source extension — `.ts`, `.rs`, `.py`, `.go`, `.java` and their peers. `general` otherwise.

A `query` scope is always `general` unless the text is clearly source code.
