#!/usr/bin/env npx tsx
/**
 * Guard over the generated JSON Schema files.
 *
 * `schemas/` is what an authoring client validates a definition against, and the files are rendered
 * from the Zod sources in `src/schema/`. A schema change that never reached `schemas/` therefore
 * reaches an author as their own file being wrong — a spurious authoring error, at a remove from the
 * change that caused it, with nothing pointing back to it.
 *
 * The subject is the files the generator writes, read from its own declared list. A schema file in
 * `schemas/` that is not in that list is reported, so a file added beside the generated set is not
 * ignored.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { GENERATED_SCHEMAS, SCHEMAS_DIR, renderSchema, schemaPath } from '../scripts/generate-schemas.js';
import { report, type Finding } from './guard-protocol.js';

const ROOT = resolve(import.meta.dirname, '..');

export function collectStaleSchemas(): Finding[] {
  const findings: Finding[] = [];
  const generated = new Set<string>();

  for (const entry of GENERATED_SCHEMAS) {
    const file = `${entry.name}.schema.json`;
    generated.add(file);
    const path = schemaPath(entry.name);
    if (!existsSync(path)) {
      findings.push({
        check: 'schema-missing',
        site: `schemas/${file}`,
        detail: `${entry.name} is generated from its Zod source and no file exists for it`,
      });
      continue;
    }
    if (readFileSync(path, 'utf-8') === renderSchema(entry)) continue;
    findings.push({
      check: 'schema-stale',
      site: `schemas/${file}`,
      detail: `${file} does not match the Zod schema it is generated from — the source changed and the file did not`,
    });
  }

  for (const file of readdirSync(SCHEMAS_DIR)) {
    if (!file.endsWith('.schema.json')) continue;
    if (generated.has(file)) continue;
    findings.push({
      check: 'schema-unaccounted',
      site: `schemas/${file}`,
      detail: `${file} is not in the generator's list, so nothing checks it`,
    });
  }
  return findings;
}

// Only when run as a script: importing this module for its exports must not report or exit.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  report('generated-schemas', collectStaleSchemas(), {
    okMessage: 'every generated schema file matches the Zod source it is rendered from',
    root: ROOT,
    remedy: "run 'npm run build:schemas' and commit the regenerated files",
  });
}
