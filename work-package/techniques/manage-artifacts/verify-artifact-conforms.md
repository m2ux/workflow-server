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

array of `{ file, rule, detail, fixed }` entries — one per detected violation, where `rule` names the rule breached (`single-source-and-link`, `state-once-per-artifact`, `omit-null-sections`, `exception-only-reporting`, `line-budget`, `code-reference-is-an-inline-link`, `finding-layout`, `designator-order`, `severity-value`, or `delivery-class`) and `fixed` records whether the in-place fix was applied.


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
   - a code reference departing from [code-reference-is-an-inline-link](./TECHNIQUE.md#code-reference-is-an-inline-link) breaches that rule, in any of the shapes it names.

### 3. Check Finding Shape

1. For each artifact that states findings, take its report's declared field list and prefix, then apply the criteria in [Finding Layout](../../resources/findings-report.md#finding-layout), [Designators](../../resources/findings-report.md#designators), [Severity](../../resources/findings-report.md#severity) and [Delivery Completeness](../../resources/findings-report.md#delivery-completeness) as each is written. Record a breach of the first as `finding-layout`, of the second as `designator-order`, of the third as `severity-value`, and of the fourth as `delivery-class`.

### 4. Fix in Place

1. Fix each violation where it sits, by the remedy its own rule or section prescribes. Preserve any content the user explicitly requested (requested detail is exempt, per [omit-null-sections](./TECHNIQUE.md#omit-null-sections)).

### 5. Report

1. Compose `{artifact_conformance}`: its `violations` array lists every detected violation with its fix status; its `conforms` verdict is true iff the list is empty after fixes. Report exceptions only — a fully conformant folder is the one-line result, not a per-file table.
