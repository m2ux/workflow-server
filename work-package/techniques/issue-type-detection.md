---
metadata:
  version: 1.0.0
---

## Capability

The work-type category of an already-tracked issue, with an ambiguity flag when its own signals do not settle one category.

## Inputs

### issue_record

The tracked issue as returned by the platform's read operation — carries the issue's type field, labels, title, and body.

## Outputs

### issue_type

The issue category (`feature`, `bug`, `task`, `enhancement`, `epic`); unset when `issue_type_ambiguous` is `true`.

### issue_type_ambiguous

`true` when the issue's own signals are absent or name more than one category; `false` when one category is settled.

## Protocol

1. Read the category signals `{issue_record}` already carries, most authoritative first: the platform's own type field, then labels, then the title and body.
2. When those signals settle on one category, set `{issue_type}` to it and `{issue_type_ambiguous}` to `false`.
3. When they are absent, or name more than one category (an issue whose body holds both a defect and an enhancement), set `{issue_type_ambiguous}` to `true` and leave `{issue_type}` unset.
   > Do not pick a category unaided. `{issue_type}` fixes the branch-name prefix ([naming-conventions](./naming-conventions.md)), which is expensive to change once a PR is open, so an unsettled category is never a guess here.
