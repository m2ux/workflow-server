# Board

How a mode chooses a theme board and reads it.

## Select

- The board is a theme's board, per [Themes and Boards](../SKILL.md#themes-and-boards). Run [Find Theme Board](commands.md#find-theme-board) for the theme the user names.
- When the request names none, ask which theme as an [Interview](interview.md).
- One board at a time.

## Read

- [Find Status Field](commands.md#find-status-field), then [Fetch Board Items with Status](commands.md#fetch-board-items-with-status).
- [Fetch All Initiative Pull Requests](commands.md#fetch-all-initiative-pull-requests) for the board's repository, appending each further repository the board's issues live in.
