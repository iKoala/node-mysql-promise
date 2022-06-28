import { ConnectionConfig, Pool, QueryOptions } from 'mysql';
import { Logger } from '../src/interface';
declare class DBConnection {
    name: string;
    settings: ConnectionConfig | null;
    pool: Pool | null;
    poolQuery: Function | null;
    activeConnection: number;
    verbose: boolean;
    logger: Logger;
    /**
     * @constructor
     * @param {object} settings MySQL Settings
     */
    constructor(connName: string);
    init(settings: ConnectionConfig, logger?: Logger): void;
    destroy(): void;
    /**
     * Execute query and return result set
     * @public
     * @memberOf exports
     */
    query(stmt: string, params: QueryOptions | Array<any>): Promise<any>;
    getActiveConnection(): number;
    setVerbose(verbose: boolean): void;
}
export default DBConnection;
//# sourceMappingURL=db-connection.d.ts.map