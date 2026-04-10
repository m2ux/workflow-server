const fs = require('fs');
let code = fs.readFileSync('tests/mcp-server.test.ts', 'utf8');

// Replace the old test assertions with our new expectations based on primary skill
code = code.replace(
  "      expect(skillIds).toContain('meta-orchestrator');\n      expect(skillIds).toContain('activity-worker');\n      expect(skillIds).not.toContain('create-issue');\n      expect(skillIds).not.toContain('knowledge-base-search');",
  "      expect(skillIds).toContain('12-workflow-orchestrator');\n      expect(skillIds).not.toContain('meta-orchestrator');\n      expect(skillIds).not.toContain('create-issue');\n      expect(skillIds).not.toContain('knowledge-base-search');"
);

// We need to look for any other places that assert against the old skills array for work-package
code = code.replace(
  "    it('should nest resources under workflow-level skills', async () => {\n      const result = await client.callTool({\n        name: 'get_skills',\n        arguments: { session_token: sessionToken },\n      });\n      const response = parseToolResponse(result);\n      const metaOrch = response.skills['meta-orchestrator'] as Record<string, unknown>;\n      expect(metaOrch).toBeDefined();\n      expect(Array.isArray(metaOrch._resources)).toBe(true);\n    });",
  "    it('should nest resources under workflow-level skills', async () => {\n      const result = await client.callTool({\n        name: 'get_skills',\n        arguments: { session_token: sessionToken },\n      });\n      const response = parseToolResponse(result);\n      const wfOrch = response.skills['12-workflow-orchestrator'] as Record<string, unknown>;\n      expect(wfOrch).toBeDefined();\n      expect(Array.isArray(wfOrch._resources)).toBe(true);\n    });"
);

fs.writeFileSync('tests/mcp-server.test.ts', code);
