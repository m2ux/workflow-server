export type Result<T, E = Error> = { success: true; value: T } | { success: false; error: E };
export function ok<T>(value: T): Result<T, never> { return { success: true, value }; }
export function err<E>(error: E): Result<never, E> { return { success: false, error }; }
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.success) return result.value;
  throw result.error instanceof Error ? result.error : new Error(String(result.error));
}
