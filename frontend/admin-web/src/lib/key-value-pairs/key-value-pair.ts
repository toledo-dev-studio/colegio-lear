export type KeyValuePair<T = string> = {
  key: T;
  label: string;
};

export const labelOf = <T extends string>(
  list: KeyValuePair<T>[],
  key: T | undefined | null,
): string => list.find((x) => x.key === key)?.label || String(key ?? "");
