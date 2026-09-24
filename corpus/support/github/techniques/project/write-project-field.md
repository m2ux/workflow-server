---
metadata:
  version: 1.0.0
---

## Capability

Set one single-select project field on an item to an option id, then re-read the item and confirm that option.

## Inputs

### project_number

Project number.

### item_id

Project item id.

### field_id

Id of the single-select field to write.

### option_id

Id of the single-select option to set. The write sends this id as the field value.

### field_name

Name of the same field, used by the confirming re-read.

## Outputs

### field_value

Option id the re-read shows on the item. Unset when that re-read is not `{option_id}`.

## Protocol

### 1. Resolve The Collection

1. When `{owner_kind}` is `user`, set `{$projects_root}` to `users/{owner_login}`.
2. When `{owner_kind}` is `org`, set `{$projects_root}` to `orgs/{owner_login}`.

### 2. Write The Option

1. Write a JSON body `{"fields":[{"id":{field_id},"value":"{option_id}"}]}` to a temp file, per `github.authored-prose-by-file`.
2. `gh api --method PATCH {$projects_root}/projectsV2/{project_number}/items/{item_id} --input <body-file>`.

### 3. Confirm The Value

1. `gh api "{$projects_root}/projectsV2/{project_number}/fields?per_page=100" --paginate` and keep the object whose `.name` equals `{field_name}`.
2. `gh api "{$projects_root}/projectsV2/{project_number}/items/{item_id}?fields={field_id}"`.
3. Set `{field_value}` to `{option_id}` when the re-read field's `.value.id` is `{option_id}`.
   > Any other value leaves `{field_value}` unset. The caller carries an unconfirmed field rather than an option the re-read did not show.
