const { loadWorkflow } = require('./dist/loaders/workflow-loader.js');
const { ActivitySchema } = require('./dist/schema/activity.schema.js');

async function run() {
  const WORKFLOW_DIR = '/home/mike/projects/dev/workflow-server/.engineering/workflows';
  const result = await loadWorkflow(WORKFLOW_DIR, 'work-package');
  const wf = result.value;
  for (const act of wf.activities) {
     const res = ActivitySchema.safeParse(act);
     if (!res.success) {
         console.log(act.id, JSON.stringify(res.error.issues, null, 2));
     } else {
         console.log(act.id, "OK");
     }
  }
}
run();
