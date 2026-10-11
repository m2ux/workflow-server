---
metadata:
  version: 1.0.0
---

## Capability

Which account owns a GitHub project, and whether that account is a user or an organization.

## Inputs

### owner_login

Login of the user or organization that owns the project.

### owner_kind

`user` or `org`. `user` addresses `/users/{owner_login}/projectsV2`. `org` addresses `/orgs/{owner_login}/projectsV2`.
