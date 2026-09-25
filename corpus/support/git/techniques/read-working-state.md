---
metadata:
  version: 1.0.0
---

## Capability

What a working tree holds that its repository does not record — the tracked paths carrying modifications and the nested checkouts standing off the commits the tree names — read without writing anything.

## Inputs

### repo_path

Working tree to read.

## Outputs

### modified_paths

The tracked paths carrying modifications. Empty where the tree stands as its repository records it.

### moved_nested_checkouts

The nested checkouts standing at a commit other than the one this tree records for them, each with the commit it stands at. Empty where the tree holds none, and where every one stands where the tree names.

### read_refusal

Why the tree could not be read. Null where the read answered.

## Protocol

### 1. Read the Tracked Modifications

- `git -C {repo_path} status --porcelain`, and record every tracked path it names as `{modified_paths}`.
  > Where the command fails, the path is not a checkout: set `{read_refusal}` naming it, and stop.

### 2. Read the Nested Checkouts

- `git -C {repo_path} submodule status`, and record as `{moved_nested_checkouts}` each entry the output marks as standing off the recorded commit, with the commit it stands at.
  > A tree holding no nested checkouts answers with nothing, which is an empty list rather than a refusal.

## Rules

### the-read-writes-nothing

This technique answers what a tree holds and changes none of it. A caller puts its answer in front of a person before a technique that discards, so the answer has to describe a tree that still holds what it names.
