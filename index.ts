import * as NodeDB from './index-db';

export const setLogger = NodeDB.setLogger;
export const create: any = NodeDB.create;
export const destroy = NodeDB.destroy;
export const getInstanceList = NodeDB.getInstanceList;
export const getConnection = NodeDB.getConnection;
export const query = NodeDB.query;
export const loadFile = NodeDB.loadFile;
export const printQuery = NodeDB.printQuery;
export const setVerbose = NodeDB.setVerbose;
export const helper = NodeDB.helper;

const printVersion = (version: string): void => {
  console.log(`NodeDB Version >> ${version}`);
};
printVersion(`v1`);
