import { LocalBackend } from '/home/mike1/.nvm/versions/node/v24.21.0/lib/node_modules/gitnexus/dist/mcp/local/local-backend.js';
import { readResource } from '/home/mike1/.nvm/versions/node/v24.21.0/lib/node_modules/gitnexus/dist/mcp/resources.js';
import { executeParameterized } from '/home/mike1/.nvm/versions/node/v24.21.0/lib/node_modules/gitnexus/dist/core/lbug/pool-adapter.js';
import { readFileSync, writeFileSync, writeSync } from 'node:fs';
const scratch='/tmp/project17-auto-delivery/';
const changes=JSON.parse(readFileSync(scratch+'graph-changes-full.json','utf8'));
const backend=new LocalBackend();
const contexts=[],queries=[],traces=[];
try {
 if(!await backend.init())throw new Error('No index');
 const repo=await backend.resolveRepo('i17-e03-pr1627');
 await backend.ensureInitialized(repo);
 for(const symbol of changes.changed_symbols){
  const result=await backend.callTool('context',{uid:symbol.id,repo:'i17-e03-pr1627'});
  if(result.error || result.partial || result.staleness)throw new Error(JSON.stringify(result));
  contexts.push({target:symbol,result});
 }
 writeFileSync(scratch+'graph-contexts.json',JSON.stringify(contexts,null,2)+'\n');
 for(const flow of changes.affected_processes){
  const result=await backend.callTool('query',{search_query:flow.name,limit:1,repo:'i17-e03-pr1627'});
  if(result.error || result.partial || result.staleness)throw new Error(JSON.stringify(result));
  queries.push({requested:flow,result});
  const steps=await executeParameterized(repo.lbugPath,`MATCH (n)-[r:CodeRelation {type: 'STEP_IN_PROCESS'}]->(p:Process {id: $flowId}) RETURN n.id AS id, n.name AS name, n.filePath AS filePath, n.startLine AS startLine, n.endLine AS endLine, r.step AS step_index ORDER BY r.step`,{flowId:flow.id});
  if(steps.length!==flow.step_count)throw new Error('Incomplete measured flow '+flow.id);
  traces.push({flow,process_symbols:steps});
 }
 writeFileSync(scratch+'graph-flow-queries.json',JSON.stringify(queries,null,2)+'\n');
 writeFileSync(scratch+'graph-flow-traces.json',JSON.stringify(traces,null,2)+'\n');
 writeFileSync(scratch+'graph-context-after.yaml',await readResource('gitnexus://repo/i17-e03-pr1627/context',backend));
 writeSync(1,JSON.stringify({contexts:contexts.length,statuses:[...new Set(contexts.map(x=>x.result.status))],queries:queries.length,traces:traces.length})+'\n');
}finally{await backend.dispose();}
