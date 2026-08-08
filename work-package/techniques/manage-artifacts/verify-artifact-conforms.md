---
metadata:
  version: 1.1.0
---

## Capability

Conformance of planning artifacts to this group's output-discipline rules (artifact set, not the planning README).

## Outputs

### artifact_conformance

The conformance envelope — the violation list plus the aggregate verdict:

#### conforms

true iff the `violations` array is empty after fixes are applied.

#### violations

array of `{ file, rule, detail, fixed }` entries — one per detected violation, where `rule` names the rule breached (`single-source-and-link`, `state-once-per-artifact`, `omit-null-sections`, `exception-only-reporting`, `line-budget`, `code-reference-is-an-inline-link`, `finding-layout`, `designator-order`, `severity-value`, `delivery-class`, or `anchor-resolves`) and `fixed` records whether the in-place fix was applied.


## Protocol

### 1. Enumerate

1. Enumerate the planning artifacts in `{planning_folder_path}` — every `.md` file except `session.json`-adjacent state files. A method record is enumerated with the report it accompanies: it is the half nobody re-reads, and so the half a stale claim survives in.

### 2. Check Output Discipline

1. Check each artifact against the group's output-discipline rules and the [canonical-home map](./TECHNIQUE.md#canonical-home-map):
   - a section restating content whose canonical home is another artifact (map lookup) breaches `single-source-and-link`;
   - a link-only slot (a template section defined as a one-line pointer) carrying more than a link plus one line breaches `single-source-and-link`;
   - a section whose content is "None", "N/A", or a statement of non-applicability breaches `omit-null-sections`;
   - a recap table or closing summary restating the artifact's own sections breaches `state-once-per-artifact`;
   - an all-pass status table breaches `exception-only-reporting`;
   - an artifact exceeding a line budget declared in its template's `## Rules` breaches `line-budget`;
   - a reference to a named thing in the code carrying no inline link on the name — or carrying a coordinate-only link, a trailing parenthetical citation, or a code span inside the link text — breaches `code-reference-is-an-inline-link`.

### 3. Check Finding Shape

1. For each artifact that states findings, take its report's declared field list and prefix, then check every finding against [Finding Layout](../../resources/findings-report.md#finding-layout):
   - a finding that is not a heading, or a grouping heading standing between findings, breaches `finding-layout`;
   - a paragraph whose opening label is outside the declared list breaches `finding-layout`, as does a finding whose labels appear out of declared order or omit a required one;
   - a designator whose prefix is not the one the report declares, or a findings list or table not in ascending designator order, breaches `designator-order`;
   - a severity outside the render scale, a severity carrying a qualifier, an absent severity, or one disagreeing with the map applied to that finding's recorded classification, breaches `severity-value`;
   - a designator the run produced that appears in no delivery class, or in more than one, breaches `delivery-class` — compare the set of designators produced against the set each class names rather than reading the ranges.

### 4. Resolve Anchors

1. Resolve every `[…](file#anchor)` within the planning folder against the target file's actual headings; record each that does not resolve as `anchor-resolves`. Resolve the whole folder, not the files this run edited — removing a heading or renaming a designator invalidates links from anywhere.

### 5. Fix and Report

1. Fix each violation in place: replace restatement with a link to the canonical home, delete null sections and recap tables, collapse all-pass tables to one line, condense over-budget prose, move a code reference's link onto the name it belongs to, relabel and reorder a finding's fields, restore a heading an anchor points at, and derive an absent or wrong severity through the map. Preserve any content the user explicitly requested (requested detail is exempt, per [omit-null-sections](./TECHNIQUE.md#omit-null-sections)).
2. Compose `{artifact_conformance}`: its `violations` array lists every detected violation with its fix status; its `conforms` verdict is true iff the list is empty after fixes. Report exceptions only — a fully conformant folder is the one-line result, not a per-file table.
