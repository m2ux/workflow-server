import { describe, it, expect } from 'vitest';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import type { ZodTypeAny } from 'zod';
import {
  AUTHORED_KINDS,
  CANON_DEFINED_IDS,
  CANON_HOMES,
  DECLARATION_MARKER,
  WILDCARD_ID,
  checkFiresOn,
  collect,
  loadSchemas,
  readDeclarations,
  unresolvedSegment,
  type JsonSchema,
  type SchemaSet,
} from '../guards/check-fires-on-ids.js';
import { GENERATED_SCHEMAS, SCHEMAS_DIR } from '../scripts/generate-schemas.js';
import { UnreachableCorpusError } from '../guards/workflows-root.js';
import { liveCorpusRoot } from './corpus-root.js';

/**
 * fires-on-ids guard: every id a canon unit declares on its `**Fires on:**` line is a canon-defined
 * id, an authored kind, or a field path into that kind's generated schema. The ids are read against
 * the schema files, so a schema field renamed or removed fails every unit that still names it. These
 * fixtures seed ids of each form, and schema sets with a field deleted, and pin the verdict on each.
 */
describe('fires-on-ids guard', () => {
  const schemas = loadSchemas();
  const HOME = CANON_HOMES[0];
  const NON_ALONE_CANON_IDS = [...CANON_DEFINED_IDS].filter((id) => id !== WILDCARD_ID);

  function findingsFor(text: string, set: SchemaSet = schemas): ReturnType<typeof checkFiresOn> {
    return checkFiresOn([{ path: HOME, text }], set);
  }

  function unit(...ids: string[]): string {
    return `# Catalog\n\n### A unit\n\n${DECLARATION_MARKER} ${ids.map((id) => '`' + id + '`').join(', ')}\n\nBody.\n`;
  }

  function checksFor(...ids: string[]): string[] {
    return findingsFor(unit(...ids)).map((f) => f.check);
  }

  function cloned(): Map<string, JsonSchema> {
    return new Map([...schemas].map(([kind, schema]) => [kind, structuredClone(schema)]));
  }

  function definition(set: Map<string, JsonSchema>, kind: string): JsonSchema {
    return (set.get(kind)!['definitions'] as JsonSchema)[kind] as JsonSchema;
  }

  describe('loadSchemas', () => {
    it('loads the schema of each authored kind and no other', () => {
      expect([...schemas.keys()].sort()).toEqual([...AUTHORED_KINDS].sort());
    });

    it('loads nothing from a directory holding only non-authored schemas', () => {
      const dir = mkdtempSync(join(tmpdir(), 'wf-fires-on-schemas-'));
      try {
        copyFileSync(join(SCHEMAS_DIR, 'condition.schema.json'), join(dir, 'condition.schema.json'));
        copyFileSync(join(SCHEMAS_DIR, 'session-file.schema.json'), join(dir, 'session-file.schema.json'));
        expect(loadSchemas(dir).size).toBe(0);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  });

  describe('fails an id outside the kinds and the canon', () => {
    it('reports a seeded unknown id', () => {
      const findings = findingsFor(unit('nosuchschema.field'));
      expect(findings.map((f) => f.check)).toEqual(['unknown-id']);
      expect(findings[0]!.detail).toContain("'nosuchschema.field'");
    });

    it('reports a bare word that names neither a kind nor a canon-defined id', () => {
      expect(checksFor('resources')).toEqual(['unknown-id']);
      expect(checksFor('Activity')).toEqual(['unknown-id']);
    });

    it('rejects a generated schema that is not an authored kind, bare or as a path root', () => {
      expect(checksFor('condition', 'session-file', 'condition.type', 'session-file.variables'))
        .toEqual(['unknown-id', 'unknown-id', 'unknown-id', 'unknown-id']);
    });

    it('reports a path into a kind that names no field of it', () => {
      const findings = findingsFor(unit('activity.nosuchfield'));
      expect(findings.map((f) => f.check)).toEqual(['unresolved-path']);
      expect(findings[0]!.detail).toContain("at 'nosuchfield'");
    });

    it('fails an id naming a field once that field is removed from the schema', () => {
      const pruned = cloned();
      const properties = definition(pruned, 'technique')['properties'] as JsonSchema;
      expect(properties).toHaveProperty('rules');
      delete properties['rules'];

      expect(findingsFor(unit('technique.rules'))).toEqual([]);
      const findings = findingsFor(unit('technique.rules'), pruned);
      expect(findings.map((f) => f.check)).toEqual(['unresolved-path']);
      expect(findings[0]!.detail).toContain("at 'rules'");
      // The clone leaves the loaded set whole.
      expect(findingsFor(unit('technique.rules'))).toEqual([]);
    });

    it('resolves a field removed from one union variant while another declares it, and fails it once none does', () => {
      const pruned = cloned();
      const steps = (definition(pruned, 'activity')['properties'] as JsonSchema)['steps'] as JsonSchema;
      const variants = (steps['items'] as JsonSchema)['anyOf'] as JsonSchema[];
      const declaring = variants.filter((variant) => Object.hasOwn(variant['properties'] as JsonSchema, 'when'));
      expect(declaring.length).toBeGreaterThan(1);

      delete (declaring[0]!['properties'] as JsonSchema)['when'];
      expect(findingsFor(unit('activity.steps[].when'), pruned)).toEqual([]);

      for (const variant of declaring) delete (variant['properties'] as JsonSchema)['when'];
      expect(findingsFor(unit('activity.steps[].when'), pruned).map((f) => f.check)).toEqual(['unresolved-path']);
    });

    it('fails a path into a kind whose schema the set does not hold, while the bare kind passes', () => {
      const partial = new Map([...schemas].filter(([kind]) => kind !== 'technique'));
      expect(findingsFor(unit('technique.rules'), partial).map((f) => f.check)).toEqual(['unresolved-path']);
      expect(findingsFor(unit('technique'), partial)).toEqual([]);
    });
  });

  describe('passes each valid form', () => {
    it('passes each canon-defined id', () => {
      expect([...CANON_DEFINED_IDS].sort()).toEqual(['*', 'readme', 'resource']);
      expect(findingsFor(unit(...NON_ALONE_CANON_IDS))).toEqual([]);
      expect(findingsFor(unit(WILDCARD_ID))).toEqual([]);
    });

    it('passes every authored kind bare', () => {
      expect(findingsFor(unit(...AUTHORED_KINDS))).toEqual([]);
    });

    it('passes top-level and nested field paths', () => {
      expect(findingsFor(unit(
        'technique.rules',
        'workflow.rules.universal',
        'activity.steps[].when',
        'workflow.variables[].type',
        'activity.steps[].technique.inputs',
        'workflow.graph',
      ))).toEqual([]);
    });

    it('passes an array field named as itself', () => {
      expect(findingsFor(unit('activity.steps', 'workflow.variables', 'activity.steps[].steps', 'technique.protocol'))).toEqual([]);
    });

    it('passes a field only one union variant declares', () => {
      // `message` is declared by the checkpoint step alone, `loopType` by the loop step alone.
      expect(findingsFor(unit('activity.steps[].message', 'activity.steps[].loopType', 'routine.steps[].routine'))).toEqual([]);
      // `name` is declared only by the inline branch of a step's technique union.
      expect(findingsFor(unit('activity.steps[].technique.name'))).toEqual([]);
    });

    it('follows a recursive $ref into a loop body', () => {
      expect(findingsFor(unit('activity.steps[].steps[].when', 'activity.steps[].steps[].steps[].message'))).toEqual([]);
      expect(checksFor('activity.steps[].steps[].nosuch')).toEqual(['unresolved-path']);
    });

    it('reads a declaration ended by CRLF', () => {
      expect(findingsFor('### A unit\r\n\r\n**Fires on:** `nosuch.id`\r\n').map((f) => f.check)).toEqual(['unknown-id']);
      expect(findingsFor('### A unit\r\n\r\n**Fires on:** `technique.rules`\r\n')).toEqual([]);
    });

    it('trims whitespace inside a code span', () => {
      expect(findingsFor('### A unit\n\n**Fires on:** ` technique.rules `, `resource`\n')).toEqual([]);
    });
  });

  /**
   * enforcement.json keys its annotated fields by the same grammar, so every key it holds for an
   * authored kind must read as a valid id; a key that did not would mean the guard's grammar and the
   * enforcement walk differ.
   */
  it('resolves every enforcement.json key of an authored kind read as an id', () => {
    const enforcement = JSON.parse(readFileSync(join(SCHEMAS_DIR, 'enforcement.json'), 'utf-8')) as Record<string, Record<string, unknown>>;
    expect(Object.keys(enforcement).filter((kind) => !(AUTHORED_KINDS as readonly string[]).includes(kind))).toEqual([]);
    const ids = Object.entries(enforcement).flatMap(([kind, keys]) => Object.keys(keys).map((key) => `${kind}.${key}`));
    expect(ids.length).toBeGreaterThan(50);
    const unresolved = ids.filter((id) => {
      const dot = id.indexOf('.');
      return unresolvedSegment(schemas.get(id.slice(0, dot))!, id.slice(dot + 1)) !== null;
    });
    expect(unresolved).toEqual([]);
    expect(findingsFor(unit(...ids))).toEqual([]);
  });

  /**
   * The Zod schemas are what the JSON schemas are generated from. Walking them the way
   * src/schema/enforcement.ts walks them — an object field is a dot segment, an array's elements are
   * `[]`, every union branch contributes, a record ends the path — names every field path an author can
   * write. The guard accepts exactly those: each one resolves, and every other path a known property
   * name could spell beside them does not.
   */
  describe('agrees with the Zod schemas', () => {
    const WRAPPERS = new Set(['ZodOptional', 'ZodNullable', 'ZodDefault', 'ZodEffects', 'ZodLazy', 'ZodBranded']);
    const LEAVES = new Set(['ZodBoolean', 'ZodEnum', 'ZodLiteral', 'ZodNull', 'ZodNumber', 'ZodRecord', 'ZodString', 'ZodUnknown']);

    interface ZodPaths {
      /** Every field path, an array field named without `[]`. */
      fields: Set<string>;
      /** Node paths (a field, or an array field's `[]`) whose schema recurs above them, so the walk stops there. */
      recurs: Set<string>;
      /** Every property name any object declares. */
      names: Set<string>;
      /** Core type names the walk met that it neither enters nor knows as a leaf. */
      unknown: Set<string>;
    }

    function unwrap(schema: ZodTypeAny): ZodTypeAny {
      let current = schema;
      while (WRAPPERS.has(current._def.typeName as string)) {
        const typeName = current._def.typeName as string;
        if (typeName === 'ZodEffects') current = current._def.schema as ZodTypeAny;
        else if (typeName === 'ZodLazy') current = (current._def.getter as () => ZodTypeAny)();
        else if (typeName === 'ZodBranded') current = current._def.type as ZodTypeAny;
        else current = current._def.innerType as ZodTypeAny;
      }
      return current;
    }

    function walk(schema: ZodTypeAny, path: string, above: ZodTypeAny[], out: ZodPaths): void {
      const core = unwrap(schema);
      if (above.includes(core)) { out.recurs.add(path); return; }
      const typeName = core._def.typeName as string;
      const inner = [...above, core];
      if (typeName === 'ZodObject') {
        for (const [key, child] of Object.entries((core as unknown as { shape: Record<string, ZodTypeAny> }).shape)) {
          const field = path ? `${path}.${key}` : key;
          out.names.add(key);
          out.fields.add(field);
          walk(child, field, inner, out);
        }
      } else if (typeName === 'ZodArray') {
        walk(core._def.type as ZodTypeAny, `${path}[]`, inner, out);
      } else if (typeName === 'ZodUnion' || typeName === 'ZodDiscriminatedUnion') {
        for (const option of core._def.options as ZodTypeAny[]) walk(option, path, above, out);
      } else if (!LEAVES.has(typeName)) {
        out.unknown.add(typeName);
      }
    }

    const walks = new Map(GENERATED_SCHEMAS
      .filter((entry) => (AUTHORED_KINDS as readonly string[]).includes(entry.name))
      .map((entry) => {
        const out: ZodPaths = { fields: new Set(), recurs: new Set(), names: new Set(), unknown: new Set() };
        walk(entry.schema as ZodTypeAny, '', [], out);
        return [entry.name, out] as const;
      }));

    it('walks every authored kind through constructs it knows', () => {
      expect([...walks.keys()].sort()).toEqual([...AUTHORED_KINDS].sort());
      for (const [kind, out] of walks) {
        expect(out.unknown, kind).toEqual(new Set());
        expect(out.fields.size, kind).toBeGreaterThan(5);
      }
    });

    it.each([...AUTHORED_KINDS])('resolves every field path the %s Zod schema declares', (kind) => {
      const json = schemas.get(kind)!;
      const { fields } = walks.get(kind)!;
      expect([...fields].filter((path) => unresolvedSegment(json, path) !== null)).toEqual([]);
    });

    it.each([...AUTHORED_KINDS])('resolves no other path beside a %s field', (kind) => {
      const json = schemas.get(kind)!;
      const { fields, recurs, names } = walks.get(kind)!;
      const vocabulary = [...names, 'zz_absent', 'definitions', 'properties', 'items'];
      const accepted: string[] = [];
      const check = (path: string): void => {
        if (!fields.has(path) && unresolvedSegment(json, path) === null) accepted.push(path);
      };
      for (const name of vocabulary) check(name);
      for (const field of fields) {
        check(`${field}[]`);
        for (const name of vocabulary) {
          if (!recurs.has(field)) check(`${field}.${name}`);
          if (!recurs.has(`${field}[]`)) check(`${field}[].${name}`);
        }
      }
      expect(accepted).toEqual([]);
    });
  });

  describe('holds the path grammar', () => {
    it('fails a path that omits [] at an array before a further field', () => {
      expect(checksFor('activity.steps.when')).toEqual(['unresolved-path']);
      expect(unresolvedSegment(schemas.get('activity')!, 'steps.when')).toBe('when');
    });

    it('fails a path that ends with []', () => {
      expect(checksFor('activity.steps[]')).toEqual(['unresolved-path']);
      expect(checksFor('workflow.variables[]')).toEqual(['unresolved-path']);
      expect(checksFor('activity.steps[].steps[]')).toEqual(['unresolved-path']);
      expect(unresolvedSegment(schemas.get('activity')!, 'steps[]')).toBe('steps[]');
    });

    it('fails [] after a non-array', () => {
      expect(checksFor('activity.id[]')).toEqual(['unresolved-path']);
      expect(checksFor('activity.id[].x')).toEqual(['unresolved-path']);
      expect(checksFor('activity.steps[][].when')).toEqual(['unresolved-path']);
      expect(unresolvedSegment(schemas.get('activity')!, 'id[]')).toBe('id[]');
    });

    it('does not step into a record', () => {
      expect(checksFor('workflow.graph.anything')).toEqual(['unresolved-path']);
      expect(checksFor('technique.rules.anything')).toEqual(['unresolved-path']);
      expect(checksFor('technique.rules[].anything')).toEqual(['unresolved-path']);
      expect(checksFor('activity.steps[].technique.inputs.anything')).toEqual(['unresolved-path']);
    });

    it('fails a trailing dot or an empty segment', () => {
      expect(checksFor('activity.')).toEqual(['unresolved-path']);
      expect(checksFor('activity.steps[].')).toEqual(['unresolved-path']);
      expect(checksFor('activity..id')).toEqual(['unresolved-path']);
      expect(unresolvedSegment(schemas.get('activity')!, 'steps[].')).toBe('');
    });

    it('fails a malformed segment and an id led by a dot', () => {
      expect(checksFor('activity.steps[]when')).toEqual(['unresolved-path']);
      expect(checksFor('activity.ste[ps')).toEqual(['unresolved-path']);
      expect(checksFor('.activity')).toEqual(['unknown-id']);
    });

    it('does not read a schema file keyword as a field', () => {
      expect(checksFor('activity.definitions')).toEqual(['unresolved-path']);
      expect(checksFor('activity.properties')).toEqual(['unresolved-path']);
    });
  });

  describe('holds each id to once on its line', () => {
    it('reports * declared beside another id, once per line', () => {
      const findings = findingsFor(unit('resource', WILDCARD_ID, 'readme'));
      expect(findings.map((f) => f.check)).toEqual(['wildcard-not-alone']);
      expect(findings[0]!.site).toBe(`${HOME}:5`);
      expect(checksFor(WILDCARD_ID, 'nosuch.id')).toEqual(['wildcard-not-alone', 'unknown-id']);
    });

    it('reports an id repeated on its line once, however often it repeats', () => {
      expect(checksFor('resource', 'resource', 'resource')).toEqual(['duplicate-id']);
      expect(checksFor('resource', 'readme', 'resource', 'readme')).toEqual(['duplicate-id', 'duplicate-id']);
      expect(findingsFor(unit('resource', 'resource'))[0]!.detail).toBe("'A unit' declares 'resource' more than once");
    });

    it('judges a repeated id once and reports the repeat', () => {
      expect(checksFor('nosuch.id', 'nosuch.id')).toEqual(['unknown-id', 'duplicate-id']);
    });

    it('takes ids differing only in span padding as the same id', () => {
      expect(findingsFor('### A unit\n\n**Fires on:** `resource`, ` resource `\n').map((f) => f.check)).toEqual(['duplicate-id']);
    });

    it('reports a repeated * as both beside another id and repeated', () => {
      expect(checksFor(WILDCARD_ID, WILDCARD_ID)).toEqual(['wildcard-not-alone', 'duplicate-id']);
    });

    it('holds ids once per line, not once per home', () => {
      expect(findingsFor(`${unit('resource')}\n### Another unit\n\n**Fires on:** \`resource\`\n`)).toEqual([]);
    });
  });

  describe('reads only declaration lines', () => {
    it('reports a declaration holding no code span', () => {
      const findings = findingsFor('# Catalog\n\n### A unit\n\n**Fires on:** everything\n');
      expect(findings.map((f) => f.check)).toEqual(['malformed-declaration']);
      expect(findings[0]!.detail).toContain("'**Fires on:** everything'");
    });

    it('reports a declaration with nothing after the marker', () => {
      expect(findingsFor('### A unit\n\n**Fires on:**\n').map((f) => f.check)).toEqual(['malformed-declaration']);
      expect(findingsFor('### A unit\n\n**Fires on:**   \n').map((f) => f.check)).toEqual(['malformed-declaration']);
    });

    it('reports a bare id after a code span rather than leaving it unchecked', () => {
      const findings = findingsFor('### A unit\n\n**Fires on:** `technique.rules`, activity.steps[].when\n');
      expect(findings.map((f) => f.check)).toEqual(['malformed-declaration']);
    });

    it('reports ids joined by a word rather than a comma', () => {
      expect(findingsFor('### A unit\n\n**Fires on:** `technique.rules` and `resource`\n').map((f) => f.check))
        .toEqual(['malformed-declaration']);
    });

    it('reports a double-backtick code span', () => {
      expect(findingsFor('### A unit\n\n**Fires on:** ``technique.rules``\n').map((f) => f.check))
        .toEqual(['malformed-declaration']);
    });

    it('checks no id on a malformed line', () => {
      expect(findingsFor('### A unit\n\n**Fires on:** `nosuch.id`; `other.id`\n').map((f) => f.check))
        .toEqual(['malformed-declaration']);
    });

    it('reports a code span holding only whitespace', () => {
      expect(findingsFor('### A unit\n\n**Fires on:** ` `\n').map((f) => f.check)).toEqual(['malformed-declaration']);
      expect(findingsFor('### A unit\n\n**Fires on:** `resource`, `  `\n').map((f) => f.check)).toEqual(['malformed-declaration']);
    });

    it('accepts any whitespace around the separating commas', () => {
      expect(findingsFor('### A unit\n\n**Fires on:**`resource` ,`readme`,  `technique.rules`  \n')).toEqual([]);
    });

    it.each([
      ['one leading space', ' **Fires on:** `resource`'],
      ['three leading spaces', '   **Fires on:** `resource`'],
      ['a quote marker', '> **Fires on:** `resource`'],
      ['a nested quote marker', '> > **Fires on:** `resource`'],
      ['a dash bullet', '- **Fires on:** `resource`'],
      ['a star bullet', '* **Fires on:** `resource`'],
      ['a plus bullet', '+ **Fires on:** `resource`'],
      ['an ordered bullet with a dot', '1. **Fires on:** `resource`'],
      ['an ordered bullet with a parenthesis', '12) **Fires on:** `resource`'],
      ['a quoted bullet', '> - **Fires on:** `resource`'],
      ['underscore bold', '__Fires on:__ `resource`'],
      ['lower case', '**fires on:** `resource`'],
      ['title case', '**Fires On:** `resource`'],
      ['upper case', '**FIRES ON:** `resource`'],
      ['the colon outside the bold', '**Fires on**: `resource`'],
      ['no colon', '**Fires on** `resource`'],
      ['a space before the colon', '**Fires on :** `resource`'],
      ['a doubled space', '**Fires  on:** `resource`'],
      ['a space inside the bold', '** Fires on:** `resource`'],
      ['star italic', '*Fires on:* `resource`'],
      ['underscore italic', '_Fires on:_ `resource`'],
      ['star bold italic', '***Fires on:*** `resource`'],
      ['underscore bold italic', '___Fires on:___ `resource`'],
      ['a space inside the bold italic', '*** Fires on:*** `resource`'],
      ['a bulleted italic', '- *Fires on:* `resource`'],
      ['a star-bulleted italic', '* *Fires on:* `resource`'],
      ['a quoted italic', '> _fires on:_ `resource`'],
    ])('reports a near-miss marker: %s', (_, line) => {
      const findings = findingsFor(`### A unit\n\n${line}\n`);
      expect(findings.map((f) => f.check)).toEqual(['malformed-declaration']);
      expect(findings[0]!.site).toBe(`${HOME}:3`);
      expect(findings[0]!.detail).toContain(`'${line}'`);
    });

    it('checks no id behind a near-miss marker', () => {
      expect(findingsFor('### A unit\n\n- **Fires on:** `nosuch.id`\n').map((f) => f.check)).toEqual(['malformed-declaration']);
    });

    it('does not read a marker that does not open its line', () => {
      expect(findingsFor('### A unit\n\nIt reads as in **Fires on:** `nosuch.id`.\n')).toEqual([]);
      expect(findingsFor('### A unit\n\n| **Fires on:** | `nosuch.id` |\n')).toEqual([]);
    });

    it('does not read a line indented as code', () => {
      expect(findingsFor('### A unit\n\n    **Fires on:** `nosuch.id`\n')).toEqual([]);
    });

    it('does not read bold prose that only mentions the line', () => {
      expect(findingsFor('### A unit\n\n**Fires-on line.** Each unit names its constructs.\n')).toEqual([]);
      expect(findingsFor('### A unit\n\n**Fires once** per activity.\n')).toEqual([]);
      expect(findingsFor('### A unit\n\n**Fires only** when gated.\n')).toEqual([]);
      expect(findingsFor('### A unit\n\n**Fires once** per run.\n')).toEqual([]);
      expect(findingsFor('### A unit\n\n*Fires once* per run.\n')).toEqual([]);
    });

    it('does not read a list item whose text opens with the words', () => {
      expect(findingsFor('### A unit\n\n* fires on every edit\n')).toEqual([]);
      expect(findingsFor('### A unit\n\n_ fires on every edit\n')).toEqual([]);
      expect(findingsFor('### A unit\n\n- fires on every edit\n')).toEqual([]);
      expect(findingsFor('### A unit\n\nFires on every edit.\n')).toEqual([]);
    });

    it('does not read a declaration inside a fenced block', () => {
      expect(findingsFor('### A unit\n\n```markdown\n**Fires on:** `nosuch.id`\n**Fires on:** none\n- **Fires on:** `x`\n```\n')).toEqual([]);
      expect(findingsFor('### A unit\n\n~~~\n**Fires on:** `nosuch.id`\n~~~\n')).toEqual([]);
    });

    it('reads a declaration after a fenced block closes', () => {
      const text = '### A unit\n\n```\n**Fires on:** `nosuch.id`\n```\n\n**Fires on:** `other.id`\n';
      const findings = findingsFor(text);
      expect(findings.map((f) => f.check)).toEqual(['unknown-id']);
      expect(findings[0]!.site).toBe(`${HOME}:7`);
    });

    it('reads through an unclosed fence so it cannot hide a declaration', () => {
      const findings = findingsFor('### A unit\n\n```\n**Fires on:** `nosuch.id`\n');
      expect(findings.map((f) => f.check)).toEqual(['unknown-id']);
    });

    it('reports each bad id on a line and passes the good ones beside it', () => {
      const findings = findingsFor(unit('resource', 'nosuch.id', 'activity.steps[].when', 'activity.nosuch'));
      expect(findings.map((f) => f.check)).toEqual(['unknown-id', 'unresolved-path']);
    });
  });

  describe('passes over front matter and a byte-order mark', () => {
    const FRONT = '---\nname: anti-patterns\n# a YAML comment\n**Fires on:** `nosuch.id`\n- **Fires on:** `x`\n---\n';

    it('skips front matter, its comment and a declaration inside it', () => {
      const findings = findingsFor(`${FRONT}\n### Real unit\n\n**Fires on:** \`other.id\`\n`);
      expect(findings.map((f) => [f.check, f.site])).toEqual([['unknown-id', `${HOME}:10`]]);
      expect(findings[0]!.detail).toContain("'Real unit'");
    });

    it('names a declaration after front matter but above every heading as having none', () => {
      const findings = findingsFor(`${FRONT}**Fires on:** \`other.id\`\n`);
      expect(findings.map((f) => f.site)).toEqual([`${HOME}:7`]);
      expect(findings[0]!.detail).toContain("'(no heading)'");
    });

    it('accepts a front matter block closed by ...', () => {
      expect(findingsFor('---\n# comment\n...\n\n### Unit\n\n**Fires on:** `resource`\n')).toEqual([]);
    });

    it('reads a block that does not open the file as markdown', () => {
      const findings = findingsFor('### Unit\n\n---\n**Fires on:** `nosuch.id`\n---\n');
      expect(findings.map((f) => f.check)).toEqual(['unknown-id']);
    });

    it('does not let a fence in front matter un-fence the body', () => {
      const STRAY = '---\nexample: |\n  ```\n---\n';
      const findings = findingsFor(`${STRAY}\n### Unit\n\n\`\`\`\n**Fires on:** \`shown.id\`\n\`\`\`\n`);
      expect(findings).toEqual([]);
    });

    it('does not let a fence in front matter fence the body', () => {
      const STRAY = '---\nexample: |\n  ```\n---\n';
      const findings = findingsFor(`${STRAY}\n### Unit\n\n**Fires on:** \`nosuch.id\`\n\n\`\`\`\nshown\n\`\`\`\n`);
      expect(findings.map((f) => [f.check, f.site])).toEqual([['unknown-id', `${HOME}:8`]]);
    });

    it('sites a body fence at its absolute line after front matter', () => {
      const findings = findingsFor('---\nx: 1\n---\n```\n**Fires on:** `shown.id`\n```\n**Fires on:** `nosuch.id`\n');
      expect(findings.map((f) => f.site)).toEqual([`${HOME}:7`]);
    });

    it('reads an unclosed front matter block as markdown', () => {
      const findings = findingsFor('---\n# comment\n\n**Fires on:** `nosuch.id`\n');
      expect(findings.map((f) => f.check)).toEqual(['unknown-id']);
      expect(findings[0]!.detail).toContain("'comment'");
    });

    it('strips a leading byte-order mark', () => {
      expect(findingsFor('\uFEFF**Fires on:** `resource`\n')).toEqual([]);
      const findings = findingsFor('\uFEFF### Unit\n\n**Fires on:** `nosuch.id`\n');
      expect(findings.map((f) => f.site)).toEqual([`${HOME}:3`]);
      expect(findings[0]!.detail).toContain("'Unit'");
    });

    it('skips front matter behind a byte-order mark', () => {
      expect(findingsFor(`\uFEFF${FRONT}\n### Unit\n\n**Fires on:** \`resource\`\n`)).toEqual([]);
    });
  });

  describe('readDeclarations', () => {
    it('returns each declaration with its unit, absolute line and ids in written order, repeats kept', () => {
      const text = '---\ntitle: x\n---\n\n# Catalog\n\n### First\n\n**Fires on:** `technique.rules`, `resource`, `technique.rules`\n\n'
        + '### Second\n\n- **Fires on:** `x`\n\n**Fires on:** `*`\n';
      expect(readDeclarations(text)).toEqual({
        declarations: [
          { unit: 'First', line: 9, ids: ['technique.rules', 'resource', 'technique.rules'] },
          { unit: 'Second', line: 15, ids: ['*'] },
        ],
        malformed: [{ unit: 'Second', line: 13, text: '- **Fires on:** `x`' }],
      });
    });

    it('trims span padding from ids and trailing space from malformed text', () => {
      expect(readDeclarations('**Fires on:** ` resource `\n**Fires on:** none   \n')).toEqual({
        declarations: [{ unit: '(no heading)', line: 1, ids: ['resource'] }],
        malformed: [{ unit: '(no heading)', line: 2, text: '**Fires on:** none' }],
      });
    });

    it('reads nothing from text with no declaration', () => {
      expect(readDeclarations('# Title\n\nProse.\n')).toEqual({ declarations: [], malformed: [] });
    });
  });

  describe('sites a finding', () => {
    it('at home:line, naming the unit by its nearest heading', () => {
      const text = '# Catalog\n\n## Group\n\n### AP-01. first-unit\n\nOpening.\n\n**Fires on:** `resource`\n\n**Detect:** Fine.\n\n'
        + '### AP-02. second-unit\n\nOpening.\n\n**Fires on:** `nosuch.id`\n\n**Detect:** Fine.\n';
      const findings = findingsFor(text);
      expect(findings).toHaveLength(1);
      expect(findings[0]!.site).toBe(`${HOME}:17`);
      expect(findings[0]!.detail).toContain("'AP-02. second-unit'");
    });

    it('does not take a heading inside a fenced block as the unit', () => {
      const findings = findingsFor('### Real unit\n\n```\n### Shown heading\n```\n\n**Fires on:** `nosuch.id`\n');
      expect(findings[0]!.detail).toContain("'Real unit'");
    });

    it('names a declaration above every heading as having none', () => {
      const findings = findingsFor('**Fires on:** `nosuch.id`\n');
      expect(findings[0]!.site).toBe(`${HOME}:1`);
      expect(findings[0]!.detail).toContain("'(no heading)'");
    });

    it('in the home the declaration was read from', () => {
      const findings = checkFiresOn([
        { path: CANON_HOMES[1], text: unit('resource') },
        { path: CANON_HOMES[2], text: unit('nosuch.id') },
      ], schemas);
      expect(findings.map((f) => f.site)).toEqual([`${CANON_HOMES[2]}:5`]);
    });

    /** A detail names the unit and the id; the lists of valid ids live in the remedy, so a detail is stable as they grow. */
    it('with a detail carrying the unit and the id and no list of valid ids', () => {
      const details = findingsFor(unit('nosuch.id', 'activity.nosuch', 'condition', WILDCARD_ID)).map((f) => f.detail);
      expect(details).toEqual([
        "'A unit' declares '*' beside other ids",
        "'A unit' fires on 'nosuch.id', which is not a canon-defined id, an authored kind, or a path rooted at one",
        "'A unit' fires on 'activity.nosuch', which reaches no field of the activity schema at 'nosuch'",
        "'A unit' fires on 'condition', which is not a canon-defined id, an authored kind, or a path rooted at one",
      ]);
      for (const detail of details) {
        for (const kind of AUTHORED_KINDS.filter((k) => k !== 'activity')) expect(detail).not.toContain(kind);
        expect(detail).not.toContain('readme');
      }
    });
  });

  describe('collect', () => {
    function withCorpus(homes: Record<string, string>, run: (root: string) => void): void {
      const root = mkdtempSync(join(tmpdir(), 'wf-fires-on-'));
      try {
        for (const [path, text] of Object.entries(homes)) {
          mkdirSync(dirname(join(root, path)), { recursive: true });
          writeFileSync(join(root, path), text, 'utf-8');
        }
        run(root);
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    }

    it('reads every canon home', () => {
      const homes = Object.fromEntries(CANON_HOMES.map((path) => [path, unit('nosuch.id')]));
      withCorpus(homes, (root) => {
        expect(collect(root).map((f) => f.site)).toEqual(CANON_HOMES.map((path) => `${path}:5`));
      });
    });

    it('reports a canon home the corpus does not hold', () => {
      withCorpus({ [CANON_HOMES[0]]: unit('resource'), [CANON_HOMES[2]]: unit('resource') }, (root) => {
        const findings = collect(root);
        expect(findings.map((f) => [f.check, f.site])).toEqual([['missing-home', CANON_HOMES[1]]]);
      });
    });

    it('refuses a corpus holding no canon home as unmeasured rather than passing', () => {
      withCorpus({}, (root) => {
        expect(() => collect(root)).toThrow(UnreachableCorpusError);
        expect(() => collect(root)).toThrow(/no canon homes found/);
      });
    });

    it('refuses a schemas directory holding no schema rather than passing', () => {
      withCorpus(Object.fromEntries(CANON_HOMES.map((path) => [path, unit('activity')])), (root) => {
        expect(() => collect(root, join(root, 'no-schemas'))).toThrow(/no generated schemas found/);
      });
    });

    it.skipIf(!liveCorpusRoot())('holds the corpus clean', () => {
      expect(collect(liveCorpusRoot()!)).toEqual([]);
    });
  });

  describe('requires one Fires-on line under each unit title', () => {
    const anti = CANON_HOMES[0];
    const principles = CANON_HOMES[1];
    const conventions = CANON_HOMES[2];

    function checks(path: string, text: string): string[] {
      return checkFiresOn([{ path, text }], schemas).map((finding) => finding.check);
    }

    it('fails an anti-pattern entry that carries no line, and passes a family heading and a Creation Rule', () => {
      const text = [
        '## Structural',
        '',
        'File smells.',
        '',
        '### Smell not stance',
        '',
        'An entry detects one defect.',
        '',
        '### AP-01. no-inline-content',
        '',
        '"Let me just inline that"',
      ].join('\n');
      const findings = checkFiresOn([{ path: anti, text }], schemas);
      expect(findings.map((finding) => [finding.check, finding.site])).toEqual([
        ['missing-line', `${anti}:9`],
      ]);
      expect(findings[0]!.detail).toContain("'AP-01. no-inline-content'");
    });

    it('fails a numbered principle and a convention section that carry no line, and passes the overview', () => {
      expect(checks(principles, '# Overview\n\nThe canon.\n\n## 1. Workflows Ossify Patterns\n\nA graph.\n'))
        .toEqual(['missing-line']);
      expect(checks(conventions, '# Convention Conformance\n\n## Reference Conventions\n\n| Concern |\n')).toEqual(['missing-line']);
    });

    it('fails a second line, and a line that leads the entry', () => {
      const repeated = '### AP-01. name\n\n"quote"\n\n**Fires on:** `activity`\n\n**Detect:** The mismatch.\n\n**Fires on:** `technique`\n';
      expect(checks(anti, repeated)).toEqual(['repeated-line']);
      const leading = '### AP-01. name\n\n**Fires on:** `activity`\n\n"quote"\n\n**Detect:** The mismatch.\n';
      const findings = checkFiresOn([{ path: anti, text: leading }], schemas);
      expect(findings.map((finding) => finding.check)).toEqual(['misplaced-line']);
      expect(findings[0]!.detail).toContain('before Detect');
    });

    it('accepts one line after the opening prose and before Detect', () => {
      const text = '### AP-01. name\n\n"quote"\n\nThe failure.\n\n**Fires on:** `activity`, `technique`\n\n**Detect:** The mismatch.\n';
      expect(checks(anti, text)).toEqual([]);
    });

    it('accepts a principle line after its prose, and a convention line under its title', () => {
      expect(checks(principles, '## 1. Name\n\nA graph.\n\n**Fires on:** `workflow`\n')).toEqual([]);
      expect(checks(principles, '## 1. Name\n\n**Fires on:** `workflow`\n\nA graph.\n')).toEqual(['misplaced-line']);
      expect(checks(conventions, '## Reference Conventions\n\n**Fires on:** `workflow`\n\n| Concern |\n')).toEqual([]);
    });
  });
});
