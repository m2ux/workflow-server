const fs = require('fs');

// 1. Fix 12-workflow-orchestrator.toon
let wo = fs.readFileSync('.engineering/workflows/meta/skills/12-workflow-orchestrator.toon', 'utf8');

// Fix dispatch-activity next_activity params
wo = wo.replace(
  '"Call next_activity to load the activity definition"', 
  '"Call next_activity({ session_token, activity_id, step_manifest, transition_condition }) to load the activity definition"'
);

// Fix duplicate end-workflow block
wo = wo.replace(/  end-workflow\[2\]:\n    - "When all transitions evaluate and no next activity remains, compile a final summary including completion dates, outcomes, key decisions, artifacts, and follow-ups\."\n    - "Yield workflow_complete to your parent orchestrator, including the final variable state and the summary\."\n  session-protocol/g, '  session-protocol');

// Fix duplicate start_session in tools
wo = wo.replace(/  start_session:\n    when: "Bootstrapping or resuming"\n  get_resource:\n    when: "After get_skills"\n  start_session:\n    when: "Bootstrapping or resuming"/g, '  get_resource:\n    when: "After get_skills"\n  start_session:\n    when: "Bootstrapping or resuming"');

fs.writeFileSync('.engineering/workflows/meta/skills/12-workflow-orchestrator.toon', wo);

// 2. Fix 11-activity-worker.toon
let aw = fs.readFileSync('.engineering/workflows/meta/skills/11-activity-worker.toon', 'utf8');
aw = aw.replace(
  'Call resume_checkpoint({ session_token: checkpoint_handle })',
  'Call resume_checkpoint({ session_token }) passing the checkpoint_handle as the session_token'
);
fs.writeFileSync('.engineering/workflows/meta/skills/11-activity-worker.toon', aw);

