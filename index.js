const fs = require('fs');
const util = require('util');
const mysql = require('mysql');
const helper = require('./lib/helper');

let defaultInstance;
let instanceList = {};
let isVerbose = true;
let customLogger;

let logger = {
  info: (...args) => {
    if (!isVerbose) { return; }
    if (customLogger) {
      customLogger.info(...args);
    } else {
      console.info.apply(null, args);
    }
  },
  log: (...args) => {
    if (!isVerbose) { return; }
    if (customLogger) {
      customLogger.log(...args);
    } else {
      console.log.apply(null, args);
    }

  },
  warn: (...args) => {
    console.warn.apply(null, args);
  }
};

exports.setLogger = (mLogger) => {
  customLogger = mLogger;
};

exports.create = function(connName, settings) {
  if (!connName) {
    throw new Error('missing connection name');
  }

  if (instanceList[connName]) {
    throw new Error('connection exists >> ' + connName);
  }

  logger.info(`db.create :: <${connName}> :: host >> ${settings.host}, database >> ${settings.database}`);

  if (!settings.host || settings.host.length === 0) {
    logger.warn(`db ${connName} :: Invalid host config. Database not available.`)
    return null;
  }

  if (settings.password === null || settings.password === undefined) {
    logger.warn(`db <${connName}> :: Invalid password config. Database not available.`);
    return null;
  }

  let instance = new DBConnection(connName);
  instance.init(settings);
  instanceList[connName] = exports[connName] = instance;
  if (!defaultInstance) {
    defaultInstance = instance;
  }
  return instance;
}

exports.destroy = function(connName) {
  if (instanceList[connName]) {
    instanceList[connName].destroy();
    delete instanceList[connName];
    return;
  }

  Object.keys(instanceList).forEach((key) => {
    instanceList[key].destroy();
    delete instanceList[key];
  });
}

exports.getInstanceList = () => {
  return instanceList
}

exports.getConnection = (opts) => {
  let connection = mysql.createConnection(opts);
  return {
    query: async (...args) => {
      const query = util.promisify(connection.query.bind(connection));
      return query(...args);
    },
    end: connection.end.bind(connection)
  };
}

exports.query = async function(stmt, params) {
  if (!defaultInstance) { return Promise.reject(new Error(`db :: no default instance`)) }
  return defaultInstance.query(stmt, params);
}

/**
* Load .sql file with multiple statements connection
* @param  {string} filepath full path of source file
* @return {[type]}          [description]
*/
exports.loadFile = async (settings, filepath) => {
  logger.log(`<${settings.host}> :: #loadFile :: ${filepath}`);

  settings.multipleStatements = true;
  let connection = mysql.createConnection(settings);

  let readFilePromise = util.promisify(fs.readFile);

  let stmts = await readFilePromise(filepath, 'utf8');

  // stmts = stmts.replace(/(?:\r\n|\r|\n)/g, '');
  // console.log(stmts);

  let query = util.promisify(connection.query.bind(connection))
  await query(stmts);

  connection.end();

  return true;
}

exports.printQuery = function (_stmt, _params) {
  if (!defaultInstance) { return; }
  let stmt = mysql.format(_stmt, _params);
  return stmt;
}

exports.setVerbose = function(v) {
  isVerbose = v;
  Object.keys(instanceList).forEach((key) => {
    let conn = instanceList[key];
    conn.setVerbose(v);
  });
}

class DBConnection {
  /**
   * @constructor
   * @param {object} settings MySQL Settings
   */
  constructor(connName) {
    this.name = util.format('[db::%s]', connName);
    this.settings = null;
    this.pool = null;
    this.activeConnection = 0;
    this.verbose = true;
  }

  init(settings) {
    this.settings = settings;
    this.pool = mysql.createPool(settings);
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
      logger.log(`${this.name} :: query :: stmt >> ${exports.printQuery(stmt, params)}`);
    }
    let self = this;
    this.activeConnection += 1;
    let poolQuery = util.promisify(self.pool.query.bind(self.pool));
    let results = await poolQuery(stmt, params);
    self.activeConnection -= 1;
    return results;
  }

  getActiveConnection() {
    return this.activeConnection;
  }

  setVerbose(verbose) {
    logger.log(`setVerbose >> ${verbose}`);
    this.verbose = verbose;
  }
}


/**
 * Helper Functions
 */
exports.helper = helper;
