---
metadata:
  version: 3.5.0
---

## Capability

Planning-folder `README.md` from the universal planning Template under the bound readme-seed profile.

## Inputs

### include_links

*(optional)* Whether the seeded README carries the Links table. True fills that table from the seed and `{entity_context}`. False leaves the table out, so the README records no public pull-request or issue link.

#### default

`true`

### entity_context

*(optional)* `{ entity_title, entity_url, entity_type, current_date, status }` for header/Links population. When unbound, seed profile defaults alone fill those slots.

#### default

`{}`

### seed_profile

Resource id of the workflow's readme-seed profile (Progress inventory, classifier, links defaults, mode-exclusion map).

### is_review_mode

*(optional)* Boolean mode flag for seed profiles that key exclusions on review vs implement/create.

### operation_type

*(optional)* Operation/mode string for seed profiles that key exclusions on create / update / review.

## Outputs

### created_readme

Full path to the created `README.md`

#### artifact

`README.md`

#### audience

`human`

## Protocol

### 1. Take Planning Template

- Load [Template](/meta/resources/planning-readme.md#template).

### 2. Take Seed Profile

- Load the readme-seed profile named by `{seed_profile}`.

### 3. Fill Header And Links

- Populate the header (title, classifier from seed + `{entity_context}`, date, lifecycle Status) and the Executive Summary placeholder, each per its entry in [Rules](/meta/resources/planning-readme.md#rules).
- When `{include_links}` is true, populate the Links table from the seed defaults merged with `{entity_context}` URLs when present, per [Links table](/meta/resources/planning-readme.md#links-table).
  > When `{include_links}` is false, the written README has no Links section.

### 4. Lay In Progress Rows

- Replace the Progress table body with the seed profile's Progress inventory rows as authored (icons from [Status vocabulary](/meta/resources/planning-readme.md#status-vocabulary)). Insert any seed-declared append H2 sections after Solution Overview and before Progress.

### 5. Apply Mode Exclusions

- Apply the seed profile's mode-exclusion map using `{is_review_mode}` and/or `{operation_type}` when bound (else implement/create defaults on the profile), per [Status transition policy](/meta/resources/planning-readme.md#status-transition-policy).

### 6. Write README File

- Create `{planning_folder_path}` when it does not already exist.
- Write the populated `README.md` into that folder, and return that location as `{created_readme}`.

## Rules

### overview-placeholders-at-seed

Leave Problem Overview and Solution Overview as Template placeholders for later producing steps — do not fill them at seed.

### preserve-seed-na

Never reset a Progress Status cell from cancelled/N/A to pending except when a mode flip in the bound seed profile explicitly brings that row into scope (mode-exclusion apply), per [Status transition policy](/meta/resources/planning-readme.md#status-transition-policy). Optional-path undecided rows and path-skip cancelled/N/A follow that same section and [Status vocabulary](/meta/resources/planning-readme.md#status-vocabulary).

### status-icons-from-vocabulary

Progress Status cells use only icons from [Status vocabulary](/meta/resources/planning-readme.md#status-vocabulary).
