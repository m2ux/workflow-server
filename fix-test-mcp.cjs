const fs = require('fs');

let doc = fs.readFileSync('tests/mcp-server.test.ts', 'utf8');

doc = doc.replace(
  "    it('should error when no activity in session token', async () => {\n      const result = await client.callTool({\n        name: 'get_skill',\n        arguments: { session_token: sessionToken, step_id: 'create-issue' },\n      });\n      expect(result.isError).toBe(true);\n    });",
  "    it('should error when step_id is provided but no activity in session token', async () => {\n      const result = await client.callTool({\n        name: 'get_skill',\n        arguments: { session_token: sessionToken, step_id: 'create-issue' },\n      });\n      expect(result.isError).toBe(true);\n    });\n\n    it('should return workflow primary skill when no activity in session token', async () => {\n      const result = await client.callTool({\n        name: 'get_skill',\n        arguments: { session_token: sessionToken },\n      });\n      expect(result.isError).toBe(false);\n      const response = parseToolResponse(result);\n      expect(response.id).toBe('12-workflow-orchestrator'); // work-package's new primary skill\n    });"
);

fs.writeFileSync('tests/mcp-server.test.ts', doc);
