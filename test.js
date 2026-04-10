const yaml = require('yaml');
const fs = require('fs');
const doc = fs.readFileSync('/home/mike/projects/dev/workflow-server/.engineering/workflows/meta/workflow.toon', 'utf8');
try {
  // It's a toon file, we have a toon parser! Let's just use the toon parser
} catch(e){}
