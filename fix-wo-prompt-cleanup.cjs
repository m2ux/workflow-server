const fs = require('fs');
let code = fs.readFileSync('.engineering/workflows/meta/resources/05-workflow-orchestrator-prompt.md', 'utf8');

const sectionIndex = code.indexOf('## Rules');
if (sectionIndex !== -1) {
  code = code.substring(0, sectionIndex);
  fs.writeFileSync('.engineering/workflows/meta/resources/05-workflow-orchestrator-prompt.md', code);
}
