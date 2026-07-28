---
metadata:
  version: 1.0.0
---

## Capability

Planning artifacts corrected in place against the guide each one's filename maps to, and against the canonical-home map.

## Protocol

### 1. Enumerate the Artifacts

- Enumerate every planning artifact in `{planning_folder_path}` — each `.md` except session state files — and resolve each one's guide through the artifact-to-guide map

### 2. Check Each Against Its Own Guide

- Check each artifact against the `## Rules` of the guide its filename maps to, and against [canonical-home-map](../TECHNIQUE.md#canonical-home-map); apply each rule by cite and do not restate its criteria here
- An artifact carrying a fact the map homes elsewhere is a finding whether or not the fact is accurate

### 3. Correct in Place

- Replace a restated fact with a link to its canonical home, delete a section whose content is an absence, collapse a table whose every row passes, and condense prose over its guide's budget
- Preserve content the user asked for explicitly, whatever the budget says

### 4. Surface the Exceptions

- Surface the corrections made and any finding left unfixed, exceptions only — an artifact that already conformed gets no line

## Rules

### guide-is-the-standard

An artifact is measured against the guide its own filename maps to, never against another workflow's output-discipline map. Where no guide maps the filename, that missing mapping is the finding.
