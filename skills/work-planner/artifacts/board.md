# Board

The theme or proposals board, its membership and each item's status.

## Prerequisites

Read these files first.

- For proposals-board selection or creation, read [Proposals Board Configuration](../configuration.md#proposals-board).
- For theme-board creation, read [Theme Board Configuration](../configuration.md#theme-boards).

## Operations

### Select Project Board

The theme or proposals board the request names.

**Inputs:** [Board Owner](#board-owner), [Board Selection](#board-selection).

**Outputs:** [Selected Board](#selected-board).

#### 1. Find Requested Board

Apply [Find Theme Board](#find-theme-board) for the named theme, or Apply [Find Proposals Board](#find-proposals-board) when the request names proposals. The selection meets [Themes](#themes) or [Proposals](#proposals).

#### 2. Return Missing Selection

Return a missing-selection result when neither a theme nor proposals is specified; the caller obtains that choice.

#### 3. Return Selected Board

Return the selected board number, or an absent-board result for the caller’s creation path. Work one board at a time.

### Copy Project Board

A missing theme board, or a missing proposals board.

**Inputs:** [Board Owner](#board-owner), [Repository](#repository), [Selected Kind](#selected-kind).

**Outputs:** [Copied Board](#copied-board).

#### 1. Create Absent Proposals Board

When no open board has the [proposals title](../configuration.md#proposals-board), Apply [Create Proposals Board](#create-proposals-board). The copy source and the title meet [Proposals](#proposals).

#### 2. Create Absent Theme Board

- When the selected theme board is absent:
- Apply [Create Theme Board](#create-theme-board) with the owner, repository, theme title and originating proposal record when applicable.
- Require the new theme's label and board before an initiative takes that theme.

### Create Proposals Board

A new proposals board linked to the supplied repository.

**Inputs:** [Board Owner](#board-owner), [Repository](#repository).

**Outputs:** [Copied Board](#copied-board).

#### 1. Find Proposals Template

Apply [Find Board Template](#find-board-template) with the owner and the exact [proposals-template title](../configuration.md#proposals-board).

#### 2. Select Template Source

Use the returned number as the copy source.

#### 3. Copy Proposals Template

Apply [Copy Board Template](#copy-board-template) with that template number, the owner and the [proposals title](../configuration.md#proposals-board).

#### 4. Retain New Board Number

Retain the new board number. The copy meets [Proposals](#proposals).

#### 5. Link Copied Board

Apply [Link Board to Repository](#link-board-to-repository) with the owner, new board number and repository.

#### 6. Return Linked Board

Return the new board number after linking succeeds.

### Create Theme Board

A new theme board linked to the supplied repository.

**Inputs:** [Board Owner](#board-owner), [Repository](#repository), [Theme Provenance](#theme-provenance).

**Outputs:** [Copied Board](#copied-board).

#### 1. Check Theme Provenance

Require the originating proposal record for a proposal-derived board; return a missing-input finding when its designator is unavailable.

#### 2. Find Theme Template

Apply [Find Board Template](#find-board-template) with the owner and the exact [theme-template title](../configuration.md#theme-boards).

#### 3. Select Template Source

Use the returned number as the copy source.

#### 4. Copy Theme Template

Apply [Copy Board Template](#copy-board-template) with that template number, the owner and the title required by [One Board Per Theme](#one-board-per-theme).

#### 5. Retain New Board Number

Retain the new board number. The copy carries the [theme-board fields](../configuration.md#theme-boards).

#### 6. Link Copied Board

Apply [Link Board to Repository](#link-board-to-repository) with the owner, new board number and repository.

#### 7. Return Linked Board

Return the new board number after linking succeeds.

### Place Issue on Board

One issue's membership and initial status.

**Inputs:** [Board Coordinates](#board-coordinates), [Issue Id](#issue-id), [Initial Status](#initial-status).

**Outputs:** [Board Configuration](#board-configuration).

#### 1. Read Status Options

Apply [Fetch Board Fields](#fetch-board-fields) for the Status options, using the caller's supplied board and issue identities.

#### 2. Add Supplied Issue

Apply [Add Issue to Board](#add-issue-to-board) with the issue id.

#### 3. Set Initial Status

Apply [Set Item Status](#set-item-status) with the caller's selected status and the matching field and option ids.

#### 4. Read Saved Item

Apply [Fetch Board Item](#fetch-board-item) for the saved item.

### Read Board State

The selected board's items and status fields.

**Inputs:** [Board Coordinates](#board-coordinates).

**Outputs:** [Board State](#board-state).

#### 1. Locate Board Status Field

Apply [Find Status Field](#find-status-field) for the board number.

#### 2. Fetch Complete Board Items

Apply [Fetch Board Items with Status](#fetch-board-items-with-status), passing that field id and board number.

#### 3. Return Board State

Return the items, Status field, item ids and the board's [Repositories](#repositories) to the caller.

### Read Board Assignee

The authenticated login available for board assignments.

**Inputs:** [Authenticated Access](#authenticated-access).

**Outputs:** [Assignee Login](#assignee-login).

#### 1. Find Authenticated User

Apply [Find User](#find-user).

#### 2. Return Assignment Login

Return its login for the caller's assignment decisions.

### Read Board Configuration

One board's field definitions and requested item state.

**Inputs:** [Board Coordinates](#board-coordinates), [Output Files](#output-files), [Optional Item](#optional-item).

**Outputs:** [Board Configuration](#board-configuration).

#### 1. Read Board Fields

Apply [Fetch Board Fields](#fetch-board-fields) for the supplied board.

#### 2. Read Requested Item

When a single item is requested for write confirmation, Apply [Fetch Board Item](#fetch-board-item). A list snapshot may lag a write.

#### 3. Return Current Configuration

Return the field definitions and requested current item.

### Locate Project Board

The board identity matching a supplied purpose or theme.

**Inputs:** [Board Owner](#board-owner), [Board Selection](#board-selection).

**Outputs:** [Selected Board](#selected-board).

#### 1. Find Requested Purpose

Apply [Find Proposals Board](#find-proposals-board) for proposals, or Apply [Find Theme Board](#find-theme-board) for a theme.

#### 2. Return Matching Board

Return the identity or an absent-board finding for the caller's selection or creation path.

### Find Board Template

Prints the number of the open board with the supplied exact template title.

**Inputs:** [Board Owner](#board-owner), [Template Selection](#template-selection).

**Outputs:** [Template Selection](#template-selection).

#### 1. Find Board Template

Run the following command with the supplied inputs.

<big><pre>
gh api --paginate "users/[**&lt;owner&gt;**](#board-owner)/projectsV2?per_page=100" --jq '.&#91;&#93; | select(.closed | not) | select(.title == "[**&lt;template-title&gt;**](#template-selection)") | .number'
</pre></big>

### Copy Board Template

Copies the supplied template into a new open board with the supplied title and prints its number.

**Inputs:** [Board Owner](#board-owner), [Template Selection](#template-selection), [Copy Title](#copy-title).

**Outputs:** [Copied Board](#copied-board).

#### 1. Copy Board Template

- Run the following command with the supplied inputs.

- The copy's JSON is one project; `.number` identifies the new board.

<big><pre>
gh project copy '[**&lt;template-number&gt;**](#template-selection)' --source-owner '[**&lt;owner&gt;**](#board-owner)' --target-owner '[**&lt;owner&gt;**](#board-owner)' --title '[**&lt;board-title&gt;**](#copy-title)' --format json --jq .number
</pre></big>

### Link Board to Repository

Links one board to the supplied repository.

**Inputs:** [Board Coordinates](#board-coordinates), [Repository](#repository).

**Outputs:** [Link Result](#link-result).

#### 1. Link Board to Repository

Run the following command with the supplied inputs.

<big><pre>
gh project link '[**&lt;board-number&gt;**](#board-coordinates)' --owner '[**&lt;owner&gt;**](#board-owner)' --repo '[**&lt;repo&gt;**](#repository)'
</pre></big>

### Find Proposals Board

Prints the number of the open [proposals board](../configuration.md#proposals-board).

**Inputs:** [Board Owner](#board-owner).

**Outputs:** [Selected Board](#selected-board).

#### 1. Find Proposals Board

Run the following command with the supplied inputs.

<big><pre>
gh api --paginate "users/[**&lt;owner&gt;**](#board-owner)/projectsV2?per_page=100" --jq '.&#91;&#93; | select(.closed | not) | select(.title == "Proposals") | .number'
</pre></big>

### Add Issue to Board

Adds the caller-supplied issue to a board and prints the new item's id.

**Inputs:** [Board Coordinates](#board-coordinates), [Issue Id](#issue-id).

**Outputs:** [Membership Result](#membership-result).

#### 1. Add Issue to Board

Run the following command with the supplied inputs.

<big><pre>
gh api --method POST 'users/[**&lt;owner&gt;**](#board-owner)/projectsV2/[**&lt;board-number&gt;**](#board-coordinates)/items' -f type=Issue -F 'id=[**&lt;issue-id&gt;**](#issue-id)' --jq .id
</pre></big>

**Example:**

<big><pre>
gh api --method POST 'users/[**&lt;owner&gt;**](#board-owner)/projectsV2/13/items' -f type=Issue -F id=3040123456 --jq .id
</pre></big>

### Set Item Status

Sets one board item's Status.

**Inputs:** [Board Coordinates](#board-coordinates), [Item Coordinates](#item-coordinates), [Status Input File](#status-input-file).

**Outputs:** [Membership Result](#membership-result).

#### 1. Set Item Status

- Run the following command with the supplied inputs.

- The input body names the Status field id and option id from the fetched board fields: `{"fields":[{"id":<status-field-id>,"value":"<status-option-id>"}]}`. Substitute the field id as a JSON integer and the option id as a JSON string.

**Example payload:** `{"fields":[{"id":419167630,"value":"OPTION"}]}`.

<big><pre>
gh api --method PATCH 'users/[**&lt;owner&gt;**](#board-owner)/projectsV2/[**&lt;board-number&gt;**](#board-coordinates)/items/[**&lt;item-id&gt;**](#item-coordinates)' --input '[**&lt;status-input-file&gt;**](#status-input-file)' --jq .id
</pre></big>

**Example:**

<big><pre>
gh api --method PATCH 'users/[**&lt;owner&gt;**](#board-owner)/projectsV2/13/items/1001' --input status-backlog.json --jq .id
</pre></big>

### Remove Board Item

Removes one item from a board, leaving its issue as it stands.

**Inputs:** [Board Coordinates](#board-coordinates), [Item Coordinates](#item-coordinates).

**Outputs:** [Membership Result](#membership-result).

#### 1. Remove Board Item

Run the following command with the supplied inputs.

<big><pre>
gh api --method DELETE 'users/[**&lt;owner&gt;**](#board-owner)/projectsV2/[**&lt;board-number&gt;**](#board-coordinates)/items/[**&lt;item-id&gt;**](#item-coordinates)'
</pre></big>

**Example:**

<big><pre>
gh api --method DELETE 'users/[**&lt;owner&gt;**](#board-owner)/projectsV2/9/items/1001'
</pre></big>

### Fetch Board Fields

Saves a board's fields.

**Inputs:** [Board Coordinates](#board-coordinates), [Board Fields File](#board-fields-file).

**Outputs:** [Board Configuration](#board-configuration).

#### 1. Fetch Board Fields

Run the following command with the supplied inputs.

<big><pre>
gh api --paginate "users/[**&lt;owner&gt;**](#board-owner)/projectsV2/[**&lt;board-number&gt;**](#board-coordinates)/fields?per_page=100" > '[**&lt;board-fields-file&gt;**](#board-fields-file)'
</pre></big>

**Example:**

<big><pre>
gh api --paginate "users/[**&lt;owner&gt;**](#board-owner)/projectsV2/9/fields?per_page=100" > fields.json
</pre></big>

### Find Theme Board

Prints the number of the open board for one theme, by its theme name after any proposal designator.

**Inputs:** [Board Owner](#board-owner), [Theme Name](#theme-name).

**Outputs:** [Selected Board](#selected-board).

#### 1. Find Theme Board

Run the following command with the supplied inputs.

<big><pre>
gh api --paginate "users/[**&lt;owner&gt;**](#board-owner)/projectsV2?per_page=100" --jq '.&#91;&#93; | select(.closed | not) | select(.title | sub("^\\&#91;P&#91;0-9&#93;+\\&#93; "; "") | startswith("[**&lt;theme-name&gt;**](#theme-name): ")) | .number'
</pre></big>

**Example:**

<big><pre>
gh api --paginate "users/[**&lt;owner&gt;**](#board-owner)/projectsV2?per_page=100" --jq '.&#91;&#93; | select(.closed | not) | select(.title | sub("^\\&#91;P&#91;0-9&#93;+\\&#93; "; "") | startswith("Canon: ")) | .number'
</pre></big>

### Find Status Field

Prints the id of a board's Status field.

**Inputs:** [Board Coordinates](#board-coordinates).

**Outputs:** [Status Field](#status-field).

#### 1. Find Status Field

Run the following command with the supplied inputs.

<big><pre>
gh api --paginate "users/[**&lt;owner&gt;**](#board-owner)/projectsV2/[**&lt;board-number&gt;**](#board-coordinates)/fields?per_page=100" --jq '.&#91;&#93; | select(.name == "Status") | .id'
</pre></big>

**Example:**

<big><pre>
gh api --paginate "users/[**&lt;owner&gt;**](#board-owner)/projectsV2/9/fields?per_page=100" --jq '.&#91;&#93; | select(.name == "Status") | .id'
</pre></big>

### Fetch Board Items with Status

Saves a board's items with their Status, each carrying its issue whole.

**Inputs:** [Board Coordinates](#board-coordinates), [Status Field](#status-field), [Board Items File](#board-items-file).

**Outputs:** [Board State](#board-state).

#### 1. Fetch Board Items with Status

Run the following command with the supplied inputs.

<big><pre>
gh api --paginate "users/[**&lt;owner&gt;**](#board-owner)/projectsV2/[**&lt;board-number&gt;**](#board-coordinates)/items?per_page=100&fields=[**&lt;status-field-id&gt;**](#status-field)" > '[**&lt;board-items-file&gt;**](#board-items-file)'
</pre></big>

**Example:**

<big><pre>
gh api --paginate "users/[**&lt;owner&gt;**](#board-owner)/projectsV2/9/items?per_page=100&fields=419167630" > items.json
</pre></big>

### Fetch Board Item

Reads one board item, including its current Status.

**Inputs:** [Board Coordinates](#board-coordinates), [Item Coordinates](#item-coordinates), [Status Field](#status-field).

**Outputs:** [Board Configuration](#board-configuration).

#### 1. Fetch Board Item

Run the following command with the supplied inputs.

<big><pre>
gh api "users/[**&lt;owner&gt;**](#board-owner)/projectsV2/[**&lt;board-number&gt;**](#board-coordinates)/items/[**&lt;item-id&gt;**](#item-coordinates)?fields=[**&lt;status-field-id&gt;**](#status-field)"
</pre></big>

**Example:**

<big><pre>
gh api "users/[**&lt;owner&gt;**](#board-owner)/projectsV2/9/items/1001?fields=419167630"
</pre></big>

### Find User

Prints the login `gh` runs as, the user assigned to work from Ready on.

**Inputs:** [Authenticated Access](#authenticated-access).

**Outputs:** [Assignee Login](#assignee-login).

#### 1. Find User

Run the following command with the supplied inputs.

<big><pre>
gh api user --jq .login
</pre></big>

## Fields

### Themes

Every initiative belongs to one theme, and each theme has one project board. Each project names its own themes.

Project examples are in [Themes](../configuration.md#themes).

### One Theme

An initiative carries one `theme:*` label, and each of its epics carries the same one.

### One Board Per Theme

- A proposal-derived board title is the originating proposal's exact `[Pxx]` designator, a space, the theme name, a colon, and its description: `[P03] Canon: Definitions Checked Against the Design Canon`. Preserve the proposal's digits exactly. A board with no originating proposal uses `Name: Description`.
- It is linked to the repository.
- It holds the theme's initiatives, their epics and their task issues, and its hot-fixes.

### Repositories

A board's repositories are those its items' issues live in, read from each item's issue, deduplicated and ordered with the board's own repository first. An item whose issue is unreadable leaves the list incomplete, which is reported rather than filled by assumption.

### Assignees

An issue at Ready, In Progress, In Review or Done is assigned to the user; one in Backlog has no assignee. An assignee is set on the issue, not on the board item, so the call that changes one acts on the issue.

### Standalone Issues

A standalone issue sits on no board.

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

### Board Owner

The supplied board owner.

### Board Selection

Either the supplied theme name or the proposals-board selection.

### Board Coordinates

The supplied existing board owner and number.

### Repository

The supplied repository name for the board link.

### Theme Provenance

The supplied theme title and originating proposal record when applicable.

### Selected Kind

The supplied selected board kind, with its theme title and proposal record when applicable.

### Template Selection

The supplied exact board-template title and its returned template number. The number is absent until the lookup succeeds.

### Copy Title

The supplied title for the copied board.

### Selected Board

The selected board number, an absent-board result or a missing-selection result.

### Copied Board

The new board owner and number. The number is absent until the copy succeeds.

### Issue Id

The supplied numeric issue id; it is distinct from the issue number.

### Initial Status

The initial Status selected by the caller.

### Item Coordinates

The supplied board item id and board coordinates.

### Status Field

The supplied Status field id and its option ids.

### Status Input File

The local input file containing the selected Status field and option ids in the exact JSON payload shown in the executing step.

### Output Files

The supplied local destinations for board-field or item snapshots.

### Board State

The returned items with their complete issues and Status, field and item ids, and repositories, retaining unreadable-issue findings.

### Board Configuration

The returned board-field definitions and requested current item state.

### Authenticated Access

The authenticated repository access supplied for the operation.

### Assignee Login

The authenticated login available for issue assignments.

### Membership Result

The added or removed board item id, or the saved Status returned for the item.

### Optional Item

The optional board item identity requested for write confirmation.

### Link Result

The repository link operation result for the supplied board.

### Board Fields File

The supplied local output path for the complete board-field definitions.

### Board Items File

The supplied local output path for the board items with Status and their complete issues.

### Theme Name

The supplied theme name, excluding any originating proposal designator.
