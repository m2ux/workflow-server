const { loadWorkflow } = require('./dist/loaders/workflow-loader.js');
async function run() {
  const WORKFLOW_DIR = '/home/mike/projects/dev/workflow-server/workflows';
  const result = await loadWorkflow(WORKFLOW_DIR, 'work-package');
  const wf = result.value;
  console.log(wf.skills);
}
run();
