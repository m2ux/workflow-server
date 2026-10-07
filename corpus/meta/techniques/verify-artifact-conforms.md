---
metadata:
  version: 1.7.0
---

## Capability

Conformance of a folder's persisted artifacts to the guide each filename maps to, the canonical-home map the caller declares, and the artifact writing register — corrected in place. Artifacts the map covers no guide for are reported as unmeasured, apart from the verdict.

## Inputs

### artifact_dir

*(optional)* Directory holding the artifacts to check, for a caller whose artifacts land somewhere other than the session planning folder.

#### default

`{planning_folder_path}`

### guide_map

*(optional)* Reference to the caller's planning-artifact-to-guide map — what resolves a bare filename to the guide whose `## Template` and `## Rules` the artifact is measured against. When unbound, each artifact is measured against the guide that names its filename.

### canonical_home_map

*(optional)* Reference to the caller's canonical-home map — which fact category has its one home in which artifact. When unbound, the single-source check is limited to what each guide's own rules state.

## Outputs

### artifact_conformance

The conformance envelope — what was measured and found wanting, what could not be measured, and the aggregate verdict over the first:

#### conforms

true iff every entry in `violations` carries `fixed` true — nothing measured is left standing. A folder whose only remaining violations sit in artifacts under a published contract reports false, since the shape is still wrong wherever it is corrected. Entries in `unmeasured` leave the verdict alone.

#### violations

array of `{ file, rule, detail, fixed }` entries — one per breach of a guide the artifact was held against, where `rule` is the slug the breached discipline carries in the guide, the map, or the writing register that owns it, and `fixed` records whether the in-place fix was applied.

#### unmeasured

array of `{ file, reason }` entries — one per artifact the pass held against no guide, where `reason` is `no-guide` when the folder's map names no guide for the filename. An entry carries no verdict on the artifact's shape, and its correction belongs to whoever owns the map, so no rework inside this run clears one.

## Protocol

### 1. Resolve Artifact Guides

- Enumerate the human-audience artifacts this run persisted into `{artifact_dir}` and resolve each one's guide through `{guide_map}` when it is bound, otherwise through the guide that names the filename
  > Scope per `only-what-this-run-wrote`.
- Record an artifact whose guide no map names in `unmeasured` and carry it no further

### 2. Measure Conformance

- Check each artifact against the `## Rules` of its guide and, when `{canonical_home_map}` is bound, against that map; apply each rule by cite and do not restate its criteria here
- An artifact carrying a fact the map homes elsewhere is a finding whether or not the fact is accurate
- Check each human-audience artifact's prose, tables and links against [Artifact Writing Register](/meta/resources/writing-register.md); a passage, table or link that breaks the register is a `writing-register` violation

### 3. Correct In Place

- Replace a restated fact with a pointer to its canonical home, as the Links rules of the [Artifact Writing Register](/meta/resources/writing-register.md) state, delete a section whose content is an absence, collapse a table whose every row passes, condense prose over its guide's budget, and rewrite a passage that breaks the register
- Preserve content the user asked for explicitly, whatever the budget says
- Leave an artifact under a published contract as it stands, recording its violations with `fixed` false — see `published-contracts-are-reported`

### 4. Surface Exceptions

- Compose `{artifact_conformance}`: its `violations` array carries every detected violation with its fix status, its `unmeasured` array carries every artifact held against no guide, and `conforms` is true iff every violation was fixed
- Report exceptions only — an artifact that already conformed gets no line
- State the two claims apart: a violation says the artifact's shape is wrong, an `unmeasured` entry says the folder's map names no guide to judge it by

## Rules

### only-what-this-run-wrote

Measure the human-audience artifacts this run persisted, and nothing else in the directory. A file the run did not write, an agent-audience artifact, and a folder holding a child run's own output are out of scope.

### guide-is-the-standard

An artifact is measured against the guide its own filename maps to, and against no other.

### published-contracts-are-reported

An artifact under a published contract is measured and never rewritten. Its declaration or its guide says so: the bytes are posted or delivered verbatim, or a consumer outside this run parses the file.

### maps-come-from-the-caller

Resolve every map through the bound `{guide_map}` and `{canonical_home_map}` only. A workflow's artifacts are never measured against another workflow's map, and reaching for a familiar map that the caller did not bind is a wrong measurement whatever it reports.
