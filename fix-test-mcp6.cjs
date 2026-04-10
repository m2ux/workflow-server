const fs = require('fs');
let code = fs.readFileSync('/home/mike/projects/dev/workflow-server/tests/mcp-server.test.ts', 'utf8');

code = code.replace(
  "      expect(response.id).toBe('workflow-orchestrator'); // work-package's new primary skill",
  "      expect(response.id).toBe('12-workflow-orchestrator');"
);

code = code.replace(
  "      expect(response.id).toBe('workflow-orchestrator');",
  "      expect(response.id).toBe('12-workflow-orchestrator');"
);

code = code.replace(
  "      expect(skillIds).not.toContain('meta-orchestrator');",
  "      expect(skillIds).not.toContain('10-meta-orchestrator');"
);

code = code.replace(
  "      expect(skillIds).toContain('workflow-orchestrator');",
  "      expect(skillIds).toContain('12-workflow-orchestrator');"
);

code = code.replace(
  "      expect(skillIds).toContain('meta-orchestrator');",
  "      expect(skillIds).toContain('10-meta-orchestrator');"
);

code = code.replace(
  "      const wfOrch = response.skills['workflow-orchestrator'];",
  "      const wfOrch = response.skills['12-workflow-orchestrator'];"
);

code = code.replace(
  "      const orchestrate = response.skills['workflow-orchestrator'];",
  "      const orchestrate = response.skills['10-meta-orchestrator'];"
);

fs.writeFileSync('/home/mike/projects/dev/workflow-server/tests/mcp-server.test.ts', code);
