---
metadata:
  version: 1.0.2
---

## Capability

The work-type category of an already-tracked issue, with an ambiguity flag when its own signals do not settle one category.

## Inputs

### issue_record

The tracked issue — its type field, labels, title, and body.

## Outputs

### issue_type

The issue category. Unset when `{needs_issue_type}` is true.

#### values

`feature` `bug` `task` `enhancement` `epic`

### needs_issue_type

`true` when the issue's own signals are absent or name more than one category; `false` when one category is settled.

## Protocol

### 1. Read the Category Signals

- Read the category signals `{issue_record}` already carries, most authoritative first: the platform's own type field, then labels, then the title and body.

### 2. Set the Type Where They Settle

- When those signals settle on one category, set `{issue_type}` to that member of its `#### values`, and `{needs_issue_type}` to `false`.

### 3. Report Ambiguity Where They Do Not

- When they are absent, or name more than one category (an issue whose body holds both a defect and an enhancement), set `{needs_issue_type}` to `true` and leave `{issue_type}` unset.
   > Do not pick a category unaided.
