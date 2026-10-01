# Fires-on rule and hook declaration

Corpus `i09/workflows` at `7fae6cb3`. Skill `i09/workspace` at `e50ec767`.

## Fires-on rule

The [Fires-on line](https://github.com/m2ux/workflow-server/blob/7fae6cb3739b6b03e0bae781b25a9971539f2162/corpus/canon/resources/anti-patterns.md#L31-L42) Creation Rule states the line form and the id sources. One line sits directly under the unit title, blank line on each side: `**Fires on:**`, then comma-separated code spans. An id is an authored kind (`workflow`, `activity`, `technique`, `routine`), a path under one (an array named without `[]`, `[]` stepping into an element field), `resource`, `readme`, or `*` standing alone. A family heading and a Creation Rule carry none.

[Design principles](https://github.com/m2ux/workflow-server/blob/7fae6cb3739b6b03e0bae781b25a9971539f2162/corpus/canon/resources/design-principles.md#L11) and [convention conformance](https://github.com/m2ux/workflow-server/blob/7fae6cb3739b6b03e0bae781b25a9971539f2162/corpus/canon/resources/convention-conformance.md#L10) cite that rule. Neither restates the id sources.

## Hook declaration

The [guidelines](https://github.com/m2ux/workflow-server/blob/e50ec76770ec62f520cca198ccb094750cd5151f/skills/guidelines.md#L8-L13) admit `hooks` and state when a skill declares one: a check it owns must run at every tool call that could break it. The command runs a script in the skill's own scripts folder. Claude Code registers it for the session. Cursor ignores the field.

[workflow-canon](https://github.com/m2ux/workflow-server/blob/e50ec76770ec62f520cca198ccb094750cd5151f/skills/workflow-canon/SKILL.md#L4-L9) declares a PostToolUse hook for `Edit|Write|MultiEdit`, running `edit_guard.py`. Its [Dependencies](https://github.com/m2ux/workflow-server/blob/e50ec76770ec62f520cca198ccb094750cd5151f/skills/workflow-canon/SKILL.md#L67-L78) name git, Node and npm, Python 3.10+, the workspace's `.project/main`, the corpus tree's `origin/workflows` and `origin/iNN/workflows` refs, and Claude Code hooks.
