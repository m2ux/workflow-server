---
metadata:
  version: 1.0.0
---

## Capability

Find the project item that represents one issue.

## Inputs

### project_number

Project number.

### issue_number

Issue number the item's content must carry.

### field_ids

*(optional)* Comma-separated project field ids to request on the item list. When unset, the list returns the title field, and `content` still identifies the issue.

## Outputs

### item_id

Id of the matching project item. Unset when no item matches the issue.

## Protocol

### 1. Resolve Coordinates

1. Apply [resolve-repo-coordinates](../resolve-repo-coordinates.md).

### 2. Resolve The Collection

1. When `{owner_kind}` is `user`, set `{$projects_root}` to `users/{owner_login}`.
2. When `{owner_kind}` is `org`, set `{$projects_root}` to `orgs/{owner_login}`.

### 3. Select The Item

1. `gh api "{$projects_root}/projectsV2/{project_number}/items?per_page=100&fields={field_ids}" --paginate` when `{field_ids}` is set; otherwise `gh api "{$projects_root}/projectsV2/{project_number}/items?per_page=100" --paginate`.
   > Without `fields`, each item's project fields are the title alone. `content` still carries the issue.
2. Keep the object whose `content_type` is `Issue`, whose `content.number` equals `{issue_number}`, and whose repository is `{owner}/{repo}`.
3. Set `{item_id}` from that object's `.id`.
   > When no object matches, leave `{item_id}` unset.
