const fs = require('fs');
let code = fs.readFileSync('tests/mcp-server.test.ts', 'utf8');

code = code.replace(
  "      console.log('RESPONSE:', response);\n      expect(response.skill.id).toBe('workflow-orchestrator');",
  "      expect(response.skill.id).toBe('workflow-orchestrator');"
);

// We need to fix the other tests that expect response.id rather than response.skill.id!
code = code.replace(/expect\(response\.id\)\.toBe/g, 'expect(response.skill.id).toBe');

fs.writeFileSync('tests/mcp-server.test.ts', code);
