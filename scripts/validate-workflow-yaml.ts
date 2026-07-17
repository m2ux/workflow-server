#!/usr/bin/env npx tsx
/**
 * Validate a workflow's YAML files (workflow.yaml, activities/*.yaml) against schemas.
 * Usage: npx tsx scripts/validate-workflow-yaml.ts <path-to-workflow-dir>
 * Example: npx tsx scripts/validate-workflow-yaml.ts /path/to/workflows/substrate-node-security-audit
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { loadWorkflow } from '../src/loaders/workflow-loader.js';
import { parseActivityFilename } from '../src/loaders/filename-utils.js';
import { validateActivityFile } from './validate-activities.js';

/**
 * Check NN- filename prefix and report duplicate skill/activity IDs.
 * Files without a NN-{id}.yaml prefix are invisible to the runtime loader
 * (see src/loaders/filename-utils.ts), and duplicate IDs cause non-deterministic
 * resolution (whichever file readdir returns first wins).
 */
function checkPrefixAndDuplicates(files: string[]): string[] {
  const issues: string[] = [];
  const idToFiles = new Map<string, string[]>();
  for (const file of files) {
    const parsed = parseActivityFilename(file);
    if (!parsed) {
      issues.push(`${file}: missing NN- prefix — runtime loader will ignore this file`);
      continue;
    }
    const list = idToFiles.get(parsed.id) ?? [];
    list.push(file);
    idToFiles.set(parsed.id, list);
  }
  for (const [id, fileList] of idToFiles) {
    if (fileList.length > 1) {
      issues.push(`duplicate id "${id}" in: ${fileList.join(', ')} — runtime resolution is non-deterministic`);
    }
  }
  return issues;
}

/** Recursively collect technique .md files (group dirs contain per-operation files). */
function walkTechniqueFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkTechniqueFiles(p));
    else if (entry.name.endsWith('.md')) out.push(p);
  }
  return out;
}

/**
 * Flag unanchored value-references in a technique's `## Protocol` section: a
 * multi-word snake_case token used BARE — neither a `{designator}` (the
 * technique's input/output/local), nor a `code` token, nor an invocation
 * arg-key (`name:`). Every value a protocol sets or reads must resolve to a
 * declared designator (AP-49/59). Single-word tokens are excluded — they
 * routinely coincide with ordinary prose ("complexity", "plan") and require
 * human judgement rather than mechanical bracing.
 */
function checkTechniqueProtocolRefs(file: string): string[] {
  const s = readFileSync(file, 'utf-8');
  const m = s.match(/^##\s+Protocol\b/m);
  if (m?.index == null) return [];
  const rest = s.slice(m.index + 1);
  const next = rest.search(/^##\s+(?!#)/m);
  const protocol = next === -1 ? s.slice(m.index) : s.slice(m.index, m.index + 1 + next);
  // Strip fenced/inline code and italic/bold emphasis so op argument names
  // (*arg* / **arg**) and code tokens are not flagged as bare designators.
  const stripCode = (t: string) =>
    t
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]*`/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '')
      .replace(/\*([^*]+)\*/g, '')
      .replace(/__([^_]+)__/g, '')
      .replace(/_([^_]+)_/g, '');
  const bare = new Set<string>();
  for (const rawLine of protocol.split('\n')) {
    if (/^\s*#{1,4}\s/.test(rawLine)) continue; // skip headings
    const line = stripCode(rawLine);
    for (const mm of line.matchAll(/(?<![\w{])([a-z][a-z0-9]*(?:_[a-z0-9]+)+)(?![\w}:])/g)) {
      bare.add(mm[1]);
    }
  }
  return [...bare].map(
    (t) => `unanchored protocol reference '${t}' — brace as {${t}} (declared designator) or backtick as a code token`,
  );
}

const workflowDirPath = resolve(process.argv[2] ?? '');
if (!workflowDirPath || !existsSync(workflowDirPath)) {
  console.error('Usage: npx tsx scripts/validate-workflow-yaml.ts <path-to-workflow-dir>');
  console.error('Example: npx tsx scripts/validate-workflow-yaml.ts workflows/substrate-node-security-audit');
  process.exit(2);
}

const workflowYamlPath = join(workflowDirPath, 'workflow.yaml');
if (!existsSync(workflowYamlPath)) {
  console.error(`[FAIL] workflow.yaml not found at ${workflowYamlPath}`);
  console.error('The specified directory does not appear to be a workflow directory.');
  process.exit(2);
}

const workflowId = workflowDirPath.split(/[/\\]/).pop() ?? '';
const parentDir = resolve(workflowDirPath, '..');

async function main() {
  let failed = 0;

  const loadResult = await loadWorkflow(parentDir, workflowId);
  if (loadResult.success) {
    console.log('[PASS] workflow.yaml valid');
    console.log(`   ID: ${loadResult.value.id}, Version: ${loadResult.value.version}, Activities: ${loadResult.value.activities.length}`);
  } else {
    console.error('[FAIL] workflow.yaml validation failed:', loadResult.error);
    failed++;
  }

  const activitiesDir = join(workflowDirPath, 'activities');
  if (existsSync(activitiesDir)) {
    const activityFiles = readdirSync(activitiesDir).filter((f) => f.endsWith('.yaml'));
    console.log(`\n[INFO] activities/ (${activityFiles.length} files)`);
    const layoutIssues = checkPrefixAndDuplicates(activityFiles);
    for (const issue of layoutIssues) {
      console.log(`   [FAIL] ${issue}`);
      failed++;
    }
    for (const file of activityFiles) {
      const result = validateActivityFile(join(activitiesDir, file));
      if (result.passed) {
        console.log(`   [PASS] ${file}`);
      } else {
        console.log(`   [FAIL] ${file}`);
        for (const err of result.errors ?? []) {
          console.log(`      - ${err}`);
        }
        failed++;
      }
    }
  }

  const techniquesDir = join(workflowDirPath, 'techniques');
  if (existsSync(techniquesDir)) {
    const techFiles = walkTechniqueFiles(techniquesDir);
    console.log(`\n[INFO] techniques/ (${techFiles.length} files)`);
    let techFailed = 0;
    for (const file of techFiles) {
      const issues = checkTechniqueProtocolRefs(file);
      if (issues.length) {
        console.log(`   [FAIL] ${file.replace(techniquesDir + '/', '')}`);
        for (const issue of issues) console.log(`      - ${issue}`);
        failed++;
        techFailed++;
      }
    }
    if (techFailed === 0) {
      console.log(`   [PASS] no unanchored protocol references`);
    }
  }

  console.log('\n' + '─'.repeat(50));
  console.log(failed === 0 ? 'All YAML files valid.' : `Validation failed: ${failed} file(s).`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
