const fs = require('fs');

const path = 'workflows/meta/skills/12-workflow-orchestrator.toon';
let content = fs.readFileSync(path, 'utf8');
content = content.replace("inputs[3]:\n  - id: workflow-id\n    description: \"Workflow to orchestrate (e.g., 'work-package')\"\n  - id: user-request\n    description: \"The user's initial request, used to detect mode and extract target\"\n  - id: target-path\n    description: \"Path to the target directory for all git operations\"",
  "inputs[3]:\n  - id: workflow-id\n    description: \"Workflow to orchestrate (e.g., 'work-package')\"\n    required: true\n  - id: user-request\n    description: \"The user's initial request, used to detect mode and extract target\"\n    required: true\n  - id: target-path\n    description: \"Path to the target directory for all git operations\"\n    required: true"
);

fs.writeFileSync(path, content);
