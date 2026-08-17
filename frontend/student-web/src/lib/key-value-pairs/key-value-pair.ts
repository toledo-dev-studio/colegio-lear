export type KeyValuePair<T = string> = {
  key: T;
  label: string;
};

export const labelOf = <T extends string>(
  list: KeyValuePair<T>[],
  key: T | undefined | null,
): string => list.find((x) => x.key === key)?.label || String(key ?? "");

export const keyOf = <T extends string>(
  list: KeyValuePair<T>[],
  key: T | undefined | null,
): string => list.find((x) => x.key === key)?.key || String(key ?? "");

export const getKeys = <T extends string>(
    values: KeyValuePair<T>[]
): T[] => values.map(x => x.key);

export const getKeyValuePairsByKeys = <T extends string>(
    values: KeyValuePair<T>[],
    keys: T[]
): KeyValuePair<T>[] => {
    const keySet = new Set(keys);
    return values.filter(x => keySet.has(x.key));
};