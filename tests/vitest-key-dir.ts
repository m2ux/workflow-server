/**
 * Each vitest worker holds its signing key under a process-private directory.
 * Parallel files otherwise share `~/.workflow-server/secret`, and a reader can
 * open that file in the window between exclusive create and the 32-byte write.
 */
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const keyDir = join(tmpdir(), `wf-vitest-key-${process.pid}`);
mkdirSync(keyDir, { recursive: true, mode: 0o700 });
process.env['WORKFLOW_SERVER_KEY_DIR'] = keyDir;
