const fs = require('fs');
let code = fs.readFileSync('tests/mcp-server.test.ts', 'utf8');

// The MCP SDK doesn't always return isError: false when it's successful, it usually omits it entirely (undefined).
// So replace expect(result.isError).toBe(false) with expect(result.isError).toBeFalsy()

code = code.replace(/expect\(result\.isError\)\.toBe\(false\);/g, 'expect(result.isError).toBeFalsy();');

fs.writeFileSync('tests/mcp-server.test.ts', code);
