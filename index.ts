import fs from 'fs';
import util from 'util';
import 'dotenv/config';
import * as mysql from 'mysql';
import { DBConnection } from './lib/db-connection';
import * as helper from './lib/helper';

const instanceList: { [key: string]: DBConnection } = {};
let defaultInstance: DBConnection;
let isVerbose: boolean = true;

interface Logger {
  info: any;
  log: any;
  warn: any;
}
export const createLogger = (info: any, log: any, warn: any): Logger => {
  return { info, log, warn };
};
let customLogger: Logger;
const logger: Logger = {
  info: (...args: any[]) => {
    if (!isVerbose) { return; }
    if (customLogger) {
      customLogger.info(...args);
    } else {
      console.info.apply(null, args);
    }
  },
  log: (...args: any[]) => {
    if (!isVerbose) { return; }
    if (customLogger) {
      customLogger.log(...args);
    } else {
      console.log.apply(null, args);
    }
  },
  warn: (...args: any[]) => {
    console.warn.apply(null, args);
  },
};

export const setLogger = (mLogger: Logger): void => {
  if (!mLogger) throw new Error('invalid logger object');
  if (typeof mLogger.log !== 'function') throw new Error('logger must has .log function');
  if (typeof mLogger.info !== 'function') throw new Error('logger must has .info function');
  customLogger = mLogger;
};

export const create = (connName: string, settings: any): DBConnection | null => {
  if (!connName) {
    throw new Error('missing connection name');
  }

  if (instanceList[connName]) {
    throw new Error('connection exists >> ' + connName);
  }

  logger.info(`db.create :: <${connName}> :: host >> ${settings.host}, database >> ${settings.database}`);

  if (!settings.host || settings.host.length === 0) {
    logger.warn(`db ${connName} :: Invalid host config. Database not available.`);
    return null;
  }

  if (settings.password === null || settings.password === undefined) {
    logger.warn(`db <${connName}> :: Invalid password config. Database not available.`);
    return null;
  }

  const instance: DBConnection = new DBConnection(connName);
  instance.init(settings);
  instanceList[connName] = exports[connName] = instance;
  if (!defaultInstance) {
    defaultInstance = instance;
  }
  return instance;
};

export const destroy: Function = (connName: string): void => {
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

export const getInstanceList: Function = (): object => {
  return instanceList;
};

export const getConnection: Function = (opts: string | mysql.ConnectionConfig): { query: Function, end: Function } => {
  const connection = mysql.createConnection(opts);
  const query: Function = util.promisify(connection.query.bind(connection));
  const end: Function = connection.end.bind(connection);
  return {
    // query: async (...args: []) => {
    //   const query = util.promisify(connection.query.bind(connection));
    //   return query(...args);
    // },
    query,
    end,
  };
};

export const query: Function = async (stmt: string, params: Array<any> = []): Promise<any> => {
  if (!defaultInstance) { return Promise.reject(new Error(`db :: no default instance`)); }
  return defaultInstance.query(stmt, params);
};

/**
* Load .sql file with multiple statements connection
* @param  {string} filepath full path of source file
* @return {[type]}          [description]
*/
export const loadFile: Function = async (settings: string | mysql.ConnectionConfig, filepath: string): Promise<boolean> => {
  logger.log(`<${typeof settings === 'string' ? settings : settings.host}> :: #loadFile :: ${filepath}`);

  if (typeof settings !== 'string') {
    settings.multipleStatements = true;
  }
  const connection: mysql.Connection = mysql.createConnection(settings);

  const readFilePromise: Function = util.promisify(fs.readFile);

  const stmts: string = await readFilePromise(filepath, 'utf8');

  // stmts = stmts.replace(/(?:\r\n|\r|\n)/g, '');
  // console.log(stmts);

  const queryPromise = util.promisify(connection.query.bind(connection));
  await queryPromise(stmts);

  connection.end();

  return true;
};

export const printQuery: Function = (_stmt: string, _params: Array<any>): string | null => {
  if (!defaultInstance) { return null; }
  const stmt = mysql.format(_stmt, _params);
  return stmt;
};

export const setVerbose = (v: boolean): void => {
  isVerbose = v;
  Object.keys(instanceList).forEach((key) => {
    const conn: DBConnection = instanceList[key];
    conn.setVerbose(v);
  });
};

export { helper };
