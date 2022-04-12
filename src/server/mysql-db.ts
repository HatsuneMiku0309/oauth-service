import { install } from 'source-map-support';
install();

import * as mysql2 from 'mysql2/promise';
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

export {
    MysqlDatabase
};
