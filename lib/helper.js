/**
 * Helper module to create basic Create, Select, Update, Delete functions
 */
const util = require('util');
const _ = require('lodash');
const db = require('../index.ts');

exports.createSelect = (table, idField) => {
  return async function (...args) {
    // `id` should be be Integer or Array
    let id = args[0];
    id = (_.isInteger(id) || Array.isArray(id)) ? id : null;

    // opts should be object{}
    let opts = args[args.length - 1];
    opts = (_.isPlainObject(opts)) ? opts : {};

    if (!id && !opts.where && opts.all !== true) {
      throw new Error('select query must provide `id`, `where` clause or set options.all = true');
    }

    if (opts.where && !_.isPlainObject(opts.where)) {
      throw new Error('`where` caluse must be plain object');
    }

    // Remove where clause if select all
    if (opts.all === true) {
      id = null;
      delete opts.where;
    }

    let stmt;
    let params = [];

    if (opts.fields) {
      stmt = 'SELECT ?? FROM ??';
      params.push(opts.fields);
      params.push(table);
    } else {
      stmt = 'SELECT * FROM ??';
      params.push(table);
    }

    // Support integer id
    let isIntegerID = (idField && id && _.isInteger(id));
    if (isIntegerID) {
      stmt += ' WHERE ?? = ? LIMIT 1';
      params.push(idField);
      params.push(id);
    }

    // Support array id
    let isArrayID = (idField && id && Array.isArray(id));
    if (isArrayID) {
      if (id.length === 0) {
        return [];
      }
      stmt += ' WHERE ?? IN (?)';
      params.push(idField);
      params.push(id);
    }

    // support where object
    if (opts.where && _.isPlainObject(opts.where)) {
      let whereArr = [];
      _.each(opts.where, function(val, key) {
        if (Array.isArray(val)) {
          whereArr.push(`?? IN (?)`);
          if (val.length === 0) {
            val.push(0);
          }
        } else {
          whereArr.push('?? = ?');
        }
        params.push(key);
        params.push(val);
      });
      stmt += ' WHERE ' + whereArr.join(' AND ');
    }

    if (opts.order) {
      if (!Array.isArray(opts.order)) {
        throw new Error('options.order only support Array type, e.g. ["field", "ASC"], [["field", "DESC"]]');
      }
      const orderArr = []
      // Array of String
      if (typeof opts.order[0] === 'string') {
        let [field, order] = opts.order;
        order = (_.toString(order).toUpperCase() === 'ASC' || _.toString(order).toUpperCase() === 'DESC')
          ? order : 'ASC';
        let orderStr = `?? ${order}`;
        orderArr.push(orderStr);
        params.push(field);
      }
      // Array of Array
      if (Array.isArray(opts.order[0])) {
        _.each(opts.order, (o) => {
          let [field, order] = o;
          order = (_.toString(order).toUpperCase() === 'ASC' || _.toString(order).toUpperCase() === 'DESC')
            ? order : 'ASC';
          let orderStr = `?? ${order}`;
          orderArr.push(orderStr);
          params.push(field);
        })
      }
      stmt += ' ORDER BY ' + orderArr.join(', ');
    }

    if (opts.limit && _.isInteger(opts.limit)) {
      stmt += ' LIMIT ?';
      params.push(opts.limit);
    }

    if (opts.offset && _.isInteger(opts.offset)) {
      stmt += ' OFFSET ?';
      params.push(opts.offset);
    }

    let rs = await db.query(stmt, params)
    if (isIntegerID) {
      return rs[0];
    }
    return rs;
  };
};

exports.createInsert = function (tbl, idField, _cfg) {
  if (!tbl || !idField) {
    throw new Error('createInsert() should provide table and primary key');
  }
  return async function (rc, _opts) {
    const cfg = _cfg || {};
    const opts = _opts || {};

    const defaultFields = cfg.defaults || cfg.defaultFields;

    // skip generate ID with ticket system
    // if (!cfg.skipId) {
    //   return ticket.generate(tbl)
    //     .then(function(id) {
    //       rc[idField] = id;
    //     });
    // }

    // override default fields, support both object-like and array
    if (_.isPlainObject(defaultFields)) {
      rc = _.assignWith(rc, defaultFields, function(objVal, srcVal) {
        if (_.isFunction(srcVal)) {
          return srcVal();
        }
        return srcVal;
      });
    }

    // Not supporting ha
    // if (Array.isArray(cfg.defaultFields)) {
    //   rc = fieldRunner(rc, cfg.defaultFields);
    // }

    let stmt = 'INSERT INTO ?? SET ?';

    if (cfg.insertIgnore === true || cfg.ignore === true) {
      stmt = 'INSERT IGNORE INTO ?? SET ?';
    }

    if (cfg.replaceInto === true || cfg.replace === true) {
      stmt = 'REPLACE INTO ?? SET ?';
    }

    let params = [tbl, rc];

    let rs = await db.query(stmt, params);

    //   console.log(rs);

    // if (!rs.insertId) {
    //   return null;
    // }

    rc[idField] = !rc[idField] ? rs.insertId : rc[idField];
    // rc[idField] = rs.insertId;
    return rc;
  };
};

exports.createUpdate = function (table, primaryKeyField, _cfg) {
  if (!table || !primaryKeyField) {
    throw new Error('createUpdate() requires table name and primary key field');
  }
  return async function (id, _rc, _opts) {
    const cfg = _cfg || {};
    const opts = _opts || {};
    let rc = _.clone(_rc || {});
    delete rc[primaryKeyField]; // Does not allow to update primary key field

    const restrictedFields = cfg.restricts || cfg.restrictedFields;
    if (restrictedFields) {
      _.each(restrictedFields, (field) => {
        if (_.has(rc, field)) {
          throw new Error(`udpate query failed, \`${field}\` is restricted`)
        }
      })
    }

    const defaultFields = cfg.defaults || cfg.defaultFields;
    if (_.isPlainObject(defaultFields)) {
      rc = _.assignWith(rc, defaultFields, function(objVal, srcVal) {
        if (_.isFunction(srcVal)) {
          return srcVal();
        }
        return srcVal;
      });
    }

    let stmt = 'UPDATE ?? SET ? WHERE ?? = ? LIMIT 1';
    let params = [table, rc, primaryKeyField, id];
    await db.query(stmt, params)

    // update failed ???
    // if (result.affectedRows === 0) {
    //   return null;
    // }

    rc[primaryKeyField] = id;
    return rc;
  };
};
