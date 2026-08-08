export interface TableAction<T extends Record<string, any>> {
    key: string;
    render: (item: T) => React.ReactNode;
}