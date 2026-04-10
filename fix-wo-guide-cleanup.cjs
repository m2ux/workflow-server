const fs = require('fs');
let code = fs.readFileSync('.engineering/workflows/meta/resources/03-workflow-orchestrator-guide.md', 'utf8');

const sectionIndex = code.indexOf('## 9. Activity Worker Prompt Template');
if (sectionIndex !== -1) {
  code = code.substring(0, sectionIndex);
  fs.writeFileSync('.engineering/workflows/meta/resources/03-workflow-orchestrator-guide.md', code);
}
