export type Selectable<T extends object = object> = T & {
    selected?: boolean;
};
