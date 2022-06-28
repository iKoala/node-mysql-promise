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
export declare const createSelect: Function;
export declare const createInsert: Function;
export declare const createUpdate: (table: string, primaryKeyField: string, _cfg?: UpdateConfig) => Function;
//# sourceMappingURL=helper.d.ts.map