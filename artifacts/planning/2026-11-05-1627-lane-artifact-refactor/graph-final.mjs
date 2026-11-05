import { LocalBackend } from '/home/mike1/.nvm/versions/node/v24.21.0/lib/node_modules/gitnexus/dist/mcp/local/local-backend.js';
import { readResource } from '/home/mike1/.nvm/versions/node/v24.21.0/lib/node_modules/gitnexus/dist/mcp/resources.js';
import { executeParameterized } from '/home/mike1/.nvm/versions/node/v24.21.0/lib/node_modules/gitnexus/dist/core/lbug/pool-adapter.js';
import { writeFileSync } from 'node:fs';
const scratch='/tmp/project17-lane-artifact/';
const alias='i17-e03-lane-refactor';
const backend=new LocalBackend();
try {
 if(!await backend.init())throw new Error('No index');
 const context=await readResource('gitnexus://repo/'+alias+'/context',backend);
 writeFileSync(scratch+'graph-context.yaml',context);
 const changes=await backend.callTool('detect_changes',{scope:'compare',base_ref:'d0a62b8037bb1b8fdafac5bf0e0035ada8c64486',repo:alias});
 writeFileSync(scratch+'graph-changes.json',JSON.stringify(changes,null,2)+'\n');
 const contexts=[];
 for(const symbol of changes.changed_symbols || []){
  const result=await backend.callTool('context',{uid:symbol.id,repo:alias});
  contexts.push({target:symbol,result});
 }
 writeFileSync(scratch+'graph-contexts.json',JSON.stringify(contexts,null,2)+'\n');
 const repo=await backend.resolveRepo(alias);
 await backend.ensureInitialized(repo);
 const traces=[];
 for(const flow of changes.affected_processes || []){
  const steps=await executeParameterized(repo.lbugPath,"MATCH (n)-[r:CodeRelation {type: 'STEP_IN_PROCESS'}]->(p:Process {id: $flowId}) RETURN n.id AS id, n.name AS name, n.filePath AS filePath, r.step AS step_index ORDER BY r.step",{flowId:flow.id});
  traces.push({flow,steps});
 }
 writeFileSync(scratch+'graph-traces.json',JSON.stringify(traces,null,2)+'\n');
 console.log(JSON.stringify({summary:changes.summary,contexts:contexts.length,traces:traces.length,errors:contexts.filter(x=>x.result.error||x.result.partial||x.result.staleness).length}));
}finally{await backend.dispose();}
