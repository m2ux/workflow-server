const fs = require('fs');
let code = fs.readFileSync('tests/mcp-server.test.ts', 'utf8');

code = code.replace(
  "      expect(crossWfRef.id).toBe('workflow-orchestrator-prompt');",
  "      expect(crossWfRef.id).toBe('activity-worker-prompt');"
);

fs.writeFileSync('tests/mcp-server.test.ts', code);
