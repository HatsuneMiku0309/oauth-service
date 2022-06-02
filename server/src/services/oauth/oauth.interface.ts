import { JwtPayload } from "jsonwebtoken";
import { Connection } from "mysql2/promise";
import { IConfig, IMysqlDatabase, TAnyObj } from "../../utils.interface";
import { IBasicPassportRes } from "../jwt/passport.interface";
import { IOauthApplicationScopeAndApiScopeRes } from "../oauth-app/oauth-app-scope.interface";
import { IOauthApplicationDao } from "../oauth-app/oauth-app.interface";
import { TMethod } from "../scope/scope.interface";
import { IJWTCotext } from "../utils.interface";

/**
 * code: Authorization Code
 * 
 * token: Access Token
 */
export type TResponseType = 'code' | 'token';
export type TTokenType = 'Bearer' | 'Basic';

export interface IErrorRes {
    error: {
        invalid_request: string;
        unauthorized_client: string;
        access_denied: string;
        unsupported_response_type: string;
        invalid_scope: string;
        server_error: string;
        temporarily_unavailable: string;
    };
    error_description?: string;
    error_uri?: string;
    state: string;
}

export interface IGrantCodeTokenBody {
    response_type: TResponseType;
    client_id: string;
    redirect_uri?: string;
    state?: string;
    scope?: string;
}

export interface IGrantCodeTokenRes {
    code: string;
    state?: string;
    redirect_uri?: string;
}

export interface IAccessTokenBody {
    grant_type: 'code',
    code: string;
    redirect_uri: string;
    state?: string;
}

export interface IAccessTokenRes {
    access_token: string;
    token_type: TTokenType;
    expires_in: number;
    refresh_token?: string;
    example_parameter?: string;
    redirect_uri?: string;
    state?: string;
}

export interface IRefreshTokenBody {
    grant_type: 'refresh_token';
    refresh_token: string;
    scope?: string;
    state?: string;
}

export interface IVerifyTokenBody extends JwtPayload {
    access_token: string;
    state?: string;
}

export interface IVerifyTokenRes extends JwtPayload {
    ACTIVE: boolean;
    CLIENT_ID: string;
    USER_ID: string;
    USER_EMP_NO: string;
    USER_ACCOUNT: string;
    OAUTH_SCOPES: IOauthApplicationScopeAndApiScopeRes[];
    APIS: ({ api: string, method: TMethod } & TAnyObj)[];
}

export interface IOauthApplicationScopeRes {
    SCOPES: IOauthApplicationScopeAndApiScopeRes[];
    APP: {
        NAME: string;
        HOMEPAGE_URL: string;
        USER_ACCOUNT: string;
        CREATE_TIME: Date;
        USER_COUNT: number;
    };
    CLIENT_ACCOUNT: string;
}

export interface IGrantBaseData {
    OAUTH_APPLICATION_ID: string;
    OAUTH_APPLICATION_USER_ID: string;
    USER_ID: string;
    USER_EMP_NO: string;
    USER_ACCOUNT: string;
}

export interface IGrantTokenResult extends IGrantBaseData {
    RESPONSE_TYPE: TResponseType | 'refresh_token' | 'api_key';
    OAUTH_TOKEN_ID: string;
    OAUTH_SCOPES: IOauthApplicationScopeAndApiScopeRes[];
}

export interface IAccessTokenCheckRes extends IOauthTokenDao {
    USER_ID: string;
}

export interface IOauth {
    options: TAnyObj & { config: IConfig };
    getOauthApplicationScope(database: IMysqlDatabase, client_id: string, options: TAnyObj & IJWTCotext): Promise<IOauthApplicationScopeRes>;
    checkOauthApplication(db: Connection, client_id: string, options: TAnyObj): Promise<IOauthApplicationDao>;
    grantCodeToken(database: IMysqlDatabase, body: IGrantCodeTokenBody, options: TAnyObj & IJWTCotext): Promise<IGrantCodeTokenRes | IAccessTokenRes>;
    dbGrantCodeToken(db: Connection, body: IGrantCodeTokenBody, options: TAnyObj & IJWTCotext): Promise<IGrantCodeTokenRes | IAccessTokenRes>;
    accessToken(database: IMysqlDatabase, body: IAccessTokenBody, options: TAnyObj & { user: IBasicPassportRes }): Promise<IAccessTokenRes>;
    dbAccessToken(db: Connection, body: IAccessTokenBody, options: TAnyObj & { user: IBasicPassportRes }): Promise<IAccessTokenRes>;
    refreshToken(database: IMysqlDatabase, body: IRefreshTokenBody, options: TAnyObj & { user: IBasicPassportRes }): Promise<IAccessTokenRes>;
    verifyToken(database: IMysqlDatabase, body: IVerifyTokenBody, options: TAnyObj & { user: IBasicPassportRes }): Promise<IVerifyTokenRes>;
}

// ---------- DAO -----------

export interface IOauthApplicationAndUserDao {
    ID: string;
    USER_ID: string;
    CLIENT_ID: string;
    CLIENT_SECRET: string;
    REDIRECT_URI: string;
    EXPIRES_DATE: Date;
    NOT_BEFORE: Date;
    IS_DISABLED: boolean; // default: 0
    IS_EXPIRES: boolean; // default: 0
    IS_CHECKED: boolean; // default: 1
    AUDIT_STATE: string;
}

export interface IOauthTokenDao {
    ID: string; // varchar(100) uuid
    OAUTH_APPLICATION_USER_ID: string; // varchar(100) uuid
    GRANT_TYPE: TResponseType;
    CODE: string; // varchar(100)
    TOKEN_TYPE: TTokenType; // varchar(100)
    ACCESS_TOKEN?: string; // varchar(1000)
    REFRESH_TOKEN?: string; // varchar(1000)
    EXPIRES_DATE: Date;
    NOT_BEFORE?: Date;
    IS_DISABLED?: boolean; // default: 0
    IS_EXPIRES?: boolean; // default: 0
    USE_LIMIT?: number; // u_int default: 0
    USE_COUNT?: number; // u_int default: 0
    REFRESH_LIMIT?: number; // u_int default: 0
    REFRESH_COUNT?: number; // u_int default: 0
    CREATE_TIME?: Date;
    CREATE_BY: string; // varchar(100)
    UPDATE_TIME?: Date;
    UPDATE_BY?: string; // varchar(100)
    STATE?: string; // varchar(255)
}