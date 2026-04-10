const fs = require('fs');

const path = '/home/mike/projects/dev/workflow-server/src/tools/resource-tools.ts';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `      if (!token.act) {
        throw new Error('No current activity in session. Call next_activity before get_skill.');
      }
      assertCheckpointsResolved(token);

      const wfResult = await loadWorkflow(config.workflowDir, workflow_id);
      if (!wfResult.success) throw wfResult.error;

      const activity = getActivity(wfResult.value, token.act);
      if (!activity) {
        throw new Error(\`Activity '\${token.act}' not found in workflow '\${workflow_id}'.\`);
      }

      let skillId: string | undefined;

      if (!step_id) {
        skillId = activity.skills?.primary;
        if (!skillId) {
          throw new Error(\`Activity '\${token.act}' does not define a primary skill.\`);
        }
      } else {`;

const newStr = `      assertCheckpointsResolved(token);

      const wfResult = await loadWorkflow(config.workflowDir, workflow_id);
      if (!wfResult.success) throw wfResult.error;

      let skillId: string | undefined;

      if (!token.act) {
        if (step_id) {
          throw new Error('Cannot provide step_id when no activity is active. Call next_activity first.');
        }
        skillId = wfResult.value.skills?.primary;
        if (!skillId) {
          throw new Error(\`Workflow '\${workflow_id}' does not define a primary skill.\`);
        }
      } else {
        const activity = getActivity(wfResult.value, token.act);
        if (!activity) {
          throw new Error(\`Activity '\${token.act}' not found in workflow '\${workflow_id}'.\`);
        }

        if (!step_id) {
          skillId = activity.skills?.primary;
          if (!skillId) {
            throw new Error(\`Activity '\${token.act}' does not define a primary skill.\`);
          }
        } else {`;

content = content.replace(targetStr, newStr);

fs.writeFileSync(path, content);
