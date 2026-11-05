import { LocalBackend } from '/home/mike1/.nvm/versions/node/v24.21.0/lib/node_modules/gitnexus/dist/mcp/local/local-backend.js';
import { readResource } from '/home/mike1/.nvm/versions/node/v24.21.0/lib/node_modules/gitnexus/dist/mcp/resources.js';
import { writeFileSync } from 'node:fs';
const folder='/tmp/project17-caller-dry/';
const repo='i17-e03-lane-refactor';
const backend=new LocalBackend();
try {
 if(!await backend.init())throw new Error('No index');
 writeFileSync(folder+'graph-context.yaml',await readResource('gitnexus://repo/'+repo+'/context',backend));
 const changes=await backend.callTool('detect_changes',{scope:'compare',base_ref:'d0a62b8037bb1b8fdafac5bf0e0035ada8c64486',repo});
 writeFileSync(folder+'graph-changes.json',JSON.stringify(changes,null,2)+'\n');
 const contexts=[];
 for(const uid of ['Function:skills/work-planner/scripts/lane.py:read_lanes','Function:skills/work-planner/scripts/board.py:epic_state','Function:skills/work-planner/scripts/lane.py:assign_lanes']){
  contexts.push(await backend.callTool('context',{uid,repo}));
 }
 writeFileSync(folder+'graph-contexts.json',JSON.stringify(contexts,null,2)+'\n');
 console.log(JSON.stringify(changes.summary));
}finally{await backend.dispose();}
