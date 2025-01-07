/* eslint-disable quote-props */

const path = require('path');
const assert = require('assert');
const db = require('../dist/main');
const testConfig = require('./index');

const DB_CONFIG = testConfig.getDBConfig();

describe('Test database operation ...', function() {
  describe(`Create "test" database`, function() {
    it('should create test database if not exists', async function() {
      let rs = await db.query(`CREATE DATABASE IF NOT EXISTS test`)
      assert.ok(rs.affectedRows === 0 || rs.affectedRows === 1);
    });

    it(`should load schema from test.sql file`, async function() {
      let rs = await db.loadFile(DB_CONFIG, path.join('test.sql'))
      assert.ok(rs);
    });

    it(`should load data from test_data table`, async function() {
      let rs = await db.query('SELECT * FROM `test`.`test_data`;')
      assert.ok((rs.length === 3));
    });

    it(`should delete test_data table`, async function() {
      let rs = await db.query('DROP TABLE `test`.`test_data`')
      assert.ok(rs.warningStatus === 0);
    });
  });

});
