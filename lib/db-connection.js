const util = require('util');
const mysql = require('mysql');

class DBConnection {
  /**
   * @constructor
   * @param {object} settings MySQL Settings
   */
  constructor(connName) {
    this.name = `[db::${connName}]`;
    this.settings = null;
    this.pool = null;
    this.activeConnection = 0;
    this.verbose = true;
    this.logger = console;
  }

  init(settings, logger = null) {
    this.settings = settings;
    this.pool = mysql.createPool(settings);
    this.poolQuery = util.promisify(this.pool.query.bind(this.pool));
    this.logger = logger || this.logger;
  }

  destroy() {
    if (this.pool) {
      this.pool.end();
      this.pool = null;
      this.activeConnection = 0;
    }
  }

  /**
   * Execute query and return result set
   * @public
   * @memberOf exports
   */
  async query(stmt, params) {
    if (this.verbose) {
      this.logger.log(`${this.name} :: query :: stmt >> ${mysql.format(stmt, params)}`);
    }
    let self = this;
    this.activeConnection += 1;
    let results = await self.poolQuery(stmt, params);
    self.activeConnection -= 1;
    return results;
  }

  getActiveConnection() {
    return this.activeConnection;
  }

  setVerbose(verbose) {
    this.logger.log(`setVerbose >> ${verbose}`);
    this.verbose = verbose;
  }
}

exports.DBConnection = DBConnection;
