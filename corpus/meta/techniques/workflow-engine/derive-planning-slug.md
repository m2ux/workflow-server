---
metadata:
  version: 2.1.0
---

## Capability

The canonical planning slug for a work package — today's date plus its kebab-case initiative name — composed and returned without touching the filesystem.

## Inputs

### initiative_name

Kebab-case identifier for the work package: lowercase, alphanumerics and single hyphens.

## Outputs

### planning_slug

The slug naming the work package's planning folder: `YYYY-MM-DD-{initiative_name}` (today's date plus the kebab-case initiative name). The stable identifier the server uses to name and locate the planning folder under its workspace `.engineering` root.

## Protocol

1. Compose the slug: `YYYY-MM-DD-{initiative_name}` (today's date, then the kebab-case initiative name).
2. Return `{planning_slug}` — no filesystem write.
