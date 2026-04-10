const fs = require('fs');
let content = fs.readFileSync('/home/mike/projects/dev/workflow-server/.engineering/workflows/meta/workflow.toon', 'utf8');
content = content.replace('skills:\n  primary: 10-meta-orchestrator', 'skills:\n  primary: meta-orchestrator');
fs.writeFileSync('/home/mike/projects/dev/workflow-server/.engineering/workflows/meta/workflow.toon', content);
