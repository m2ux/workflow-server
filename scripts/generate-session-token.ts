#!/usr/bin/env npx tsx
/**
 * Generate a session token for a legacy planning folder that predates the session token feature.
 *
 * Creates a workflow-state.json with an HMAC-signed session token so that the
 * session discovery stage can find and offer to resume the workflow.
 *
 * Usage:
 *   npx tsx scripts/generate-session-token.ts --path <planning-folder> --workflow-id <id>
 *
 * Example:
 *   npx tsx scripts/generate-session-token.ts \
 *     --path .engineering/artifacts/planning/2026-01-22-migrate-guides \
 *     --workflow-id work-package
 *
 * Guards:
 *   - Exits if workflow-state.json already exists (won't overwrite)
 *   - Exits if COMPLETE.md exists (completed workflows are skipped)
 *   - Exits if no README.md or START-HERE.md is found
 */

import { existsSync, readFileSync } from 'fs';
import { writeFile } from 'fs/promises';
import { resolve, basename } from 'path';
import { randomUUID } from 'crypto';
import { createSessionToken, decodeSessionToken } from '../src/utils/session.js';

// --- Argument parsing ---

function parseArgs(argv: string[]): { path: string; workflowId: string } {
  const args = argv.slice(2);
  let path: string | undefined;
  let workflowId: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--path' && args[i + 1]) {
      path = args[++i];
    } else if (args[i] === '--workflow-id' && args[i + 1]) {
      workflowId = args[++i];
    }
  }

  if (!path || !workflowId) {
    console.error('Usage: npx tsx scripts/generate-session-token.ts --path <planning-folder> --workflow-id <id>');
    console.error('');
    console.error('Options:');
    console.error('  --path          Path to the planning folder');
    console.error('  --workflow-id   Workflow ID (e.g., "work-package")');
    process.exit(2);
  }

  return { path: resolve(path), workflowId };
}

// --- Progress parsing ---

interface ProgressItem {
  description: string;
  status: 'complete' | 'pending';
}

interface ParsedProgress {
  totalItems: number;
  completedItems: number;
  pendingItems: number;
  items: ProgressItem[];
}

function parseProgress(content: string): ParsedProgress {
  const items: ProgressItem[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    if (!line.startsWith('|') || line.includes('---')) continue;

    const isComplete = line.includes('✅') || /\bComplete\b/.test(line);
    const isPending = line.includes('⬚') || line.includes('⚪') || /\bPending\b/.test(line);

    if (!isComplete && !isPending) continue;

    const cols = line.split('|').map(c => c.trim()).filter(c => c);
    const description = (cols[1] ?? '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // strip markdown links

    items.push({ description, status: isComplete ? 'complete' : 'pending' });
  }

  return {
    totalItems: items.length,
    completedItems: items.filter(i => i.status === 'complete').length,
    pendingItems: items.filter(i => i.status === 'pending').length,
    items,
  };
}

// --- Main ---

async function main() {
  const { path, workflowId } = parseArgs(process.argv);
  const folderName = basename(path);

  // Guard: folder exists
  if (!existsSync(path)) {
    console.error(`[FAIL] Planning folder not found: ${path}`);
    process.exit(1);
  }

  // Guard: existing workflow-state.json
  const stateFilePath = resolve(path, 'workflow-state.json');
  if (existsSync(stateFilePath)) {
    console.error(`[FAIL] workflow-state.json already exists in ${folderName}`);
    console.error('       Remove it first if you want to regenerate.');
    process.exit(1);
  }

  // Guard: completed workflow
  if (existsSync(resolve(path, 'COMPLETE.md'))) {
    console.error(`[FAIL] ${folderName} has COMPLETE.md — skipping completed workflow`);
    process.exit(1);
  }

  // Read README.md or START-HERE.md for progress
  let readmeContent = '';
  let readmeSource = '';
  for (const name of ['README.md', 'START-HERE.md']) {
    const filePath = resolve(path, name);
    if (existsSync(filePath)) {
      readmeContent = readFileSync(filePath, 'utf-8');
      readmeSource = name;
      break;
    }
  }

  if (!readmeContent) {
    console.error(`[FAIL] No README.md or START-HERE.md found in ${folderName}`);
    process.exit(1);
  }

  console.log(`[INFO] Reading progress from ${folderName}/${readmeSource}`);
  const progress = parseProgress(readmeContent);
  console.log(`[INFO] Progress: ${progress.completedItems}/${progress.totalItems} items complete`);

  if (progress.pendingItems > 0) {
    const pending = progress.items.filter(i => i.status === 'pending');
    for (const item of pending) {
      console.log(`       Pending: ${item.description}`);
    }
  }

  // Create session token
  const token = await createSessionToken(workflowId, '0.0.0', 'legacy-backfill');
  const decoded = await decodeSessionToken(token);
  console.log(`[INFO] Session ID: ${decoded.sid}`);

  // Build the state save file
  const now = new Date().toISOString();

  const saveFile = {
    id: `legacy-${randomUUID()}`,
    savedAt: now,
    description: `Legacy backfill from ${folderName} — ${progress.completedItems}/${progress.totalItems} items complete`,
    workflowId,
    workflowVersion: '0.0.0',
    planningFolder: path,
    sessionToken: token,
    sessionTokenEncrypted: false,
    state: {
      workflowId,
      workflowVersion: '0.0.0',
      stateVersion: 1,
      startedAt: now,
      updatedAt: now,
      currentActivity: '',
      completedActivities: [] as string[],
      skippedActivities: [] as string[],
      completedSteps: {},
      checkpointResponses: {},
      decisionOutcomes: {},
      activeLoops: [] as unknown[],
      variables: {
        planning_folder_path: path,
      },
      triggeredWorkflows: [] as unknown[],
      history: [
        {
          timestamp: now,
          type: 'workflow_started',
          data: {
            source: 'legacy-backfill',
            progress: {
              completed: progress.completedItems,
              total: progress.totalItems,
              pending: progress.items
                .filter(i => i.status === 'pending')
                .map(i => i.description),
            },
          },
        },
      ],
      status: 'running',
    },
  };

  await writeFile(stateFilePath, JSON.stringify(saveFile, null, 2) + '\n');

  console.log(`[PASS] Generated ${stateFilePath}`);
  console.log(`[INFO] Token workflow: ${workflowId}, agent: legacy-backfill, seq: 0`);
}

main();
