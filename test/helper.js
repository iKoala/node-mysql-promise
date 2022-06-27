/* eslint-disable quote-props */

const path = require('path');
const assert = require('assert');
const db = require('../dist/main');
const testConfig = require('./index');

const { helper } = db;

const DB_CONFIG = testConfig.getDBConfig();

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
    it('should order by `id` in descending order', async function() {
      const select = helper.createSelect(`test_data_2`, `id`);
      const rs = await select({ all: true, order: ['id', 'DESC'] });
      assert.deepStrictEqual(rs.length, 3);
      assert.deepStrictEqual(rs[0].id, 3);
    });
    it('should order by `stub` and `id` in descending order', async function() {
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

  describe('Test `createInsert` query function', function() {
    it('should throw error without table or primary key', async function() {
      assert.throws(helper.createInsert);
    });
    it('should insert with default fields', async function() {
      const insert = helper.createInsert('test_data_2', 'id', {
        defaultFields: {
          ctime: () => 123456789
        }
      });
      let rs = await insert({ stub: 'stub999' });
      assert.ok(rs.id > 3);
      let [rc] = await db.query('SELECT * FROM `test_data_2` WHERE `id` = ?', [rs.id]);
      assert.strictEqual(rc.ctime, 123456789);
      assert.strictEqual(rc.stub, 'stub999');
    });
    it('should use INSERT IGNORE by config', async function() {
      const insert = helper.createInsert('test_data_2', 'id', {
        ignore: true
      });
      let rs = await insert({ id: 3, ctime: 0, stub: 'stub3' });
      assert.strictEqual(rs.id, 3);
    });
    it('should use REPLACE INTO by config', async function() {
      const insert = helper.createInsert('test_data_2', 'id', {
        replace: true
      });
      let rs = await insert({ id: 3, ctime: 0, stub: 'stub3' });
      assert.strictEqual(rs.id, 3);
    });
  });

  describe('Test `createUpdate` query function', function() {
    it('should throw error without table or primary key', async function() {
      assert.throws(helper.createUpdate);
    });
    it('should update record with id', async function() {
      const select = helper.createSelect('test_data_2', 'id');
      const update = helper.createUpdate('test_data_2', 'id');
      await update(3, { ctime: 333, stub: 'stub333' });
      let rs = await select(3);
      assert.strictEqual(rs.id, 3);
      assert.strictEqual(rs.ctime, 333);
      assert.strictEqual(rs.stub, 'stub333');
    });
    it('should throw error when update restricted fields', async function() {
      const select = helper.createSelect('test_data_2', 'id');
      const update = helper.createUpdate('test_data_2', 'id', { restricts: ['ctime'] });
      assert.rejects(() => update(1, { ctime: 1 }));
      let rs = await select(1);
      assert.strictEqual(rs.id, 1);
      assert.notStrictEqual(rs.ctime, 1);
    });
    it('should update with default fields', async function() {
      const select = helper.createSelect('test_data_2', 'id');
      const update = helper.createUpdate('test_data_2', 'id', {
        defaults: {
          ctime: () => Math.round(Math.random() * 10000),
          stub: 's222',
        }
      });
      await update(2);
      let rs = await select(2);
      assert.strictEqual(rs.id, 2);
      assert.ok(rs.ctime > 0);
      assert.strictEqual(rs.stub, 's222');
    });
  });
});
