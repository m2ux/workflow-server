---
name: yaml-style
description: Style a definition file is authored in. The authoring technique cites this and does not restate it.
metadata:
  version: 1.0.0
---

# YAML style

## Block-style arrays

Declare arrays as a key followed by `-`-prefixed items on indented lines. Do not annotate an array with an item count.

## Block-style mappings

Prefer block style. Nested objects are indented `key: value` lines. Reserve flow style for short inline values.

## Scalar quoting

Quote any scalar containing a colon-space, starting with a character YAML treats specially, or that would otherwise parse as a number or boolean. Prefer double quotes where the value needs escape sequences.

## Multi-line scalars

Use a block scalar for multi-line text. `|` preserves newlines. `>` folds.

## Version format

Versions are semantic X.Y.Z, per [Reference Conventions](/canon/resources/convention-conformance.md#reference-conventions).

## Field ordering

Field order follows existing files of the same kind, per [Reference Conventions](/canon/resources/convention-conformance.md#reference-conventions).

## Schema reference

A root definition file declares a `$schema` field naming its schema at the same relative depth every sibling uses.
