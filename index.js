'use strict';

const util = require('util');
const P = require('bluebird');
const mysql = require("mysql");

var defaultInstance;
var instanceList = {};

var db = module.exports = exports = {
  create: function(connName, settings) {

    if (!connName) {
      throw new Error('missing connection name');
    }

    if (instanceList[connName]) {
      throw new Error('connection exists >> ' + connName);
    }

    console.info('db.create :: <%s> :: host >> %s, database >> %s',
      connName, settings.host, settings.database);

    if (!settings.host || settings.host.length === 0) {
      console.warn('db <%s> :: Invalid host config. Database not available.', connName);
      return null;
    }

    if (settings.password === null || settings.password === undefined) {
      console.warn('db <%s> :: Invalid password config. Database not available.', connName);
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

  query: function(stmt, params) {
    if (!defaultInstance) { return P.resolve(); }
    return defaultInstance.query(stmt, params);
  },

  printQuery: function (_stmt, _params) {
    if (!defaultInstance) { return; }
    var stmt = mysql.format(_stmt, _params);
    return stmt;
  },

  setVerbose: function(verbose) {
    for (var key in instanceList) {
      var conn = instanceList[key];
      conn.setVerbose(verbose);
    }
  }
};

/**
 * @constructor
 */
function DBConnection(connName) {
  this.name = util.format('[db::%s]', connName);
  this.pool = null;
  this.activeConnection = 0;
  this.verbose = true;
}

/**
 * @constructor
 * @param {object} settings MySQL Settings
 */
DBConnection.prototype.init = function init(settings) {
  this.pool = mysql.createPool(settings);
};

DBConnection.prototype.destroy = function destroy() {
  if (this.pool) {
    this.pool.end();
    this.pool = null;
    this.activeConnection = 0;
  }
};

/**
 * Execute query and return result set
 * @public
 * @memberOf exports
 */
DBConnection.prototype.query = function query(stmt, params) {
  if (this.verbose) {
    console.log('%s :: query :: stmt >> %s',
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
};

DBConnection.prototype.getActiveConnection = function getActiveConnection() {
  return this.activeConnection;
};

DBConnection.prototype.setVerbose = function(verbose) {
  console.log('setVerbose >> %s', verbose);
  this.verbose = verbose;
};
