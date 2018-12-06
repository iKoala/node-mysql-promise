'use strict';

const assert = require('assert');
const db = require('../index');

const DB_CONFIG = {
  "host": "127.0.0.1",
  "user": "root",
  "password": "abc123"
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

  describe('SELECT 1', function() {
    it('should return 1 with valid connection', function() {
      return db.query(`SELECT 1;`, [])
        .then(function(rs) {
          assert.ok(Array.isArray(rs));
          assert.deepStrictEqual(rs.length, 1);
          assert.ok(rs[0]['1'] === 1);
        });
    });
  });
});
