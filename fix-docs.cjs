const fs = require('fs');

let doc = fs.readFileSync('docs/api-reference.md', 'utf8');

doc = doc.replace(
  '| `get_skill` | `session_token`, `step_id?` | Skill definition object | Load the skill for a specific step within the current activity. If `step_id` is omitted, loads the primary skill for the activity. Requires `next_activity` to have been called first |',
  '| `get_skill` | `session_token`, `step_id?` | Skill definition object | Load the skill for the workflow or current activity. If called before `next_activity` (no active activity), loads the workflow primary skill. If called during an activity without `step_id`, loads the activity primary skill. If `step_id` is provided, loads the skill for that step. |'
);

fs.writeFileSync('docs/api-reference.md', doc);
