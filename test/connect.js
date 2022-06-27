/* eslint-disable quote-props */

const assert = require('assert');
const db = require('../dist/main');
const testConfig = require('./index');

const DB_CONFIG = testConfig.getDBConfig();

describe('Test MySQL Promise Wrapper', function() {
  describe('Test database connection ...', function() {
    it('should select 1 from database', async function() {
      let rs = await db.query(`SELECT 1;`, [])
      assert.ok(Array.isArray(rs));
      assert.deepStrictEqual(rs.length, 1);
      assert.ok(rs[0]['1'] === 1);
    });

    it('should select NOW() with single connection', async function() {
      let connection = db.getConnection(DB_CONFIG);
      let rs = await connection.query('SELECT NOW(), ?;', ['foo'])
      connection.end();
      let rc = rs[0];
      assert.ok(rc['NOW()'] instanceof Date);
    });
  });
})
