#!/usr/bin/env npx tsx
/**
 * Link checker for the documentation site (site/**\/*.html).
 *
 * Verifies that every internal href/src resolves to a file under site/, that
 * every fragment points at an existing element id in its target page, and
 * that every GitHub blob link into this repository points at a file that
 * exists in the working tree. External links to other hosts are not fetched.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { HTML_ATTR_RE } from './markdown-refs.js';

const ROOT = resolve(import.meta.dirname, '..');
const SITE_DIR = join(ROOT, 'site');
const GITHUB_PREFIX = 'https://github.com/m2ux/workflow-server/blob/main/';

function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: 'utf-8' })
    .filter(f => f.endsWith('.html'))
    .map(f => join(dir, f));
}

/**
 * An attribute value in any spelling HTML permits: double-quoted, single-quoted, or bare.
 *
 * Reading only double quotes leaves a destination written either other way unchecked, and an anchor
 * target written that way invisible — which then reads as an anchor nothing declares, so that direction
 * loses a real finding.
 *
 * Pairs are walked in order and the name is matched exactly. Order is what keeps a quoted value from
 * being mined: `alt="see id=phantom"` is consumed whole, where a whitespace-before-the-name test would
 * harvest the inner `id` and let a phantom anchor silence a genuine report. The pattern comes from
 * `markdown-refs`, which owns it — two copies of the same reader is what the extraction was against.
 */
function* attrValues(html: string, names: ReadonlySet<string>): Generator<string> {
  for (const [, name, quoted, single, bare] of html.matchAll(HTML_ATTR_RE)) {
    if (!names.has(name!.toLowerCase())) continue;
    const value = quoted ?? single ?? bare!;
    if (value !== '') yield value;
  }
}

const ID_ATTR = new Set(['id']);
const DEST_ATTRS = new Set(['href', 'src']);

function idsOf(filePath: string): Set<string> {
  const ids = new Set<string>();
  for (const value of attrValues(readFileSync(filePath, 'utf-8'), ID_ATTR)) ids.add(value);
  return ids;
}

/** Resolve a directory-style link target to its index.html. */
function asFile(path: string): string {
  return existsSync(path) && statSync(path).isDirectory() ? join(path, 'index.html') : path;
}

export function checkSiteLinks(): string[] {
  const errors: string[] = [];
  for (const file of htmlFiles(SITE_DIR)) {
    const page = relative(ROOT, file);
    const html = readFileSync(file, 'utf-8');
    for (const link of attrValues(html, DEST_ATTRS)) {
      if (link.startsWith(GITHUB_PREFIX)) {
        const repoPath = decodeURIComponent(link.slice(GITHUB_PREFIX.length)).split('#')[0]!;
        if (!existsSync(join(ROOT, repoPath))) {
          errors.push(`${page}: GitHub link target missing from repo: ${link}`);
        }
        continue;
      }
      if (/^[a-z][a-z0-9+.-]*:/i.test(link)) continue; // other absolute URLs: not fetched
      const [pathPart, fragment] = link.split('#') as [string, string?];
      const target = pathPart === '' ? file : asFile(resolve(dirname(file), pathPart));
      if (!existsSync(target)) {
        errors.push(`${page}: broken link: ${link}`);
        continue;
      }
      if (fragment !== undefined && target.endsWith('.html') && !idsOf(target).has(fragment)) {
        errors.push(`${page}: missing anchor #${fragment} in ${link}`);
      }
    }
  }
  return errors;
}

const isMain = process.argv[1] !== undefined && resolve(process.argv[1]) === resolve(import.meta.filename);
if (isMain) {
  const errors = checkSiteLinks();
  if (errors.length > 0) {
    for (const error of errors) console.error(`[FAIL] ${error}`);
    process.exit(1);
  }
  console.log('[PASS] All site links and anchors resolve');
}
