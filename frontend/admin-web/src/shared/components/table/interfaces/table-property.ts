export interface TableProperty<T extends Record<string, any>> {
    key: string;
    render?: (item: T) => React.ReactNode;
}
