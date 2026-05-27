---
name: manage-artifacts
description: Create and organize planning artifacts in .engineering/artifacts/planning/.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 2.0.0
  order: 14
  legacy_id: 14
---

# Manage Artifacts

## Capability

Manage planning artifacts — create folders, enforce activity-based artifact prefixing, and organize documents

## Inputs

### planning-folder-path

*(optional)* Path to planning folder (or parent for creation)

### issue-title

Issue title for deriving initiative name

## Protocol

### 1. Create Folder

- Create planning folder at .engineering/artifacts/planning/YYYY-MM-DD-{initiative-name}/
- Derive initiative-name from issue title (slugified)

### 2. Create Readme

- Use attached [readme](legacy/work-package/resources/readme/SKILL.md) for the README.md template and guidelines
- Create README.md from the template in the planning folder with placeholder sections populated from issue context
- Populate header fields (name, date, status, type), Executive Summary, and Links table. Leave Problem Overview and Solution Overview as placeholder text for later activities to populate.

### 3. Apply Prefix

- The activity's artifactPrefix is server-computed from the activity filename (e.g., '09' from 09-post-impl-review.toon). It is available in the activity definition returned by the server.
- Prepend {artifactPrefix}- to each bare artifact filename at write time
- Example: activity 09-post-impl-review.toon writing 'code-review.md' produces '09-code-review.md'

### 4. Write Artifact

- Write artifact content to the correct path with the activity prefix applied
- Use format {artifactPrefix}-filename.md where artifactPrefix is provided by the server in the activity definition
- Preserve existing artifacts when adding new ones

## Outputs

### planning-folder

Planning folder created or verified with artifacts organized by activity prefix

- **folder_path**: Full path to planning folder
- **artifact_index**: Map of activity prefix to artifact filenames

## Operations

### verify-readme-conforms

**Description:** Verify the planning folder's README.md still matches the [readme](legacy/work-package/resources/readme/SKILL.md) template structure (header block, executive summary, problem/solution overview, progress table, links). Catches template drift that would otherwise only be flagged late in the workflow by a human reviewer.

**Inputs:**

- **planning_folder_path** — Absolute path to the planning folder containing README.md

**Output:**

- **readme_conformance** — { conforms: bool, missing_sections: [], extra_top_level_headings: [], header_block_drift: [] } — conforms is true iff missing_sections, extra_top_level_headings, and header_block_drift are all empty

**Procedure:**

- Read {planning_folder_path}/README.md and load [readme](legacy/work-package/resources/readme/SKILL.md) (the README template) via get_resource.
- Extract H1/H2/H3 sections from each. Compare H2 sections against the template's required set: Executive Summary, Problem Overview, Solution Overview, Progress, Links. Compare the header block (Created/Status/Type fields) against the template's header fields.
- Compose readme_conformance: missing_sections lists template H2s absent from the README; extra_top_level_headings lists H1s beyond the single title H1; header_block_drift lists header fields missing or renamed (e.g., a custom 'Issue:' line in place of the canonical 'Status:'/'Type:' rows). conforms is true iff all three arrays are empty.

**Tools:**

- **harness:** Read
- **workflow-server:** get_resource

**Errors:**

- **readme_missing** — Cause: No README.md found in planning_folder_path · Recovery: Re-run manage-artifacts::create-readme protocol to seed the README from [readme](legacy/work-package/resources/readme/SKILL.md) before continuing

## Rules

### activity-prefix

Artifact filenames are prefixed with the producing activity's artifactPrefix (server-computed from the activity filename). Skills declare bare names (e.g., 'code-review.md'); the prefix is applied at write time (e.g., '09-code-review.md'). This groups artifacts by activity and sorts them in workflow order.

### committed-to-parent

Planning artifacts are regular files in the parent repo (.engineering/artifacts/). They MUST be committed and pushed to the parent repo before any PR or issue references them via URL, otherwise the link will 404.

### push-before-linking

Any engineering link included in a PR body (📐 Engineering) MUST resolve to a committed file on the remote. Commit and push the planning folder BEFORE creating or updating the PR.

### tool-usage

use shell for mkdir folder creation and ls to verify existing artifacts

## Errors

### folder_exists

**Cause:** Planning folder already exists

**Recovery:** Use existing folder and continue with activity-based prefixing

### permission_error

**Cause:** Cannot create directory

**Recovery:** Check path and permissions
