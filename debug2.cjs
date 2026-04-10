const { run } = require('vitest');
// Actually, I can just use my own test script to see why get_skill is returning an error.
const { createClient } = require('./dist/mcp-server.js');
const { startSession } = require('./dist/tools/workflow-tools.js'); // well, just testing the actual function via the tools handler directly is harder.

async function debug() {
  const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
  const { InMemoryTransport } = require("@modelcontextprotocol/sdk/shared/inMemory.js");
  // Can't easily use the in-memory transport for the dist version like vitest does in tests/mcp-server.test.ts
}
