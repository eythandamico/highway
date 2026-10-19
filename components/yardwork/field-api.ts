/** This standalone demo has no field-service backend. */
export async function fieldApi<T>(...args: [path: string, method?: string, body?: unknown]): Promise<T> {
  void args;
  throw new Error("Field-service connections are unavailable in this demo.");
}
