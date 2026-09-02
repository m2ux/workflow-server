#!/usr/bin/env npx tsx
/**
 * Citation-grain guard over the mechanical half of `whole-resource-for-one-section`.
 *
 * A citation is a delivery instruction: `../resources/example.md` sends the whole file,
 * `../resources/example.md#rules` sends that heading's span. Every distinct citation in a technique
 * is delivered, and the total counts against the budget deciding what else arrives.
 *
 * So a technique citing one resource both ways sends the file AND the sections — the sections
 * arrive twice, once alone and once inside the file that contains them, and the file's size
 * displaces other bundled content. That is the tell this guard reads, and it is the half of the
 * catalog entry's Detect that needs no judgement: the other half asks whether the prose around a
 * bare citation names a single section, which is a reading.
 *
 * Do-not-flag carve-outs the entry states are honoured structurally rather than by verdict: a
 * single-section resource has no sections to prefer, and a resource cited bare in overview prose
 * that nothing else anchors raises no pair. A technique that genuinely reads most of the body
 * anchors nothing, so it raises no pair either.
 *
 * The Detect pairs a bare citation with an anchor of the same resource held ELSEWHERE in the file,
 * so a pair inside one bullet is not one. "Criteria homes: …, [anti-patterns](x.md); … per
 * [entry](x.md#entry)" is a single instruction naming a home and the entry it invokes within it —
 * whether that over-delivers turns on whether the prose reads one section, which is the judgement
 * half this guard declines. A bullet is one line here, so the line is the unit.
 *
 * Run: npx tsx scripts/check-citation-grain.ts [--root <workflows-dir>]
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, dirname, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { report, type Finding } from './guard-protocol.js';
import { resolveWorkflowsRoot } from './workflows-root.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolveWorkflowsRoot(resolve(join(DIR, '..', 'workflows')));

/** A markdown link whose target is a `.md` path, with or without a trailing `#anchor`. */
const LINK = /\[[^\]]*\]\(([^)\s]+?\.md)(#[^)\s]*)?\)/g;

function markdownFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) markdownFiles(p, out);
    else if (name.endsWith('.md')) out.push(p);
  }
  return out;
}

/** Sections a resource offers — a resource with fewer than two has no grain to choose. */
function sectionCount(path: string): number {
  try {
    return readFileSync(path, 'utf-8').split('\n').filter((l) => /^##\s+\S/.test(l)).length;
  } catch {
    return 0;
  }
}

function collect(root: string = ROOT): Finding[] {
  const findings: Finding[] = [];
  for (const file of markdownFiles(root)) {
    // The entry scopes the tell to a technique consulting a resource. A resource cross-referencing
    // a sibling, and a README introducing one, are the overview-prose carve-out it names.
    if (!file.includes(`${sep}techniques${sep}`) || file.endsWith('README.md')) continue;
    const text = readFileSync(file, 'utf-8');

    // target path -> the anchors this file cites it with; '' records a bare citation.
    // Anchors sharing a line with the bare citation are dropped: they are the same instruction.
    const cited = new Map<string, Set<string>>();
    const bareLines = new Map<string, Set<number>>();
    const lineOf = (index: number): number => text.slice(0, index).split('\n').length;
    for (const m of text.matchAll(LINK)) {
      const target = resolve(dirname(file), m[1]);
      const anchors = cited.get(target) ?? new Set<string>();
      if (!m[2]) {
        anchors.add('');
        const lines = bareLines.get(target) ?? new Set<number>();
        lines.add(lineOf(m.index));
        bareLines.set(target, lines);
      }
      cited.set(target, anchors);
    }
    for (const m of text.matchAll(LINK)) {
      if (!m[2]) continue;
      const target = resolve(dirname(file), m[1]);
      if (bareLines.get(target)?.has(lineOf(m.index))) continue;
      cited.get(target)?.add(m[2].slice(1));
    }

    for (const [target, anchors] of cited) {
      if (!anchors.has('') || anchors.size < 2) continue;
      // The entry is about a technique consulting a resource. A sibling operation cited both ways
      // is the composition question `technique-references-technique` owns, not a delivery one.
      if (!target.includes(`${sep}resources${sep}`)) continue;
      if (sectionCount(target) < 2) continue;
      const named = [...anchors].filter((a) => a !== '').sort();
      findings.push({
        check: 'citation-grain',
        site: relative(root, file),
        detail: `cites ${relative(root, target)} bare and by anchor (${named.join(', ')}) — both are delivered, so the file arrives alongside its own sections; anchor the bare citation or drop it`,
      });
    }
  }
  return findings;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  report('citation-grain', collect(), {
    okMessage: 'no file cites one resource both bare and by anchor',
    root: ROOT,
    remedy: 'anchor the bare citation at the section it reads, or drop it where the anchored ones already cover the need',
  });
}

export { collect };
