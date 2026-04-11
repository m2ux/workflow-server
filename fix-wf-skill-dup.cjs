const fs = require('fs');
let code = fs.readFileSync('.engineering/workflows/meta/skills/12-workflow-orchestrator.toon', 'utf8');

// There are duplicate sections in the protocol! 
//   end-workflow[2]: ...
// appears twice.
//   start_session:
//     when: "Bootstrapping or resuming"
// appears twice in tools.

code = code.replace(/  end-workflow\[2\]:\n    - "When all transitions evaluate and no next activity remains, compile a final summary including completion dates, outcomes, key decisions, artifacts, and follow-ups\."\n    - "Yield workflow_complete to your parent orchestrator, including the final variable state and the summary\."\n/g, "");

// Add it back exactly once
code = code.replace(/  session-protocol\[1\]:/, '  end-workflow[2]:\n    - "When all transitions evaluate and no next activity remains, compile a final summary including completion dates, outcomes, key decisions, artifacts, and follow-ups."\n    - "Yield workflow_complete to your parent orchestrator, including the final variable state and the summary."\n  session-protocol[1]:');

// Fix duplicate start_session
code = code.replace(/  start_session:\n    when: "Bootstrapping or resuming"\n/g, "");
code = code.replace(/  get_resource:\n    when: "After get_skills"\n/, '  start_session:\n    when: "Bootstrapping or resuming"\n  get_resource:\n    when: "After get_skills"\n');

fs.writeFileSync('.engineering/workflows/meta/skills/12-workflow-orchestrator.toon', code);
