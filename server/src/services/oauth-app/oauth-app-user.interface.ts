import { Connection } from "mysql2/promise";
import { IMysqlDatabase, TAnyObj } from "../../utils.interface";
import { IJWTCotext } from "../utils.interface";

export interface IListQuery {
    q: string;
    offset?: number;
    count?: number;
}


export interface IListRes {
    datas: IOauthApplicationUserDao[],
    offset: number;
    count: number;
    totalPage: number;
}

export interface IRemoveUserRes {
    ID: string
}

export interface IUserAppsRes {
    ID: string;
    APP_NAME: string;
}

export interface IOauthApplicationUser {
    options: TAnyObj;
    list(database: IMysqlDatabase, oa_id: string, query: IListQuery, options: TAnyObj & IJWTCotext): Promise<IListRes>;
    dbList(db: Connection, oa_id: string, query: IListQuery, options: TAnyObj & IJWTCotext): Promise<IListRes>;
    userApps(database: IMysqlDatabase, options: TAnyObj & IJWTCotext): Promise<IUserAppsRes[]>;
    dbUserApps(db: Connection, options: TAnyObj & IJWTCotext): Promise<IUserAppsRes[]>;
    userRemoveApps(database: IMysqlDatabase, id: string, options: TAnyObj & IJWTCotext): Promise<{ ID: string }>;
    dbUserRemoveApps(db: Connection, id: string, options: TAnyObj & IJWTCotext): Promise<{ ID: string }>;
    removeUser(database: IMysqlDatabase, oa_id: string, id: string, options: TAnyObj & IJWTCotext): Promise<IRemoveUserRes>;
    dbRemoveUser(db: Connection, oa_id: string, id: string, options: TAnyObj & IJWTCotext): Promise<IRemoveUserRes>;
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
