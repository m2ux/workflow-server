// Source addresses use the paired engine's installed YAML parser.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const input = JSON.parse(readFileSync(0, 'utf8'));
const require = createRequire(resolve(input.engine, 'package.json'));
const { parseDocument, isMap, isSeq, isScalar } = require('yaml');
const results = input.sources.map(({ path, text }) => {
  const doc = parseDocument(text, { keepSourceTokens: true, uniqueKeys: true });
  const nodes = [];
  const line = offset => text.slice(0, offset).split('\n').length;
  function visit(node, address, section) {
    if (!node) return;
    const range = node.range || [0, text.length];
    nodes.push({ address, section, start: line(range[0]),
      end: line(Math.max(range[0], range[1] - 1)),
      value: isScalar(node) ? node.value : null,
      container: isMap(node) || isSeq(node) });
    if (isMap(node)) {
      const seen = new Map();
      for (const pair of node.items) {
        const name = String(pair.key?.value ?? '?');
        const count = seen.get(name) || 0;
        seen.set(name, count + 1);
        const key = encodeURIComponent(name) + (count ? '~' + count : '');
        visit(pair.value, address + '/' + key, section || name);
      }
    } else if (isSeq(node)) {
      const seen = new Map();
      node.items.forEach((child, index) => {
        let name = String(index);
        if (isMap(child)) {
          const id = child.items.find(pair => ['id', 'name'].includes(pair.key?.value));
          if (id && isScalar(id.value)) name = 'id=' + encodeURIComponent(String(id.value.value));
        }
        const count = seen.get(name) || 0;
        seen.set(name, count + 1);
        visit(child, address + '/' + name + (count ? '~' + count : ''), section);
      });
    }
  }
  visit(doc.contents, '', '');
  let value = null;
  try { value = doc.toJS({ maxAliasCount: 100 }); } catch { /* Diagnostics retain the source. */ }
  return { path, nodes, value, errors: doc.errors.map(error => error.message) };
});
process.stdout.write(JSON.stringify(results));
