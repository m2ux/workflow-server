---
metadata:
  version: 1.0.0
---

## Capability

Find one user-owned or organization-owned project by number or by title.

## Inputs

### project_number

*(optional)* Project number. When set, the match is that number.

### project_title

*(optional)* Project title. When `{project_number}` is unset, the match is this title on the parsed project objects.

## Outputs

### project_number

Number of the matching project. Unset when no project matches.

## Protocol

### 1. Resolve The Collection

1. When `{owner_kind}` is `user`, set `{$projects_root}` to `users/{owner_login}`.
2. When `{owner_kind}` is `org`, set `{$projects_root}` to `orgs/{owner_login}`.

### 2. Select The Project

1. `gh api "{$projects_root}/projectsV2?per_page=100" --paginate`.
2. When `{project_number}` is set, keep the object whose `.number` equals `{project_number}`.
3. When `{project_number}` is unset, keep the object whose `.title` equals `{project_title}`.
   > `{project_title}` is compared on the parsed objects. It is not interpolated into the request URL.
4. Set `{project_number}` from the kept object's `.number`.
   > When no object matches, or both selectors are unset, leave `{project_number}` unset.
