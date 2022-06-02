import * as NodeDB from './index-db';
import { DBConnection } from './lib/db-connection';
interface Logger {
    info: any;
    log: any;
    warn: any;
}
export declare const createLogger: (info: any, log: any, warn: any) => Logger;
export declare const setLogger: (mLogger: Logger) => void;
export declare const create: (connName: string, settings: any) => DBConnection | null;
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
export declare const printVersion: (version: string) => void;
export {};
//# sourceMappingURL=index.d.ts.map