# Issue Body

The shape every issue body shares: its title, its Problem and Proposal, its acceptance criteria, and its work-breakdown table.

## Operations

### Write Issue Table

The shared table, before a kind fills its cells.

#### 1. Populate Shared Cells

- Populate the shared Done, Coverage and Depends on cells in [Body Evidence](#body-evidence) from [Row Data](#row-data).
- The columns must match the table in [Kind Conditions](#kind-conditions).
- The shared cells must meet [Tables](#tables).

#### 2. Check Finished Table

Read the finished table against [Tables](#tables), [Numbering](#numbering), and [Reference form](#reference-form).

#### 3. Provide Written Issue Table

Provide [Body Evidence](#body-evidence) with the completed shared table.

### Check Round of Edits

The shared check after a round of edits.

#### 1. Check Kind Conditions

Check each section of [Changed Bodies](#changed-bodies) against [Kind Conditions](#kind-conditions) and [Fields](#fields) in this file.

#### 2. Run Body Format

Run [Check Body Format](#check-body-format "ƒ") to every changed issue, writing its results to [Output Files](#output-files).

#### 3. Provide Checked Round of Edits

Provide [Format Findings](#format-findings) for the complete round.

### Validate Issue Body

One body checked against its supplied kind and template.

#### 1. Run Body Format

Run [Check Body Format](#check-body-format "ƒ") for the selected body.

#### 2. Review Supplied Conditions

Review the body against the shared [Fields](#fields) and the supplied kind conditions.

#### 3. Provide Format Findings

Provide the [Format Findings](#format-findings).

### Apply Body Corrections

One body rewritten from confirmed local findings.

#### 1. Populate Missing Sections

Populate missing sections in [Body Evidence](#body-evidence) from the supplied issue and related context, using [Output Files](#output-files) for the corrected file.

#### 2. Apply Confirmed Decisions

Apply [Confirmed Corrections](#confirmed-corrections) to keep, fold or remove an extra section, and rewrite a wrong-kind body in the selected template.

#### 3. Record Kind Changes

Record a required tracker-kind change for the caller.

#### 4. State Current Design

Restate historical narration as the current design.

#### 5. Apply Criterion Changes

- Apply confirmed criterion changes.
- The body must meet [Body](#body), [Shared Acceptance Criteria](#shared-acceptance-criteria) and the supplied [kind conditions](#kind-conditions).

#### 6. Validate Corrected Body

Apply [Validate Issue Body](#validate-issue-body "ƒ") with the corrected body and supplied validation inputs.

#### 7. Provide Corrected File

Provide the corrected [Body Evidence](#body-evidence) and [Format Findings](#format-findings), including any required cross-body or metadata changes.

### Build Body Snapshot

A local issue-shaped record for body validation.

#### 1. Write Body Snapshot

Write [Body Evidence](#body-evidence) and [Snapshot Metadata](#snapshot-metadata) to [Output Files](#output-files) in the [Body Snapshot](#body-snapshot) shape, including optional existing issue evidence.

#### 2. Provide Snapshot Path

Provide the JSON path for validation. No tracker issue is created by this operation.

### Repair Issue Format

The saved format corrections for one issue and any unresolved content findings.

#### 1. Validate Current Body

- Apply [Validate Issue Body](#validate-issue-body "ƒ") to the current body.
- Provide an unreadable source as a blocker before editing.

#### 2. Review Mechanical Changes

- Review the provided diff.
- For wording-preserving format, title and label corrections, Apply [Save Tracker Issue](issue.md#save-tracker-issue "ƒ") without asking.
- Retain content decisions and cross-body findings separately; do not publish them as mechanical fixes.

#### 3. Resolve Local Content

- Resolve a non-mechanical finding confined to this body.
- Obtain the user's decision.
- Apply [Apply Body Corrections](#apply-body-corrections "ƒ") to the current body using the confirmed resolution.
- Publish through Save Tracker Issue. An unanswered decision or a finding requiring changes to other issues returns to the caller as a blocker.

#### 4. Validate Saved Body

- Apply [Read Tracker Issue](issue.md#read-tracker-issue "ƒ") for the saved issue.
- Apply [Validate Issue Body](#validate-issue-body "ƒ") again with the saved JSON and the same kind conditions, context and output path.
- Provide saved [Body Evidence](#body-evidence), whether a correction was made, and [Format Findings](#format-findings). A remaining failure is a blocker.

## Commands

### Check Body Format

Check one issue against its template, write mechanical body fixes when `--fix` is supplied, and provide [Format Findings](#format-findings "●") and, when a corrected body was requested, [Output Files](#output-files "●") to the requester.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/format.py '[**&lt;issue-json-file&gt;**](#body-record "○")' &#92;
  --initiative '[**&lt;initiative-json-file&gt;**](#initiative-record "○")' &#92;
  --epic '[**&lt;epic-json-file&gt;**](#epic-records "○")' &#92;
  --prs '[**&lt;pull-request-records-file&gt;**](#pull-request-records "○")' &#92;
  --files '[**&lt;pull-request-changed-paths&gt;**](#changed-file-records "○")' &#92;
  --project '[**&lt;checkout&gt;**](#project-checkout "○")' &#92;
  --revision '[**&lt;revision&gt;**](#evaluated-revision "○")' &#92;
  --fix '[**&lt;output-body-file&gt;**](#output-files "○")'
</pre></big>

- Validate the body against [Kind Conditions](#kind-conditions "○").

- The format reader takes the template fence from the body artifact and its table columns where present. A body with a Work Breakdown table requires coverage for every criterion.
- For an epic, supply its parent with `--initiative`. For an initiative, supply every linked epic by repeating `--epic`; omit those options for other kinds.
- For epic delivery checks, supply the pull request snapshot with `--prs` and repeat `--files` for each supplied changed-path record.
- Supply `--project` and `--revision` together for project-required-criteria validation at the fetched revision. Omit both when that validation is outside the request.
- Omit optional flags whose corresponding evidence is not applicable; retain all evidence required by the selected kind. Omit `--fix` when no corrected body is requested.

### List Reference Repositories

List repository names from the issue destination and References section and provide [Reference Repositories](#reference-repositories "●") to the requester.

<big><pre>
[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx python3 [**&lt;workspace&gt;**](#workspace "○")/skills/work-planner/scripts/align.py repositories '[**&lt;issue-json-file&gt;**](#body-record "○")'
</pre></big>

### Fetch Reference Repository

Read one listed repository's visibility with the authenticated repository API and provide [Repository Snapshot](#repository-snapshot "●") to the requester.

<big><pre>
gh api repos/[**&lt;owner&gt;**](#reference-repositories "○")/[**&lt;repo&gt;**](#reference-repositories "○") &gt; '[**&lt;repository-json-file&gt;**](#output-files "○")'
</pre></big>

- Run in the repository checkout.

- Save each object with its `full_name` and `private` fields; combine the objects into the caller's JSON array. A failed fetch supplies no visibility.

### Validate Reference Visibility

Report private repository references on a public issue and unresolved repository visibility, and provide [Visibility Findings](#visibility-findings "●") to the requester.

The snapshot is a JSON array of fetched repository objects. Exit 1 means findings remain.

<big><pre>
[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx python3 [**&lt;workspace&gt;**](#workspace "○")/skills/work-planner/scripts/align.py references '[**&lt;issue-json-file&gt;**](#body-record "○")' --repositories '[**&lt;repositories-json-file&gt;**](#repository-snapshot "○")'
</pre></big>

## Fields

### Titles

The issue title string, with its kind's optional prefix.

- The title separates its name and outcome subtitle with a colon.
- The name is two or three words and the subtitle a succinct summary of at most ten, in title case.
- A prefixed title separates its levels with colons, then the name.

### Labels

The collection of repository label names attached to the issue.

The collection includes `enhancement`, `bug` and `tech-debt` as applicable; every name identifies an existing repository label. eg `workflows` for workflow-server.

### Problem and Proposal

The Problem and Proposal prose sections of an issue body. Their items carry the following content constraints.

- **Friction.**
  A Problem states the friction as it is now. Its evidence is a count or a code link for that friction. A Problem does not describe the plan.
- **Plan ids.**
  A Problem or Proposal names no epic, task or acceptance criterion of its own initiative. The Work Breakdown table holds those references; a sibling boundary is plain language.
- **Evidence that may be cited.**
  Code, a merged pull request, and an issue outside this initiative may be cited.

### Shared Acceptance Criteria

A collection of labelled criterion statements; each criterion must meet these constraints. A kind adds its own under its Acceptance Criteria.

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

The kind's row table, whose shared cell values have these shapes.

- **Done.**
  The last column. Its cell is empty while the row is open, and a tick, ✓, when the row is complete.
- **Description.**
  A short phrase naming what the row delivers, at most eight words, with no list, semicolon or detail.
- **Coverage.**
  The acceptance criteria the row delivers, `AC2, AC5`, and nothing else. Every criterion is delivered by at least one row.
- **Depends on.**
  References only, with no prose, and only what no other entry in the cell already implies.

### Reference Form

A row reference string: colon-separated levels in table cells, as the scripts read them, and space-separated levels in prose.

### Body

The complete Markdown issue body with the sections and table columns defined by its kind template.

A body states the plan as it is. It carries no change narrative. How the plan evolved belongs in the planning record and in commit and pull request bodies.

Task and epic numbers, issue links and wording must agree with the current decisions and bodies. References to superseded decisions are findings.

- Every template placeholder is populated; optional sections are present only when they have content.
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

### References

The issue body's collection of labelled source links and descriptions. An issue's References section does not link issues or pull requests on the same board. A public issue's References cite public repositories; unavailable visibility is unresolved.

### Coverage Reports

A collection of entries identifying every criterion in the reviewed scope, its observing check and evidence, or why it is unobservable.

- **Unobservable items.**
  An item a test cannot observe is named in the plan or the coverage report. It stays in the report.
- **The check matches the criterion.**
  - A file or string check counts as coverage only when the criterion is a fact about that file.
  - A criterion about a run is covered by a run that shows it.
- **The specified set.**
  A coverage report lists every acceptance criterion the work under review is specified to cover.

### Format Findings

A collection of tagged findings with the following variants.

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

The supplied local destinations for a corrected complete body, a body-snapshot JSON record or repository visibility evidence. eg `output-body-file: fixed.md`, `repository-json-file: repository.json`

### Body Snapshot

A local issue-shaped JSON record retaining the body's exact text, title and labels, plus the existing issue's identity and state when supplied. An unpublished draft uses `number: null` and `state: "open"`; labels are strings or objects with a name.

### Reference Repositories

The destination repository and the repositories cited in References, identified by owner and name.

### Repository Snapshot

The supplied JSON array of fetched repository objects, each retaining full_name and private. eg `repositories.json`

### Visibility Findings

Findings carrying the issue identity, cited repository identities and their observed visibility or missing evidence.

### Workspace

The absolute checkout holding the installed Work Planner scripts and sandbox helper.

### Body Record

The complete current issue-shaped JSON record: a saved tracker issue record, or a local [Body Snapshot](#body-snapshot) for an unpublished draft. eg `issue.json`

### Initiative Record

The complete parent initiative JSON used to resolve an epic's cross-epic references. eg `initiative.json`

### Epic Records

Every linked epic's complete current JSON, supplied separately when validating an initiative's row titles and structure. eg `epic.json`

### Pull Request Records

The current complete REST pull request snapshot as one JSON object per nonempty line, used to determine which declared branches and paths the epic changes. eg `prs.json`

### Changed File Records

Each pull request number paired with its local changed-paths file as `NUMBER=FILE`; the file contains one tracker-supplied changed path per line. eg `950=changed-950.txt`

### Project Checkout

The checkout holding the project-required-criteria declaration and the fetched revision at which it is evaluated.

### Evaluated Revision

The fetched epic base on the declaration's long-lived branch, or that long-lived branch while the epic has no base on it. eg `origin/i07/e00/workspace`

### Snapshot Metadata

The supplied title and labels for the body, with the existing issue JSON when its identity and state are available.

## Guidance

### Numbering

Rows are numbered in the order they can start, so every dependency points to an earlier row. Numbering that does not follow start order is advisory.

Work a pull request names keeps its number. Renumbering touches only a row no pull request names.
