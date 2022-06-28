import * as db from '../src/index';
export declare type InsertConfig = {
    defaults?: {
        [key: string]: any;
    };
    defaultFields?: {
        [key: string]: any;
    };
    ignore?: boolean;
    insertIgnore?: boolean;
    replace?: boolean;
    replaceInto?: boolean;
};
export declare type UpdateConfig = {
    restricts?: Array<string>;
    restrictedFields?: Array<string>;
    defaults?: {
        [key: string]: any;
    };
    defaultFields?: {
        [key: string]: any;
    };
};
export declare const createSelect: (table: string, idField: string) => (...args: any[]) => Promise<any>;
export declare const createInsert: (tbl: string, idField: string, _cfg?: InsertConfig) => (rc: {
    [key: string]: any;
}, _opts?: Object) => Promise<any>;
export declare const createUpdate: (table: string, primaryKeyField: string, _cfg?: UpdateConfig) => (id: number, _rc: {
    [key: string]: any;
}, _opts?: Object) => Promise<any>;
//# sourceMappingURL=helper.d.ts.map