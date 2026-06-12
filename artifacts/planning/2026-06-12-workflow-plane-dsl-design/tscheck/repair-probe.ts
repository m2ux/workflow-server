type KebabId = string;
type Expr = { readonly kind: 'expr' };
interface CheckpointOption { readonly id: KebabId; readonly label: string }

// --- SupportingRef widening (finding: techniques.supporting forecloses rule segments)
type SupportingRef<Addr extends string> = Addr | `${Addr}::${string}`;
type Addr = 'jira-comment' | 'gitnexus-operations::impact';
const ok1: SupportingRef<Addr> = 'jira-comment';
const ok2: SupportingRef<Addr> = 'jira-comment::comment-approval-before-post';
const ok3: SupportingRef<Addr> = 'gitnexus-operations::impact::index-freshness-first';
// @ts-expect-error typo'd base still caught
const bad1: SupportingRef<Addr> = 'jira-coment';

// --- CheckpointOpts 3-arm union
type CheckpointOpts = {
  readonly name?: string;
  readonly options: readonly [CheckpointOption, ...CheckpointOption[]];
  readonly when?: Expr;
  readonly required?: boolean;
} & (
  | { readonly blocking?: true;  readonly defaultOption?: never;  readonly autoAdvanceMs?: never }
  | { readonly blocking: false;  readonly defaultOption?: KebabId; readonly autoAdvanceMs?: never }
  | { readonly blocking: false;  readonly defaultOption: KebabId;  readonly autoAdvanceMs: number }
);
declare function checkpoint(id: KebabId, message: string, opts: CheckpointOpts): { kind: 'checkpoint' };
// corpus shape: blocking:false WITHOUT defaultOption (prism-update/05-verify)
checkpoint('verification-review', 'm', { options: [{ id: 'accept', label: 'Accept' }], required: true, blocking: false });
// auto-advance arm
checkpoint('c2', 'm', { options: [{ id: 'a', label: 'A' }], blocking: false, defaultOption: 'a', autoAdvanceMs: 30000 });
// blocking default arm
checkpoint('c3', 'm', { options: [{ id: 'a', label: 'A' }] });
// @ts-expect-error CKPT-002: autoAdvance without defaultOption
checkpoint('c4', 'm', { options: [{ id: 'a', label: 'A' }], blocking: false, autoAdvanceMs: 5 });
// @ts-expect-error CKPT-002: autoAdvance on blocking checkpoint
checkpoint('c5', 'm', { options: [{ id: 'a', label: 'A' }], blocking: true, autoAdvanceMs: 5 });

// --- always() transition
interface TransitionDef { readonly kind: 'transition' }
declare function on(condition: Expr, target: KebabId): TransitionDef;
declare function always(target: KebabId): TransitionDef;
declare function otherwise(target: KebabId): TransitionDef;
const next: readonly TransitionDef[] = [on({ kind: 'expr' }, 'a'), always('b'), otherwise('c')];

// --- step args passthrough
type ValueRef = string | number | boolean | null | { kind: 'var_ref' };
declare function step<T extends 'jira-comment'>(id: KebabId, opts: {
  technique: T;
  bind?: { [K in 'categorized-assumptions' | 'issue-number']?: ValueRef };
  args?: Readonly<Record<string, string | number | boolean>>;
}): { kind: 'step' };
step('s', { technique: 'jira-comment', args: { activity_context: 'design-philosophy', anything_at_all: 42 } });

export { ok1, ok2, ok3, bad1, next };
