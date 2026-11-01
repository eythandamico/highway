export type SelectionKey = string | number;
export function toggleSelection<K extends SelectionKey>(
  values: readonly K[],
  key: K,
): K[] {
  return values.includes(key)
    ? values.filter((value) => value !== key)
    : [...values, key];
}
/** Search widgets use active descendants; menus/selects delegate focus management to Radix. */
export function nextEnabledIndex(
  disabled: readonly boolean[],
  current: number,
  direction: 1 | -1,
) {
  for (let step = 1; step <= disabled.length; step++) {
    const index =
      (current + direction * step + disabled.length) % disabled.length;
    if (!disabled[index]) return index;
  }
  return -1;
}
