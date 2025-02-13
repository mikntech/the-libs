export function lazyGuard<TArgs extends unknown[], TReturn>(
  ...fns: ((...args: TArgs) => TReturn)[]
): (...args: TArgs) => TReturn {
  if (fns.length === 0) {
    throw new Error('lazyGuard requires at least one function.');
  }

  return function (...args: TArgs): TReturn {
    let lastError: unknown;

    for (let i = 0; i < fns.length; i++) {
      try {
        return fns[i](...args);
      } catch (error) {
        lastError = error;
        console.warn(`lazyGuard: Function ${i} failed, falling back.`, error);
      }
    }

    throw lastError; // Ensure we never return undefined
  };
}
