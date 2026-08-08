---
metadata:
  version: 1.0.0
---

## Capability

Kebab-case name for the work a request opens — the durable half of the slug that names its planning folder, so a resume of the same work reaches the same folder.

## Inputs

### user_request

User's free-form request.

### identifying_context

*(optional)* Map of identifiers the request carries: `{ issue_number?, branch_name?, pr_number?, work_package? }`.

## Outputs

### initiative_name

Kebab-case identifier for the work: lowercase, alphanumerics and single hyphens, no leading or trailing hyphen, at most 48 characters. Names what the work is about, not the tracker item that holds it — `unbounded-queue-growth-on-close`, never `issue-1980`.

## Protocol

### 1. Take the Naming Phrase

1. Take the phrase in `{user_request}` that says what the work is about: the title it quotes for the issue, pull request or work package `{identifying_context}` identifies, and otherwise its own statement of what is to be done. A bare identifier is not a naming phrase — where the request carries only one, take the words around it.

### 2. Slugify

1. Lowercase the phrase, keep alphanumerics, collapse every other run of characters to a single hyphen, drop leading and trailing hyphens, and truncate to 48 characters on a hyphen boundary. Emit the result as `{initiative_name}`.

## Rules

### one-name-per-work-item

The same work yields the same name on every run, because the name is taken from the work item's own words rather than composed afresh. The slug is the key a resume matches on, so a name invented differently on a second run addresses a folder the first run never wrote.
