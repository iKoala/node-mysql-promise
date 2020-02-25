/* eslint-disable quote-props */

const db = require('../index');

const DB_CONFIG = {
  "host": "127.0.0.1",
  "user": "root",
  "password": "abc@123"
};
const VERBOSE = true;

before(function() {
  db.verbose = VERBOSE;
  db.create('master', DB_CONFIG);
});

after(function() {
  db.destroy();
});
