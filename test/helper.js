/* eslint-disable quote-props */

const path = require('path');
const assert = require('assert');
const db = require('../index');

const { helper } = db;

const DB_CONFIG = {
  "host": "127.0.0.1",
  "user": "root",
  "password": "abc@123",
  "database": "test",
};

describe('Test query helper', function() {
  before(async function() {
    await db.loadFile(DB_CONFIG, path.join('test2.sql'))
    await db.query('USE `test`');
  });

  describe('Test `createSelect` query function', function() {
    it('should throw error without where clause', async function() {
      const select = helper.createSelect(`test_data_2`, `id`);
      await assert.rejects(select);
    });
    it('should throw error with where string', async function() {
      const select = helper.createSelect(`test_data_2`, `id`);
      await assert.rejects(() => select({ where: '1=1' }));
    });
    it('should select all from database', async function() {
      const select = helper.createSelect(`test_data_2`, `id`);
      const rs = await select({ all: true });
      assert.ok(Array.isArray(rs));
      assert.deepStrictEqual(rs.length, 3);
    });
    it('should select record id 3', async function() {
      const select = helper.createSelect(`test_data_2`, `id`);
      const rs = await select(3);
      assert.deepStrictEqual(rs.id, 3);
    });
    it('should select record id [1,3]', async function() {
      const select = helper.createSelect(`test_data_2`, `id`);
      const rs = await select([1, 3]);
      assert.deepStrictEqual(rs.length, 2);
      assert.deepStrictEqual(rs[0].id, 1);
      assert.deepStrictEqual(rs[1].id, 3);
    });
    it('should select no record with empty array', async function() {
      const select = helper.createSelect(`test_data_2`, `id`);
      const rs = await select([]);
      assert.deepStrictEqual(rs.length, 0);
    });
    it('should order by id in descending order', async function() {
      const select = helper.createSelect(`test_data_2`, `id`);
      const rs = await select({ all: true, order: ['id', 'DESC'] });
      assert.deepStrictEqual(rs.length, 3);
      assert.deepStrictEqual(rs[0].id, 3);
    });
    it('should order by id in descending order', async function() {
      const select = helper.createSelect(`test_data_2`, `id`);
      const rs = await select({ all: true, order: [['stub', 'DESC'], ['id', 'DESC']] });
      assert.deepStrictEqual(rs.length, 3);
      assert.deepStrictEqual(rs[0].stub, 'stub3');
    });
    it('should select all from database', async function() {
      const select = helper.createSelect(`test_data_2`, `id`);
      const rs = await select({ all: true, limit: 2 });
      assert.ok(Array.isArray(rs));
      assert.deepStrictEqual(rs.length, 2);
    });
  });
})
