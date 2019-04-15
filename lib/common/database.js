// this is a modified version of this file:
// https://github.com/HowProgrammingWorks/Databases/blob/master/JavaScript/db.js

const { Pool } = require('pg');

const where = conditions => {
    let clause = '';
    const args = [];
    const regexp = RegExp('^>=|^<=|^<>|^>|^<|\\*|\\?');

    Object.entries(conditions).forEach(([key, value], index) => {
        let condition = `${key} = $${index + 1}`;

        if (typeof value === 'string' && regexp.test(value)) {
            const match = regexp.exec(value)[0];
            const isWildCard = ['*', '?'].includes(match);

            condition = condition.replace('=', isWildCard  ? 'LIKE' : match);

            value = isWildCard
                ? value.replace(/\*/g, '%').replace(/\?/g, '_')
                : value.substring(match.length);
        }

        args.push(value);
        clause = clause ? `${clause} AND ${condition}` : condition;
    });

    return { clause, args };
};

const MODE_ROWS = 0;
const MODE_VALUE = 1;
const MODE_ROW = 2;
const MODE_COL = 3;
const MODE_COUNT = 4;

class Cursor {
    constructor(database, table) {
        this.database = database;
        this.table = table;
        this.cols = null;
        this.rows = null;
        this.rowCount = 0;
        this.ready = false;
        this.mode = MODE_ROWS;
        this.whereClause = undefined;
        this.columns = ['*'];
        this.args = [];
        this.orderBy = undefined;
    }
    resolve(result) {
        const { rows, fields, rowCount } = result;
        this.rows = rows;
        this.cols = fields;
        this.rowCount = rowCount;
    }
    where(conditions) {
        const { clause, args } = where(conditions);
        this.whereClause = clause;
        this.args = args;
        return this;
    }
    fields(list) {
        this.columns = list;
        return this;
    }
    value() {
        this.mode = MODE_VALUE;
        return this;
    }
    row() {
        this.mode = MODE_ROW;
        return this;
    }
    col(name) {
        this.mode = MODE_COL;
        this.columnName = name;
        return this;
    }
    count() {
        this.mode = MODE_COUNT;
        return this;
    }
    order(name) {
        this.orderBy = name;
        return this;
    }
    then(callback) {
        // TODO: store callback to pool
        const { mode, table, columns, args } = this;
        const { whereClause, orderBy, columnName } = this;
        const fields = columns.join(', ');
        let sql = `SELECT ${fields} FROM ${table}`;
        if (whereClause) sql += ` WHERE ${whereClause}`;
        if (orderBy) sql += ` ORDER BY ${orderBy}`;
        this.database.query(sql, args,  (err, res) => {
            this.resolve(res);
            const { rows, cols } = this;
            if (mode === MODE_VALUE) {
                const col = cols[0];
                const row = rows[0];
                callback(row[col.name]);
            } else if (mode === MODE_ROW) {
                callback(rows[0]);
            } else if (mode === MODE_COL) {
                const col = [];
                for (const row of rows) {
                    col.push(row[columnName]);
                }
                callback(col);
            } else if (mode === MODE_COUNT) {
                callback(this.rowCount);
            } else {
                callback(rows);
            }
        });
        return this;
    }
}

class Database {
    constructor(config) {
        this.pool = new Pool(config);
        this.config = config;
    }

    query(sql, values, callback) {
        if (typeof values === 'function') {
            callback = values;
            values = [];
        }

        return this.pool.query(sql, values, (err, res) => {
            if (callback) callback(err, res);
        });
    }

    select(table) {
        return new Cursor(this, table);
    }

    insert(table, columns, values, callback) {
        const _columns = columns.join(', ');
        const _values = values.map((v,i) => `$${i+1}`).join(',');
        const sql = `INSERT INTO ${table} (${_columns}) VALUES(${_values})`;
        return this.pool.query(sql, values, (err, res) => {
            if(callback) callback(err, res)
        })
    }

    close() {
        this.pool.end();
    }
}

module.exports = Database;
