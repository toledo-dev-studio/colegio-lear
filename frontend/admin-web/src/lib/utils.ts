import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Función de utilidad para simular una espera
 * @param ms Milisegundos de espera
 * @returns Promise void
 */
export const sleep = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

export const stringToBooleanWithDefault = (value: string | null | undefined) : boolean => {
    const normalizedValue = value?.trim().toLowerCase();
    if (normalizedValue === "false") {
        return false;
    }
    return true;
}

export const downloadDataToCsvFile = (fieldName: string, headers: { label: string, key: string }[], data: any[]) => {
    const csvHeaders = headers.map(h => h.label).join(',');
    const csvRows = data.map(item =>
        headers.map(h => {
            const value = item[h.key];
            if (typeof value === 'string') {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value?.toString() || '';
        }).join(',')
    );
    const csvContent = '\ufeff' + [csvHeaders, ...csvRows].join('\n');

    // Create blob and download
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