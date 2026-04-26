import type { TableList, TableListBaseObject } from "@/interfaces/components/tableList";

export const useTableList = <T extends TableListBaseObject>({ data, columns, actions }: TableList<T>) => {
    return { 
        data, 
        columns, 
        actions
    };
};
