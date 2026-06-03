/**
 * Returns a nested value from an object based on a dot-separated path.
 * If the path does not exist, it returns undefined.
 * @param obj Object value
 * @param path Nested value path
 * @returns value
 */
export const getNestedValue = (obj: any, path: string) => {
    return path
        .split(".")
        .reduce((acc, key) => acc?.[key], obj);
};