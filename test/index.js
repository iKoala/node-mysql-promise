/* eslint-disable quote-props */

const db = require('../dist/main');

const DB_CONFIG = {
  "host": process.env.DB_HOST || "127.0.0.1",
  "user": process.env.DB_USER || "root",
  "password": process.env.DB_PASSWORD || "abc@123",
};
const VERBOSE = parseFloat(process.env.DB_VERBOSE) === 1 || false;

exports.getDBConfig = () => DB_CONFIG;

before(function() {
  db.setVerbose(VERBOSE);
  db.setLogger({
    info: (...args) => {
      console.info(`${new Date()}`, ...args);
    },
    log: (...args) => {
      console.log(`${new Date()}`, ...args);
    },
  });
  db.create('master', DB_CONFIG);
});

after(async function() {
  await db.query('DROP TABLE IF EXISTS `test_data_2`')
  db.destroy();
});
