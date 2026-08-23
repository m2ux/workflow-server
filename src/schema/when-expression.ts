/**
 * Reference `when` expression dialect — parse, evaluate, and authoring checks.
 *
 * Grammar (C-style precedence, tightest first):
 *   primary     := IDENT | comparison | '(' orExpr ')'
 *   unary       := '!' unary | primary
 *   comparison  := IDENT ('==' | '!=' | '>' | '<' | '>=' | '<=') literal
 *   andExpr     := unary ('&&' unary)*
 *   orExpr      := andExpr ('||' andExpr)*
 *
 * Identifiers are dotted bag paths (`a.b.c`). Literals: true/false/null, quoted
 * strings, integers. Bare identifiers evaluate as truthiness. Numeric
 * comparators coerce both sides with Number() when finite.
 *
 * Authoring rule: mixing `&&` and `||` at the same nesting depth requires
 * parentheses so grouping is explicit (precedence is still defined for eval).
 *
 * Invalid / unparseable input fails closed (evaluate → false).
 */

export type CmpOp = '==' | '!=' | '>' | '<' | '>=' | '<=';

export type WhenAst =
  | { kind: 'literal'; value: boolean }
  | { kind: 'truthy'; path: string }
  | { kind: 'cmp'; path: string; op: CmpOp; value: unknown }
  | { kind: 'not'; expr: WhenAst }
  | { kind: 'and'; left: WhenAst; right: WhenAst }
  | { kind: 'or'; left: WhenAst; right: WhenAst };

export type ParseWhenResult =
  | { ok: true; ast: WhenAst }
  | { ok: false; error: string };

export type AuthoringResult =
  | { ok: true }
  | { ok: false; error: string };

type Tok =
  | { t: 'id'; v: string }
  | { t: 'lit'; v: unknown }
  | { t: 'op'; v: CmpOp | '&&' | '||' | '!' | '(' | ')' };

function tokenize(src: string): Tok[] | string {
  const tokens: Tok[] = [];
  let i = 0;
  const s = src;
  while (i < s.length) {
    const c = s[i]!;
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (c === '(' || c === ')') {
      tokens.push({ t: 'op', v: c });
      i++;
      continue;
    }
    if (c === '!' && s[i + 1] !== '=') {
      tokens.push({ t: 'op', v: '!' });
      i++;
      continue;
    }
    if (c === '&' && s[i + 1] === '&') {
      tokens.push({ t: 'op', v: '&&' });
      i += 2;
      continue;
    }
    if (c === '|' && s[i + 1] === '|') {
      tokens.push({ t: 'op', v: '||' });
      i += 2;
      continue;
    }
    if (c === '=' && s[i + 1] === '=') {
      tokens.push({ t: 'op', v: '==' });
      i += 2;
      continue;
    }
    if (c === '!' && s[i + 1] === '=') {
      tokens.push({ t: 'op', v: '!=' });
      i += 2;
      continue;
    }
    if (c === '>' && s[i + 1] === '=') {
      tokens.push({ t: 'op', v: '>=' });
      i += 2;
      continue;
    }
    if (c === '<' && s[i + 1] === '=') {
      tokens.push({ t: 'op', v: '<=' });
      i += 2;
      continue;
    }
    if (c === '>') {
      tokens.push({ t: 'op', v: '>' });
      i++;
      continue;
    }
    if (c === '<') {
      tokens.push({ t: 'op', v: '<' });
      i++;
      continue;
    }
    if (c === '"' || c === "'") {
      const q = c;
      let j = i + 1;
      let out = '';
      while (j < s.length && s[j] !== q) {
        if (s[j] === '\\' && j + 1 < s.length) {
          out += s[j + 1];
          j += 2;
          continue;
        }
        out += s[j];
        j++;
      }
      if (j >= s.length) return `unclosed string starting at ${i}`;
      tokens.push({ t: 'lit', v: out });
      i = j + 1;
      continue;
    }
    if (/[-\d]/.test(c) && (c !== '-' || /\d/.test(s[i + 1] ?? ''))) {
      let j = i;
      if (s[j] === '-') j++;
      while (j < s.length && /\d/.test(s[j]!)) j++;
      if (j === i || (s[i] === '-' && j === i + 1)) {
        /* fall through to ident/error */
      } else {
        tokens.push({ t: 'lit', v: Number(s.slice(i, j)) });
        i = j;
        continue;
      }
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i + 1;
      while (j < s.length && /[A-Za-z0-9_.]/.test(s[j]!)) j++;
      const word = s.slice(i, j);
      if (word === 'true') tokens.push({ t: 'lit', v: true });
      else if (word === 'false') tokens.push({ t: 'lit', v: false });
      else if (word === 'null') tokens.push({ t: 'lit', v: null });
      else tokens.push({ t: 'id', v: word });
      i = j;
      continue;
    }
    return `unexpected character '${c}' at ${i}`;
  }
  return tokens;
}

class Parser {
  private i = 0;
  constructor(private readonly toks: Tok[]) {}

  parse(): ParseWhenResult {
    try {
      if (this.toks.length === 0) return { ok: false, error: 'empty expression' };
      const ast = this.parseOr();
      if (this.i < this.toks.length) {
        return { ok: false, error: `trailing input at token ${this.i}` };
      }
      return { ok: true, ast };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  private peek(): Tok | undefined {
    return this.toks[this.i];
  }

  private take(): Tok {
    const t = this.toks[this.i];
    if (!t) throw new Error('unexpected end of expression');
    this.i++;
    return t;
  }

  private parseOr(): WhenAst {
    let left = this.parseAnd();
    while (this.peek()?.t === 'op' && (this.peek() as { v: string }).v === '||') {
      this.take();
      const right = this.parseAnd();
      left = { kind: 'or', left, right };
    }
    return left;
  }

  private parseAnd(): WhenAst {
    let left = this.parseUnary();
    while (this.peek()?.t === 'op' && (this.peek() as { v: string }).v === '&&') {
      this.take();
      const right = this.parseUnary();
      left = { kind: 'and', left, right };
    }
    return left;
  }

  private parseUnary(): WhenAst {
    if (this.peek()?.t === 'op' && (this.peek() as { v: string }).v === '!') {
      this.take();
      return { kind: 'not', expr: this.parseUnary() };
    }
    return this.parsePrimary();
  }

  private parsePrimary(): WhenAst {
    const t = this.peek();
    if (!t) throw new Error('unexpected end of expression');

    if (t.t === 'op' && t.v === '(') {
      this.take();
      const inner = this.parseOr();
      const close = this.take();
      if (close.t !== 'op' || close.v !== ')') throw new Error('expected )');
      return inner;
    }

    if (t.t === 'lit' && typeof t.v === 'boolean') {
      this.take();
      return { kind: 'literal', value: t.v };
    }

    if (t.t === 'id') {
      this.take();
      const path = t.v;
      const next = this.peek();
      const cmpOps: CmpOp[] = ['==', '!=', '>', '<', '>=', '<='];
      if (next?.t === 'op' && cmpOps.includes(next.v as CmpOp)) {
        const op = next.v as CmpOp;
        this.take();
        const rhs = this.take();
        if (rhs.t === 'lit') {
          return { kind: 'cmp', path, op, value: rhs.v };
        }
        if (rhs.t === 'id') {
          // Bare word on RHS is a string literal (matches walker: unquoted non-keyword text).
          return { kind: 'cmp', path, op, value: rhs.v };
        }
        throw new Error('expected comparison value');
      }
      return { kind: 'truthy', path };
    }

    throw new Error(`unexpected token ${JSON.stringify(t)}`);
  }
}

/** Parse a `when` expression into an AST, or return a structured error. */
export function parseWhen(expr: string): ParseWhenResult {
  const toks = tokenize(expr);
  if (typeof toks === 'string') return { ok: false, error: toks };
  return new Parser(toks).parse();
}

/**
 * The bag paths an expression reads: the left side of each comparison and each bare truthiness
 * clause. Only the left side — a right operand is a value, and an unquoted one is
 * indistinguishable from an identifier by shape, so `analysis_type == completion` reads
 * `analysis_type` alone. An unparseable expression reads nothing (fail-closed, as evaluation does).
 */
export function expressionPaths(expr: string): string[] {
  const parsed = parseWhen(expr);
  if (!parsed.ok) return [];
  const paths: string[] = [];
  const walk = (ast: WhenAst): void => {
    switch (ast.kind) {
      case 'truthy':
      case 'cmp':
        paths.push(ast.path);
        return;
      case 'not':
        walk(ast.expr);
        return;
      case 'and':
      case 'or':
        walk(ast.left);
        walk(ast.right);
        return;
      case 'literal':
        return;
    }
  };
  walk(parsed.ast);
  return paths;
}

function getVar(path: string, vars: Record<string, unknown>): unknown {
  let cur: unknown = vars;
  for (const part of path.split('.')) {
    if (cur === null || cur === undefined || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

function evalAst(ast: WhenAst, vars: Record<string, unknown>): boolean {
  switch (ast.kind) {
    case 'literal':
      return ast.value;
    case 'truthy':
      return Boolean(getVar(ast.path, vars));
    case 'cmp': {
      const actual = getVar(ast.path, vars);
      if (ast.op === '==') return actual === ast.value;
      if (ast.op === '!=') return actual !== ast.value;
      const a = typeof actual === 'number' ? actual : Number(actual);
      const b = typeof ast.value === 'number' ? ast.value : Number(ast.value);
      if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
      switch (ast.op) {
        case '>':
          return a > b;
        case '<':
          return a < b;
        case '>=':
          return a >= b;
        case '<=':
          return a <= b;
      }
    }
    case 'not':
      return !evalAst(ast.expr, vars);
    case 'and':
      return evalAst(ast.left, vars) && evalAst(ast.right, vars);
    case 'or':
      return evalAst(ast.left, vars) || evalAst(ast.right, vars);
  }
}

/**
 * Evaluate a `when` expression against a variable bag.
 * Unparseable expressions return false (fail-closed).
 */
export function evaluateWhenExpression(expr: string, vars: Record<string, unknown>): boolean {
  const parsed = parseWhen(expr);
  if (!parsed.ok) return false;
  return evalAst(parsed.ast, vars);
}

/**
 * Authoring check: mixing `&&` and `||` without parentheses is rejected.
 * Pure `&&` chains, pure `||` chains, and parenthesized mixed forms pass.
 * Parse errors are reported as authoring failures.
 */
export function assertWhenAuthoring(expr: string): AuthoringResult {
  const parsed = parseWhen(expr);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  // Scan top-level (paren depth 0) for both && and ||.
  const toks = tokenize(expr);
  if (typeof toks === 'string') return { ok: false, error: toks };

  let depth = 0;
  let sawAnd = false;
  let sawOr = false;
  for (const t of toks) {
    if (t.t === 'op' && t.v === '(') depth++;
    else if (t.t === 'op' && t.v === ')') depth = Math.max(0, depth - 1);
    else if (depth === 0 && t.t === 'op' && t.v === '&&') sawAnd = true;
    else if (depth === 0 && t.t === 'op' && t.v === '||') sawOr = true;
  }
  if (sawAnd && sawOr) {
    return {
      ok: false,
      error: 'mixed && and || at the same nesting depth require parentheses',
    };
  }
  return { ok: true };
}
