'use strict';

const fs = require('fs');
const util = require('util');
const P = require('bluebird');
const mysql = require("mysql");

var defaultInstance;
var instanceList = {};
var isVerbose = true;

var logger = {
  info: (...args) => {
    if (!isVerbose) { return; }
    console.info.apply(null, args);
  },
  log: (...args) => {
    if (!isVerbose) { return; }
    console.log.apply(null, args);
  },
  warn: (...args) => {
    console.warn.apply(null, args);
  }
};

var db = module.exports = exports = {
  create: function(connName, settings) {

    if (!connName) {
      throw new Error('missing connection name');
    }

    if (instanceList[connName]) {
      throw new Error('connection exists >> ' + connName);
    }

    logger.info('db.create :: <%s> :: host >> %s, database >> %s',
      connName, settings.host, settings.database);

    if (!settings.host || settings.host.length === 0) {
      logger.warn('db <%s> :: Invalid host config. Database not available.', connName);
      return null;
    }

    if (settings.password === null || settings.password === undefined) {
      logger.warn('db <%s> :: Invalid password config. Database not available.', connName);
      return null;
    }

    var instance = new DBConnection(connName);
    instance.init(settings);
    instanceList[connName] = db[connName] = instance;
    if (!defaultInstance) {
      defaultInstance = instance;
    }
    return instance;
  },

  destroy: function(connName) {
    if (instanceList[connName]) {
      instanceList[connName].destroy();
      delete instanceList[connName];
      return;
    }

    Object.keys(instanceList).forEach(key => {
      instanceList[key].destroy();
      delete instanceList[key];
    });
  },

  getConnection: (opts) => {
    let connection = mysql.createConnection(opts);

    return {
      query: (...args) => {
        return P.fromCallback((cb) => {
          // connection.query(stmt, cb);
          args.push(cb);
          connection.query.apply(connection, args);
        });
      },
      end: connection.end.bind(connection)
    };
  },

  query: function(stmt, params) {
    if (!defaultInstance) { return P.resolve(); }
    return defaultInstance.query(stmt, params);
  },

  loadFile: (...args) => {
    if (!defaultInstance) { return P.resolve(); }
    return defaultInstance.loadFile.apply(defaultInstance, args);
  },

  printQuery: function (_stmt, _params) {
    if (!defaultInstance) { return; }
    var stmt = mysql.format(_stmt, _params);
    return stmt;
  },

  setVerbose: function(v) {
    exports.verbose = v;
  },

  get verbose() {
    return isVerbose;
  },
  set verbose(v) {
    isVerbose = v;
    Object.keys(instanceList).forEach(key => {
      var conn = instanceList[key];
      conn.setVerbose(v);
    });
  }
};

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
  query(stmt, params) {
    if (this.verbose) {
      logger.log('%s :: query :: stmt >> %s',
        this.name, db.printQuery(stmt, params));
    }

    var self = this;
    this.activeConnection++;

    return P.fromCallback(function(callback) {
      return self.pool.query(stmt, params, callback);
    }).then(function(results) {
      self.activeConnection--;
      return results;
    });
  }

  /**
   * Load .sql file with multiple statements connection
   * @param  {string} filepath full path of source file
   * @return {[type]}          [description]
   */
  loadFile(filepath) {
    if (this.verbose) {
      logger.log(`${this.name} :: #loadFile :: ${filepath}`);
    }

    // let self = this;
    let settings = JSON.parse(JSON.stringify(this.settings));
    settings.multipleStatements = true;
    let connection = mysql.createConnection(settings);

    return P.fromCallback((cb) => {
      return fs.readFile(filepath, 'utf8', cb);
    }).then((stmts) => {
      // stmts = stmts.replace(/(?:\r\n|\r|\n)/g, '');
      // console.log(stmts);
      return P.fromCallback((cb) => {
        return connection.query(stmts, cb);
      });
    }).then(() => {
      connection.end();
      return true;
    });
  }

  getActiveConnection() {
    return this.activeConnection;
  }

  setVerbose(verbose) {
    logger.log('setVerbose >> %s', verbose);
    this.verbose = verbose;
  }
}
