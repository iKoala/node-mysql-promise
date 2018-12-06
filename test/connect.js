'use strict';

const assert = require('assert');
const db = require('../index');

const DB_CONFIG = {
  "host": "127.0.0.1",
  "user": "root",
  "password": "abc@123"
};
const VERBOSE = false;

before(function() {
  db.verbose = VERBOSE;
  db.create('master', DB_CONFIG);
});

after(function() {
  db.destroy();
});

describe('Test database connection ...', function() {

  it('should select 1 from database', function() {
    return db.query(`SELECT 1;`, [])
      .then(function(rs) {
        assert.ok(Array.isArray(rs));
        assert.deepStrictEqual(rs.length, 1);
        assert.ok(rs[0]['1'] === 1);
      });
  });

  it('should select NOW() with single connection', function() {
    let connection = db.getConnection(DB_CONFIG);
    return connection.query('SELECT NOW(), ?;', ['foo'])
      .then(function(rs) {
        connection.end();
        let rc = rs[0];
        assert.ok(rc['NOW()'] instanceof Date);
      });
  });
});
