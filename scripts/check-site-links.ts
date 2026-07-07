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

const ROOT = resolve(import.meta.dirname, '..');
const SITE_DIR = join(ROOT, 'site');
const GITHUB_PREFIX = 'https://github.com/m2ux/workflow-server/blob/main/';

function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: 'utf-8' })
    .filter(f => f.endsWith('.html'))
    .map(f => join(dir, f));
}

function idsOf(filePath: string): Set<string> {
  const ids = new Set<string>();
  for (const match of readFileSync(filePath, 'utf-8').matchAll(/\bid="([^"]+)"/g)) {
    ids.add(match[1]!);
  }
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
    for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const link = match[1]!;
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
