import { install } from 'source-map-support';
install();

import { Connection } from 'mysql2/promise';
import { FieldPacket } from 'mysql2';
import { TAnyObj, IMysqlDatabase } from '../../utils.interface';
import { IJWTCotext } from '../utils.interface';
import {
    IRemoveUserRes
} from './oauth-app.interface';
import * as _ from 'lodash';
import { IListQuery, IListRes, IOauthApplicationUser, IOauthApplicationUserDao } from './oauth-app-user.interface';

class OauthApplicationUser implements IOauthApplicationUser {
    static instance: IOauthApplicationUser;
    options: TAnyObj;
    private constructor(options: TAnyObj = { }) {
        this.options = options;
    }

    static getInstance(options: TAnyObj = { }): IOauthApplicationUser {
        if (!OauthApplicationUser.instance) {
            OauthApplicationUser.instance = new OauthApplicationUser(options);
        }

        return OauthApplicationUser.instance;
    }

    async list(database: IMysqlDatabase, oa_id: string, query: IListQuery, options: TAnyObj & IJWTCotext): Promise<IListRes> {
        try {
            let db = await database.getConnection();
            try {
                let result = await this.dbList(db, oa_id, query, options);

                return result;
            } catch (err) {
                throw err;
            } finally {
                await database.end(db);
            }
        } catch (err) {
            throw err;
        }
    }

    async dbList(db: Connection, oa_id: string, query: IListQuery, options: TAnyObj & IJWTCotext): Promise<IListRes> {
        const { user: { user_id } } = options;
        const { q, offset = 0, count = 10 } = query;
        try {
            if (!_.isNumber(Number(offset)) || !_.isNumber(Number(count))) {
                throw new Error('[offset, count] type error');
            }

            let sql = 'SELECT * FROM OAUTH_APPLICATION_USER WHERE OAUTH_APPLICATION_ID = ? AND CREATE_BY = ?';
            let whereSql = ['USER_ID LIKE ?'];
            let params: any[] = [oa_id, user_id];
            let pageParams: any[] = [Number(count), Number(offset * count)];
            !!q && params.push(`%${q}%`);
            !!q && (sql += ` AND (${whereSql.join(' OR ')})`);
            sql += ' LIMIT ? OFFSET ?';
            let [rows] = <[IOauthApplicationUserDao[], FieldPacket[]]> await db.query(sql, [...params, ...pageParams]);

            let totalSql = 'SELECT COUNT(1) TOTAL_PAGE FROM OAUTH_APPLICATION_USER WHERE OAUTH_APPLICATION_ID = ?';
            !!q && (totalSql += ` AND (${whereSql.join(' OR ')})`);

            let [totalCounts] = <[{ TOTAL_PAGE: number }[], FieldPacket[]]> await db.query(totalSql, params);
            let totalCount = totalCounts[0].TOTAL_PAGE;
            let totalPage = Math.ceil(totalCount / count);

            return {
                datas: rows,
                offset,
                count,
                totalPage
            };
        } catch (err) {
            throw err;
        }
    }

    async removeUser(database: IMysqlDatabase, oa_id: string,  id: string, options: TAnyObj & IJWTCotext): Promise<IRemoveUserRes> {
        try {
            let db = await database.getConnection();
            try {
                await db.beginTransaction();
                let result = await this.dbRemoveUser(db, oa_id, id, options);
                await db.commit();

                return result;
            } catch (err) {
                await db.rollback();
                throw err;
            } finally {
                await database.end(db);
            }
        } catch (err) {
            throw err;
        }
    }

    async dbRemoveUser(db: Connection, oa_id: string, id: string, options: TAnyObj & IJWTCotext): Promise<IRemoveUserRes> {
        const { user: { user_id } } = options;
        try {
            let [rows] = <[IOauthApplicationUserDao[], FieldPacket[]]> await db.query(`
                SELECT * FROM OAUTH_APPLICATION_USER WHERE ID = ? AND CREATE_BY = ?
            `, [id, user_id]);
            if (rows.length === 0) {
                throw new Error(`[${id}] id not find`);
            }

            let sql = `
                DELETE FROM OAUTH_APPLICATION_USER WHERE ID = ? AND CREATE_BY = ?
            `;
            let params = [ id, user_id ];

            await db.query(sql, params);

            return {
                ID: oa_id,
                OAUTH_APPLICATION_USER_ID: id
            };
        } catch (err) {
            throw err;
        }
    }
}

export {
    OauthApplicationUser
};
