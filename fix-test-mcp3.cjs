const fs = require('fs');

let doc = fs.readFileSync('tests/mcp-server.test.ts', 'utf8');

doc = doc.replace(
  "      expect(response.id).toBe('12-workflow-orchestrator'); // work-package's new primary skill",
  "      expect(response.id).toBe('workflow-orchestrator'); // work-package's new primary skill"
);
doc = doc.replace(
  "      expect(skillIds).toContain('12-workflow-orchestrator');",
  "      expect(skillIds).toContain('workflow-orchestrator');"
);
doc = doc.replace(
  "      expect(skillIds).toContain('12-workflow-orchestrator');",
  "      expect(skillIds).toContain('workflow-orchestrator');"
);
doc = doc.replace(
  "      const wfOrch = response.skills['12-workflow-orchestrator'] as Record<string, unknown>;",
  "      const wfOrch = response.skills['workflow-orchestrator'] as Record<string, unknown>;"
);
doc = doc.replace(
  "      expect(skillIds).toContain('12-workflow-orchestrator');",
  "      expect(skillIds).toContain('workflow-orchestrator');"
);

fs.writeFileSync('tests/mcp-server.test.ts', doc);
