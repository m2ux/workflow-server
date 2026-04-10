const { loadWorkflow } = require('./dist/loaders/workflow-loader.js');
const { validateWorkflow } = require('./dist/schema/workflow.schema.js');

async function run() {
  const WORKFLOW_DIR = '/home/mike/projects/dev/workflow-server/.engineering/workflows';
  const result = await loadWorkflow(WORKFLOW_DIR, 'work-package');
  if (!result.success) {
     console.error("LOAD ERROR:", result.error);
     return;
  }
  
  const wf = result.value;
  const { WorkflowSchema } = require('./dist/schema/workflow.schema.js');
  const res = WorkflowSchema.safeParse(wf);
  if (!res.success) {
      console.log(JSON.stringify(res.error.issues, null, 2));
  } else {
      console.log("SUCCESS");
  }
}
run();
