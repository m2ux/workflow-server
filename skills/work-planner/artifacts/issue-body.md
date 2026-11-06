# Issue Body

The shape every issue body shares: its title, its Problem and Proposal, its acceptance criteria, and its work-breakdown table.

## Prerequisites

Read these files first.

- [Requirement Characteristics](../references/requirement-characteristics.md)
- [Issue](issue.md)

## Operations

### Write Issue Table

The shared table, before a kind fills its cells.

#### 1. Populate Shared Cells

- Populate the shared Done, Coverage and Depends on cells in [Body Evidence](#body-evidence "○") from [Row Data](#row-data "○").
- The columns must match the table in [Kind Conditions](#kind-conditions "○").
- The shared cells must meet [Tables](#tables).

#### 2. Check Finished Table

Read the finished table against [Tables](#tables), [Numbering](#numbering), and [Reference form](#reference-form).

#### 3. Provide Written Issue Table

Provide [Body Evidence](#body-evidence "●") with the completed shared table.

### Check Round of Edits

The shared check after a round of edits.

#### 1. Check Kind Conditions

Check each section of [Changed Bodies](#changed-bodies "○") against [Kind Conditions](#kind-conditions "○") and [Fields](#fields) in this file.

#### 2. Run Body Format

Apply [Check Body Format](#check-body-format "ƒ") to every changed issue, writing its results to [Output Files](#output-files "○").

#### 3. Provide Checked Round of Edits

Provide [Format Findings](#format-findings "●") for the complete round.

### Validate Issue Body

One body checked against its supplied kind and template.

#### 1. Run Body Format

Apply [Check Body Format](#check-body-format "ƒ") to [Body Record](#body-record "○") with [Kind Conditions](#kind-conditions "○"), writing corrections to [Output Files](#output-files "○").

#### 2. Review Supplied Conditions

Review the body against the supplied field conditions.

#### 3. Provide Format Findings

Provide the [Format Findings](#format-findings "●").

### Apply Body Corrections

One body rewritten from confirmed local findings.

#### 1. Populate Missing Sections

Populate missing sections in [Body Evidence](#body-evidence "○") from the supplied issue and related context, using [Output Files](#output-files "○") for the corrected file.

#### 2. Apply Confirmed Decisions

Apply [Confirmed Corrections](#confirmed-corrections "○") to keep, fold or remove an extra section, and rewrite a wrong-kind body in the selected template.

#### 3. Record Kind Changes

Record a required tracker-kind change for the caller.

#### 4. State Current Design

Restate historical narration as the current design.

#### 5. Apply Criterion Changes

- Apply confirmed criterion changes.
- The body must meet [Body](#body), [Shared Acceptance Criteria](#shared-acceptance-criteria) and the supplied [kind conditions](#kind-conditions "○").

#### 6. Validate Corrected Body

Apply [Validate Issue Body](#validate-issue-body "ƒ") with the corrected body and supplied validation inputs.

#### 7. Provide Corrected File

Provide the corrected [Body Evidence](#body-evidence "●") and [Format Findings](#format-findings "●"), including any required cross-body or metadata changes.

### Build Body Snapshot

A local issue-shaped record for body validation.

#### 1. Write Body Snapshot

Write [Body Evidence](#body-evidence "○") and [Snapshot Metadata](#snapshot-metadata "○") to [Output Files](#output-files "○") in the [Body Snapshot](#body-snapshot "●") shape, including optional existing issue evidence.

#### 2. Provide Snapshot Path

Provide the JSON path for validation. No tracker issue is created by this operation.

### Repair Issue Format

The saved format corrections for one issue and any unresolved content findings.

#### 1. Validate Current Body

- Apply [Validate Issue Body](#validate-issue-body "ƒ") to [Body Record](#body-record "○") with [Kind Conditions](#kind-conditions "○"), related evidence and [Output Files](#output-files "○").
- Provide an unreadable source as a blocker before editing.

#### 2. Review Mechanical Changes

- Review the provided diff.
- For wording-preserving format, title and label corrections, Apply [Save Tracker Issue](issue.md#save-tracker-issue "ƒ") without asking.
- Retain content decisions and cross-body findings separately; do not publish them as mechanical fixes.

#### 3. Resolve Local Content

- Resolve a non-mechanical finding confined to this body.
- Obtain the user's decision.
- Apply [Apply Body Corrections](#apply-body-corrections "ƒ") with the current body, kind template and conditions, related context, confirmed resolution and output path.
- Publish through Save Tracker Issue. An unanswered decision or a finding requiring changes to other issues returns to the caller as a blocker.

#### 4. Validate Saved Body

- Apply [Read Tracker Issue](issue.md#read-tracker-issue "ƒ") for the saved issue.
- Apply [Validate Issue Body](#validate-issue-body "ƒ") again with the saved JSON and the same kind conditions, context and output path.
- Provide saved [Body Evidence](#body-evidence "●"), whether a correction was made, and [Format Findings](#format-findings "●"). A remaining failure is a blocker.

### Check Reference Visibility

Repository visibility for the destination issue and its References entries.

#### 1. Identify Reference Repositories

Apply [List Reference Repositories](#list-reference-repositories "ƒ") to [Body Record](#body-record "○") to identify the destination and cited repositories.

#### 2. Fetch Repository Visibility

Apply [Fetch Reference Repository](#fetch-reference-repository "ƒ") for each provided name; collect the objects into a JSON array at the snapshot path in [Output Files](#output-files "○"). Retain failed fetches as unresolved visibility, never as public visibility.

#### 3. Validate Reference Snapshot

Apply [Validate Reference Visibility](#validate-reference-visibility "ƒ") with that snapshot and the issue record.

#### 4. Provide Visibility Findings

Provide [Visibility Findings](#visibility-findings "●") identifying each private reference on a public issue and each unavailable visibility. A private destination has no public-reference restriction; deciding how to replace or remove a private reference belongs to the requester.

### Check Body Format

Checks one issue against its template, and with `--fix` writes the body with the mechanical fixes made.

#### 1. Check Body Format

- Validate the body against [Kind Conditions](#kind-conditions "○").

- The format reader takes the template fence from the body artifact and its table columns where present. A body with a Work Breakdown table requires coverage for every criterion.
- The input is one issue JSON. `--fix` names the output body file for mechanical fixes. Further inputs are specified by the calling body procedure.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && \
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/format.py '[**&lt;issue-json-file&gt;**](#body-record "○")' \
  --fix '[**&lt;output-body-file&gt;**](#output-files "○")'
</pre></big>

**Example:**

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && \
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/format.py issue.json \
  --fix fixed.md
</pre></big>

#### 2. Provide Checked Body Format

Provide [Format Findings](#format-findings "●") to the requester.

### List Reference Repositories

List repository names from the issue destination and References section.

#### 1. List Reference Repositories

<big><pre>
[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx python3 [**&lt;workspace&gt;**](#workspace "○")/skills/work-planner/scripts/align.py repositories '[**&lt;issue-json-file&gt;**](#body-record "○")'
</pre></big>

**Example:**

<big><pre>
[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx python3 [**&lt;workspace&gt;**](#workspace "○")/skills/work-planner/scripts/align.py repositories issue-943.json
</pre></big>

#### 2. Provide Listed Reference Repositories

Provide [Reference Repositories](#reference-repositories "●") to the requester.

### Fetch Reference Repository

Read one listed repository's visibility with the authenticated repository API.

#### 1. Fetch Reference Repository

- Run in the repository checkout.

- Save each object with its `full_name` and `private` fields; combine the objects into the caller's JSON array. A failed fetch supplies no visibility.

<big><pre>
gh api repos/[**&lt;owner&gt;**](#reference-repositories "○")/[**&lt;repo&gt;**](#reference-repositories "○") > '[**&lt;repository-json-file&gt;**](#output-files "○")'
</pre></big>

**Example:**

<big><pre>
gh api repos/{owner}/{repo} > repository.json
</pre></big>

#### 2. Provide Fetched Reference Repository

Provide [Repository Snapshot](#repository-snapshot "●") to the requester.

### Validate Reference Visibility

Report private repository references on a public issue and unresolved repository visibility.

#### 1. Validate Reference Visibility

The snapshot is a JSON array of fetched repository objects. Exit 1 means findings remain.

<big><pre>
[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx python3 [**&lt;workspace&gt;**](#workspace "○")/skills/work-planner/scripts/align.py references '[**&lt;issue-json-file&gt;**](#body-record "○")' --repositories '[**&lt;repositories-json-file&gt;**](#repository-snapshot "○")'
</pre></big>

**Example:**

<big><pre>
[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx python3 [**&lt;workspace&gt;**](#workspace "○")/skills/work-planner/scripts/align.py references issue-943.json --repositories repositories.json
</pre></big>

#### 2. Provide Validated Reference Visibility

Provide [Visibility Findings](#visibility-findings "●") to the requester.

## Fields

### Titles

- **Titles.**
  - A title is a short name, a colon, and a subtitle stating the outcome.
  - The name is two or three words and the subtitle a succinct summary of at most ten, in title case.
  - A prefixed title separates its levels with colons, then the name.
- **Bodies.**
  - Every body keeps the section order of its kind template and the columns of that kind's table.
  - Fill each `{{…}}` and delete a section the template marks as optional when it has nothing to say.
- **Code references.**
  A body references code as a link on the words it supports, a permalink pinned to a commit with its line anchors, never a bare `path:line`: `the [extrinsic type](…/blob/<sha>/runtime/src/lib.rs#L1231-L1232)`.
- **Succinct items.**
  Each Problem and Proposal item, and each of its sub-bullets, is at most two lines. A bold opener does not count toward the two. Several distinct points go in a bulleted list, never packed into those two lines.
- **Bold leads.**
  - A Problem or Proposal item that opens with a bold statement puts its body on the next line, indented under the bullet:

    ```markdown
    - **Length is the only check on entry.**
      The data source decodes the key and never checks its value.
    ```

  - A bulleted item with sub-bullets keeps the line introducing them on its bold statement's line:

    ```markdown
    - **Framing is undocumented.** Nothing describes:
      - the runtime's extrinsic type;
    ```
- **Labels.**
  - Add `enhancement`, `bug` and `tech-debt` as they apply.
  - **Example.**  workflow-server adds `workflows`.
  - Only labels that exist are applied.

### Problem and Proposal

- **Friction.**
  A Problem states the friction as it is now. Its evidence is a count or a code link for that friction. A Problem does not describe the plan.
- **Plan ids.**
  A Problem or Proposal names no epic, task or acceptance criterion of its own initiative. The Work Breakdown table holds those references; a sibling boundary is plain language.
- **Evidence that may be cited.**
  Code, a merged pull request, and an issue outside this initiative may be cited.

### Shared Acceptance Criteria

An acceptance criterion meets these. A kind adds its own under its Acceptance Criteria.

- States an end state, not an activity.
- Names or implies the instrument that observes it: a test, a guard, a command or a measure.
- Is unambiguous, so two readers agree on whether it holds.
- Meets [Requirement Characteristics](../references/requirement-characteristics.md).
- **One invariant.**
  Each criterion states a single condition that holds or does not. One joining several is split, and the Coverage cells cite the new ones. A condition over a list of subjects is one condition.

#### Criterion Labels

Criteria are labelled `AC1` onward, in ascending order. A criterion that leaves a body takes its label with it, and the criteria that remain keep theirs, since other work cites them, so the labels may ascend with a gap.

#### Verifiable

- Subjective wording is an observable pass or fail, or the criterion is absent.
- A fact that inspection, analysis, demonstration, or test can check is kept, such as every option having a description.
- A judgment about meaning, such as a claim that a description states what choosing means, is subjective wording.
- An item none of those methods can observe is named as [Coverage Reports](#coverage-reports) define, and it stays named there.

### Tables

- **Done.**
  The last column. Its cell is empty while the row is open, and a tick, ✓, when the row is complete.
- **Description.**
  A short phrase naming what the row delivers, at most eight words, with no list, semicolon or detail.
- **Coverage.**
  The acceptance criteria the row delivers, `AC2, AC5`, and nothing else. Every criterion is delivered by at least one row.
- **Depends on.**
  References only, with no prose, and only what no other entry in the cell already implies.

### Numbering

Rows are numbered in the order they can start, so every dependency points to an earlier row. Numbering that does not follow start order is advisory.

Work a pull request names keeps its number. Renumbering touches only a row no pull request names.

### Reference Form

Tables write references with colons, the form the scripts read. Prose uses a space.

### Body

- **Stale references.**
  A row number, issue link or decision wording agrees with the current plan.
- **Body.**
  A body states the plan as it is. It carries no change narrative. How the plan evolved belongs in the planning record and in commit and pull request bodies.

### Stale References

Task and epic numbers, issue links and wording must agree with the current decisions and bodies. References to superseded decisions are findings.

### References

An issue's References section does not link issues or pull requests on the same board. A public issue's References cite public repositories; unavailable visibility is unresolved.

### Coverage Reports

- **Unobservable items.**
  An item a test cannot observe is named in the plan or the coverage report. It stays in the report.
- **The check matches the criterion.**
  - A file or string check counts as coverage only when the criterion is a fact about that file.
  - A criterion about a run is covered by a run that shows it.
- **The specified set.**
  A coverage report lists every acceptance criterion the work under review is specified to cover.

### Format Findings

- **Fixed.**
  Structural changes preserve the wording and are present in the provided body file, with a body diff.
- **Apply.** Title or label changes for the caller to publish on the issue.
- **Decide.** Missing content or a judgement for the caller to resolve.

### Body Evidence

The supplied complete current issue body, held as text or at a local body-file path.

### Kind Conditions

The supplied kind template, table columns, field conditions and additional format inputs. Related evidence required by that kind accompanies the body.

### Row Data

The supplied row data for the kind's shared table cells.

### Changed Bodies

Every changed body's issue-shaped JSON record, with its kind conditions and format inputs.

### Confirmed Corrections

The confirmed local resolutions, criterion changes and selected decisions to keep, fold or remove extra sections, with the related context needed to populate them.

### Output Files

The supplied local destinations for a corrected complete body, a body-snapshot JSON record or repository visibility evidence.

### Body Snapshot

A local issue-shaped JSON record retaining the body's exact text, title and labels, plus the existing issue's identity and state when supplied. An unpublished draft uses `number: null` and `state: "open"`; labels are strings or objects with a name.

### Reference Repositories

The destination repository and the repositories cited in References, identified by owner and name.

### Repository Snapshot

The supplied JSON array of fetched repository objects, each retaining full_name and private.

### Visibility Findings

Findings carrying the issue identity, cited repository identities and their observed visibility or missing evidence.

### Workspace

The absolute checkout holding the installed Work Planner scripts and sandbox helper.

### Body Record

The complete current issue-shaped JSON record: a saved tracker issue record, or a local [Body Snapshot](#body-snapshot) for an unpublished draft.

### Snapshot Metadata

The supplied title and labels for the body, with the existing issue JSON when its identity and state are available.
