import * as NodeDB from './index-db';
export declare const setLogger: (mLogger: any) => void;
export declare const create: any;
export declare const destroy: (connName: any) => void;
export declare const getInstanceList: () => {};
export declare const getConnection: (opts: any) => {
    query: (...args: any[]) => Promise<any>;
    end: any;
};
export declare const query: (stmt: any, params: any) => Promise<any>;
export declare const loadFile: (settings: any, filepath: string) => [type];
export declare const printQuery: (_stmt: any, _params: any) => any;
export declare const setVerbose: (v: any) => void;
export declare const helper: typeof NodeDB.helper;
//# sourceMappingURL=index.d.ts.map