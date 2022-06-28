import util from 'util';
import mysql, {
  ConnectionConfig, Pool, QueryOptions
} from 'mysql';
import { Logger } from '../src/interface';

class DBConnection {
  name: string = '';

  settings: ConnectionConfig | null = null;

  pool: Pool | null = null;

  poolQuery: Function | null = null;
  // poolQuery: ((argv: string | QueryOptions) => Promise<Query>) | null = null;

  activeConnection: number = 0;

  verbose: boolean = true;

  logger: Logger = console;

  /**
   * @constructor
   * @param {object} settings MySQL Settings
   */
  constructor(connName: string) {
    this.name = `[db::${connName}]`;
    // this.settings = null;
    // this.pool = null;
    // this.activeConnection = 0;
    // this.verbose = true;
    // this.logger = console;
  }

  init(settings: ConnectionConfig, logger?: Logger) {
    this.settings = settings;
    this.pool = mysql.createPool(settings);
    this.poolQuery = util.promisify(this.pool.query.bind(this.pool));
    this.logger = logger || this.logger;
  }

  destroy() {
    if (this.pool) {
      this.pool.end();
      this.pool = null;
      this.poolQuery = null;
      this.activeConnection = 0;
    }
  }

  /**
   * Execute query and return result set
   * @public
   * @memberOf exports
   */
  async query(stmt: string, params: QueryOptions | Array<any>): Promise<any> {
    if (this.verbose) {
      this.logger.log(`${this.name} :: query :: stmt >> ${mysql.format(stmt, params as any)}`);
    }
    // let self = this;
    this.activeConnection += 1;
    const results: any = this.poolQuery && await this.poolQuery(stmt, params);
    this.activeConnection -= 1;
    return results;
  }

  getActiveConnection() {
    return this.activeConnection;
  }

  setVerbose(verbose: boolean) {
    this.logger.log(`setVerbose >> ${verbose}`);
    this.verbose = verbose;
  }
}

export default DBConnection;
