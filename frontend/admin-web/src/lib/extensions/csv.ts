export interface CsvHeader<T extends Record<string, any>> {
    label: string;
    key: string;
    render?: (item: T) => any;
}

/**
 * Read a nested property from an object using dot notation.
 * Example: getValueByPath(obj, 'user.address.city')
 * @param object The source object.
 * @param path Dot-separated path string.
 * @returns The nested value or undefined if not found.
 */
const getValueByPath = (object: any, path: string) => {
    return path.split('.').reduce((current, segment) => {
        if (current === null || current === undefined) {
            return undefined;
        }
        return current[segment];
    }, object);
};

/**
 * Download an array of data as a CSV file.
 * Supports nested object paths in header keys using dot notation.
 * @param fieldName File name without extension.
 * @param headers Array of header definitions with label and key.
 * @param data Data rows to convert into CSV.
 */
export const downloadDataToCsvFile = <T extends Record<string, any>>(fieldName: string, headers: CsvHeader<T>[], data: T[]) => {
    const csvHeaders = headers.map(h => h.label).join(',');
    const csvRows = data.map(item =>
        headers.map(h => {
            let value = undefined;
            if (h.render !== undefined)
                value = h.render(item);
            else
                value = getValueByPath(item, h.key);

            if (typeof value === 'string')
                return `"${value.replace(/"/g, '""')}"`;
            
            return value?.toString() || '';
        }).join(',')
    );
    const csvContent = '\ufeff' + [csvHeaders, ...csvRows].join('\n');

    // Create blob and trigger browser download.
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${fieldName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}