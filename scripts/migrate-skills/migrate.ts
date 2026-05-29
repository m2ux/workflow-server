#!/usr/bin/env tsx
/**
 * migrate.ts — Copy pre-migrated markdown skills content from the planning
 * folder into a workflows worktree.
 *
 * Inputs:
 *   <legacy-source-dir>   Path to the `legacy/` folder under the planning artifact
 *                         (e.g. `.engineering/artifacts/planning/2026-05-22-claude-skills-migration/legacy`).
 *   <workflows-target-dir>  Path to the workflows worktree root
 *                           (e.g. `~/projects/work/workflows/2026-05-28-markdown-skills-impl`).
 *
 * Outputs (per workflow present in <legacy-source-dir>):
 *   <workflows-target-dir>/<workflow>/techniques/<slug>/SKILL.md   (+ sibling <op>.md children)
 *   <workflows-target-dir>/<workflow>/resources/<slug>/SKILL.md    (+ any sibling .md children)
 *
 * Idempotency: re-running overwrites destination files with identical bytes
 * sourced from the legacy tree. The directory structure is the canonical
 * shape; no synthesised files.
 *
 * Stats: per-workflow counts (techniques migrated, op-child files materialised,
 * resources migrated) are printed to stdout.
 */

import { existsSync, mkdirSync, readdirSync, statSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

interface CategoryStats {
  topLevel: number;       // SKILL.md count
  childFiles: number;     // op-as-child-files count (markdown siblings excluding SKILL.md / README.md)
}

interface WorkflowStats {
  workflow: string;
  techniques: CategoryStats;
  resources: CategoryStats;
}

function printUsage(): void {
  console.error('Usage: tsx migrate.ts <legacy-source-dir> <workflows-target-dir>');
  console.error('');
  console.error('  legacy-source-dir     Path to the legacy/ folder under the planning artifact');
  console.error('  workflows-target-dir  Path to the workflows worktree root');
  console.error('');
  console.error('  --help, -h            Show this message');
}

function listDirectories(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => {
      try {
        return statSync(join(dir, name)).isDirectory();
      } catch {
        return false;
      }
    })
    .sort();
}

function listMarkdownFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .sort();
}

/**
 * Copy a single skill or resource slug folder.
 * Returns the count of SKILL.md (top-level) and child .md files copied.
 */
function migrateSlug(srcSlugDir: string, dstSlugDir: string): { topLevel: number; childFiles: number } {
  mkdirSync(dstSlugDir, { recursive: true });
  let topLevel = 0;
  let childFiles = 0;

  for (const filename of listMarkdownFiles(srcSlugDir)) {
    const srcPath = join(srcSlugDir, filename);
    const dstPath = join(dstSlugDir, filename);
    copyFileSync(srcPath, dstPath);

    if (filename === 'SKILL.md') {
      topLevel += 1;
    } else if (filename !== 'README.md') {
      childFiles += 1;
    }
  }

  return { topLevel, childFiles };
}

function migrateCategory(legacyWorkflowDir: string, targetWorkflowDir: string, category: 'techniques' | 'resources'): CategoryStats {
  const srcDir = join(legacyWorkflowDir, category);
  const dstDir = join(targetWorkflowDir, category);
  const stats: CategoryStats = { topLevel: 0, childFiles: 0 };

  if (!existsSync(srcDir)) return stats;
  mkdirSync(dstDir, { recursive: true });

  for (const slug of listDirectories(srcDir)) {
    const { topLevel, childFiles } = migrateSlug(join(srcDir, slug), join(dstDir, slug));
    stats.topLevel += topLevel;
    stats.childFiles += childFiles;
  }

  return stats;
}

function formatTechniqueLine(stats: CategoryStats): string {
  return `${stats.topLevel} techniques, ${stats.childFiles} op-child files`;
}

function formatResourceLine(stats: CategoryStats): string {
  return `${stats.topLevel} resources, ${stats.childFiles} child files`;
}

function main(argv: string[]): number {
  const args = argv.slice(2);
  if (args.includes('--help') || args.includes('-h') || args.length < 2) {
    printUsage();
    return args.length < 2 ? 1 : 0;
  }

  const legacyDir = resolve(args[0]!);
  const targetDir = resolve(args[1]!);

  if (!existsSync(legacyDir) || !statSync(legacyDir).isDirectory()) {
    console.error(`ERROR: legacy source directory does not exist: ${legacyDir}`);
    return 1;
  }
  if (!existsSync(targetDir) || !statSync(targetDir).isDirectory()) {
    console.error(`ERROR: target workflows directory does not exist: ${targetDir}`);
    return 1;
  }

  console.log('Markdown skills migration');
  console.log('=========================');
  console.log('');
  console.log(`Source:  ${legacyDir}`);
  console.log(`Target:  ${targetDir}`);
  console.log('');

  const allStats: WorkflowStats[] = [];
  for (const workflow of listDirectories(legacyDir)) {
    const legacyWorkflowDir = join(legacyDir, workflow);
    const targetWorkflowDir = join(targetDir, workflow);
    if (!existsSync(targetWorkflowDir)) {
      console.log(`[${workflow}] SKIP (target workflow directory does not exist)`);
      continue;
    }
    console.log(`[${workflow}]`);
    const techniques = migrateCategory(legacyWorkflowDir, targetWorkflowDir, 'techniques');
    const resources = migrateCategory(legacyWorkflowDir, targetWorkflowDir, 'resources');
    console.log(`  ${workflow}/techniques: ${formatTechniqueLine(techniques)}`);
    console.log(`  ${workflow}/resources: ${formatResourceLine(resources)}`);
    allStats.push({ workflow, techniques, resources });
  }

  const totals = allStats.reduce(
    (acc, s) => {
      acc.techniques += s.techniques.topLevel;
      acc.opChildFiles += s.techniques.childFiles;
      acc.resources += s.resources.topLevel;
      return acc;
    },
    { techniques: 0, opChildFiles: 0, resources: 0 },
  );

  console.log('');
  console.log('=========================');
  console.log('Summary:');
  console.log(`  Techniques migrated:  ${totals.techniques}`);
  console.log(`  Op-child files:       ${totals.opChildFiles}`);
  console.log(`  Resources migrated:   ${totals.resources}`);
  console.log(`  Total .md files:      ${totals.techniques + totals.opChildFiles + totals.resources}`);
  console.log('');
  console.log('Done.');
  return 0;
}

// Suppress unused-import warnings when only used inside conditionals
void readFileSync;
void writeFileSync;

const exitCode = main(process.argv);
process.exit(exitCode);
