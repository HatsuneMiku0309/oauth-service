import { Connection } from "mysql2/promise";
import { IMysqlDatabase, TAnyObj } from "../../utils.interface";
import { IJWTCotext } from "../utils.interface";

export interface IListQuery {

}

export interface IListRes {
    ID: string;
    NAME: string;
    HOMEPAGE_URL: string;
    APPLICATION_DESCRIPTION?: string;
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

}

export interface ICommonRes {
    ID: string
}

export interface IRemoveUserRes extends ICommonRes {
    OAUTH_APPLICATION_USER_ID: string
}

export interface IOauthApplication {
    options: TAnyObj;
    list(database: IMysqlDatabase, query: IListQuery, options: TAnyObj & IJWTCotext): Promise<IListRes[]>;
    dbList(db: Connection, query: IListQuery, options: TAnyObj & IJWTCotext): Promise<IListRes[]>;
    detail(database: IMysqlDatabase, id: string, options?: TAnyObj & IJWTCotext): Promise<IOauthApplicationDao>;
    dbDetail(db: Connection, id: string, options?: TAnyObj & IJWTCotext): Promise<IOauthApplicationDao>;
    create(database: IMysqlDatabase, body: ICreateBody, options: TAnyObj & IJWTCotext): Promise<ICommonRes>;
    dbCreate(db: Connection, body: ICreateBody, options: TAnyObj & IJWTCotext): Promise<ICommonRes>;
    update(database: IMysqlDatabase, id: string, body: IUpdateBody, options: TAnyObj & IJWTCotext): Promise<ICommonRes>;
    dbUpdate(db: Connection, id: string, body: IUpdateBody, options: TAnyObj & IJWTCotext): Promise<ICommonRes>;
    remove(database: IMysqlDatabase, id: string, options: TAnyObj & IJWTCotext): Promise<ICommonRes>;
    dbRemove(db: Connection, id: string, options: TAnyObj & IJWTCotext): Promise<ICommonRes>;
    removeUser(database: IMysqlDatabase, id: string, oau_id: string, options: TAnyObj & IJWTCotext): Promise<IRemoveUserRes>;
    dbRemoveUser(db: Connection, id: string, oau_id: string, options: TAnyObj & IJWTCotext): Promise<IRemoveUserRes>;
}

// ---------- DAO -----------

export interface IOauthApplicationDao {
    ID: string; // varchar(100) uuid
    NAME: string; // varchar(100)
    HOMEPAGE_URL: string; // varchar(255)
    APPLICATION_DESCRIPTION?: string; // text
    USER_ID: string; // varchar(100)
    CLIENT_ID: string; // varchar(100)
    CLIENT_SECRET: string; // varchar(255) ID:USER_ID:CLIENT_ID BASE64
    REDIRECT_URI: string; // varchar(255)
    EXPIRES_DATE?: Date;
    NOT_BEFORE?: Date;
    IS_DISABLED?: boolean | number; // default: 0
    IS_EXPIRES?: boolean | number; // default: 0
    IS_CHECKED?: boolean | number; // default: 1
    AUDIT_STATE?: string; // varchar(100)
    CREATE_TIME?: Date;
    CREATE_BY: string; // varchar(100)
    UPDATE_TIME?: Date;
    UPDATE_BY?: string; // varchar(100)
}
