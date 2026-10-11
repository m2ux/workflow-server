---
metadata:
  version: 1.0.0
---

## Capability

Read one project field, including a single-select field's option ids, and the value that field currently holds on one item.

## Inputs

### project_number

Project number.

### item_id

Project item id.

### field_name

Name of the project field to read.

## Outputs

### field_id

Id of the field named `{field_name}`.

### field_options

Option records for a single-select field: each option's id and name. Empty when the field is not single-select.

### field_value

Value that field holds on the item. For a single-select field this is the selected option id. Unset when the item has no value for the field.

## Protocol

### 1. Resolve The Collection

1. When `{owner_kind}` is `user`, set `{$projects_root}` to `users/{owner_login}`.
2. When `{owner_kind}` is `org`, set `{$projects_root}` to `orgs/{owner_login}`.

### 2. Read The Field

1. `gh api "{$projects_root}/projectsV2/{project_number}/fields?per_page=100" --paginate`.
2. Keep the object whose `.name` equals `{field_name}`. Set `{field_id}` from its `.id`.
3. Set `{field_options}` from that object's `.options`, each as its `id` and its `.name.raw`.
   > A field with no `.options` yields an empty `{field_options}`.

### 3. Read The Item Value

1. `gh api "{$projects_root}/projectsV2/{project_number}/items/{item_id}?fields={field_id}"`.
2. Set `{field_value}` from the matching field on that item. A single-select value is the option `id` on `.value.id`.
   > When the item has no value for `{field_id}`, leave `{field_value}` unset.
