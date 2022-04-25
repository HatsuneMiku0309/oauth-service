import { install } from 'source-map-support';
install();

import * as mysql2 from 'mysql2/promise';
import * as _ from 'lodash';
import { IDatabaseConfig, IEndReturn, IMysqlDatabase } from './utils.interface';

class MysqlDatabase implements IMysqlDatabase {
    readonly config: IDatabaseConfig;
    constructor(config: IDatabaseConfig ) {
        this.config = config;
    }

    async release(poolConn: mysql2.PoolConnection, force?: boolean): Promise<IEndReturn> {
        try {
            if (!poolConn) {
                throw new Error('No poolConn');
            }

            force === true
                ? await poolConn.end()
                : poolConn.release();

            return {
                state: 0,
                message: ''
            };
        } catch (err) {
            throw err;
        }
    }

    async end(conn: mysql2.Connection, force?: boolean): Promise<IEndReturn>;
    async end(pool: mysql2.Pool): Promise<IEndReturn>;
    async end(poolConn: mysql2.PoolConnection, force?: boolean): Promise<IEndReturn>;
    async end(connection?: mysql2.Connection | mysql2.Pool | mysql2.PoolConnection, force?: boolean): Promise<IEndReturn> {
        try {
            let msg = '';
            if (connection && connection.constructor.name === 'PromiseConnection') {
                force === true
                    ? (<mysql2.Connection> connection).destroy()
                    : await (<mysql2.Connection> connection).end();
                msg = 'Connection end';
            } else if (connection && connection.constructor.name === 'PromisePool') {
                await (<mysql2.Pool> connection).end();
                msg = 'Pool end';
            } else if (connection && connection.constructor.name === 'PromisePoolConnection') {
                force === true
                    ? await (<mysql2.PoolConnection> connection).end()
                    : (<mysql2.PoolConnection> connection).release();
                msg = 'PoolConn end';
            } else {
                throw new Error('Unkowns connection');
            }

            return {
                state: 0,
                message: msg
            };
        } catch (err) {
            throw err;
        }
    }

    async getPoolConnection(pool: mysql2.Pool): Promise<mysql2.PoolConnection> {
        try {
            if (!pool) {
                throw new Error('No pool');
            }
            const poolConn = await pool.getConnection();

            return poolConn;
        } catch (err) {
            throw err;
        }
    }

    async getConnection(): Promise<mysql2.Connection> {
        try {
            const conn = await mysql2.createConnection(this.config);

            return conn;
        } catch (err) {
            throw err;
        }
    }

    async getPool(): Promise<mysql2.Pool> {
        try {
            const pool = mysql2.createPool(this.config);

            return pool;
        } catch (err) {
            throw err;
        }
    }
}

export enum dbType {
    DECIMAL = 0x00, // aka DECIMAL (http://dev.mysql.com/doc/refman/5.0/en/precision-math-decimal-changes.html)
    TINY = 0x01, // aka TINYINT, 1 byte
    SHORT = 0x02, // aka SMALLINT, 2 bytes
    LONG = 0x03, // aka INT, 4 bytes
    FLOAT = 0x04, // aka FLOAT, 4-8 bytes
    DOUBLE = 0x05, // aka DOUBLE, 8 bytes
    NULL = 0x06, // NULL (used for prepared statements, I think)
    TIMESTAMP = 0x07, // aka TIMESTAMP
    LONGLONG = 0x08, // aka BIGINT, 8 bytes
    INT24 = 0x09, // aka MEDIUMINT, 3 bytes
    DATE = 0x0a, // aka DATE
    TIME = 0x0b, // aka TIME
    DATETIME = 0x0c, // aka DATETIME
    YEAR = 0x0d, // aka YEAR, 1 byte (don't ask)
    NEWDATE = 0x0e, // aka ?
    VARCHAR = 0x0f, // aka VARCHAR (?)
    BIT = 0x10, // aka BIT, 1-8 byte
    JSON = 0xf5,
    NEWDECIMAL = 0xf6, // aka DECIMAL
    ENUM = 0xf7, // aka ENUM
    SET = 0xf8, // aka SET
    TINY_BLOB = 0xf9, // aka TINYBLOB, TINYTEXT
    MEDIUM_BLOB = 0xfa, // aka MEDIUMBLOB, MEDIUMTEXT
    LONG_BLOB = 0xfb, // aka LONGBLOG, LONGTEXT
    BLOB = 0xfc, // aka BLOB, TEXT
    VAR_STRING = 0xfd, // aka VARCHAR, VARBINARY
    STRING = 0xfe, // aka CHAR, BINARY
    GEOMETRY = 0xff // aka GEOMETRY
}

export {
    MysqlDatabase
};
