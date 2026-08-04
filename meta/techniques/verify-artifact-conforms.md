---
metadata:
  version: 1.3.0
---

## Capability

Conformance of a folder's persisted artifacts to the guide each filename maps to, the canonical-home map the caller declares, and the artifact writing register — corrected in place.

## Inputs

### artifact_dir

*(optional)* Directory holding the artifacts to check, for a caller whose artifacts land somewhere other than the session planning folder. In scope are the artifacts **this run persisted** there, never every file the directory happens to hold — a planning folder holds only the run's own artifacts, while a code or shared directory holds a great deal the run did not write.

#### default

`{planning_folder_path}`

### guide_map

*(optional)* Reference to the caller's planning-artifact-to-guide map — what resolves a bare filename to the guide whose `## Template` and `## Rules` the artifact is measured against. When unbound, each artifact is measured against the guide that names its filename.

### canonical_home_map

*(optional)* Reference to the caller's canonical-home map — which fact category has its one home in which artifact. When unbound, the single-source check is limited to what each guide's own rules state.

## Outputs

### artifact_conformance

The conformance envelope — the violation list plus the aggregate verdict:

#### conforms

true iff every entry in `violations` carries `fixed` true — nothing is left standing. A folder whose only remaining violations sit in artifacts under a published contract reports false, since the shape is still wrong wherever it is corrected.

#### violations

array of `{ file, rule, detail, fixed }` entries — one per detected violation, where `rule` is the slug the breached discipline carries in the guide, the map, or the writing register that owns it (`no-guide` when no guide maps the filename) and `fixed` records whether the in-place fix was applied.

## Protocol

### 1. Enumerate and Resolve

- Enumerate the artifacts this run persisted into `{artifact_dir}` — a file the run did not write is out of scope — and resolve each one's guide through `{guide_map}` when it is bound, otherwise through the guide that names the filename

### 2. Measure Against the Guide and the Map

- Check each artifact against the `## Rules` of its guide and, when `{canonical_home_map}` is bound, against that map; apply each rule by cite and do not restate its criteria here
- An artifact carrying a fact the map homes elsewhere is a finding whether or not the fact is accurate
- Check each human-audience artifact's prose and tables against [Artifact Writing Register](../resources/writing-register.md); a passage or table that breaks the register is a `writing-register` violation

### 3. Correct in Place

- Replace a restated fact with a link to its canonical home, delete a section whose content is an absence, collapse a table whose every row passes, condense prose over its guide's budget, and rewrite a passage that breaks the register
- Preserve content the user asked for explicitly, whatever the budget says
- Leave an artifact under a published contract as it stands, recording its violations with `fixed` false — see [published-contracts-are-reported](#published-contracts-are-reported)

### 4. Surface the Exceptions

- Compose `{artifact_conformance}`: its `violations` array carries every detected violation with its fix status, and `conforms` is true iff every entry was fixed
- Report exceptions only — an artifact that already conformed gets no line

## Rules

### only-what-this-run-wrote

Measure the artifacts this run persisted, and nothing else in the directory. A caller whose artifact directory is a checkout, a code path, or any folder it shares with content the run did not write would otherwise have unrelated files measured against guides they were never written to, and corrected in place against them.

### guide-is-the-standard

An artifact is measured against the guide its own filename maps to. Where no guide maps the filename, that missing mapping is the finding — a `no-guide` violation against the folder rather than against the artifact.

### published-contracts-are-reported

An artifact under a published contract is measured and reported, never rewritten. Its declaration or its guide says so: the bytes are posted or delivered verbatim, or a consumer outside this run parses the file. Rewriting one breaks a promise the producing step made — condensing prose renumbers sections a split step already fixed, and collapsing a table removes a field a triggering workflow reads. Record each violation with `fixed` false and leave the file, so the producing step's own guide is where the shape gets corrected.

### maps-come-from-the-caller

Resolve every map through the bound `{guide_map}` and `{canonical_home_map}` only. A workflow's artifacts are never measured against another workflow's map, and reaching for a familiar map that the caller did not bind is a wrong measurement whatever it reports.
