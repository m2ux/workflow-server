const fs = require('fs');
let code = fs.readFileSync('.engineering/workflows/meta/resources/01-meta-orchestrator-guide.md', 'utf8');

const sectionIndex = code.indexOf('## 4. Dispatching a Client Workflow');
if (sectionIndex !== -1) {
  code = code.substring(0, sectionIndex);
  fs.writeFileSync('.engineering/workflows/meta/resources/01-meta-orchestrator-guide.md', code);
}
