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

export interface IOauthApplicationUser {
    options: TAnyObj;
    list(database: IMysqlDatabase, o_id: string, query: IListQuery, options: TAnyObj & IJWTCotext): Promise<IListRes>;
    dbList(db: Connection, o_id: string, query: IListQuery, options: TAnyObj & IJWTCotext): Promise<IListRes>;
    removeUser(database: IMysqlDatabase, o_id: string, id: string, options: TAnyObj & IJWTCotext): Promise<IRemoveUserRes>;
    dbRemoveUser(db: Connection, o_id: string, id: string, options: TAnyObj & IJWTCotext): Promise<IRemoveUserRes>;
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
