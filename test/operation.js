'use strict';

const path = require('path');
const assert = require('assert');
const db = require('../index');

describe('Test database operation ...', function() {

  describe(`Create "test" database`, () => {
    it('should create test database if not exists', () => {
      return db.query(`CREATE DATABASE IF NOT EXISTS test`)
        .then((rs) => {
          assert.ok(rs.affectedRows === 0 || rs.affectedRows === 1);
        }).then(() => {
          return db.query('USE `test`;');
        });
    });

    it(`should load schema from test.sql file`, () => {
      return db.loadFile(path.join('test.sql'))
        .then((rs) => {
          assert.ok(rs);
        });
    });

    it(`should load data from test_data table`, () => {
      return db.query('SELECT * FROM `test`.`test_data`;')
        .then((rs) => {
          assert.ok((rs.length > 0));
        });
    });

    it(`should delete test_data table`, () => {
      return db.query('DROP TABLE `test`.`test_data`')
        .then(assert.ok);
    });
  });

});
