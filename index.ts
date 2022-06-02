import * as NodeDB from './index-db';
import { DBConnection } from './lib/db-connection';

const instanceList: any = {};
let defaultInstance: DBConnection;

let isVerbose: Boolean = true;
let customLogger: any;
const logger: any = {
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

export const setLogger = (mLogger: any): void => {
  if (!mLogger) throw new Error('invalid logger object');
  if (typeof mLogger.log !== 'function') throw new Error('logger must has .log function');
  if (typeof mLogger.info !== 'function') throw new Error('logger must has .info function');
  customLogger = mLogger;
  NodeDB.setLogger(logger); // TODO
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
    logger.warn(`db ${connName} :: Invalid host config. Database not available.`)
    return null;
  }

  if (settings.password === null || settings.password === undefined) {
    logger.warn(`db <${connName}> :: Invalid password config. Database not available.`);
    return null;
  }

  const instance: DBConnection = new DBConnection(connName);
  instance.init(settings);
  instanceList[connName] = exports[connName] = instance;
  NodeDB.setInstanceList(instanceList); // TODO
  if (!defaultInstance) {
    defaultInstance = instance;
    NodeDB.setDefaultInstance(defaultInstance); // TODO
  }
  return instance;
};

export const destroy = NodeDB.destroy;
export const getInstanceList = NodeDB.getInstanceList;
export const getConnection = NodeDB.getConnection;
export const query = NodeDB.query;
export const loadFile = NodeDB.loadFile;
export const printQuery = NodeDB.printQuery;
export const setVerbose = NodeDB.setVerbose;
export const helper = NodeDB.helper;

export const printVersion = (version: string): void => {
  console.log(`NodeDB Version >> ${version}`);
};
printVersion(`v1`);
