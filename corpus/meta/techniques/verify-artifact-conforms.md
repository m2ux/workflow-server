---
metadata:
  version: 1.5.0
---

## Capability

Conformance of a folder's persisted artifacts to the guide each filename maps to, the canonical-home map the caller declares, and the artifact writing register — corrected in place. Artifacts the map covers no guide for are reported as unmeasured, apart from the verdict.

## Inputs

### artifact_dir

*(optional)* Directory holding the artifacts to check, for a caller whose artifacts land somewhere other than the session planning folder. In scope are the **human-audience artifacts this run persisted** there — never every file the directory happens to hold, since a planning folder holds only the run's own artifacts while a code or shared directory holds a great deal the run did not write, and never an agent-audience artifact, whose conformance is its declared schema rather than a prose template.

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

### 1. Enumerate and Resolve

- Enumerate the human-audience artifacts this run persisted into `{artifact_dir}` and resolve each one's guide through `{guide_map}` when it is bound, otherwise through the guide that names the filename
  > A file the run did not write, a child run's output folder, and an artifact declared `agent`, are all out of scope.
- Record an artifact whose guide no map names in `unmeasured` and carry it no further

### 2. Measure Against the Guide and the Map

- Check each artifact against the `## Rules` of its guide and, when `{canonical_home_map}` is bound, against that map; apply each rule by cite and do not restate its criteria here
- An artifact carrying a fact the map homes elsewhere is a finding whether or not the fact is accurate
- Check each human-audience artifact's prose and tables against [Artifact Writing Register](../../meta/resources/writing-register.md); a passage or table that breaks the register is a `writing-register` violation

### 3. Correct in Place

- Replace a restated fact with a link to its canonical home, delete a section whose content is an absence, collapse a table whose every row passes, condense prose over its guide's budget, and rewrite a passage that breaks the register
- Preserve content the user asked for explicitly, whatever the budget says
- Leave an artifact under a published contract as it stands, recording its violations with `fixed` false — see [published-contracts-are-reported](#published-contracts-are-reported)

### 4. Surface the Exceptions

- Compose `{artifact_conformance}`: its `violations` array carries every detected violation with its fix status, its `unmeasured` array carries every artifact held against no guide, and `conforms` is true iff every violation was fixed
- Report exceptions only — an artifact that already conformed gets no line
- State the two claims apart: a violation says the artifact's shape is wrong, an `unmeasured` entry says the folder's map names no guide to judge it by

## Rules

### only-what-this-run-wrote

Measure the human-audience artifacts this run persisted, and nothing else in the directory. Three exclusions carry the weight. A caller whose artifact directory is a checkout, a code path, or any folder it shares with content the run did not write would otherwise have unrelated files measured against guides they were never written to, and corrected in place against them. An agent-audience artifact is structured data whose conformance is its declared schema — a template and a line budget say nothing about it, so measuring one against them reports noise and correcting one against them corrupts it. And a folder holding a child run's own output belongs to that run: the child's workflow declares the guides its artifacts follow and binds its own conformance pass over them, so a caller that descends into one measures another workflow's artifacts against a map that was never written for them.

### guide-is-the-standard

An artifact is measured against the guide its own filename maps to. Where no guide maps the filename, the artifact is unmeasured and the missing mapping is what gets reported — a claim about the folder's map, not about the artifact's shape. Keeping the two apart matters because they are cleared by different people: a violation is a defect in a file the run can correct, and a gap in the map is a definition edit no amount of rework inside the run reaches.

### published-contracts-are-reported

An artifact under a published contract is measured and reported, never rewritten. Its declaration or its guide says so: the bytes are posted or delivered verbatim, or a consumer outside this run parses the file. Rewriting one breaks a promise the producing step made — condensing prose renumbers sections a split step already fixed, and collapsing a table removes a field a triggering workflow reads. Record each violation with `fixed` false and leave the file, so the producing step's own guide is where the shape gets corrected.

### maps-come-from-the-caller

Resolve every map through the bound `{guide_map}` and `{canonical_home_map}` only. A workflow's artifacts are never measured against another workflow's map, and reaching for a familiar map that the caller did not bind is a wrong measurement whatever it reports.
