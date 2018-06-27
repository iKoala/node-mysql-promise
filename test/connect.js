'use strict';

var assert = require('assert');
const db = require('../index');

const DB_CONFIG = {
  "host": "localhost",
  "user": "root",
  "password": "abc123"
};

describe('Test Database Connection', function() {

  before(function() {
    db.create('master', DB_CONFIG);
  });

  after(function() {
    db.destroy();
  });

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
