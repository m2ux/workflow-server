# Board

The theme or proposals board, its membership and each item's status.

## Operations

### Select Project Board

The theme or proposals board the request names.

#### 1. Find Requested Board

Run [Find Theme Board](#find-theme-board "ƒ") for the theme in [Board Selection](#board-selection) under [Board Owner](#board-owner), or Run [Find Proposals Board](#find-proposals-board "ƒ") when that selection names proposals. The selection must meet [Themes](#themes) or [Proposals](#proposals).

#### 2. Provide Missing Selection

Provide a missing-selection result when neither a theme nor proposals is specified; the caller obtains that choice.

#### 3. Provide Selected Board

Provide the [selected board](#selected-board) number, or an absent-board result for the caller’s creation path. Work one board at a time.

### Create Proposals Board

A new proposals board linked to the supplied repository.

#### 1. Find Proposals Template

Run [Find Board Template](#find-board-template "ƒ") under [Board Owner](#board-owner) with the exact [proposals-template title](../configuration.md#proposals-board).

#### 2. Select Template Source

Use the provided number as the copy source.

#### 3. Copy Proposals Template

Run [Copy Board Template](#copy-board-template "ƒ") with that template number, the owner and the [proposals title](../configuration.md#proposals-board).

#### 4. Retain New Board Number

Retain the new board number. The copy must meet [Proposals](#proposals).

#### 5. Link Copied Board

Run [Link Board to Repository](#link-board-to-repository "ƒ") with the owner, new board number and [repository](#repository).

#### 6. Provide Linked Board

Provide the [Copied Board](#copied-board) after linking succeeds.

### Place Issue on Board

One issue's membership and initial status.

#### 1. Read Status Options

Run [Fetch Board Fields](#fetch-board-fields "ƒ") for the Status options at [Board Coordinates](#board-coordinates), using the supplied issue identity.

#### 2. Add Supplied Issue

Run [Add Issue to Board](#add-issue-to-board "ƒ") with the [issue id](#issue-id).

#### 3. Set Initial Status

Run [Set Item Status](#set-item-status "ƒ") with [Initial Status](#initial-status) and the matching field and option ids.

#### 4. Read Saved Item

Run [Fetch Board Item](#fetch-board-item "ƒ") for the saved item.

#### 5. Provide Place Issue on Board

Provide [Board Configuration](#board-configuration) with the confirmed saved item and Status options.

### Read Board State

The selected board's items and status fields.

#### 1. Locate Board Status Field

Run [Find Status Field](#find-status-field "ƒ") for [Board Coordinates](#board-coordinates).

#### 2. Fetch Complete Board Items

Run [Fetch Board Items with Status](#fetch-board-items-with-status "ƒ"), passing that field id and board number.

#### 3. Provide Board State

Provide [Board State](#board-state) with the items, Status field, item ids and the board’s [Repositories](#repositories).

### Read Board Configuration

One board's field definitions and requested item state.

#### 1. Read Board Fields

Run [Fetch Board Fields](#fetch-board-fields "ƒ") for [Board Coordinates](#board-coordinates), saving the records at [Output Files](#output-files).

#### 2. Read Requested Item

When [Optional Item](#optional-item) requests a single item for write confirmation, Run [Fetch Board Item](#fetch-board-item "ƒ"). A list snapshot may lag a write.

#### 3. Provide Current Configuration

Provide [Board Configuration](#board-configuration) with the field definitions and requested current item.

## Commands

### Find Board Template

Print the number of the open board with the supplied exact template title and provide [Template Selection](#template-selection "●") to the requester.

<big><pre>
gh api &#92;
  --paginate "users/[**&lt;owner&gt;**](#board-owner "○")/projectsV2?per_page=100" &#92;
  --jq '.&#91;&#93; | select(.closed | not) | select(.title == "[**&lt;template-title&gt;**](#template-selection "○")") | .number'
</pre></big>

### Copy Board Template

Copy the supplied template into a new open board with the supplied title, print its number, and provide [Copied Board](#copied-board "●") to the requester.

The copy's JSON is one project; `.number` identifies the new board.

<big><pre>
gh project copy [**&lt;template-number&gt;**](#template-selection "○") &#92;
  --source-owner [**&lt;owner&gt;**](#board-owner "○") &#92;
  --target-owner [**&lt;owner&gt;**](#board-owner "○") &#92;
  --title '[**&lt;board-title&gt;**](#copy-title "○")' &#92;
  --format json &#92;
  --jq .number
</pre></big>

### Link Board to Repository

Link one board to the supplied repository and provide [Link Result](#link-result "●") to the requester.

<big><pre>
gh project link [**&lt;board-number&gt;**](#board-coordinates "○") --owner [**&lt;owner&gt;**](#board-owner "○") --repo [**&lt;repo&gt;**](#repository "○")
</pre></big>

### Find Proposals Board

Print the number of the open [proposals board](../configuration.md#proposals-board) and provide [Selected Board](#selected-board "●") to the requester.

<big><pre>
gh api &#92;
  --paginate "users/[**&lt;owner&gt;**](#board-owner "○")/projectsV2?per_page=100" &#92;
  --jq '.&#91;&#93; | select(.closed | not) | select(.title == "Proposals") | .number'
</pre></big>

### Add Issue to Board

Add the caller-supplied issue to a board, print the new item's id, and provide [Membership Result](#membership-result "●") to the requester.

<big><pre>
gh api --method POST users/[**&lt;owner&gt;**](#board-owner "○")/projectsV2/[**&lt;board-number&gt;**](#board-coordinates "○")/items -f type=Issue -F id=[**&lt;issue-id&gt;**](#issue-id "○") --jq .id
</pre></big>

### Set Item Status

Set one board item's Status and provide [Membership Result](#membership-result "●") to the requester.

<big><pre>
gh api &#92;
  --method PATCH users/[**&lt;owner&gt;**](#board-owner "○")/projectsV2/[**&lt;board-number&gt;**](#board-coordinates "○")/items/[**&lt;item-id&gt;**](#item-coordinates "○") &#92;
  --input '[**&lt;status-input-file&gt;**](#status-input-file "○")' &#92;
  --jq .id
</pre></big>

### Remove Board Item

Remove one item from a board and provide [Membership Result](#membership-result "●") to the requester. Leave its issue as it stands.

<big><pre>
gh api --method DELETE users/[**&lt;owner&gt;**](#board-owner "○")/projectsV2/[**&lt;board-number&gt;**](#board-coordinates "○")/items/[**&lt;item-id&gt;**](#item-coordinates "○")
</pre></big>

### Fetch Board Fields

Save a board's fields and provide [Board Configuration](#board-configuration "●") to the requester.

<big><pre>
gh api --paginate "users/[**&lt;owner&gt;**](#board-owner "○")/projectsV2/[**&lt;board-number&gt;**](#board-coordinates "○")/fields?per_page=100" &gt; '[**&lt;board-fields-file&gt;**](#board-fields-file "○")'
</pre></big>

### Find Theme Board

Print the number of the open board matching the theme name after any proposal designator and provide [Selected Board](#selected-board "●") to the requester.

<big><pre>
gh api &#92;
  --paginate "users/[**&lt;owner&gt;**](#board-owner "○")/projectsV2?per_page=100" &#92;
  --jq '.&#91;&#93; | select(.closed | not) | select(.title | sub("^\\&#91;P&#91;0-9&#93;+\\&#93; "; "") | startswith("[**&lt;theme-name&gt;**](#theme-name "○"): ")) | .number'
</pre></big>

### Find Status Field

Print the id of a board's Status field and provide [Status Field](#status-field "●") to the requester.

<big><pre>
gh api &#92;
  --paginate "users/[**&lt;owner&gt;**](#board-owner "○")/projectsV2/[**&lt;board-number&gt;**](#board-coordinates "○")/fields?per_page=100" &#92;
  --jq '.&#91;&#93; | select(.name == "Status") | .id'
</pre></big>

### Fetch Board Items with Status

Save a board's items with their Status and complete issues and provide [Board State](#board-state "●") to the requester.

<big><pre>
gh api &#92;
  --paginate "users/[**&lt;owner&gt;**](#board-owner "○")/projectsV2/[**&lt;board-number&gt;**](#board-coordinates "○")/items?per_page=100&fields=[**&lt;status-field-id&gt;**](#status-field "○")" &#92;
  &gt; '[**&lt;board-items-file&gt;**](#board-items-file "○")'
</pre></big>

### Fetch Board Item

Read one board item with its current Status and provide [Board Configuration](#board-configuration "●") to the requester.

<big><pre>
gh api "users/[**&lt;owner&gt;**](#board-owner "○")/projectsV2/[**&lt;board-number&gt;**](#board-coordinates "○")/items/[**&lt;item-id&gt;**](#item-coordinates "○")?fields=[**&lt;status-field-id&gt;**](#status-field "○")"
</pre></big>

### Find User

Print the authenticated `gh` login and provide [Assignee Login](#assignee-login "●") to the requester. This user is assigned to work from Ready on.

Require [Authenticated Access](#authenticated-access "○") before executing the command.

<big><pre>
gh api user --jq .login
</pre></big>

## Fields

### Themes

The project's named themes and their board associations. Each initiative has exactly one theme, and each theme has one project board. An initiative carries one `theme:*` label, and each of its epics carries the same one.

Project examples are in [Themes](../configuration.md#themes).

### Theme Board Title

A proposal-derived board title is the originating proposal's exact `[Pxx]` designator, a space, the theme name, a colon, and its description: `[P03] Canon: Definitions Checked Against the Design Canon`. Preserve the proposal's digits exactly. A board with no originating proposal uses `Name: Description`.

### Repositories

A board's repositories are those its items' issues live in, read from each item's issue, deduplicated and ordered with the board's own repository first. An item whose issue is unreadable leaves the list incomplete, which is reported rather than filled by assumption.

### Board Owner

The supplied board owner.

### Board Selection

Either the supplied theme name or the proposals-board selection.

### Board Coordinates

The supplied existing board owner and number. eg `owner: m2ux`, `board-number: 13`

### Repository

The supplied repository name for the board link.

### Theme Provenance

The supplied theme title and originating proposal record when applicable.

### Selected Kind

The supplied selected board kind, with its theme title and proposal record when applicable.

### Template Selection

The supplied exact board-template title and its provided template number. The number is absent until the lookup succeeds.

### Copy Title

The supplied title for the copied board.

### Selected Board

The selected board number, an absent-board result or a missing-selection result.

### Copied Board

The new board owner and number. The number is absent until the copy succeeds.

### Issue Id

The supplied numeric issue id; it is distinct from the issue number. eg `3040123456`

### Initial Status

The initial Status selected by the caller.

### Item Coordinates

The supplied board item id and board coordinates. eg `board: users/m2ux/projectsV2/13`, `item-id: 1001`

### Status Field

The supplied Status field id and its option ids. eg `field-id: 419167630`, `option-id: OPTION`

### Status Input File

The local input file containing the selected Status field id as a JSON integer and option id as a JSON string, from the fetched board fields. eg `status-backlog.json`, `{"fields": [{"id": 419167630, "value": "OPTION"}]}`

### Output Files

The supplied local destinations for board-field or item snapshots.

### Board State

The provided items with their complete issues and Status, field and item ids, and repositories, retaining unreadable-issue findings.

### Board Configuration

The provided board-field definitions and requested current item state.

### Authenticated Access

The authenticated repository access supplied for the operation.

### Assignee Login

The authenticated login available for issue assignments.

### Membership Result

The added or removed board item id, or the saved Status provided for the item.

### Optional Item

The optional board item identity requested for write confirmation.

### Link Result

The repository link operation result for the supplied board.

### Board Fields File

The supplied local output path for the complete board-field definitions. eg `fields.json`

### Board Items File

The supplied local output path for the board items with Status and their complete issues. eg `items.json`

### Theme Name

The supplied theme name, excluding any originating proposal designator. eg `Canon`

## Guidance

### Assignees

An issue at Ready, In Progress, In Review or Done is assigned to the user; one in Backlog has no assignee. An assignee is set on the issue, not on the board item, so the call that changes one acts on the issue.

### Proposals

- The [configured board](../configuration.md#proposals-board) holds proposal issues, the incoming funnel for work that may become an initiative.
- **Suggested.**
  Raised, and nobody has taken it up. A new proposal lands here, with no assignee.
- **Considering.**
  Someone is weighing the goal, the evidence and the criteria. That person is the assignee.
- **Approved.**
  Qualified to become an initiative. The assignee is the user.
- **Held.**
  Not now. It stays on the board, with no assignee.
- **Declined.**
  It will not become an initiative. It has no assignee.

### Standalone Issues

A standalone issue sits on no board.
