const { execSync } = require('child_process');
execSync('grep -rn "skills:" /home/mike/projects/dev/workflow-server/.engineering/workflows', { stdio: 'inherit' });
