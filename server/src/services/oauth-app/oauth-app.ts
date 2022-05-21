import { install } from 'source-map-support';
install();

import { Connection } from 'mysql2/promise';
import { FieldPacket, ResultSetHeader } from 'mysql2';
import { TAnyObj, IMysqlDatabase } from '../../utils.interface';
import { IJWTCotext } from '../utils.interface';
import {
    ICreateBody, IListQuery, IListRes,
    IOauthApplication, IOauthApplicationDao,
    IUpdateBody, ICommonRes, IListData
} from './oauth-app.interface';
import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import * as dayjs from 'dayjs';
import { checkDateTime, checkHttpProtocol, checkRedirectUri } from '../../utils';
import { IOauthApplicationScope, IRegistBody } from './oauth-app-scope.interface';
import { IAccessTokenRes, IGrantCodeTokenRes, IOauth } from '../oauth/oauth.interface';

class OauthApplication implements IOauthApplication {
    static instance: IOauthApplication;
    options: TAnyObj;
    private constructor(options: TAnyObj = { }) {
        this.options = options;
    }

    static getInstance(options: TAnyObj = { }): IOauthApplication {
        if (!OauthApplication.instance) {
            OauthApplication.instance = new OauthApplication(options);
        }

        return OauthApplication.instance;
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
        const { q, offset = 0, count = 10 } = query;
        try {
            if (!_.isNumber(Number(offset)) || !_.isNumber(Number(count))) {
                throw new Error('[offset, count] type error');
            }
            let sql = `
                SELECT * FROM OAUTH_APPLICATION WHERE USER_ID = ?
            `;
            let whereSql = ['NAME LIKE ?', 'HOMEPAGE_URL LIKE ?'];
            let params: any[] = [user_id];
            let pageParams: any[] = [Number(count), Number(offset * count)];
            !!q && params.push(`%${q}%`) && params.push(`%${q}%`);
            !!q && (sql += ` AND (${whereSql.join(' OR ')})`);
            sql += ' ORDER BY CREATE_TIME DESC';
            sql += ' LIMIT ? OFFSET ?';

            let [rows] = <[IOauthApplicationDao[], FieldPacket[]]> await db.query(sql, [...params, ...pageParams]);
            let result = rows.map((row) => {
                return <IListData> {
                    ID: row.ID,
                    NAME: row.NAME,
                    HOMEPAGE_URL: row.HOMEPAGE_URL,
                    APPLICATION_DESCRIPTION: row.APPLICATION_DESCRIPTION || '',
                    IS_CHECKED: row.IS_CHECKED ? 'Y' : 'N',
                    IS_DISABLED: row.IS_DISABLED ? 'Y' : 'N',
                    IS_EXPIRES: row.IS_EXPIRES ? 'Y' : 'N',
                    CREATE_TIME: dayjs(row.CREATE_TIME).format('YYYY-MM-DD HH:mm:ss'),
                    CREATE_BY: row.CREATE_BY,
                    UPDATE_TIME: row.UPDATE_TIME ? dayjs(row.UPDATE_TIME).format('YYYY-MM-DD HH:mm:ss') : undefined,
                    UPDATE_BY: row.UPDATE_BY
                };
            });

            let totalSql = 'SELECT COUNT(1) TOTAL_PAGE FROM OAUTH_APPLICATION WHERE USER_ID = ?';
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

    async detail(database: IMysqlDatabase, id: string, options: TAnyObj & IJWTCotext): Promise<IOauthApplicationDao> {
        try {
            let db = await database.getConnection();
            try {
                let result = await this.dbDetail(db, id, options);

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

    async dbDetail(db: Connection, id: string, options: TAnyObj & IJWTCotext): Promise<IOauthApplicationDao> {
        const { user: { user_id } } = options;
        try {
            let sql = `
                SELECT * FROM OAUTH_APPLICATION WHERE ID = ? AND CREATE_BY = ?
            `;
            let params = [id, user_id];
            let [rows] = <[IOauthApplicationDao[], (FieldPacket & { columnType: number })[]]> await db.query(sql, params);
            if (rows.length === 0) {
                throw new Error(`[${id}] id not find`);
            }
            let row = rows[0];

            return row;
        } catch (err) {
            throw err;
        }
    }

    async create(database: IMysqlDatabase, body: ICreateBody, options: TAnyObj & IJWTCotext): Promise<ICommonRes> {
        try {
            let db = await database.getConnection();
            try {
                await db.beginTransaction();
                let result = await this.dbCreate(db, body, options);
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

    private _checkCreateUpdateBody(body: IUpdateBody): IUpdateBody {
        const {
            name, homepage_url, application_description,
            redirect_uri, expires_date, not_before,
            is_disabled, is_expires, scope_ids } = body;
        try {
            if (!name) {
                throw new Error('name is required');
            } else if (!!name && !_.isString(name)) {
                throw new Error('name type error');
            } else if (!homepage_url) {
                throw new Error('homepage_url is required');
            } else if (!!application_description && !_.isString(application_description)) {
                throw new Error('application_description type error');
            } else if (!redirect_uri) {
                throw new Error('redirect_uri is required');
            } else if (!!expires_date && !checkDateTime(expires_date)) {
                throw new Error('expires_date invalid');
            } else if (!!not_before && !checkDateTime(not_before)) {
                throw new Error('not_before invalid');
            }

            if (!!homepage_url) {
                if (!_.isString(homepage_url)) {
                    throw new Error('homepage_url type error');
                } else if (!checkHttpProtocol(homepage_url, false)) {
                    throw new Error('homepage_url must https');
                }
            }

            if (!!scope_ids && !_.isArray(scope_ids)) {
                throw new Error('scope_id type error');
            }

            if (!!redirect_uri) {
                if (!_.isString(redirect_uri)) {
                    throw new Error('redirect_uri type error');
                } else if (!checkHttpProtocol(redirect_uri, false)) {
                    throw new Error('redirect_uri must https');
                } else if (!checkRedirectUri(redirect_uri)) {
                    throw new Error('redirect_uri must have path, ex: https://localhost/callback');
                }
            }

            if (is_disabled !== undefined) {
                if (!_.isBoolean(is_disabled)) {
                    throw new Error('is_disabled format error');
                }
            }

            if (is_expires !== undefined) {
                if (!_.isBoolean(is_expires)) {
                    throw new Error('is_expires format error');
                }
            }

            return body;
        } catch (err) {
            throw err;
        }
    }

    async dbCreate(db: Connection, body: ICreateBody, options: TAnyObj & IJWTCotext): Promise<ICommonRes> {
        const { user: { user_id } } = options;
        try {
            const {
                name, homepage_url, application_description,
                redirect_uri, expires_date, not_before,
                is_disabled, is_expires
            } = this._checkCreateUpdateBody(body);
            let sql = `
                INSERT INTO OAUTH_APPLICATION SET ?
            `;

            let id = uuid();
            let clientId = uuid();
            let secretParams = [id, user_id, clientId];
            let clientSecret = Buffer.from(secretParams.join(':')).toString('base64');
            let params = <IOauthApplicationDao> {
                ID: id,
                NAME: name,
                HOMEPAGE_URL: homepage_url,
                USER_ID: user_id,
                CLIENT_ID: clientId,
                CLIENT_SECRET: clientSecret,
                REDIRECT_URI: redirect_uri,
                IS_DISABLED: is_disabled || false,
                IS_EXPIRES: is_expires || false,
                CREATE_BY: user_id
            };
            !!application_description && (params.APPLICATION_DESCRIPTION = application_description);
            !!expires_date && (params.EXPIRES_DATE = new Date(expires_date));
            !!not_before && (params.NOT_BEFORE = new Date(not_before));

            await db.query(sql, [params]);

            return {
                ID: id
            };
        } catch (err) {
            throw err;
        }
    }
    async update(database: IMysqlDatabase, id: string, body: IUpdateBody, options: TAnyObj & IJWTCotext): Promise<ICommonRes> {
        try {
            let db = await database.getConnection();
            try {
                await db.beginTransaction();
                let result = await this.dbUpdate(db, id, body, {
                    ...options
                });
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

    async dbUpdate(db: Connection, id: string, body: IUpdateBody, options: TAnyObj & IJWTCotext): Promise<ICommonRes> {
        const { user: { user_id }, oauthApplicationScope, oauth } = options;
        try {
            const {
                name, homepage_url, application_description,
                redirect_uri, expires_date, not_before,
                is_disabled = false, is_expires = false, scope_ids
            } = this._checkCreateUpdateBody(body);
            let [rows] = <[IOauthApplicationDao[], FieldPacket[]]> await db.query(`
                SELECT * FROM OAUTH_APPLICATION WHERE ID = ? AND CREATE_BY = ?
            `, [id, user_id]);
            if (rows.length === 0) {
                throw new Error(`[${id}] id not find`);
            }
            let row = rows[0];
            let _body = _.map(scope_ids, (scope_id) => {
                const IS_SCOPE_DISABLED = false;
                const IS_SCOPE_CHECKED = true;
                return <IRegistBody> {
                    scope_id,
                    is_disabled: IS_SCOPE_DISABLED,
                    is_checked: IS_SCOPE_CHECKED
                };
            });
            let apiScopes =  await (<IOauthApplicationScope> oauthApplicationScope).dbRegistScope(db, id, _body, options);
            let IS_CHECKED = true;
            for (let apiScope of apiScopes) {
                if (!apiScope.IS_CHECKED && !row.IS_ORIGIN) {
                    IS_CHECKED = false;

                    break;
                }
            }

            let apiKey = '';
            try {
                let { code } = <IGrantCodeTokenRes> await (<IOauth> oauth).dbGrantCodeToken(db, {
                    response_type: 'code',
                    client_id: row.CLIENT_ID
                }, options);
                let { access_token } = <IAccessTokenRes> await (<IOauth> oauth).dbAccessToken(db, {
                    grant_type: 'code',
                    code,
                    redirect_uri: row.REDIRECT_URI
                }, {
                    user: {
                        user_id: row.USER_ID,
                        client_id: row.CLIENT_ID,
                        client_secret: row.CLIENT_SECRET
                    },
                    tokenType: 'apiKey'
                });
                apiKey = access_token;
            } catch (err) {
                // do not thing
            }

            let sql = `
                UPDATE OAUTH_APPLICATION SET
                    ?
                WHERE
                    ID = ? AND CREATE_BY = ?
            `;
            let params = <IOauthApplicationDao> {
                ID: id,
                NAME: name,
                HOMEPAGE_URL: homepage_url,
                REDIRECT_URI: redirect_uri,
                IS_DISABLED: is_disabled,
                IS_EXPIRES: is_expires,
                IS_CHECKED: IS_CHECKED,
                API_KEY: apiKey,
                UPDATE_BY: user_id
            };
            !!application_description && (params.APPLICATION_DESCRIPTION = application_description);
            !!expires_date && (params.EXPIRES_DATE = new Date(expires_date));
            !!not_before && (params.NOT_BEFORE = new Date(not_before));
            await db.query(sql, [params, id, user_id]);


            return {
                ID: id
            };
        } catch (err) {
            throw err;
        }
    }

    async remove(database: IMysqlDatabase, id: string, options: TAnyObj & IJWTCotext): Promise<ICommonRes> {
        try {
            let db = await database.getConnection();
            try {
                await db.beginTransaction();
                let result = await this.dbRemove(db, id, options);
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

    async dbRemove(db: Connection, id: string, options: TAnyObj & IJWTCotext): Promise<ICommonRes> {
        const { user: { user_id } } = options;
        try {
            let [rows] = <[IOauthApplicationDao[], FieldPacket[]]> await db.query(`
                SELECT * FROM OAUTH_APPLICATION WHERE ID = ? AND CREATE_BY = ?
            `, [id, user_id]);
            if (rows.length === 0) {
                throw new Error(`[${id}] id not find`);
            }

            let sql = `
                DELETE FROM OAUTH_APPLICATION WHERE ID = ? AND CREATE_BY = ?
            `;
            let params = [id, user_id];
            await db.query<ResultSetHeader>(sql, params);

            return {
                ID: id
            };
        } catch (err) {
            throw err;
        }
    }
}

export {
    OauthApplication
};
