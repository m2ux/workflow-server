const fs = require('fs');

const file = 'workflows/work-package/workflow.toon';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'skills:\n  primary: 12-workflow-orchestrator',
  'skills:\n  primary: workflow-orchestrator'
);

fs.writeFileSync(file, content);
