// CheckpointOpts union error shape + readonly tuple rest params
type Opts = {
  readonly options: readonly [string, ...string[]];
} & (
  | { readonly blocking?: true; readonly defaultOption?: never; readonly autoAdvanceMs?: never }
  | { readonly blocking: false; readonly defaultOption: string; readonly autoAdvanceMs?: number }
);
declare function checkpoint(id: string, msg: string, opts: Opts): void;
// author mistake: autoAdvanceMs without blocking:false
checkpoint('a', 'm', { options: ['x'], defaultOption: 'x', autoAdvanceMs: 5 });
// rest params with readonly tuple / readonly array types
declare function and(...xs: readonly [number, number, ...number[]]): void;
and(1, 2);
declare function block(id: string, ...items: readonly string[]): void;
block('b', 'one', 'two');
export { checkpoint };
