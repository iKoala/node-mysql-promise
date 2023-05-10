/**
 * Helper module to create basic Create, Select, Update, Delete functions
 */
import _ from 'lodash';
import * as db from '../src/index';

export type InsertConfig = {
  defaults?: { [key: string]: any },
  defaultFields?: { [key: string]: any },
  ignore?: boolean,
  insertIgnore?: boolean,
  replace?: boolean,
  replaceInto?: boolean,
}

export type UpdateConfig = {
  restricts?: Array<string>,
  restrictedFields?: Array<string>,
  defaults?: { [key: string]: any },
  defaultFields?: { [key: string]: any },
}

export const createSelect = (table: string, idField: string) => {
  return async function (...args: any[]): Promise<any> {
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
    const isIntegerID: boolean = (idField && id && _.isInteger(id));
    if (isIntegerID) {
      stmt += ' WHERE ?? = ? LIMIT 1';
      params.push(idField);
      params.push(id);
    }

    // Support array id
    const isArrayID: boolean = (idField && id && Array.isArray(id));
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
      const whereArr: Array<string> = [];
      let hasEmptyArray: boolean = false;
      _.each(opts.where, (val, key) => {
        if (Array.isArray(val)) {
          whereArr.push(`?? IN (?)`);
          if (val.length === 0) {
            hasEmptyArray = true;
            return false;
          }
        } else {
          whereArr.push('?? = ?');
        }
        params.push(key);
        params.push(val);
      });

      if (hasEmptyArray) {
        return [];
      }
      stmt += ' WHERE ' + whereArr.join(' AND ');
    }

    if (opts.order) {
      if (!Array.isArray(opts.order)) {
        throw new Error('options.order only support Array type, e.g. ["field", "ASC"], [["field", "DESC"]]');
      }
      const orderArr = [];
      // Array of String
      if (typeof opts.order[0] === 'string') {
        let [field, order] = opts.order;
        order = (_.toString(order).toUpperCase() === 'ASC' || _.toString(order).toUpperCase() === 'DESC')
          ? order : 'ASC';
        const orderStr = `?? ${order}`;
        orderArr.push(orderStr);
        params.push(field);
      }
      // Array of Array
      if (Array.isArray(opts.order[0])) {
        _.each(opts.order, (o) => {
          let [field, order] = o;
          order = (_.toString(order).toUpperCase() === 'ASC' || _.toString(order).toUpperCase() === 'DESC')
            ? order : 'ASC';
          const orderStr = `?? ${order}`;
          orderArr.push(orderStr);
          params.push(field);
        });
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

    const rs: any = await db.query(stmt, params);
    if (isIntegerID) {
      return rs[0];
    }
    return rs;
  };
};

export const createInsert = (
  tbl: string,
  idField: string,
  _cfg: InsertConfig = {},
) => {
  if (!tbl || !idField) {
    throw new Error('createInsert() must provide table and primary key');
  }
  return async function (
    rc: { [key: string]: any },
    _opts: Object = {},
  ): Promise<any> {
    const cfg = _cfg || {};
    const opts: Object = _opts || {};

    const defaultFields: { [key: string]: any } | undefined = cfg.defaults || cfg.defaultFields;

    // override default fields, support both object-like and array
    if (_.isPlainObject(defaultFields)) {
      rc = _.assignWith(rc, defaultFields, (objVal: any, srcVal: any) => {
        if (_.isFunction(srcVal)) {
          return srcVal();
        }
        return srcVal;
      });
    }

    let stmt: string = 'INSERT INTO ?? SET ?';

    if (cfg.insertIgnore === true || cfg.ignore === true) {
      stmt = 'INSERT IGNORE INTO ?? SET ?';
    }

    if (cfg.replaceInto === true || cfg.replace === true) {
      stmt = 'REPLACE INTO ?? SET ?';
    }

    const params: Array<string | Object> = [tbl, rc];

    const rs: any = await db.query(stmt, params);

    rc[idField] = !rc[idField] ? rs.insertId : rc[idField];

    return rc;
  };
};

export const createUpdate = (
  table: string,
  primaryKeyField: string,
  _cfg: UpdateConfig = {},
) => {
  if (!table || !primaryKeyField) {
    throw new Error('createUpdate() requires table name and primary key field');
  }
  return async (
    id: number,
    _rc: { [key: string]: any },
    _opts: Object = {},
  ): Promise<any> => {
    const cfg: UpdateConfig = _cfg || {};
    const opts: Object = _opts || {};
    let rc = _.clone(_rc || {});
    delete rc[primaryKeyField]; // Does not allow to update primary key field

    const restrictedFields = cfg.restricts || cfg.restrictedFields;
    if (restrictedFields) {
      _.each(restrictedFields, (field) => {
        if (_.has(rc, field)) {
          throw new Error(`update query failed, \`${field}\` is restricted`);
        }
      });
    }

    const defaultFields: { [key: string]: any } | undefined = cfg.defaults || cfg.defaultFields;
    if (_.isPlainObject(defaultFields)) {
      rc = _.assignWith(rc, defaultFields, (objVal: any, srcVal: any) => {
        if (_.isFunction(srcVal)) {
          return srcVal();
        }
        return srcVal;
      });
    }

    const stmt: string = 'UPDATE ?? SET ? WHERE ?? = ? LIMIT 1';
    const params: Array<any> = [table, rc, primaryKeyField, id];
    await db.query(stmt, params);

    rc[primaryKeyField] = id;
    return rc;
  };
};
