/* eslint-disable quote-props */

const db = require('../index');

const DB_CONFIG = {
  "host": process.env.DB_HOST || "127.0.0.1",
  "user": process.env.DB_USER || "root",
  "password": process.env.DB_PASSWORD || "abc@123",
};
const VERBOSE = false;

exports.getDBConfig = () => DB_CONFIG;

before(function() {
  db.setVerbose(VERBOSE);
  db.create('master', DB_CONFIG);
});

after(async function() {
  await db.query('DROP TABLE IF EXISTS `test_data_2`')
  db.destroy();
});
