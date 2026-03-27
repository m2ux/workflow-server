export type Result<T, E = Error> = { success: true; value: T } | { success: false; error: E };
export function ok<T>(value: T): Result<T, never> { return { success: true, value }; }
export function err<E>(error: E): Result<never, E> { return { success: false, error }; }
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.success) return result.value;
  if (result.error instanceof Error) throw result.error;
  const wrapped = new Error(String(result.error));
  if (result.error !== null && typeof result.error === 'object') {
    for (const [key, value] of Object.entries(result.error)) {
      (wrapped as unknown as Record<string, unknown>)[key] = value;
    }
  }
  throw wrapped;
}
