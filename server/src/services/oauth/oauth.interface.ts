import { Connection } from "mysql2/promise";
import { IMysqlDatabase, TAnyObj } from "../../utils.interface";
import { IBasicPassportRes } from "../jwt/passport.interface";
import { IOauthApplicationDao } from "../oauth-app/oauth-app.interface";
import { IJWTCotext } from "../utils.interface";

/**
 * code: Authorization Code
 * 
 * token: Access Token
 */
export type TResponseType = 'code' | 'token';
export type TTokenType = 'bearer' | 'basic';

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

export interface IGrantTokenBody {
    response_type: TResponseType;
    client_id: string;
    redirect_uri?: string;
    state?: string;
    scope?: string;
}

export interface IGrantTokenRes {
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

export interface IVerifyTokenBody {
    access_token: string;
    state?: string;
}

export interface IOauth {
    options: TAnyObj;
    checkOauthApplication(db: Connection, client_id: string, options: TAnyObj): Promise<IOauthApplicationDao>;
    grantCodeToken(database: IMysqlDatabase, body: IGrantTokenBody, options: TAnyObj & IJWTCotext): Promise<IGrantTokenRes | IAccessTokenRes>;
    accessToken(database: IMysqlDatabase, body: IAccessTokenBody, options: TAnyObj & { user: IBasicPassportRes }): Promise<IAccessTokenRes>;
    refreshToken(database: IMysqlDatabase, body: IRefreshTokenBody, options: TAnyObj & { user: IBasicPassportRes }): Promise<IAccessTokenRes>;
    verifyToken(database: IMysqlDatabase, body: IVerifyTokenBody, options: TAnyObj & { user: IBasicPassportRes }): Promise<any>;
}

// ---------- DAO -----------

export interface IOauthApplicationUserDao {
    ID: string; // varchar(100) uuid
    USER_ID: string; // varchar(100) uuid
    OAUTH_APPLICATION_ID: string; // varchar(100) uuid
    OAUTH_TOKEN_ID: string; //varchar(100) uuid
    CREATE_TIME?: Date;
    CREATE_BY: string; // varchar(100)
    UPDATE_TIME?: Date;
    UPDATE_BY?: string; // varchar(100)
}

export interface IOauthApplicationAndUserDao {
    ID: string;
    USER_ID: string;
    CLIENT_ID: string;
    CLIENT_SECRET: string;
    REDIRECT_URI: string;
    EXPIRES_DATE: Date;
    NOT_BEFORE: Date;
    IS_DISABLED: number | boolean; // default: 0
    IS_EXPIRES: number | boolean; // default: 0
    IS_CHECKED: number | boolean; // default: 1
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
    IS_DISABLED?: number | boolean; // default: 0
    IS_EXPIRES?: number | boolean; // default: 0
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