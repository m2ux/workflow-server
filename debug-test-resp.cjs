const fs = require('fs');
let code = fs.readFileSync('tests/mcp-server.test.ts', 'utf8');

code = code.replace(
  "      expect(response.id).toBe('workflow-orchestrator');",
  "      console.log('RESPONSE:', response);\n      expect(response.skill.id).toBe('workflow-orchestrator');"
);

fs.writeFileSync('tests/mcp-server.test.ts', code);
