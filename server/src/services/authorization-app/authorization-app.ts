import { install } from 'source-map-support';
install();

import { Connection } from 'mysql2/promise';
import { IConfig, IMysqlDatabase, TAnyObj } from '../../utils.interface';
import { IAuthorizationApp, IDetailRes, IListData, IListQuery, IListRes, IReviewBody, IReviewRes } from './authorization-app.interface';
import { FieldPacket } from 'mysql2';
import * as _ from 'lodash';
import { IJWTCotext } from '../utils.interface';
import { IOauthApplicationDao } from '../oauth-app/oauth-app.interface';
import { IUserDAO } from '../login/login.interface';
import got from 'got';
import { IOauthApplicationScopeDao } from '../oauth-app/oauth-app-scope.interface';

class AuthorizationApp implements IAuthorizationApp {
    private static instance: IAuthorizationApp;
    options: TAnyObj & { config: IConfig };
    private constructor(options: TAnyObj & { config: IConfig }) {
        this.options = options;
    }

    static getInstance(options: TAnyObj & { config: IConfig }): IAuthorizationApp {
        if (!AuthorizationApp.instance) {
            AuthorizationApp.instance = new AuthorizationApp(options);
        }

        return AuthorizationApp.instance;
    }

    async list(database: IMysqlDatabase, query: IListQuery, options: TAnyObj & IJWTCotext): Promise<IListRes> {
        try {
            let db = await database.getConnection();
            try {
                let result = await this.dbList(db, query, options);

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

    async dbList(db: Connection, query: IListQuery, options: TAnyObj & IJWTCotext): Promise<IListRes> {
        const { user: { user_id } } = options;
        const { q, count = 10, offset = 0 } = query;
        try {
            if (!_.isNumber(Number(offset)) || !_.isNumber(Number(count))) {
                throw new Error('[offset, count] type error');
            }

            let sql = `
                SELECT
                    DISTINCT
                        OS.OAUTH_APPLICATION_ID
                FROM
                    OAUTH_SCOPE OS,
                    API_SCOPE AS2
                WHERE
                    OS.SCOPE_ID = AS2.ID
                    AND OS.IS_CHECKED = FALSE
                    AND AS2.CREATE_BY = ?
            `;
            let [oauthAppIds] = <[{ OAUTH_APPLICATION_ID: string }[], FieldPacket[]]> await db.query(sql, [ user_id ]);
            if (oauthAppIds.length === 0) {
                return {
                    datas: [],
                    offset,
                    count,
                    totalPage: 0
                };
            }
            let oaIds = oauthAppIds.map((oauthAppId) => oauthAppId.OAUTH_APPLICATION_ID);

            sql = `
                SELECT
                    OA.ID,
                    OA.NAME,
                    OA.USER_ID,
                    U.ACCOUNT USER_ACCOUNT,
                    U.EMAIL USER_EMAIL,
                    U.PHONE USER_PHONE,
                    OA.HOMEPAGE_URL,
                    OA.APPLICATION_DESCRIPTION
                FROM
                    OAUTH_APPLICATION OA,
                    \`USER\` U
                WHERE
                    OA.USER_ID = U.ID
                    AND OA.ID IN (?)
            `;
            let whereSql = ['OA.NAME LIKE ?', 'OA.HOMEPAGE_URL LIKE ?'];
            let params: any[] = [oaIds];
            let pageParams: any[] = [Number(count), Number(offset * count)];
            !!q && params.push(`%${q}%`) && params.push(`%${q}%`);
            !!q && (sql += ` AND (${whereSql.join(' OR ')})`);
            sql += ' ORDER BY OA.CREATE_TIME DESC';
            sql += ' LIMIT ? OFFSET ?';

            let [result] = <[IListData[], FieldPacket[]]> await db.query(sql, [...params, ...pageParams]);
            if (result.length === 0) {
                return {
                    datas: [],
                    offset,
                    count,
                    totalPage: 0
                };
            }

            let totalSql = 'SELECT COUNT(1) FROM OAUTH_APPLICATION OA, \`USER\` U WHERE OA.USER_ID = U.ID AND OA.ID IN (?)';
            !!q && (totalSql += ` AND (${whereSql.join(' OR ')})`);

            let [totalCounts] = <[{ TOTAL_PAGE: number }[], FieldPacket[]]> await db.query(totalSql, params);
            let totalCount = totalCounts[0].TOTAL_PAGE;
            let totalPage = Math.ceil(totalCount / count);

            return {
                datas: result,
                offset,
                count,
                totalPage
            };
        } catch (err) {
            throw err;
        }
    }

    async detail(database: IMysqlDatabase, oa_id: string, options: TAnyObj & IJWTCotext): Promise<IDetailRes[]> {
        try {
            let db = await database.getConnection();
            try {
                let result = await this.dbDetail(db, oa_id, options);

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

    async dbDetail(db: Connection, oa_id: string, options: TAnyObj & IJWTCotext): Promise<IDetailRes[]> {
        const { user: { user_id } } = options;
        try {
            let sql = `
                SELECT
                    OS.ID OAUTH_SCOPE_ID,
                    OS.SCOPE_ID,
                    AS2.\`SYSTEM\` SCOPE_SYSTEM,
                    AS2.NAME SCOPE_NAME,
                    AS2.DESCRIPTION SCOPE_DESCRIPTION,
                    AS2.APIS SCOPE_APIS
                FROM
                    OAUTH_SCOPE OS,
                    API_SCOPE AS2
                WHERE
                    OS.SCOPE_ID = AS2.ID
                    AND OS.IS_CHECKED = FALSE
                    AND OS.OAUTH_APPLICATION_ID = ?
                    AND AS2.CREATE_BY = ?
            `;
            let [result] = <[IDetailRes[], FieldPacket[]]> await db.query(sql, [ oa_id, user_id ]);

            return result;
        } catch (err) {
            throw err;
        }
    }

    async rejectApp(database: IMysqlDatabase, oa_id: string, body: IReviewBody, options: TAnyObj & IJWTCotext): Promise<IReviewRes> {
        try {
            let db = await database.getConnection();
            try {
                await db.beginTransaction();
                let result = await this.dbRejectApp(db, oa_id, body, options);
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

    private async _mailTo(
        db: Connection, type: 'approved' | 'rejected',
        oa_id: string,
        apiScopes: { SYSTEM: string, NAME: string }[],
        body: IReviewBody,
        options: TAnyObj & IJWTCotext
    ): Promise<{
        code: number, status: string, message: string
    }> {
        const { description = '' } = body;
        const { EMAIL_CALLER_NOTIFY = [], EMAIL_SYSTEM = 'AC', EMAIL_IP, EMAIL_PORT } = this.options.config.getOptionConfig();
        try {
            let [oauthApps] = <[IOauthApplicationDao[], FieldPacket[]]> await db.query(`
                SELECT * FROM OAUTH_APPLICATION WHERE ID = ?
            `, [oa_id]);
            if (oauthApps.length === 0) {
                throw new Error(`[${oa_id}] Not find App`);
            }
            let { USER_ID, NAME } = oauthApps[0];
            let [users] = <[IUserDAO[], FieldPacket[]]> await db.query('SELECT * FROM USER WHERE ID = ?', [USER_ID]);
            if (users.length === 0) {
                throw new Error(`[${USER_ID}] Not find user`);
            }
            let { EMAIL, ACCOUNT } = users[0];

            let res = await got.post(`${EMAIL_IP}:${EMAIL_PORT}/api/mail-agent`, {
                json: {
                    system: EMAIL_SYSTEM,
                    callerNotify: EMAIL_CALLER_NOTIFY,
                    to: [EMAIL],
                    subject: `The App<${NAME}> you audit was ${type}`,
                    html: `<div>Dear ${ACCOUNT}:</div>
                    <br />
    <div>The <a href="https://localhost/application/${oa_id}">app</a> you audit was ${type}.</div>
    <br />
    <div>The ${type} scopes have:</div>
    <br />
    <div style="margin-left: 2rem">
        ${
            apiScopes.map((apiScope, index) => `${index + 1}. ${apiScope.SYSTEM}-${apiScope.NAME}`).join('<br />')
        }
    </div>
    <br />
    <div>
        Reson: ${description}
    </div>
                    `
                }
            });
            let result = JSON.parse(res.body);

            return result;
        } catch (err) {
            throw err;
        }
    }

    async dbRejectApp(db: Connection, oa_id: string, body: IReviewBody, options: TAnyObj & IJWTCotext): Promise<IReviewRes> {
        const { user: { user_id } } = options;
        try {
            let sql = `
                SELECT
                    AS2.\`SYSTEM\` , AS2.NAME
                FROM
                    OAUTH_SCOPE OS,
                    API_SCOPE AS2
                WHERE
                    OS.SCOPE_ID = AS2.ID
                    AND OS.OAUTH_APPLICATION_ID = '293f96ac-ead9-411b-88dd-9bbd007d3fb7'
                    AND OS.IS_CHECKED = FALSE
                    AND AS2.CREATE_BY = '89dad38e-0a29-42a9-a2dd-615732cf1b10'
            `;
            let [apiScopes] = <[{ SYSTEM: string, NAME: string }[], FieldPacket[]]> await db.query(sql, [oa_id, user_id]);

            sql = `
                DELETE
                    OS
                FROM
                    OAUTH_SCOPE OS,
                    API_SCOPE AS2
                WHERE
                    OS.SCOPE_ID = AS2.ID
                    AND OS.OAUTH_APPLICATION_ID = ?
                    AND OS.IS_CHECKED = FALSE
                    AND AS2.CREATE_BY = ?
            `;
            await db.query(sql, [oa_id, user_id]);
            await this._checkAppChecked(db, oa_id, options);

            // mail
            await this._mailTo(db, 'rejected', oa_id, apiScopes, body, options);

            return {
                OAUTH_APPLICATION_ID: oa_id
            };
        } catch (err) {
            throw err;
        }
    }

    async approveApp(database: IMysqlDatabase, oa_id: string, body: IReviewBody, options: TAnyObj & IJWTCotext): Promise<IReviewRes> {
        try {
            let db = await database.getConnection();
            try {
                await db.beginTransaction();
                let result = await this.dbApproveApp(db, oa_id, body, options);
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

    async dbApproveApp(db: Connection, oa_id: string, body: IReviewBody, options: TAnyObj & IJWTCotext): Promise<IReviewRes> {
        const { user: { user_id } } = options;
        try {
            let sql = `
                SELECT
                    AS2.\`SYSTEM\` , AS2.NAME
                FROM
                    OAUTH_SCOPE OS,
                    API_SCOPE AS2
                WHERE
                    OS.SCOPE_ID = AS2.ID
                    AND OS.OAUTH_APPLICATION_ID = '293f96ac-ead9-411b-88dd-9bbd007d3fb7'
                    AND OS.IS_CHECKED = FALSE
                    AND AS2.CREATE_BY = '89dad38e-0a29-42a9-a2dd-615732cf1b10'
            `;
            let [apiScopes] = <[{ SYSTEM: string, NAME: string }[], FieldPacket[]]> await db.query(sql, [oa_id, user_id]);

            sql = `
                UPDATE
                    OAUTH_SCOPE OS,
                    API_SCOPE AS2
                SET
                    OS.IS_CHECKED = TRUE
                WHERE
                    OS.SCOPE_ID = AS2.ID
                    AND OS.OAUTH_APPLICATION_ID = ?
                    AND OS.IS_CHECKED = FALSE
                    AND AS2.CREATE_BY = ?
            `;
            await db.query(sql, [oa_id, user_id]);
            await this._checkAppChecked(db, oa_id, options);
            // mail
            await this._mailTo(db, 'approved', oa_id, apiScopes, body, options);

            return {
                OAUTH_APPLICATION_ID: oa_id
            };
        } catch (err) {
            throw err;
        }
    }

    private async _checkAppChecked(db: Connection, oa_id: string, options: TAnyObj & IJWTCotext): Promise<any> {
        try {
            let sql = 'SELECT * FROM OAUTH_SCOPE WHERE OAUTH_APPLICATION_ID = ? AND IS_CHECKED = FALSE LIMIT 1';
            let [oauthScopes] = <[IOauthApplicationScopeDao[], FieldPacket[]]> await db.query(sql, [oa_id]);
            if (oauthScopes.length === 0) {
                await db.query('UPDATE OAUTH_APPLICATION SET ? WHERE ID = ?', [{ IS_CHECKED: true }, oa_id]);
            }
        } catch (err) {
            throw err;
        }
    }
}

export {
    AuthorizationApp
};
