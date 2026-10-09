#!/usr/bin/env npx tsx
/**
 * Every answer the GitNexus library gives is taken through a tool.
 *
 * The namespace's techniques are the one place raw GitNexus calls live, and a client reaches them
 * holding whatever the harness gives it. A tool is in every such client; an MCP resource is not —
 * a reader with no resource reader addresses `gitnexus://repo/<name>/process/<flow>` and gets
 * nothing back, while the technique's declared output still reads as a value it was handed. The
 * failure is silent in exactly the way a stale index is: the shape of the answer says nothing
 * about whether the reading was taken.
 *
 * So a protocol here addresses a tool, and the guard is a textual one over the namespace's own
 * files: a `gitnexus://` address inside a technique's `## Protocol` or `## Outputs` is a reading
 * the client may not be able to take, or an identifier pointing a reader at one.
 *
 *   `resource-answer` — a technique of the namespace naming a `gitnexus://` address where its
 *                       answer or its declared output is settled.
 *
 * Two readings GitNexus publishes through a resource alone are excused by name below. The
 * exemption is the surface that records them: a reading with no tool behind it cannot be composed,
 * and excusing it here keeps that fact visible instead of leaving the guard unwritten.
 *
 * Run: npx tsx guards/check-gitnexus-tool-answers.ts [--root <workflows-dir>]
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { report, requireRootOrExit, type Finding } from './guard-protocol.js';
import { defaultCorpusDest } from './workflows-root.js';

const REPO = resolve(import.meta.dirname, '..');
const DEFAULT_ROOT = defaultCorpusDest(REPO);

/** The library namespace this guard holds, as a path fragment inside the corpus. */
export const NAMESPACE = join('support', 'gitnexus', 'techniques');

/** A GitNexus MCP resource address, in any of its repo and group forms. */
const RESOURCE = /gitnexus:\/\//;

/** The sections where a technique settles its answer. Prose elsewhere describes, it does not read. */
const ANSWER_SECTIONS = new Set(['Protocol', 'Outputs']);

/**
 * The readings GitNexus publishes through a resource and no tool: a repository group's status and
 * its contract registry. `gitnexus_group_list` names a group's members and nothing about their
 * freshness, and `gitnexus_group_sync` rebuilds the registry rather than reading it, so neither
 * reading can be composed over a tool at all. Each is excused under the reading it names.
 */
export const RESOURCE_ONLY_READINGS = new Map<string, string>([
  [
    'group-freshness.md',
    'the group status resource is the only reader of a member\'s contract freshness and of the '
    + 'registry\'s own provenance; no tool carries either',
  ],
  [
    'group-contracts.md',
    'the group contracts resource is the only reader of a group\'s contract registry; the sync tool '
    + 'rebuilds it and reports what it wrote rather than what the registry holds',
  ],
]);

function markdownFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) markdownFiles(full, out);
    else if (name.endsWith('.md')) out.push(full);
  }
  return out;
}

/** The `## ` heading each line sits under, by zero-based line index. */
export function sectionOf(lines: string[]): (string | null)[] {
  let current: string | null = null;
  return lines.map((line) => {
    const heading = /^##\s+(.+?)\s*$/.exec(line);
    if (heading) current = heading[1]!;
    else if (/^#\s/.test(line)) current = null;
    return current;
  });
}

export interface ToolAnswerTally {
  findings: Finding[];
  /** Technique files of the namespace read. */
  checked: number;
  /** Files excused by name, each for a reading no tool carries. */
  excused: number;
}

export function collect(root: string): ToolAnswerTally {
  const findings: Finding[] = [];
  let checked = 0;
  let excused = 0;

  for (const file of markdownFiles(root).filter((f) => f.includes(NAMESPACE))) {
    const name = file.slice(file.lastIndexOf('/') + 1);
    if (RESOURCE_ONLY_READINGS.has(name)) {
      excused += 1;
      continue;
    }
    checked += 1;
    const lines = readFileSync(file, 'utf-8').split('\n');
    const sections = sectionOf(lines);
    for (const [lineNo, line] of lines.entries()) {
      const section = sections[lineNo];
      if (!section || !ANSWER_SECTIONS.has(section)) continue;
      if (!RESOURCE.test(line)) continue;
      findings.push({
        check: 'resource-answer',
        site: `${relative(root, file)}:${lineNo + 1}`,
        detail:
          `\`## ${section}\` addresses a \`gitnexus://\` resource, so a client holding this library's `
          + 'tools and no resource reader takes nothing here and reads the absence as an answer. '
          + 'Compose the reading over a tool the namespace binds, and where none carries it, say so '
          + 'and name the file in this guard\'s exemption surface with the reading it stands for.',
      });
    }
  }
  return { findings, checked, excused };
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const root = requireRootOrExit('gitnexus-tool-answers', DEFAULT_ROOT);
  const tally = collect(root);
  report('gitnexus-tool-answers', tally.findings, {
    root,
    okMessage:
      `${tally.checked} GitNexus technique(s) settle their answer through a tool `
      + `(${tally.excused} excused for a reading GitNexus publishes through a resource alone)`,
    remedy: 'compose the reading over a tool, or excuse the file with the reading no tool carries',
  });
}
