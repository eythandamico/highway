/** Intent preloads and rendering share one request; failed warmups remain retryable. */
export function preloadOnce<T>(loader: () => Promise<T>) {
  let pending: Promise<T> | undefined;
  return () => pending ??= loader().catch(error => {
    pending = undefined;
    throw error;
  });
}
