const fs = require('fs');
let code = fs.readFileSync('/home/mike/projects/dev/workflow-server/tests/mcp-server.test.ts', 'utf8');

// I replaced 12-workflow-orchestrator with workflow-orchestrator in the tests. 
// But the get_skill output for work-package/workflow.toon is actually giving the ID of the file. 
// parseSkillFilename returns { index: '12', id: 'workflow-orchestrator' } so the id IS 'workflow-orchestrator'!
// But why is it failing?
