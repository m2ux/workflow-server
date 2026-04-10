const fs = require('fs');
let code = fs.readFileSync('/home/mike/projects/dev/workflow-server/tests/mcp-server.test.ts', 'utf8');

// The file utils strip off the 01- or 12- prefix entirely and the id is just the word parts
code = code.replace(/12-workflow-orchestrator/g, 'workflow-orchestrator');
code = code.replace(/10-meta-orchestrator/g, 'meta-orchestrator');

fs.writeFileSync('/home/mike/projects/dev/workflow-server/tests/mcp-server.test.ts', code);
