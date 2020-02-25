/* eslint-disable quote-props */

const db = require('../index');

const DB_CONFIG = {
  "host": "127.0.0.1",
  "user": "root",
  "password": "abc@123",
};
const VERBOSE = false;

before(function() {
  db.setVerbose(VERBOSE);
  db.create('master', DB_CONFIG);
});

after(function() {
  db.destroy();
});
