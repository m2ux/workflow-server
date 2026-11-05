import { LocalBackend } from '/home/mike1/.nvm/versions/node/v24.21.0/lib/node_modules/gitnexus/dist/mcp/local/local-backend.js';
import { readResource } from '/home/mike1/.nvm/versions/node/v24.21.0/lib/node_modules/gitnexus/dist/mcp/resources.js';
import { writeFileSync, writeSync } from 'node:fs';
const scratch='/tmp/project17-auto-delivery/';
const backend=new LocalBackend();
try {
  if(!await backend.init()) throw new Error('No index');
  const context=await readResource('gitnexus://repo/i17-e03-pr1627/context',backend);
  writeFileSync(scratch+'graph-repository-context.yaml',context);
  const changes=await backend.callTool('detect_changes',{scope:'compare',base_ref:'d0a62b8037bb1b8fdafac5bf0e0035ada8c64486',repo:'i17-e03-pr1627'});
  writeFileSync(scratch+'graph-changes-full.json',JSON.stringify(changes,null,2)+'\n');
  writeSync(1,JSON.stringify({keys:Object.keys(changes),summary:changes.summary,first:changes.changed_symbols?.[0],firstProcess:changes.affected_processes?.[0],staleness:changes.staleness})+'\n');
} finally { await backend.dispose(); }
