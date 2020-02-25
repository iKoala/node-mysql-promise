/**
 * Helper module to create basic Create, Select, Update, Delete functions
 */
const util = require('util');
const _ = require('lodash');
const db = require('../index');

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

    let rs = await db.query(stmt, params)
    if (isIntegerID) {
      return rs[0];
    } else {
      return rs;
    }
  };
};

