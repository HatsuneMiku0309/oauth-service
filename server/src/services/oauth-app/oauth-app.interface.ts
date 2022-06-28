import { Connection } from "mysql2/promise";
import { IConfig, IMysqlDatabase, TAnyObj } from "../../utils.interface";
import { IJWTCotext } from "../utils.interface";

export interface IListQuery {
    q: string;
    offset?: number;
    count?: number;
}

export interface IListData {
    ID: string;
    NAME: string;
    HOMEPAGE_URL: string;
    APPLICATION_DESCRIPTION?: string;
    IS_DISABLED: string;
    IS_EXPIRES: string;
    IS_CHECKED: string;
    CREATE_TIME: string;
    CREATE_BY: string;
    UPDATE_TIME?: string;
    UPDATE_BY?: string;
}

export interface IListRes {
    datas: IListData[],
    offset: number;
    count: number;
    totalPage: number;
}

export interface ICreateBody {
    name: string;
    homepage_url: string;
    application_description?: string;
    redirect_uri: string;
    expires_date?: string; // YYYY-MM-DD
    not_before?: string; // YYYY-MM-DD
    is_disabled?: boolean;
    is_expires?: boolean;
}

export interface IUpdateBody extends ICreateBody {
    color: string;
    scope_ids?: string[];
}

export interface ICommonRes {
    ID: string
}

export interface IRemoveUserRes extends ICommonRes {
    OAUTH_APPLICATION_USER_IDS: string[]
}

export interface IReloadApiKeyRes {
    API_KEY: string;
}

export interface IReloadSecretRes {
    CLIENT_SECRET: string;
}

export interface IOauthApplication {
    options: TAnyObj & { config: IConfig };
    list(database: IMysqlDatabase, query: IListQuery, options: TAnyObj & IJWTCotext): Promise<IListRes>;
    dbList(db: Connection, query: IListQuery, options: TAnyObj & IJWTCotext): Promise<IListRes>;
    detail(database: IMysqlDatabase, id: string, options?: TAnyObj & IJWTCotext): Promise<IOauthApplicationDao>;
    dbDetail(db: Connection, id: string, options?: TAnyObj & IJWTCotext): Promise<IOauthApplicationDao>;
    create(database: IMysqlDatabase, body: ICreateBody, options: TAnyObj & IJWTCotext): Promise<ICommonRes>;
    dbCreate(db: Connection, body: ICreateBody, options: TAnyObj & IJWTCotext): Promise<ICommonRes>;
    update(database: IMysqlDatabase, id: string, body: IUpdateBody, options: TAnyObj & IJWTCotext): Promise<ICommonRes>;
    dbUpdate(db: Connection, id: string, body: IUpdateBody, options: TAnyObj & IJWTCotext): Promise<ICommonRes>;
    reloadApiKey(database: IMysqlDatabase, id: string, options: TAnyObj & IJWTCotext): Promise<IReloadApiKeyRes>;
    dbReloadApiKey(db: Connection, id: string, options: TAnyObj & IJWTCotext): Promise<IReloadApiKeyRes>;
    reloadClientSecret(database: IMysqlDatabase, id: string, options: TAnyObj & IJWTCotext): Promise<IReloadSecretRes>;
    dbReloadClientSecret(db: Connection, id: string, options: TAnyObj & IJWTCotext): Promise<IReloadSecretRes>;
    remove(database: IMysqlDatabase, id: string, options: TAnyObj & IJWTCotext): Promise<ICommonRes>;
    dbRemove(db: Connection, id: string, options: TAnyObj & IJWTCotext): Promise<ICommonRes>;
}

// ---------- DAO -----------

export interface IOauthApplicationDao {
    ID: string; // varchar(100) uuid
    NAME: string; // varchar(100)
    HOMEPAGE_URL: string; // varchar(255)
    APPLICATION_DESCRIPTION?: string; // text
    USER_ID: string; // varchar(100)
    COLOR?: string; // varchar(10) default: FFFFFF
    CLIENT_ID: string; // varchar(100)
    CLIENT_SECRET: string; // varchar(255) ID:USER_ID:CLIENT_ID:salt BASE64
    API_KEY?: string; // text // apiKey是使用自身的帳戶即時建立token，並賦予長時間(或永久)的授權
    REDIRECT_URI: string; // varchar(255)
    EXPIRES_DATE?: Date;
    NOT_BEFORE?: Date;
    IS_DISABLED?: boolean; // default: 0
    IS_EXPIRES?: boolean; // default: 0
    IS_CHECKED?: boolean; // default: 1
    IS_ORIGIN?: boolean; // default: 0 // 設為 origin 意謂是受信任的，給予長時間的token... 原因：懶的改現有架構，通過增長時間可以避免refresh的問題。（併發api時的refresh，此參數不應該為true）
    AUDIT_STATE?: string; // varchar(100)
    CREATE_TIME?: Date;
    CREATE_BY: string; // varchar(100)
    UPDATE_TIME?: Date;
    UPDATE_BY?: string; // varchar(100)
}
