import { LocalBackend } from '/home/mike1/.nvm/versions/node/v24.21.0/lib/node_modules/gitnexus/dist/mcp/local/local-backend.js';
import { readResource } from '/home/mike1/.nvm/versions/node/v24.21.0/lib/node_modules/gitnexus/dist/mcp/resources.js';
import { executeParameterized } from '/home/mike1/.nvm/versions/node/v24.21.0/lib/node_modules/gitnexus/dist/core/lbug/pool-adapter.js';
import { writeFileSync } from 'node:fs';
const prefix='/tmp/project17-dispatch-merge-';const repoName='i17-e03-lane-refactor';const backend=new LocalBackend();
try {
 if(!await backend.init())throw new Error('No index');
 writeFileSync(prefix+'graph-context.yaml',await readResource('gitnexus://repo/'+repoName+'/context',backend));
 const changes=await backend.callTool('detect_changes',{scope:'compare',base_ref:'f1007d1db7d2a4301c22e367cd12e726775833ca',repo:repoName});
 writeFileSync(prefix+'graph-changes.json',JSON.stringify(changes,null,2)+'\n');
 const contexts=[];
 for(const uid of ['Function:skills/work-planner/scripts/lane.py:read_lanes','Function:skills/work-planner/scripts/lane.py:is_index','Function:skills/work-planner/scripts/lane.py:assign_lanes','Function:skills/work-planner/scripts/dispatch.py:batch','Function:skills/work-planner/scripts/deliver.py:survey']){
  const context=await backend.callTool('context',{uid,repo:repoName});
  if(context.status!=='found'||context.partial||context.error||context.staleness)throw new Error(JSON.stringify(context));
  contexts.push(context);
 }
 writeFileSync(prefix+'graph-contexts.json',JSON.stringify(contexts,null,2)+'\n');
 const repo=await backend.resolveRepo(repoName);await backend.ensureInitialized(repo);
 const flows=contexts.find(x=>x.symbol.name==='assign_lanes').processes || [];const traces=[];
 for(const flow of flows){
  const steps=await executeParameterized(repo.lbugPath,"MATCH (n)-[r:CodeRelation {type: 'STEP_IN_PROCESS'}]->(p:Process {id: $flowId}) RETURN n.id AS id, n.name AS name, n.filePath AS filePath, r.step AS step_index ORDER BY r.step",{flowId:flow.id});
  traces.push({flow,steps});
 }
 writeFileSync(prefix+'graph-traces.json',JSON.stringify(traces,null,2)+'\n');
 console.log(JSON.stringify({summary:changes.summary,contexts:contexts.length,traces:traces.length}));
}finally{await backend.dispose();}
