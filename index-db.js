const fs = require('fs');
const util = require('util');
const mysql = require('mysql');
const { DBConnection } = require('./lib/db-connection');
const helper = require('./lib/helper');

let defaultInstance;
let instanceList = {};
let logger;

// TODO
exports.setDefaultInstance = (instance) => {
  defaultInstance = instance;
};
exports.setInstanceList = (list) => {
  instanceList = list;
};
exports.setLogger = (_logger) => {
  logger = _logger;
};

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
};

exports.getInstanceList = () => {
  return instanceList
};

exports.getConnection = (opts) => {
  let connection = mysql.createConnection(opts);
  return {
    query: async (...args) => {
      const query = util.promisify(connection.query.bind(connection));
      return query(...args);
    },
    end: connection.end.bind(connection)
  };
};

exports.query = async function(stmt, params) {
  if (!defaultInstance) { return Promise.reject(new Error(`db :: no default instance`)) }
  return defaultInstance.query(stmt, params);
};

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
};

exports.printQuery = function (_stmt, _params) {
  if (!defaultInstance) { return; }
  let stmt = mysql.format(_stmt, _params);
  return stmt;
};

exports.setVerbose = function(v) {
  isVerbose = v;
  Object.keys(instanceList).forEach((key) => {
    let conn = instanceList[key];
    conn.setVerbose(v);
  });
};

/**
 * Helper Functions
 */
exports.helper = helper;
