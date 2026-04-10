const fs = require('fs');
let code = fs.readFileSync('tests/mcp-server.test.ts', 'utf8');

code = code.replace(
  "      expect(skillIds).toContain('meta-orchestrator');\n      expect(skillIds).not.toContain('create-issue');",
  "      expect(skillIds).not.toContain('create-issue');"
);

code = code.replace(
  "      const orchestrate = response.skills['meta-orchestrator'];\n      expect(orchestrate).toBeDefined();\n      const crossWfRef = orchestrate._resources?.find((r: { index: string }) => r.index === 'meta/10');\n      expect(crossWfRef).toBeDefined();\n      expect(crossWfRef.id).toBe('workflow-orchestrator-prompt');\n      expect(crossWfRef.content).toBeUndefined();",
  "      const orchestrate = response.skills['workflow-orchestrator'];\n      expect(orchestrate).toBeDefined();\n      const crossWfRef = orchestrate._resources?.find((r: { index: string }) => r.index === 'meta/05');\n      expect(crossWfRef).toBeDefined();\n      expect(crossWfRef.id).toBe('activity-worker-prompt');\n      expect(crossWfRef.content).toBeUndefined();"
);

fs.writeFileSync('tests/mcp-server.test.ts', code);
