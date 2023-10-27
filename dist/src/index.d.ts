import 'dotenv/config';
import * as mysql from 'mysql2';
import DBConnection from '../lib/db-connection';
import * as helper from '../lib/helper';
import { Logger } from './interface';
export declare const createLogger: (info: any, log: any, warn: any) => Logger;
export declare const setLogger: (mLogger: Logger) => void;
export declare const create: (connName: string, settings: mysql.ConnectionConfig) => DBConnection | null;
export declare const destroy: (connName?: string) => void;
export declare const getInstanceList: () => Object;
export declare const getConnection: (opts: any) => {
    query: Function;
    end: Function;
};
export declare const query: (stmt: string, params?: Array<any>) => Promise<any>;
/**
* Load .sql file with multiple statements connection
* @param  {string} filepath full path of source file
* @return {[type]}          [description]
*/
export declare const loadFile: (settings: any, filepath: string) => Promise<boolean>;
export declare const printQuery: (_stmt: string, _params: Array<any>) => string | null;
export declare const setVerbose: (v: boolean) => void;
export { helper };
//# sourceMappingURL=index.d.ts.map