---
metadata:
  version: 2.0.0
---

## Capability

Derive the canonical planning slug for a work package. The planning FOLDER itself is owned and created by the server: when the session is dispatched ([create-session](../workflow-engine/create-session.md)), the server materialises `<workspace>/.engineering/artifacts/planning/<slug>/` under its OWN workspace root (the `.engineering` root supplied at init) and returns the absolute `planning_folder_path`. This operation only computes the slug that names that folder; it does NOT create a folder relative to the CWD or the target component repo.

## Inputs

### initiative_name

Kebab-case identifier for the work package, slugified from the issue title or work-package description (lowercase, alphanumerics and hyphens). The caller derives it; this operation does not.

## Outputs

### planning_slug

The slug naming the work package's planning folder: `YYYY-MM-DD-{initiative_name}` (today's date plus the kebab-case initiative name). The stable identifier the server uses to name and locate the planning folder under its workspace `.engineering` root.

## Protocol

1. Compose the slug: `YYYY-MM-DD-{initiative_name}` (today's date, then the kebab-case initiative name).
2. Return it as `{planning_slug}`. No filesystem write happens here — the server creates the folder under its workspace root during dispatch and hands back the canonical `{planning_folder_path}`, which is authoritative for all subsequent artifact writes.
