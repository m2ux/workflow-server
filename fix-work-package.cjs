const fs = require('fs');

const path = 'workflows/work-package/workflow.toon';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('skills:\n  primary: 12-workflow-orchestrator')) {
  // It got stripped!
  content = content.replace(
    'artifactLocations:',
    'skills:\n  primary: 12-workflow-orchestrator\nartifactLocations:'
  );
  fs.writeFileSync(path, content);
}
