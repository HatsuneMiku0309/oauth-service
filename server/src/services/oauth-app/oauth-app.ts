import { install } from 'source-map-support';
install();

import { Connection } from 'mysql2/promise';
import { FieldPacket, ResultSetHeader } from 'mysql2';
import { TAnyObj, IMysqlDatabase } from '../../utils.interface';
import { IJWTCotext } from '../utils.interface';
import {
    ICreateBody, IListQuery, IListRes,
    IOauthApplication, IOauthApplicationDao,
    IUpdateBody, ICommonRes, IRemoveUserRes
} from './oauth-app.interface';
import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { checkDate, checkHttpProtocol, checkRedirectUri } from '../../utils';
import { IOauthApplicationUserDao } from '../oauth/oauth.interface';

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


    async list(database: IMysqlDatabase, query: IListQuery, options: TAnyObj & IJWTCotext): Promise<IListRes[]> {
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

    async dbList(db: Connection, query: IListQuery, options: TAnyObj & IJWTCotext): Promise<IListRes[]> {
        const { user: { user_id } } = options;
        try {
            let sql = `
                SELECT * FROM oauth_application WHERE USER_ID = ?
            `;
            let params = [user_id];
            let [rows] = <[IOauthApplicationDao[], FieldPacket[]]> await db.query(sql, params);
            let result = rows.map((row) => {
                return <IListRes> {
                    ID: row.ID,
                    NAME: row.NAME,
                    HOMEPAGE_URL: row.HOMEPAGE_URL,
                    APPLICATION_DESCRIPTION: row.APPLICATION_DESCRIPTION || ''
                };
            });

            return result;
        } catch (err) {
            throw err;
        }
    }

    async detail(database: IMysqlDatabase, id: string, options?: TAnyObj & IJWTCotext): Promise<IOauthApplicationDao> {
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

    async dbDetail(db: Connection, id: string, options?: TAnyObj & IJWTCotext): Promise<IOauthApplicationDao> {
        try {
            let sql = `
                SELECT * FROM oauth_application WHERE ID = ?
            `;
            let params = [id];
            let [rows] = <[IOauthApplicationDao[], FieldPacket[]]> await db.query(sql, params);
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

    private _checkCreateUpdateBody(body: ICreateBody): ICreateBody {
        const { name, homepage_url, application_description, redirect_uri, expires_date, not_before, is_disabled, is_expires } = body;
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
            } else if (!!expires_date && !checkDate(expires_date)) {
                throw new Error('expires_date invalid');
            } else if (!!not_before && !checkDate(not_before)) {
                throw new Error('not_before invalid');
            }

            if (!!homepage_url) {
                if (!_.isString(homepage_url)) {
                    throw new Error('homepage_url type error');
                } else if (!checkHttpProtocol(homepage_url, true)) {
                    throw new Error('homepage_url must https');
                }
            }

            if (!!redirect_uri) {
                if (!_.isString(redirect_uri)) {
                    throw new Error('redirect_uri type error');
                } else if (!checkHttpProtocol(redirect_uri, true)) {
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
                INSERT INTO oauth_application SET ?
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
                let result = await this.dbUpdate(db, id, body, options);
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
        const { user: { user_id } } = options;
        try {
            const {
                name, homepage_url, application_description,
                redirect_uri, expires_date, not_before,
                is_disabled, is_expires
            } = this._checkCreateUpdateBody(body);
            let [rows] = <[IOauthApplicationDao[], FieldPacket[]]> await db.query('SELECT * FROM oauth_application WHERE ID = ?', [id]);
            if (rows.length === 0) {
                throw new Error(`[${id}] id not find`);
            }

            let sql = `
                UPDATE oauth_application SET
                    ?
                WHERE
                    ID = ?
            `;
            let params = <IOauthApplicationDao> {
                ID: id,
                NAME: name,
                HOMEPAGE_URL: homepage_url,
                REDIRECT_URI: redirect_uri,
                IS_DISABLED: is_disabled || false,
                IS_EXPIRES: is_expires || false,
                UPDATE_BY: user_id
            };
            !!application_description && (params.APPLICATION_DESCRIPTION = application_description);
            !!expires_date && (params.EXPIRES_DATE = new Date(expires_date));
            !!not_before && (params.NOT_BEFORE = new Date(not_before));

            await db.query(sql, [params, id]);

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
        try {
            let [rows] = <[IOauthApplicationDao[], FieldPacket[]]> await db.query('SELECT * FROM oauth_application WHERE ID = ?', [id]);
            if (rows.length === 0) {
                throw new Error(`[${id}] id not find`);
            }

            let sql = `
                DELETE FROM oauth_application WHERE ID = ?
            `;
            let params = [id];
            await db.query<ResultSetHeader>(sql, params);

            return {
                ID: id
            };
        } catch (err) {
            throw err;
        }
    }

    async removeUser(database: IMysqlDatabase, id: string,  oau_id: string, options: TAnyObj & IJWTCotext): Promise<IRemoveUserRes> {
        try {
            let db = await database.getConnection();
            try {
                await db.beginTransaction();
                let result = await this.dbRemoveUser(db, id, oau_id, options);
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

    async dbRemoveUser(db: Connection, id: string, oau_id: string, options: TAnyObj & IJWTCotext): Promise<IRemoveUserRes> {
        try {
            let [rows] = <[IOauthApplicationUserDao[], FieldPacket[]]> await db.query(`
                SELECT * FROM oauth_application_user WHERE ID = ?
            `, [oau_id]);
            if (rows.length === 0) {
                throw new Error(`[${oau_id}] oau_id not find`);
            }

            let sql = `
                DELETE FROM oauth_application_user WHERE ID = ?
            `;
            let params = [ oau_id ];

            await db.query(sql, params);

            return {
                ID: id,
                OAUTH_APPLICATION_USER_ID: oau_id
            };
        } catch (err) {
            throw err;
        }
    }
}

export {
    OauthApplication
};
