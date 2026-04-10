const fs = require('fs');
let code = fs.readFileSync('tests/mcp-server.test.ts', 'utf8');

code = code.replace(
  "      expect(response.id).toBe('workflow-orchestrator'); // work-package's new primary skill",
  "      expect(response.id).toBe('12-workflow-orchestrator'); // work-package's new primary skill"
);
code = code.replace(
  "      expect(skillIds).toContain('workflow-orchestrator');",
  "      expect(skillIds).toContain('12-workflow-orchestrator');"
);
code = code.replace(
  "      expect(skillIds).toContain('workflow-orchestrator');",
  "      expect(skillIds).toContain('12-workflow-orchestrator');"
);
code = code.replace(
  "      const wfOrch = response.skills['workflow-orchestrator'] as Record<string, unknown>;",
  "      const wfOrch = response.skills['12-workflow-orchestrator'] as Record<string, unknown>;"
);

fs.writeFileSync('tests/mcp-server.test.ts', code);
