import { install } from 'source-map-support';
install();

import { Connection } from 'mysql2/promise';
import { FieldPacket } from 'mysql2';
import { TAnyObj, IMysqlDatabase, IConfig } from '../../utils.interface';
import { IJWTCotext } from '../utils.interface';
import {
    IOauthApplicationDao,
    IRemoveUserRes
} from './oauth-app.interface';
import * as _ from 'lodash';
import { IListQuery, IListRes, IOauthApplicationUser, IOauthApplicationUserDao } from './oauth-app-user.interface';

class OauthApplicationUser implements IOauthApplicationUser {
    static instance: IOauthApplicationUser;
    options: TAnyObj & { config: IConfig };
    private constructor(options: TAnyObj & { config: IConfig }) {
        this.options = options;
    }

    static getInstance(options: TAnyObj & { config: IConfig }): IOauthApplicationUser {
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

            let [oauthApplications] = <[IOauthApplicationDao[], FieldPacket[]]> await db.query('SELECT * FROM OAUTH_APPLICATION WHERE ID = ? AND USER_ID = ?', [oa_id, user_id]);
            if (oauthApplications.length === 0) {
                throw new Error('Not find app');
            }
            let oauthApplication = oauthApplications[0];

            let sql = `
                SELECT
                    U.ACCOUNT,
                    OAU.*
                FROM
                    OAUTH_APPLICATION_USER OAU,
                    \`USER\` U
                WHERE
                    OAU.USER_ID = U.ID
                    AND OAU.OAUTH_APPLICATION_ID = ?
                    AND OAU.CREATE_BY = ?
            `;
            let whereSql = ['OAU.USER_ID LIKE ?'];
            let params: any[] = [oa_id, oauthApplication.CLIENT_ID];
            let pageParams: any[] = [Number(count), Number(offset * count)];
            !!q && params.push(`%${q}%`);
            !!q && (sql += ` AND (${whereSql.join(' OR ')})`);
            sql += ' LIMIT ? OFFSET ?';
            let [rows] = <[(IOauthApplicationUserDao & { ACCOUNT: string })[], FieldPacket[]]> await db.query(sql, [...params, ...pageParams]);

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

    async removeUsers(database: IMysqlDatabase, oa_id: string, body: string[], options: TAnyObj & IJWTCotext): Promise<IRemoveUserRes> {
        try {
            let db = await database.getConnection();
            try {
                await db.beginTransaction();
                let result = await this.dbRemoveUsers(db, oa_id, body, options);
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

    async dbRemoveUsers(db: Connection, oa_id: string, body: string[], options: TAnyObj & IJWTCotext): Promise<IRemoveUserRes> {
        const { user: { user_id } } = options;
        try {
            let [oauthApplications] = <[IOauthApplicationDao[], FieldPacket[]]> await db.query('SELECT * FROM OAUTH_APPLICATION WHERE ID = ? AND USER_ID = ?', [oa_id, user_id]);
            if (oauthApplications.length === 0) {
                throw new Error('Not find app');
            }
            let oauthApplication = oauthApplications[0];

            let sql = `
                DELETE FROM OAUTH_APPLICATION_USER WHERE OAUTH_APPLICATION_ID = ? AND ID IN (?) AND CREATE_BY = ?
            `;
            let params = [ oa_id, body, oauthApplication.CLIENT_ID ];
            await db.query(sql, params);

            sql = `
                DELETE FROM OAUTH_TOKEN WHERE OAUTH_APPLICATION_USER_ID IN (?) AND CREATE_BY = ?
            `;
            await db.query(sql, [body, oauthApplication.CLIENT_ID]);

            return {
                ID: oa_id,
                OAUTH_APPLICATION_USER_IDS: body
            };
        } catch (err) {
            throw err;
        }
    }
}

export {
    OauthApplicationUser
};
