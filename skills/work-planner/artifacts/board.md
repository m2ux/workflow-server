# Board

The theme or proposals board, its membership and each item's status.

## Operations

### *Select* Project Board

The theme or proposals board the request names.

**Inputs:** Board owner and either a theme name or the proposals-board selection.

1. Run [Find Theme Board](#find-theme-board) for the named theme, or [Find Proposals Board](#find-proposals-board) when the request names proposals. The selection meets [Themes](#themes) or [Proposals](#proposals).
2. Return a missing-selection result when neither a theme nor proposals is specified; the caller obtains that choice.
3. Return the selected board number, or an absent-board result for [Copy Project Board](#copy-project-board). Work one board at a time.

### *Copy* Project Board

A missing theme board, or a missing proposals board.

**Inputs:** Board owner, repository, selected board kind, theme title and originating proposal record when applicable.

1. When no open board is titled `Proposals`, run [Create Proposals Board](#create-proposals-board). The copy source and the title meet [Proposals](#proposals).
2. When the selected theme board is absent:
   - Run [Create Theme Board](#create-theme-board) with the owner, repository, theme title and originating proposal record when applicable.
   - Require the new theme's label and board before an initiative takes that theme.

### *Create* Proposals Board

A new proposals board linked to the supplied repository.

**Inputs:** Board owner and repository.

1. Run [Find Board Template](#find-board-template) with the owner and the exact title `Proposals Template`.
2. Use the returned number as the copy source.
3. Run [Copy Board Template](#copy-board-template) with that template number, the owner and the title `Proposals`.
4. Retain the new board number. The copy meets [Proposals](#proposals).
5. Run [Link Board to Repository](#link-board-to-repository) with the owner, new board number and repository.
6. Return the new board number after linking succeeds.

### *Create* Theme Board

A new theme board linked to the supplied repository.

**Inputs:** Board owner, repository, theme title and originating proposal record when applicable.

1. Require the originating proposal record for a proposal-derived board; return a missing-input finding when its designator is unavailable.
2. Run [Find Board Template](#find-board-template) with the owner and the exact title `Initiative Template`.
3. Use the returned number as the copy source.
4. Run [Copy Board Template](#copy-board-template) with that template number, the owner and the title required by [One Board Per Theme](#one-board-per-theme).
5. Retain the new board number. The copy carries the template's Status options: Backlog, Ready, In Progress, In Review and Done.
6. Run [Link Board to Repository](#link-board-to-repository) with the owner, new board number and repository.
7. Return the new board number after linking succeeds.

### *Place* Issue on Board

One issue's membership and initial status.

**Inputs:** Board owner and number, issue id and selected initial status.

1. Run [Fetch Board Fields](#fetch-board-fields) for the Status options, using the caller's supplied board and issue identities.
2. Run [Add Issue to Board](#add-issue-to-board) with the issue id.
3. Run [Set Item Status](#set-item-status) with the caller's selected status and the matching field and option ids.
4. Run [Fetch Board Item](#fetch-board-item) for the saved item.

### *Read* Board State

The selected board's items and status fields.

**Inputs:** Existing board owner and number, as [Select Project Board](#select-project-board) or [Copy Project Board](#copy-project-board) returns them, whether the caller ran that operation or carries its result.

1. Run [Find Status Field](#find-status-field) for the board number.
2. Run [Fetch Board Items with Status](#fetch-board-items-with-status), passing that field id and board number.
3. Return the items, Status field, item ids and the board's [Repositories](#repositories) to the caller.

### *Read* Board Assignee

The authenticated login available for board assignments.

**Inputs:** Authenticated repository access.

1. Run [Find User](#find-user).
2. Return its login for the caller's assignment decisions.

### *Read* Board Configuration

One board's field definitions and requested item state.

**Inputs:** Board owner and number, output paths and optional item identity.

1. Run [Fetch Board Fields](#fetch-board-fields) for the supplied board.
2. When a single item is requested for write confirmation, run [Fetch Board Item](#fetch-board-item). A list snapshot may lag a write.
3. Return the field definitions and requested current item.

### *Locate* Project Board

The board identity matching a supplied purpose or theme.

**Inputs:** Owner and proposals-board purpose or theme title.

1. Run [Find Proposals Board](#find-proposals-board) for proposals, or [Find Theme Board](#find-theme-board) for a theme.
2. Return the identity or an absent-board finding for the caller's selection or creation path.

## Fields

### Themes

Every initiative belongs to one theme, and each theme has one project board. Each project names its own themes.

- **Example.**  workflow-server's themes.

| Theme | Label | Description |
| --- | --- | --- |
| Canon | `theme:canon` | Definitions Checked Against the Design Canon |
| Language | `theme:language` | The Definition Language and Its Rules |
| Mechanical | `theme:mechanical` | The Engine That Runs Definitions |
| Delivery | `theme:delivery` | What Reaches Agents and Hosts |

### One Theme

An initiative carries one `theme:*` label, and each of its epics carries the same one.

### One Board Per Theme

- A proposal-derived board title is the originating proposal's exact `[Pxx]` designator, a space, the theme name, a colon, and its description: `[P03] Canon: Definitions Checked Against the Design Canon`. Preserve the proposal's digits exactly. A board with no originating proposal uses `Name: Description`.
- It is linked to the repository.
- It holds the theme's initiatives, their epics and their task issues.

### Repositories

A board's repositories are those its items' issues live in, read from each item's issue, deduplicated and ordered with the board's own repository first. An item whose issue is unreadable leaves the list incomplete, which is reported rather than filled by assumption.

### Assignees

An issue at Ready, In Progress, In Review or Done is assigned to the user; one in Backlog has no assignee. An assignee is set on the issue, not on the board item, so the call that changes one acts on the issue.

### Standalone Issues

A standalone issue sits on no board.

### Proposals

- The board is titled `Proposals`. It holds proposal issues, the incoming funnel for work that may become an initiative.
- Its copy source is the open board titled `Proposals Template`. That template carries Priority: High, Medium and Low, and its view is a board grouped by Status.
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

## Commands

### Find Board Template

Prints the number of the open board with the supplied exact template title.

**Inputs:** Board owner and template title.

```bash
gh api --paginate "users/<owner>/projectsV2?per_page=100" --jq '.[] | select(.closed | not) | select(.title == "<template-title>") | .number'
```

### Copy Board Template

Copies the supplied template into a new open board with the supplied title and prints its number.

**Inputs:** Board owner, template board number and new board title.

- The copy's JSON is one project; `.number` identifies the new board.

```bash
gh project copy '<template-number>' --source-owner '<owner>' --target-owner '<owner>' --title '<board-title>' --format json --jq .number
```

### Link Board to Repository

Links one board to the supplied repository.

**Inputs:** Board owner, board number and repository.

```bash
gh project link '<board-number>' --owner '<owner>' --repo '<repo>'
```

### Find Proposals Board

Prints the number of the open board titled `Proposals`.

**Inputs:** Board owner.

```bash
gh api --paginate "users/<owner>/projectsV2?per_page=100" --jq '.[] | select(.closed | not) | select(.title == "Proposals") | .number'
```

### Add Issue to Board

Adds the caller-supplied issue id to a board and prints the new item's id. The input is the issue id, not its number.

**Inputs:** Board owner and number, and issue id.

```bash
gh api --method POST 'users/<owner>/projectsV2/<board-number>/items' -f type=Issue -F 'id=<issue-id>' --jq .id
```

**Example:**

```bash
gh api --method POST 'users/<owner>/projectsV2/13/items' -f type=Issue -F id=3040123456 --jq .id
```

### Set Item Status

Sets one board item's Status.

**Inputs:** Board owner and number, item id, and input file containing the Status field id and selected option id.

The input body names the Status field id and option id from [Fetch Board Fields](#fetch-board-fields): `{"fields":[{"id":<status-field-id>,"value":"<status-option-id>"}]}`. Substitute the field id as a JSON integer and the option id as a JSON string.

**Example payload:** `{"fields":[{"id":419167630,"value":"OPTION"}]}`.

```bash
gh api --method PATCH 'users/<owner>/projectsV2/<board-number>/items/<item-id>' --input '<status-input-file>' --jq .id
```

**Example:**

```bash
gh api --method PATCH 'users/<owner>/projectsV2/13/items/1001' --input status-backlog.json --jq .id
```

### Fetch Board Fields

Saves a board's fields.

**Inputs:** Board owner, board number and destination file.

```bash
gh api --paginate "users/<owner>/projectsV2/<board-number>/fields?per_page=100" > '<board-fields-file>'
```

**Example:**

```bash
gh api --paginate "users/<owner>/projectsV2/9/fields?per_page=100" > fields.json
```

### Find Theme Board

Prints the number of the open board for one theme, by its theme name after any proposal designator.

**Inputs:** Board owner and theme name.

```bash
gh api --paginate "users/<owner>/projectsV2?per_page=100" --jq '.[] | select(.closed | not) | select(.title | sub("^\\[P[0-9]+\\] "; "") | startswith("<theme-name>: ")) | .number'
```

**Example:**

```bash
gh api --paginate "users/<owner>/projectsV2?per_page=100" --jq '.[] | select(.closed | not) | select(.title | sub("^\\[P[0-9]+\\] "; "") | startswith("Canon: ")) | .number'
```

### Find Status Field

Prints the id of a board's Status field.

**Inputs:** Board owner and number.

```bash
gh api --paginate "users/<owner>/projectsV2/<board-number>/fields?per_page=100" --jq '.[] | select(.name == "Status") | .id'
```

**Example:**

```bash
gh api --paginate "users/<owner>/projectsV2/9/fields?per_page=100" --jq '.[] | select(.name == "Status") | .id'
```

### Fetch Board Items with Status

Saves a board's items with their Status, each carrying its issue whole.

**Inputs:** Board owner and number, Status field id and destination file.

```bash
gh api --paginate "users/<owner>/projectsV2/<board-number>/items?per_page=100&fields=<status-field-id>" > '<board-items-file>'
```

**Example:**

```bash
gh api --paginate "users/<owner>/projectsV2/9/items?per_page=100&fields=419167630" > items.json
```

### Fetch Board Item

Reads one board item, including its current Status.

**Inputs:** Board owner and number, item id and Status field id.

```bash
gh api "users/<owner>/projectsV2/<board-number>/items/<item-id>?fields=<status-field-id>"
```

**Example:**

```bash
gh api "users/<owner>/projectsV2/9/items/1001?fields=419167630"
```

### Find User

Prints the login `gh` runs as, the user assigned to work from Ready on.

**Inputs:** Authenticated repository access.

```bash
gh api user --jq .login
```
