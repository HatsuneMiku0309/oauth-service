import { install } from 'source-map-support';
install();

import { v4 as uuid } from 'uuid';
import * as _ from 'lodash';
import { IError, IMysqlDatabase, TAnyObj } from '../../utils.interface';
import {
    IOauth, IGrantCodeTokenBody, IAccessTokenBody, IGrantCodeTokenRes, IAccessTokenRes,
    IRefreshTokenBody, IOauthApplicationAndUserDao, TTokenType, IOauthTokenDao, IVerifyTokenRes,
    IVerifyTokenBody, IOauthApplicationScopeRes, IGrantBaseData, IGrantTokenResult, TResponseType, IAccessTokenCheckRes
} from './oauth.interface';
import { IOauthApplicationDao } from '../oauth-app/oauth-app.interface';
import { FieldPacket } from 'mysql2';
import { Connection } from 'mysql2/promise';
import { IJWTCotext } from '../utils.interface';
import { Passport } from '../jwt/passport';
import { IBasicPassportRes } from '../jwt/passport.interface';
import { checkHttpProtocol, checkRedirectUri } from '../../utils';
import { OauthApplicationScope } from '../oauth-app/oauth-app-scope';
import { IUserDAO } from '../login/login.interface';
import { JwtPayload } from 'jsonwebtoken';
import { TMethod } from '../scope/scope.interface';

class Oauth implements IOauth {
    static instance: IOauth;
    private _USE_LIMIT: number = 1;
    readonly SEC_TIME: number = 60 * 1000;
    readonly EXPIRES_MIN = 15;
    readonly  REFRESH_EXPIRES_TIME = 365 * 24 * 60 * this.SEC_TIME;
    readonly TOKEN_TYPE: TTokenType = 'Bearer';
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

    async getOauthApplicationScope(database: IMysqlDatabase, client_id: string, options: TAnyObj & IJWTCotext): Promise<IOauthApplicationScopeRes> {
        const { user: { user_id } } = options;
        try {
            let db = await database.getConnection();
            let oauthApplicationScope = OauthApplicationScope.getInstance(this.options);
            try {
                let oauthApplicaion = await this._checkOauthApplication(db, client_id, options);
                let sql = 'SELECT ACCOUNT FROM USER WHERE ID = ?';
                let [users] = <[{ ACCOUNT: string }[], FieldPacket[]]> await db.query(sql, [ oauthApplicaion.USER_ID ]);
                if (users.length === 0) {
                    throw new Error(`[${oauthApplicaion.ID}] user not find`);
                }
                let user = users[0];
                let oauthScopes = await oauthApplicationScope.dbList(db, oauthApplicaion.ID, options);
                oauthScopes.forEach((oauthScope) => {
                    if (oauthScope.IS_DISABLED) {
                        throw new Error(`[${oauthScope.SYSTEM}-${oauthScope.NAME}] disabled`);
                    } else if (!oauthScope.IS_CHECKED) {
                        throw new Error(`[${oauthScope.SYSTEM}-${oauthScope.NAME}] not checked`);
                    }
                });
                let [clientUsers] = <[{ ACCOUNT: string }[], FieldPacket[]]> await db.query(sql, [ user_id ]);
                if (clientUsers.length === 0) {
                    throw new Error('Client user not find');
                }
                let clientUser = clientUsers[0];

                let [oauthUserCounts] = <[{ USER_COUNT: number }[], FieldPacket[]]> await db.query(`
                    SELECT count(1) USER_COUNT FROM OAUTH_APPLICATION_USER WHERE OAUTH_APPLICATION_ID = ?
                `, [ oauthApplicaion.ID ]);
                let CLIENT_ACCOUNT = 0;
                if (oauthUserCounts.length !== 0) {
                    CLIENT_ACCOUNT = oauthUserCounts[0].USER_COUNT;
                }

                return {
                    SCOPES: oauthScopes,
                    APP: {
                        NAME: oauthApplicaion.NAME,
                        HOMEPAGE_URL: oauthApplicaion.HOMEPAGE_URL,
                        USER_ACCOUNT: user.ACCOUNT,
                        CREATE_TIME: <Date> oauthApplicaion.CREATE_TIME,
                        USER_COUNT: CLIENT_ACCOUNT
                    },
                    CLIENT_ACCOUNT: clientUser.ACCOUNT
                };
            } catch (err) {
                throw err;
            } finally {
                await database.end(db);
            }
        } catch (err) {
            throw err;
        }
    }

    private _checkGrantTokenBody(body: IGrantCodeTokenBody): void {
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
                } else if (!checkHttpProtocol(redirect_uri, false)) {
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
        },
        options: TAnyObj = { }
    ): Promise<IOauthApplicationAndUserDao | undefined> {
        const { client_id, user_id } = body;
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
                OAUTH_APPLICATION oa,
                OAUTH_APPLICATION_USER oas
            WHERE
                oas.OAUTH_APPLICATION_ID = oa.ID
                AND oa.CLIENT_ID = ? AND oas.USER_ID = ?
            `;
            let params = [ client_id, user_id ];
            let [oauthApplicationAndUsers] = <[IOauthApplicationAndUserDao[], FieldPacket[]]> await db.query(sql, params);

            if (oauthApplicationAndUsers.length === 0) {
                return ;
            }
            let oauthApplicationAndUser = oauthApplicationAndUsers[0];

            return oauthApplicationAndUser;
        } catch (err) {
            throw err;
        }
    }

    private async _grantInitOauthUser(
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
                OAUTH_APPLICATION oa,
                OAUTH_APPLICATION_USER oas
            WHERE
                oas.OAUTH_APPLICATION_ID = oa.ID
                AND oa.CLIENT_ID = ? AND oas.USER_ID = ?
            `;
            let params = [ client_id, user_id ];
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
            let oauthApplicationAndUsers = rows;
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

    /**
     * grant JWT access token, type: Bearer
     * 
     * @param db 
     * @param oa_id 
     * @param options 
     * @returns 
     */
    private async _grantToken(
        db: Connection, response_type: TResponseType | 'refresh_token' | 'api_key',
        oauthApplication: IOauthApplicationDao, oat_id: string, user_id: string,
        options: TAnyObj & (IJWTCotext | { user: IBasicPassportRes })
    ): Promise<string> {
        try {
            const EXPIRES_TIME = oauthApplication.IS_ORIGIN
                ? 365 * 24 * 60 * this.SEC_TIME
                : this.EXPIRES_MIN * this.SEC_TIME;
            let [users] = <[IUserDAO[], FieldPacket[]]> await db.query(`
                SELECT * FROM USER WHERE ID = ?
            `, [user_id]);
            if (users.length !== 1) {
                throw new Error('Grant token fail');
            }
            let user = users[0];
            // todo-cosmo: user state check

            let oauthApplicationScope = OauthApplicationScope.getInstance(this.options);
            let baseSql = `
            SELECT
                oa.ID OAUTH_APPLICATION_ID,
                oau.ID OAUTH_APPLICATION_USER_ID,
                oau.USER_ID
            FROM
                OAUTH_APPLICATION oa
                LEFT JOIN OAUTH_APPLICATION_USER oau ON oa.ID = oau.OAUTH_APPLICATION_ID
            WHERE
                oa.ID = ?
                AND oau.USER_ID = ?
            `;
            let params = [ oauthApplication.ID, user_id ];
            let [baseDatas] = <[IGrantBaseData[], FieldPacket[]]> await db.query(baseSql, params);
            if (baseDatas.length !== 1) {
                throw new Error('Grant token fail');
            }
            let baseData = baseDatas[0];
            let scopes = await oauthApplicationScope.dbList(db, oauthApplication.ID, < TAnyObj & IJWTCotext> options);
            let grantTokenBody: IGrantTokenResult = {
                RESPONSE_TYPE: response_type,
                OAUTH_APPLICATION_ID: oauthApplication.ID,
                OAUTH_APPLICATION_USER_ID: baseData.OAUTH_APPLICATION_USER_ID,
                USER_ID: baseData.USER_ID,
                USER_EMP_NO: user.EMP_NO || '',
                USER_ACCOUNT: user.ACCOUNT,
                OAUTH_TOKEN_ID: oat_id,
                OAUTH_SCOPES: scopes
            };
            let result = Passport.grantJWTToken(grantTokenBody, { expiresIn: EXPIRES_TIME });

            return result;
        } catch (err) {
            throw err;
        }
    }

    async grantCodeToken(
        database: IMysqlDatabase, body: IGrantCodeTokenBody, options: TAnyObj & IJWTCotext
    ): Promise<IGrantCodeTokenRes | IAccessTokenRes> {
        try {
            let db = await database.getConnection();
            try {
                await db.beginTransaction();
                let result = await this.dbGrantCodeToken(db, body, options);
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

    async dbGrantCodeToken(db: Connection, body: IGrantCodeTokenBody, options: TAnyObj & IJWTCotext): Promise<IGrantCodeTokenRes | IAccessTokenRes> {
        const { user: { user_id } } = options;
        const { response_type, client_id, redirect_uri, state /*, scope */ } = body;
        const NOW_DATE = new Date();
        const EXPIRES_TIME = this.EXPIRES_MIN * this.SEC_TIME;
        let result: IGrantCodeTokenRes | IAccessTokenRes;
        try {
            this._checkGrantTokenBody(body);

            let oauthApplicaion = await this._checkOauthApplication(db, client_id, options);
            let oauthApplicationAndUser = await this._checkOauthUser(db, {
                client_id, user_id
            }, options);
            if (oauthApplicationAndUser === undefined) {
                oauthApplicationAndUser = await this._grantInitOauthUser(db, {
                    client_id, user_id,
                    oauth_application_id: oauthApplicaion.ID,
                    oauth_token_id: ''
                }, options);
            }
            await this._setTokenExpires(db, client_id, oauthApplicationAndUser.ID, { ...options, NOW_DATE });
            await this._transTokenToHis(db, oauthApplicationAndUser.ID, options);

            const id = uuid();
            const code = uuid();
            switch (response_type) {
                case 'code':
                    result = {
                        code: code,
                        redirect_uri: oauthApplicationAndUser.REDIRECT_URI
                    };
                    if (!!redirect_uri && oauthApplicationAndUser.REDIRECT_URI !== redirect_uri) {
                        throw new Error('redirect_uri error');
                    }
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
                    let access_token = await this._grantToken(db, 'token', oauthApplicaion, id, user_id, options);
                    let expiresTime = oauthApplicaion.IS_ORIGIN
                        ? 365 * 24 * 60 * this.SEC_TIME
                        : EXPIRES_TIME;
                    result = {
                        access_token: access_token, // grant access_token is jwt
                        token_type: this.TOKEN_TYPE,
                        expires_in: expiresTime / 1000,
                        redirect_uri: oauthApplicationAndUser.REDIRECT_URI
                    };
                    if (!!redirect_uri && oauthApplicationAndUser.REDIRECT_URI !== redirect_uri) {
                        throw new Error('redirect_uri error');
                    }
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
                        EXPIRES_DATE: new Date((+NOW_DATE + expiresTime)),
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

            return result;
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
                } else if (!checkHttpProtocol(redirect_uri, false)) {
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
    ): Promise<IAccessTokenCheckRes> {
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
            let oauthApplicationAndUser = oauthApplicationAndUsers[0];
            let result: IAccessTokenCheckRes = {
                ...row,
                USER_ID: oauthApplicationAndUser.USER_ID
            };

            return result;
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
                delete _err.data;
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
        body: IAccessTokenBody,
        options: TAnyObj & { user: IBasicPassportRes }
    ): Promise<IAccessTokenRes> {
        try {
            const db = await database.getConnection();
            try {
                let result = await this.dbAccessToken(db, body, options);
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

    async dbAccessToken(
        db: Connection,
        body: IAccessTokenBody,
        options: TAnyObj & { user: IBasicPassportRes, tokenType?: 'apiKey' }
    ): Promise<IAccessTokenRes> {
        const { user: { client_id }, tokenType } = options;
        const { code, redirect_uri, state } = body;
        const NOW_DATE = new Date();
        const EXPIRES_TIME = this.EXPIRES_MIN * this.SEC_TIME;
        try {
            this._checkAccessTokenBody(body);
            let oauthApplicaion = await this._checkOauthApplicationByAccessAndRefreshAndVerify(db, options);
            if (redirect_uri !== oauthApplicaion.REDIRECT_URI) {
                throw new Error('redirect_uri error');
            }
            let oauthTokenData = await this._accessTokenCheck(db, code, NOW_DATE);
            let expiresTime = oauthApplicaion.IS_ORIGIN || tokenType === 'apiKey'
                ? 365 * 24 * 60 * this.SEC_TIME
                : EXPIRES_TIME;
            let accessToken = await this._grantToken(db, tokenType === 'apiKey' ? 'api_key' : 'code', oauthApplicaion, oauthTokenData.ID, oauthTokenData.USER_ID, options);
            let refreshToken = Passport.grantJWTToken({
                grant_type: 'refresh_token', client_id, user_id: oauthTokenData.USER_ID
            }, { expiresIn: this.REFRESH_EXPIRES_TIME });
            let result: IAccessTokenRes = {
                access_token: accessToken, // grant access_token is jwt
                token_type: this.TOKEN_TYPE,
                expires_in: (expiresTime) / 1000,
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
                new Date((+NOW_DATE + expiresTime)),
                client_id,
                oauthTokenData.ID
            ]);

            return result;
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
        const { refresh_token /*, scope */, state } = body;
        const NOW_DATE = new Date();
        const EXPIRES_TIME = this.EXPIRES_MIN * this.SEC_TIME;
        try {
            this._checkRefreshTokenBody(body);
            let { user_id } = Passport.decodeJWTPayload<{
                user_id: string; grant_type: 'refresh_token', client_id: string
            }>(refresh_token);
            let db = await database.getConnection();
            try {
                await db.beginTransaction();
                let oauthApplicaion = await this._checkOauthApplicationByAccessAndRefreshAndVerify(db, options);
                let expiresTime = oauthApplicaion.IS_ORIGIN
                    ? 365 * 24 * 60 * this.SEC_TIME
                    : EXPIRES_TIME;
                let oauthToken = await this._refreshTokenCheck(db, refresh_token);
                let accessToken = await this._grantToken(db, 'code', oauthApplicaion, oauthToken.ID, user_id, options);
                // refresh token should not grant new token...
                // let refreshToken = Passport.grantJWTToken({
                //     grant_type: 'refresh_token', client_id, user_id
                // }, { expiresIn: this.REFRESH_EXPIRES_TIME });
                let result: IAccessTokenRes = {
                    access_token: accessToken, // grant access_token is jwt
                    token_type: this.TOKEN_TYPE,
                    expires_in: (expiresTime) / 1000,
                    refresh_token: refresh_token
                };
                !!state && (result.state = state);

                await db.query(`
                    UPDATE OAUTH_TOKEN SET
                        ACCESS_TOKEN = ?,
                        EXPIRES_DATE = ?,
                        REFRESH_COUNT = REFRESH_COUNT + 1,
                        IS_EXPIRES = ?,
                        UPDATE_BY = ?
                    WHERE
                        ID = ?
                `, [
                    accessToken,
                    new Date((+NOW_DATE + expiresTime)),
                    false,
                    client_id,
                    oauthToken.ID
                ]);
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
                throw new Error('No access_token');
            } else if (!!access_token && !_.isString(access_token)) {
                throw new Error('access_token type error');
            } else if (!!state && !_.isString(state)) {
                throw new Error('state format error');
            }
        } catch (err) {
            throw err;
        }
    }

    private async _useTokenModifySome(db: Connection, token_id: string, options: TAnyObj & { user: IBasicPassportRes }): Promise<void> {
        const { user: { client_id } } = options;
        try {
            let sql = 'UPDATE OAUTH_TOKEN SET UPDATE_BY = ?, USE_COUNT = USE_COUNT + 1 WHERE ID = ?';
            let params = [client_id, token_id ];
            await db.query(sql, params);
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
                        IS_EXPIRES = ?
                    WHERE
                        ID = ?
                `, [ true, _err.data.ID ]);
                await this._transTokenToHis(db, _err.data.OATUH_APPLICATION_USER_ID, this.options);
                delete _err.data;
            }

            throw err;
        }
    }

    async verifyToken(
        database: IMysqlDatabase, body: IVerifyTokenBody, options: TAnyObj & { user: IBasicPassportRes }
    ): Promise<IVerifyTokenRes> {
        const { user: { client_id } } = options;
        const { access_token } = body;
        const NOW_DATE = new Date();
        try {
            this._checkVerifyTokenBody(body);
            let {
                exp, iat, USER_ID, RESPONSE_TYPE,
                USER_EMP_NO, USER_ACCOUNT,
                OAUTH_APPLICATION_ID,
                // OAUTH_APPLICATION_USER_ID,
                OAUTH_TOKEN_ID,
                OAUTH_SCOPES
            } = Passport.decodeJWTPayload<IGrantTokenResult & JwtPayload>(access_token);
            let db = await database.getConnection();
            try {
                let oauthApplication = await this._checkOauthApplicationByAccessAndRefreshAndVerify(db, options);
                // api_key不再驗證其db數據以及其他紀錄。
                if (RESPONSE_TYPE !== 'api_key') {
                    let oauthToken = await this._verifyToken(db, access_token, NOW_DATE);
                    if (oauthApplication.ID !== OAUTH_APPLICATION_ID) {
                        throw new Error('Verify fail');
                    } else if (oauthToken.ID !== OAUTH_TOKEN_ID) {
                        throw new Error('Verify fail');
                    }
                    await this. _useTokenModifySome(db, oauthToken.ID, options);
                }
                let apis = <({ api: string, method: TMethod } & TAnyObj)[]> OAUTH_SCOPES.map((scope) => {
                    return scope.APIS;
                }).flat(Infinity);

                return {
                    ACTIVE: true,
                    CLIENT_ID: client_id,
                    USER_ID,
                    USER_EMP_NO,
                    USER_ACCOUNT,
                    OAUTH_SCOPES,
                    APIS: apis,
                    exp: exp,
                    iat: iat
                };
            } catch (err) {
                throw err;
            } finally {
                await database.end(db);
            }
        } catch (err: any) {
            let _err: IError = err;
            _err.state = 401;

            throw _err;
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
