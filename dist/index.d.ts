import 'dotenv/config';
import { DBConnection } from './lib/db-connection';
import * as helper from './lib/helper';
interface Logger {
    info: any;
    log: any;
    warn: any;
}
export declare const createLogger: (info: any, log: any, warn: any) => Logger;
export declare const setLogger: (mLogger: Logger) => void;
export declare const create: (connName: string, settings: any) => DBConnection | null;
export declare const destroy: Function;
export declare const getInstanceList: Function;
export declare const getConnection: Function;
export declare const query: Function;
/**
* Load .sql file with multiple statements connection
* @param  {string} filepath full path of source file
* @return {[type]}          [description]
*/
export declare const loadFile: Function;
export declare const printQuery: Function;
export declare const setVerbose: (v: boolean) => void;
export { helper };
//# sourceMappingURL=index.d.ts.map