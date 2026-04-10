const fs = require('fs');
let code = fs.readFileSync('tests/mcp-server.test.ts', 'utf8');

code = code.replace(
  "      const orchestrate = response.skills['meta-orchestrator'];\n      expect(orchestrate).toBeDefined();",
  "      const orchestrate = response.skills['workflow-orchestrator'];\n      expect(orchestrate).toBeDefined();"
);

fs.writeFileSync('tests/mcp-server.test.ts', code);
