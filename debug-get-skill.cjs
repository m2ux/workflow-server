const fs = require('fs');
const { get_skill } = require('./build/tools/resource-tools.js');

console.log("Response:", fs.readFileSync('tests/mcp-server.test.ts', 'utf8').substring(0, 10));
