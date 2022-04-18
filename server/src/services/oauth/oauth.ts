import { install } from 'source-map-support';
install();

import { v4 as uuid } from 'uuid';
import * as _ from 'lodash';
import { IError, IMysqlDatabase, TAnyObj } from '../../utils.interface';
import {
    IOauth, IGrantTokenBody, IAccessTokenBody, IGrantTokenRes, IAccessTokenRes,
    IRefreshTokenBody, IOauthApplicationAndUserDao, TTokenType, IOauthTokenDao,
    IVerifyTokenBody
} from './oauth.interface';
import { IOauthApplicationDao } from '../oauth-app/oauth-app.interface';
import { FieldPacket } from 'mysql2';
import { Connection } from 'mysql2/promise';
import { IJWTCotext } from '../utils.interface';
import { Passport } from '../jwt/passport';
import { IBasicPassportRes } from '../jwt/passport.interface';
import { checkHttpProtocol, checkRedirectUri } from '../../utils';

class Oauth implements IOauth {
    static instance: IOauth;
    private _USE_LIMIT: number = 1;
    readonly SEC_TIME: number = 60 * 1000;
    readonly EXPIRES_MIN = 15;
    readonly TOKEN_TYPE: TTokenType = 'bearer';
    options: TAnyObj;
    private constructor(options: TAnyObj = { }) {
        this.options = options;
    }

    static getInstance(options: TAnyObj = { }): IOauth {
        if (!Oauth.instance) {
            Oauth.instance = new Oauth(options);
        }

        return Oauth.instance;
    }

    private _checkGrantTokenBody(body: IGrantTokenBody): void {
        const { response_type, client_id, scope, state, redirect_uri } = body;
        try {
            if (!['code', 'token'].includes(response_type)) {
                throw new Error(`[${response_type}] Error response_type`);
            } else if (!client_id || !_.isString(client_id)) {
                throw new Error('No client_id');
            } else if (!!scope && !_.isString(scope)) {
                throw new Error('scope format error');
            } else if (!!state && !_.isString(state)) {
                throw new Error('state format error');
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
        } catch (err) {
            throw err;
        }
    }

    private async _checkOauthUser(
        db: Connection,
        body: {
            client_id: string;
            user_id: string;
            oauth_application_id: string;
            oauth_token_id: string;
        },
        options: TAnyObj = { }
    ): Promise<IOauthApplicationAndUserDao> {
        const { client_id, user_id, oauth_application_id, oauth_token_id } = body;
        try {
            let sql = `
            SELECT
                oas.ID,
                oas.USER_ID,
                oa.CLIENT_ID,
                oa.CLIENT_SECRET,
                oa.REDIRECT_URI,
                oa.EXPIRES_DATE,
                oa.NOT_BEFORE,
                oa.IS_DISABLED,
                oa.IS_EXPIRES,
                oa.IS_CHECKED,
                oa.AUDIT_STATE
            FROM
                OAUTH_application oa,
                OAUTH_APPLICATION_USER oas
            WHERE
                oas.OAUTH_APPLICATION_ID = oa.ID
                AND oa.CLIENT_ID = ? AND oas.USER_ID = ?
            `;
            let params = [ client_id, user_id ];
            let [oauthApplicationAndUsers] = <[IOauthApplicationAndUserDao[], FieldPacket[]]> await db.query(sql, params);

            if (oauthApplicationAndUsers.length === 0) {
                await db.query(`
                    INSERT INTO OAUTH_APPLICATION_USER SET ?
                `, [{
                    ID: uuid(),
                    USER_ID: user_id,
                    OAUTH_APPLICATION_ID: oauth_application_id,
                    OAUTH_TOKEN_ID: oauth_token_id,
                    CREATE_BY: user_id
                }]);
                let [rows] = <[IOauthApplicationAndUserDao[], FieldPacket[]]> await db.query(sql, params);
                oauthApplicationAndUsers = rows;
            }
            let oauthApplicationAndUser = oauthApplicationAndUsers[0];

            return oauthApplicationAndUser;
        } catch (err) {
            throw err;
        }
    }

    /**
     * set old token expires
     * 
     * @param db 
     * @param client_id 
     * @param oauth_application_user_id 
     * @param options 
     */
    private async _setTokenExpires(
        db: Connection, client_id: string, oauth_application_user_id: string, options: TAnyObj = { }
    ): Promise<void> {
        const { NOW_DATE } = options;
        try {
            await db.query(`
                UPDATE OAUTH_TOKEN SET
                    IS_EXPIRES = ?,
                    IS_DISABLED = ?,
                    EXPIRES_DATE = ?,
                    UPDATE_BY = ?
                WHERE
                    OAUTH_APPLICATION_USER_ID = ?
                    AND (IS_EXPIRES = ? OR IS_DISABLED = ?)
            `, [ true, true, NOW_DATE, client_id, oauth_application_user_id, false, true ]);
        } catch (err) {
            throw err;
        }
    }

    /**
     * trans 15 day before data to history
     * 
     * @param db 
     * @param oauth_application_user_id 
     * @param options 
     */
    private async _transTokenToHis(db: Connection, oauth_application_user_id: string, options: TAnyObj = { }) {
        try {
            const HIS_COLUMNS = [
                'OAUTH_TOKEN_ID', 'OAUTH_APPLICATION_USER_ID',
                'GRANT_TYPE',
                'CODE',
                'TOKEN_TYPE',
                'ACCESS_TOKEN', 'REFRESH_TOKEN',
                'EXPIRES_DATE', 'NOT_BEFORE',
                'IS_DISABLED', 'IS_EXPIRES',
                'USE_LIMIT', 'USE_COUNT',
                'CREATE_TIME', 'CREATE_BY',
                'STATE'
            ];
            const COLUMNS = [
                'ID', 'OAUTH_APPLICATION_USER_ID',
                'GRANT_TYPE',
                'CODE',
                'TOKEN_TYPE',
                'ACCESS_TOKEN', 'REFRESH_TOKEN',
                'EXPIRES_DATE', 'NOT_BEFORE',
                'IS_DISABLED', 'IS_EXPIRES',
                'USE_LIMIT', 'USE_COUNT',
                'CREATE_TIME', 'CREATE_BY',
                'STATE'
            ];

            await db.query(`
                INSERT INTO OAUTH_TOKEN_HIS (??)
                SELECT ?? FROM OAUTH_TOKEN WHERE OAUTH_APPLICATION_USER_ID = ? AND (IS_EXPIRES = ? OR IS_DISABLED = ?)
            `, [ HIS_COLUMNS, COLUMNS, oauth_application_user_id, true, true ]);
            await db.query(`
                DELETE FROM OAUTH_TOKEN WHERE OAUTH_APPLICATION_USER_ID = ? AND (IS_EXPIRES = ? OR IS_DISABLED = ?)
            `, [ oauth_application_user_id, true, true ]);
        } catch (err) {
            throw err;
        }
    }

    async checkOauthApplication(db: Connection, client_id: string, options: TAnyObj = { }): Promise<IOauthApplicationDao> {
        try {
            return await this._checkOauthApplication(db, client_id, options);
        } catch (err) {
            throw err;
        }
    }

    private async _checkOauthApplication(db: Connection, client_id: string, options: TAnyObj = { }): Promise<IOauthApplicationDao> {
        try {
            let [oauthApplicaions] = <[IOauthApplicationDao[], FieldPacket[]]> await db.query(`
                SELECT * FROM OAUTH_APPLICATION WHERE CLIENT_ID = ?
            `, [ client_id ]);

            if (oauthApplicaions.length === 0) {
                throw new Error(`[${client_id}] Unknowns client_id`);
            }

            let oauthApplicaion = oauthApplicaions[0];
            if (!!oauthApplicaion.IS_DISABLED) {
                throw new Error(`[${client_id}] client_id disabled`);
            } else if (!oauthApplicaion.IS_CHECKED) {
                throw new Error(`[${client_id}] client_id not check`);
            } else if (
                (!!oauthApplicaion.EXPIRES_DATE && +new Date(oauthApplicaion.EXPIRES_DATE) <= +new Date()) ||
                !!oauthApplicaion.IS_EXPIRES
            ) {
                throw new Error(`[${client_id}] client_id expires`);
            }

            return oauthApplicaion;
        } catch (err) {
            throw err;
        }
    }

    async grantCodeToken(
        database: IMysqlDatabase, body: IGrantTokenBody, options: TAnyObj & IJWTCotext
    ): Promise<IGrantTokenRes | IAccessTokenRes> {
        const { user: { user_id } } = options;
        const { response_type, client_id, redirect_uri, state, scope } = body;
        const NOW_DATE = new Date();
        const EXPIRES_TIME = this.EXPIRES_MIN * this.SEC_TIME;
        let result: IGrantTokenRes | IAccessTokenRes;
        try {
            this._checkGrantTokenBody(body);
            const db = await database.getConnection();
            try {
                await db.beginTransaction();
                let oauthApplicaion = await this._checkOauthApplication(db, client_id, options);
                let oauthApplicationAndUser = await this._checkOauthUser(db, {
                    client_id, user_id,
                    oauth_application_id: oauthApplicaion.ID,
                    oauth_token_id: ''
                }, options);
                await this._setTokenExpires(db, client_id, oauthApplicationAndUser.ID, { ...options, NOW_DATE });
                await this._transTokenToHis(db, oauthApplicationAndUser.ID, options);

                const id = uuid();
                const code = uuid();
                switch (response_type) {
                    case 'code':
                        result = {
                            code: code
                        };
                        !!redirect_uri && (result.redirect_uri = redirect_uri);
                        !!state && (result.state = state);
                        await db.query(`
                            INSERT INTO OAUTH_TOKEN SET ?
                        `, [{
                            ID: id,
                            OAUTH_APPLICATION_USER_ID: oauthApplicationAndUser.ID,
                            GRANT_TYPE: response_type,
                            CODE: code,
                            EXPIRES_DATE: new Date((+NOW_DATE + EXPIRES_TIME)),
                            TOKEN_TYPE: this.TOKEN_TYPE,
                            CREATE_BY: client_id,
                            STATE: state
                        }]);

                        break;
                    case 'token':
                        let access_token = Passport.grantJWTToken({
                            response_type,
                            client_id
                        }, { expiresIn: EXPIRES_TIME });
                        result = {
                            access_token: access_token, // grant access_token is jwt
                            token_type: this.TOKEN_TYPE,
                            expires_in: (EXPIRES_TIME) / 1000
                        };
                        !!redirect_uri && (result.redirect_uri = redirect_uri);
                        !!state && (result.state = state);
                        await db.query(`
                            INSERT INTO OAUTH_TOKEN SET ?
                        `, [{
                            ID: id,
                            OAUTH_APPLICATION_USER_ID: oauthApplicationAndUser.ID,
                            GRANT_TYPE: response_type,
                            CODE: code,
                            TOKEN_TYPE: this.TOKEN_TYPE,
                            ACCESS_TOKEN: access_token,
                            EXPIRES_DATE: new Date((+NOW_DATE + EXPIRES_TIME)),
                            USE_LIMIT: this._USE_LIMIT,
                            CREATE_BY: client_id,
                            STATE: state
                        }]);

                        break;
                    default:
                        throw new Error(`[${response_type}] Unknown response_type`);
                }
                await db.query(`
                    UPDATE
                        OAUTH_APPLICATION_USER
                    SET
                        OAUTH_TOKEN_ID = ?
                    WHERE
                        ID = ?
                `, [ id, oauthApplicationAndUser.ID ]);
                console.log(scope);
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

    private _checkAccessTokenBody(body: IAccessTokenBody): void {
        const { grant_type, code, redirect_uri, state } = body;
        try {
            if (grant_type !== 'code') {
                throw new Error(`[${grant_type}] grant_type error`);
            } else if (!code || !_.isString(code)) {
                throw new Error('code error');
            } else if (!redirect_uri) {
                throw new Error('redirect_uri is required');
            } else if (!!state && !_.isString(state)) {
                throw new Error('state error');
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
        } catch (err) {
            throw err;
        }
    }

    private async _accessTokenCheck(
        db: Connection, code: string, NOW_DATE: Date
    ): Promise<IOauthTokenDao> {
        try {
            let _err: IError = new Error();
            let [rows] = <[IOauthTokenDao[], FieldPacket[]]> await db.query(`
                SELECT
                    *
                FROM
                    OAUTH_TOKEN
                WHERE
                    GRANT_TYPE = ? AND CODE = ?
            `, [ 'code', code ]);
            if (rows.length !== 1) {
                rows.length !== 0 && (_err.data = rows[0]);
                _err.message = `[${code}] code error`;
                throw _err;
            }
            let row = rows[0];
            if (!!row.IS_DISABLED) {
                _err.data = row;
                _err.message = `[${code}] code disabled`;
                throw _err;
            } else if (
                (!!row.EXPIRES_DATE && +new Date(row.EXPIRES_DATE) < +NOW_DATE) ||
                !!row.IS_EXPIRES
            ) {
                _err.data = row;
                _err.message = `[${code}] code expires`;
                throw _err;
            } else if (!!row.ACCESS_TOKEN) {
                _err.message = `[${code}] code duplicate generate`;
                throw _err;
            }

            let [oauthApplicationAndUsers] = <[IOauthApplicationAndUserDao[], FieldPacket[]]> await db.query(`
                SELECT * FROM OAUTH_APPLICATION_USER WHERE ID = ?
            `, [ row.OAUTH_APPLICATION_USER_ID ]);
            if (oauthApplicationAndUsers.length === 0) {
                _err.data = row;
                _err.message = `[${code}] code error`;
                throw _err;
            }

            return row;
        } catch (err: any) {
            let _err: IError = err;
            if ('data' in _err) {
                await db.query(`
                    UPDATE OAUTH_TOKEN SET
                        IS_DISABLED = ?, IS_EXPIRES = ?
                    WHERE
                        ID = ?
                `, [ true, true, _err.data.ID ]);
                await this._transTokenToHis(db, _err.data.OATUH_APPLICATION_USER_ID, this.options);
            }

            throw err;
        }
    }

    private async _checkOauthApplicationByAccessAndRefreshAndVerify(db: Connection, options: TAnyObj & { user: IBasicPassportRes }) {
        const { user: { user_id, client_id, client_secret } } = options;
        try {
            let oauthApplicaion = await this._checkOauthApplication(db, client_id, options);
            if (oauthApplicaion.CLIENT_SECRET !== client_secret) {
                throw new Error(`[${client_id}] client_secret error`);
            } else if (oauthApplicaion.USER_ID !== user_id) {
                throw new Error(`[${client_id}] user_id error`);
            }

            return oauthApplicaion;
        } catch (err) {
            throw err;
        }
    }

    async accessToken(
        database: IMysqlDatabase,
        body: IAccessTokenBody & { grant_type: 'code' },
        options: TAnyObj & { user: IBasicPassportRes }
    ): Promise<IAccessTokenRes> {
        const { user: { client_id } } = options;
        const { grant_type, code, redirect_uri, state } = body;
        const NOW_DATE = new Date();
        const EXPIRES_TIME = this.EXPIRES_MIN * this.SEC_TIME;
        let result: IAccessTokenRes;
        try {
            this._checkAccessTokenBody(body);
            const db = await database.getConnection();
            try {
                await this._checkOauthApplicationByAccessAndRefreshAndVerify(db, options);
                let oauthTokenData = await this._accessTokenCheck(db, code, NOW_DATE);
                let accessToken = Passport.grantJWTToken({
                    grant_type, client_id
                }, { expiresIn: EXPIRES_TIME });
                let refreshToken = Passport.grantJWTToken({
                    grant_type: 'refresh_token', client_id
                }, { expiresIn: EXPIRES_TIME });
                result = {
                    access_token: accessToken, // grant access_token is jwt
                    token_type: this.TOKEN_TYPE,
                    expires_in: (EXPIRES_TIME) / 1000,
                    refresh_token: refreshToken,
                    redirect_uri: redirect_uri
                };
                !!state && (result.state = state);
                await db.query(`
                    UPDATE OAUTH_TOKEN SET
                        ACCESS_TOKEN = ?, REFRESH_TOKEN = ?,
                        EXPIRES_DATE = ?,
                        UPDATE_BY = ?
                    WHERE
                        ID = ?
                `, [
                    accessToken, refreshToken,
                    new Date((+NOW_DATE + EXPIRES_TIME)),
                    client_id,
                    oauthTokenData.ID
                ]);

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

    private _checkRefreshTokenBody(body: IRefreshTokenBody): void {
        const { grant_type, refresh_token, scope, state } = body;
        try {
            if (grant_type !== 'refresh_token') {
                throw new Error(`[${grant_type}] grant_type error`);
            } else if (!refresh_token) {
                throw new Error('No refresh_token');
            } else if (!!refresh_token && !_.isString(refresh_token)) {
                throw new Error('refresh_token type error');
            } else if (!!scope && !_.isString(scope)) {
                throw new Error('scope format error');
            } else if (!!state && !_.isString(state)) {
                throw new Error('state format error');
            }
        } catch (err) {
            throw err;
        }
    }

    private async _refreshTokenCheck(
        db: Connection, refresh_token: string
    ): Promise<IOauthTokenDao> {
        try {
            let _err: IError = new Error();
            let [rows] = <[IOauthTokenDao[], FieldPacket[]]> await db.query(`
                SELECT
                    *
                FROM
                    OAUTH_TOKEN
                WHERE
                    GRANT_TYPE = ? AND REFRESH_TOKEN = ?
                FOR UPDATE
            `, [ 'code', refresh_token ]);

            if (rows.length !== 1) {
                rows.length !== 0 && (_err.data = rows[0]);
                _err.message = `[${refresh_token}] refresh_token error`;
                throw _err;
            }

            let row = rows[0];
            if (!!row.IS_DISABLED) {
                _err.data = row;
                _err.message = `[${refresh_token}] refresh_token disabled`;
                throw _err;
            } else if (row.REFRESH_LIMIT !== 0 && row.REFRESH_LIMIT! <= row.REFRESH_COUNT!) {
                _err.data = row;
                _err.message = `[${refresh_token}] refresh limit reached`;
                throw _err;
            }

            let [oauthApplicationAndUsers] = <[IOauthApplicationAndUserDao[], FieldPacket[]]> await db.query(`
                SELECT * FROM OAUTH_APPLICATION_USER WHERE ID = ?
            `, [ row.OAUTH_APPLICATION_USER_ID ]);
            if (oauthApplicationAndUsers.length === 0) {
                _err.data = row;
                _err.message = `[${refresh_token}] refresh_token error`;
                throw _err;
            }

            return row;
        } catch (err: any) {
            let _err: IError = err;
            if ('data' in _err) {
                await db.query(`
                    UPDATE OAUTH_TOKEN SET
                        IS_DISABLED = ?, IS_EXPIRES = ?
                    WHERE
                        ID = ?
                `, [ true, true, _err.data.ID ]);
                await this._transTokenToHis(db, _err.data.OATUH_APPLICATION_USER_ID, this.options);
            }

            throw err;
        }
    }

    async refreshToken(database: IMysqlDatabase, body: IRefreshTokenBody, options: TAnyObj & { user: IBasicPassportRes }): Promise<IAccessTokenRes> {
        const { user: { client_id } } = options;
        const { refresh_token, scope, state } = body;
        const NOW_DATE = new Date();
        const EXPIRES_TIME = this.EXPIRES_MIN * this.SEC_TIME;
        try {
            this._checkRefreshTokenBody(body);
            let db = await database.getConnection();
            try {
                await db.beginTransaction();
                await this._checkOauthApplicationByAccessAndRefreshAndVerify(db, options);
                let oauthToken = await this._refreshTokenCheck(db, refresh_token);
                let accessToken = Passport.grantJWTToken({
                    grant_type: 'code', client_id
                }, { expiresIn: EXPIRES_TIME });
                let refreshToken = Passport.grantJWTToken({
                    grant_type: 'refresh_token', client_id
                }, { expiresIn: EXPIRES_TIME });
                let result: IAccessTokenRes = {
                    access_token: accessToken, // grant access_token is jwt
                    token_type: this.TOKEN_TYPE,
                    expires_in: (EXPIRES_TIME) / 1000,
                    refresh_token: refreshToken
                };
                !!state && (result.state = state);

                await db.query(`
                    UPDATE OAUTH_TOKEN SET
                        ACCESS_TOKEN = ?, REFRESH_TOKEN = ?,
                        EXPIRES_DATE = ?,
                        REFRESH_COUNT = REFRESH_COUNT + 1,
                        UPDATE_BY = ?
                    WHERE
                        ID = ?
                `, [
                    accessToken, refreshToken,
                    new Date((+NOW_DATE + EXPIRES_TIME)),
                    client_id,
                    oauthToken.ID
                ]);
                console.log(scope);
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

    private _checkVerifyTokenBody(body: IVerifyTokenBody): void {
        const { access_token, state } = body;
        try {
            if (!access_token) {
                throw new Error('No refresh_token');
            } else if (!!access_token && !_.isString(access_token)) {
                throw new Error('refresh_token type error');
            } else if (!!state && !_.isString(state)) {
                throw new Error('state format error');
            }
        } catch (err) {
            throw err;
        }
    }

    private async _verifyToken(db: Connection, access_token: string, NOW_DATE: Date): Promise<IOauthTokenDao> {
        try {
            let _err: IError = new Error();
            let [rows] = <[IOauthTokenDao[], FieldPacket[]]> await db.query(`
                SELECT
                    *
                FROM
                    OAUTH_TOKEN
                WHERE
                    ACCESS_TOKEN = ?
                FOR UPDATE
            `, [ access_token ]);
            if (rows.length !== 1) {
                rows.length !== 0 && (_err.data = rows[0]);
                _err.message = `[${access_token}] access_token error`;
                throw _err;
            }

            let row = rows[0];
            if (!!row.IS_DISABLED) {
                _err.data = row;
                _err.message = `[${access_token}] access_token disabled`;
                throw _err;
            } else if (
                (!!row.EXPIRES_DATE && +new Date(row.EXPIRES_DATE) <= +NOW_DATE) ||
                !!row.IS_EXPIRES
            ) {
                _err.data = row;
                _err.message = `[${access_token}] access_token expires`;
                throw _err;
            } else if (
                row.USE_LIMIT !== 0 && row.USE_LIMIT! <= row.USE_COUNT!
            ) {
                _err.data = row;
                _err.message = `[${access_token}] access_token use limit reached`;
                throw _err;
            }

            let [oauthApplicationAndUsers] = <[IOauthApplicationAndUserDao[], FieldPacket[]]> await db.query(`
                SELECT * FROM OAUTH_APPLICATION_USER WHERE ID = ?
            `, [ row.OAUTH_APPLICATION_USER_ID ]);
            if (oauthApplicationAndUsers.length === 0) {
                _err.data = row;
                _err.message = `[${access_token}] access_token error`;
                throw _err;
            }

            return row;
        } catch (err: any) {
            let _err: IError = err;
            if ('data' in _err) {
                await db.query(`
                    UPDATE OAUTH_TOKEN SET
                        IS_DISABLED = ?, IS_EXPIRES = ?
                    WHERE
                        ID = ?
                `, [ true, true, _err.data.ID ]);
                await this._transTokenToHis(db, _err.data.OATUH_APPLICATION_USER_ID, this.options);
            }

            throw err;
        }
    }

    async verifyToken(
        database: IMysqlDatabase, body: IVerifyTokenBody, options: TAnyObj & { user: IBasicPassportRes }
    ): Promise<IVerifyTokenBody> {
        const { access_token } = body;
        const NOW_DATE = new Date();
        try {
            this._checkVerifyTokenBody(body);
            let db = await database.getConnection();
            try {
                await this._checkOauthApplicationByAccessAndRefreshAndVerify(db, options);
                await this._verifyToken(db, access_token, NOW_DATE);

                return body;
            } catch (err) {
                throw err;
            } finally {
                await database.end(db);
            }
        } catch (err) {
            throw err;
        }
    }

    // private _base64ToString(): string {
    //     try {
    //         let a = Buffer.from('123:321', 'base64').toString('ascii');
    //         let b = Buffer.from(a).toString('base64');

    //         return b;
    //     } catch (err) {
    //         throw err;
    //     }
    // }
}

export {
    Oauth
};
