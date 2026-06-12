// ============================================================================
// @workflow-plane/score — L1 normative authoring surface. Version 0.1.
// Transcribed VERBATIM from dsl-specification-draft.md §3.7 (comments trimmed).
// ============================================================================

// ---------------------------------------------------------------- lexical ---
export type KebabId = string;
export type SymbolId = string;
export type VarPath = string;
export type QualifiedRef = `${number}.${string}.${string}`;
export type ResourceRef = string;
export type ActivityId = KebabId;
export type WorkflowId = KebabId;
export type RoleId = KebabId;
export type SemVer = `${number}.${number}.${number}`;
export type Lit = string | number | boolean | null;
export type Json = Lit | readonly Json[] | { readonly [k: string]: Json };

// ------------------------------------------------------------- references ---
export interface OutputRef {
  readonly kind: 'output_ref';
  readonly activity: ActivityId;
  readonly step: KebabId;
  readonly symbol: SymbolId;
}
export declare function outputOf(activity: ActivityId, step: KebabId, symbol: SymbolId): OutputRef;

export interface VarRef { readonly kind: 'var_ref'; readonly path: VarPath | QualifiedRef; }
export declare function v(path: VarPath | QualifiedRef): VarRef;

export type ValueRef = Lit | VarRef | OutputRef;
export type Operand = VarPath | QualifiedRef | OutputRef;

// ------------------------------------------------------------ expressions ---
export interface Expr { readonly kind: 'expr'; }
export declare function eq(operand: Operand, value: Lit): Expr;
export declare function ne(operand: Operand, value: Lit): Expr;
export declare function gt(operand: Operand, value: number): Expr;
export declare function lt(operand: Operand, value: number): Expr;
export declare function gte(operand: Operand, value: number): Expr;
export declare function lte(operand: Operand, value: number): Expr;
export declare function exists(operand: Operand): Expr;
export declare function notExists(operand: Operand): Expr;
export declare function and(...exprs: readonly [Expr, Expr, ...Expr[]]): Expr;
export declare function or(...exprs: readonly [Expr, Expr, ...Expr[]]): Expr;
export declare function not(expr: Expr): Expr;

// ------------------------------------------------------------------ items ---
export type Item =
  | StepNode | AskNode | MatchNode | IfElseNode | RouteNode
  | ForEachNode | WhileNode | DoWhileNode
  | CheckpointNode | DispatchNode | MessageNode
  | GoToNode | EndNode | BreakItem | RerunItem | RetryItem
  | PassThroughItem | ByIdItem | FlowBlock
  | GovernanceNode;
export type Seq = readonly Item[];

export interface StepNode        { readonly kind: 'step';        readonly id: KebabId; }
export interface AskNode         { readonly kind: 'ask';         readonly id: KebabId; }
export interface MatchNode       { readonly kind: 'match';       readonly id: KebabId; }
export interface IfElseNode      { readonly kind: 'if_else';     readonly id: KebabId; }
export interface RouteNode       { readonly kind: 'route';       readonly id: KebabId; }
export interface ForEachNode     { readonly kind: 'for_each';    readonly id: KebabId; }
export interface WhileNode       { readonly kind: 'while';       readonly id: KebabId; }
export interface DoWhileNode     { readonly kind: 'do_while';    readonly id: KebabId; }
export interface CheckpointNode  { readonly kind: 'checkpoint';  readonly id: KebabId; }
export interface DispatchNode    { readonly kind: 'dispatch';    readonly id: KebabId; }
export interface MessageNode     { readonly kind: 'message'; }
export interface GoToNode        { readonly kind: 'goto';        readonly to: ActivityId; }
export interface EndNode         { readonly kind: 'end'; }
export interface BreakItem       { readonly kind: 'break';       readonly loop?: KebabId; }
export interface RerunItem       { readonly kind: 'rerun';       readonly loop: KebabId; }
export interface RetryItem       { readonly kind: 'retry';       readonly decision: KebabId; }
export interface PassThroughItem { readonly kind: 'pass_through'; }
export interface ByIdItem        { readonly kind: 'by_id'; }
export interface FlowBlock       { readonly kind: 'block';       readonly id: KebabId; }
export interface GovernanceNode  { readonly kind: 'governance';  readonly id: KebabId; }

// --------------------------------------------------- leaf / control items ---
export declare function msg(text: string): MessageNode;
export declare function goTo(target: ActivityId): GoToNode;
export declare function end(): EndNode;
export declare function breakLoop(): BreakItem;
export declare function rerun(loop: KebabId | ForEachNode | WhileNode | DoWhileNode): RerunItem;
export declare function retry(decision: KebabId): RetryItem;
export declare function passThrough(): PassThroughItem;
export declare function block(id: KebabId, ...items: Seq): FlowBlock;
export declare const byId: {
  step(id: KebabId): ByIdItem;
  decision(id: KebabId): ByIdItem;
  loop(id: KebabId): ByIdItem;
  block(id: KebabId): ByIdItem;
};

// -------------------------------------------------------------- decisions ---
export declare function ask(id: KebabId, message: string,
  branches?: Readonly<Record<KebabId, Seq>>): AskNode;

export declare function match(id: KebabId, operand: Operand,
  cases: Readonly<Record<string, Seq>>,
  opts?: { readonly otherwise?: Seq }): MatchNode;

export declare function ifElse(id: KebabId, condition: Expr,
  then: Seq, otherwise?: Seq): IfElseNode;

export interface RouteBranch {
  readonly id: KebabId;
  readonly label: string;
  readonly when?: Expr;
  readonly to?: ActivityId;
  readonly isDefault?: boolean;
}
export declare function route(id: KebabId, opts: {
  readonly name: string;
  readonly describe?: string;
  readonly branches: readonly [RouteBranch, RouteBranch, ...RouteBranch[]];
}): RouteNode;

// ------------------------------------------------------------------ loops ---
export interface LoopTokens {
  readonly item: VarRef;
  readonly break: BreakItem;
  readonly restart: RerunItem;
}
export interface LoopActivities { readonly activities: readonly ActivityId[]; }
export type LoopBody = (it: LoopTokens) => Seq | LoopActivities;

export declare function forEach(id: KebabId, opts: {
  readonly each: SymbolId;
  readonly over: VarPath | QualifiedRef | OutputRef;
  readonly max?: number;
  readonly breakWhen?: Expr;
  readonly describe?: string;
}, body: LoopBody): ForEachNode;

export declare function whileLoop(id: KebabId, opts: {
  readonly condition: Expr;
  readonly counter?: SymbolId;
  readonly max?: number;
  readonly breakWhen?: Expr;
  readonly describe?: string;
}, body: LoopBody): WhileNode;
export declare function doWhile(id: KebabId, opts: {
  readonly condition: Expr;
  readonly counter?: SymbolId;
  readonly max?: number;
  readonly breakWhen?: Expr;
  readonly describe?: string;
}, body: LoopBody): DoWhileNode;

// ------------------------------------------------------------- checkpoint ---
export interface CheckpointEffect {
  readonly setVariable?: Readonly<Record<SymbolId, Json>>;
  readonly transitionTo?: ActivityId;
  readonly skipActivities?: readonly ActivityId[];
}
export interface CheckpointOption {
  readonly id: KebabId;
  readonly label: string;
  readonly describe?: string;
  readonly effect?: CheckpointEffect;
}
export type CheckpointOpts = {
  readonly name?: string;
  readonly options: readonly [CheckpointOption, ...CheckpointOption[]];
  readonly when?: Expr;
  readonly required?: boolean;
} & (
  | { readonly blocking?: true;  readonly defaultOption?: never;  readonly autoAdvanceMs?: never }
  | { readonly blocking: false;  readonly defaultOption: KebabId; readonly autoAdvanceMs?: number }
);
export declare function checkpoint(id: KebabId, message: string, opts: CheckpointOpts): CheckpointNode;

// ---------------------------------------------------------------- dispatch ---
export declare function dispatch(id: KebabId, opts: {
  readonly workflow: WorkflowId;
  readonly passContext?: readonly SymbolId[];
  readonly describe?: string;
}): DispatchNode;

// ---------------------------------------------------------------- artifact ---
export interface ArtifactDef { readonly kind: 'artifact'; readonly id: KebabId; }
export declare function artifact(id: KebabId, name: string, opts?: {
  readonly location?: KebabId | string;
  readonly action?: 'create' | 'update';
  readonly describe?: string;
}): ArtifactDef;

// -------------------------------------------------------------- transitions --
export interface TransitionDef { readonly kind: 'transition'; }
export declare function on(condition: Expr, target: ActivityId): TransitionDef;
export declare function otherwise(target: ActivityId): TransitionDef;

// ------------------------------------------------------------------ actions --
export type ActionItem =
  | { readonly do: 'set';      readonly target: SymbolId; readonly value?: ValueRef; readonly describe?: string; readonly when?: Expr }
  | { readonly do: 'log';      readonly message: string;  readonly when?: Expr }
  | { readonly do: 'message';  readonly message: string;  readonly when?: Expr }
  | { readonly do: 'validate'; readonly target: Expr;     readonly message: string; readonly when?: Expr }
  | { readonly do: 'emit';     readonly target: string;   readonly value?: Json;    readonly when?: Expr };

// ----------------------------------------------------------------- activity --
export interface ActivityDef { readonly kind: 'activity'; readonly id: ActivityId; }
export interface ActivityOpts<Addr extends string = string> {
  readonly version: SemVer;
  readonly describe: string;
  readonly problem?: string;
  readonly inputs?: readonly (SymbolId | QualifiedRef | OutputRef)[];
  readonly recognition?: readonly string[];
  readonly techniques?: { readonly primary?: Addr; readonly supporting?: readonly Addr[] };
  readonly run: Seq;
  readonly blocks?: readonly FlowBlock[];
  readonly next?: readonly TransitionDef[];
  readonly artifacts?: readonly ArtifactDef[];
  readonly triggers?: readonly DispatchNode[];
  readonly entry?: readonly ActionItem[];
  readonly exit?: readonly ActionItem[];
  readonly outcome?: readonly string[];
  readonly contextToPreserve?: readonly string[];
  readonly required?: boolean;
  readonly estimatedTime?: string;
  readonly rules?: readonly string[];
}

// ----------------------------------------------------------------- workflow --
export interface WorkflowDef { readonly kind: 'workflow'; readonly id: WorkflowId; }
export interface VarSpec {
  readonly type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  readonly describe?: string;
  readonly default?: Json;
  readonly required?: boolean;
}
export type VarInit = string | number | boolean | VarSpec;
export interface RoleDecl { readonly id: RoleId; readonly describe: string; }
export interface ModeDef {
  readonly id: KebabId;
  readonly name: string;
  readonly describe?: string;
  readonly activationVariable: SymbolId;
  readonly recognition?: readonly string[];
  readonly skipActivities?: readonly ActivityId[];
  readonly defaults?: Readonly<Record<SymbolId, Json>>;
  readonly resource?: ResourceRef;
}
export interface WorkflowOpts<Addr extends string = string> {
  readonly version: SemVer;
  readonly title: string;
  readonly describe?: string;
  readonly author?: string;
  readonly tags?: readonly string[];
  readonly rules?: readonly string[];
  readonly executionModel: {
    readonly roles: readonly [RoleDecl, ...RoleDecl[]];
  };
  readonly vars?: Readonly<Record<SymbolId, VarInit>>;
  readonly modes?: readonly ModeDef[];
  readonly artifactLocations?: Readonly<Record<KebabId,
    string | { readonly path: string; readonly describe?: string; readonly gitignored?: boolean }>>;
  readonly techniques?: { readonly primary?: Addr; readonly supporting?: readonly Addr[] };
  readonly initialActivity?: ActivityId;
  readonly activities: readonly (ActivityDef | { readonly ordinal: number; readonly activity: ActivityDef })[];
}

// ============================================================================
// Generated technique contracts and the per-workflow bound surface (§4)
// ============================================================================
export type ContractOrigin = 'local' | 'container' | 'workflow-root';
export interface ContractInput {
  readonly required: boolean;
  readonly default?: Lit;
  readonly origin: ContractOrigin;
  readonly qualifiedSource?: QualifiedRef;
  readonly components?: readonly SymbolId[];
}
export interface ContractArtifact {
  readonly name: string;
  readonly action: 'create' | 'update';
  readonly tokens: readonly SymbolId[];
}
export interface ContractOutput {
  readonly artifact?: ContractArtifact;
  readonly components?: readonly SymbolId[];
}
export interface TechniqueContract {
  readonly address: string;
  readonly shape: 'standalone' | 'container' | 'nested' | 'workflow-root';
  readonly version: string;
  readonly inputs: Readonly<Record<SymbolId, ContractInput>>;
  readonly outputs: Readonly<Record<SymbolId, ContractOutput>>;
  readonly rules: readonly string[];
}

export interface Score<R extends Readonly<Record<string, TechniqueContract>>> {
  step(id: KebabId, opts: {
    readonly describe: string;
    readonly when?: Expr;
    readonly checkpoint?: CheckpointNode | KebabId;
    readonly required?: boolean;
    readonly actions?: readonly ActionItem[];
    readonly triggers?: readonly DispatchNode[];
  }): StepNode;
  step<T extends keyof R & string>(id: KebabId, opts: {
    readonly technique: T;
    readonly describe?: string;
    readonly bind?: { readonly [K in keyof R[T]['inputs'] & string]?: ValueRef };
    readonly when?: Expr;
    readonly checkpoint?: CheckpointNode | KebabId;
    readonly required?: boolean;
    readonly actions?: readonly ActionItem[];
    readonly triggers?: readonly DispatchNode[];
  }): StepNode;

  workflow(id: WorkflowId, opts: WorkflowOpts<keyof R & string>): WorkflowDef;
  activity(id: ActivityId, opts: ActivityOpts<keyof R & string>): ActivityDef;

  ask: typeof ask; match: typeof match; ifElse: typeof ifElse; route: typeof route;
  forEach: typeof forEach; whileLoop: typeof whileLoop; doWhile: typeof doWhile;
  checkpoint: typeof checkpoint; dispatch: typeof dispatch; artifact: typeof artifact;
  msg: typeof msg; goTo: typeof goTo; end: typeof end;
  breakLoop: typeof breakLoop; rerun: typeof rerun; retry: typeof retry;
  passThrough: typeof passThrough; block: typeof block; byId: typeof byId;
  on: typeof on; otherwise: typeof otherwise;
  v: typeof v; outputOf: typeof outputOf;
  eq: typeof eq; ne: typeof ne; gt: typeof gt; lt: typeof lt; gte: typeof gte; lte: typeof lte;
  exists: typeof exists; notExists: typeof notExists; and: typeof and; or: typeof or; not: typeof not;
  approve: typeof approve; gate: typeof gate; delegate: typeof delegate;
}
export declare function makeScore<R extends Readonly<Record<string, TechniqueContract>>>(): Score<R>;

// ============================================================================
// RESERVED — Phase 2+ governance constructs.
// ============================================================================
export declare function approve(id: KebabId, opts: {
  readonly role: RoleId;
  readonly message: string;
  readonly options?: readonly CheckpointOption[];
  readonly onDeny?: 'fail_node' | 'fail_workflow' | 'escalate';
}): GovernanceNode;
export declare function gate(id: KebabId, opts: {
  readonly capabilityScope: readonly string[];
  readonly onViolation?: 'deny' | 'fail_node' | 'fail_workflow' | 'escalate' | 'nudge';
  readonly run: Seq;
}): GovernanceNode;
export declare function delegate(id: KebabId, opts: {
  readonly role: RoleId;
  readonly workflow: WorkflowId;
  readonly passContext?: readonly SymbolId[];
}): GovernanceNode;
