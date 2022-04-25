import { Connection } from "mysql2/promise";
import { IMysqlDatabase, TAnyObj } from "../../utils.interface";
import { IBasicPassportRes } from "../jwt/passport.interface";
import { IJWTCotext } from "../utils.interface";

export type TMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface IAPIs {
    api: string;
    method: TMethod;
    params?: any;
}

export interface IListQuery {
    name?: string;
    system?: string;
}

export interface ICreateBody {
    name: string;
    description?: string;
    system: string;
    apis: IAPIs[];
    is_required?: boolean;
}

export interface IUpdateBody {
    description?: string;
    system: string;
    apis: IAPIs[];
    is_required?: boolean;
}

export interface IUpdatesBody extends IUpdateBody {
    id: string;
}

export interface IRegistBody {
    name: string;
    description?: string;
    apis: IAPIs[];
    is_required?: boolean;
}

export interface IScope {
    options: TAnyObj;
    list(database: IMysqlDatabase, query: IListQuery, options: TAnyObj & IJWTCotext): Promise<IApiScopeDao[]>;
    dbList(db: Connection, query: IListQuery, options: TAnyObj & IJWTCotext): Promise<IApiScopeDao[]>;
    create(database: IMysqlDatabase, body: ICreateBody, options: TAnyObj & IJWTCotext): Promise<{ ID: string }>;
    dbCreate(db: Connection, body: ICreateBody, options: TAnyObj & IJWTCotext): Promise<{ ID: string }>;
    creates(database: IMysqlDatabase, body: ICreateBody[], options: TAnyObj & IJWTCotext): Promise<{ ID: string }[]>;
    dbCreates(db: Connection, body: ICreateBody[], options: TAnyObj & IJWTCotext): Promise<{ ID: string }[]>;
    update(database: IMysqlDatabase, id: string, body: IUpdateBody, options: TAnyObj & IJWTCotext): Promise<{ ID: string }>;
    dbUpdate(db: Connection, id: string, body: IUpdateBody, options: TAnyObj & IJWTCotext): Promise<{ ID: string }>;
    updates(database: IMysqlDatabase, body: IUpdatesBody[], options: TAnyObj & IJWTCotext): Promise<{ ID: string }[]>;
    dbUpdates(db: Connection, body: IUpdatesBody[], options: TAnyObj & IJWTCotext): Promise<{ ID: string }[]>;
    remove(database: IMysqlDatabase, id: string, options: TAnyObj & IJWTCotext): Promise<{ ID: string }>;
    dbRemove(db: Connection, id: string, options: TAnyObj & IJWTCotext): Promise<{ ID: string }>;
    regist(database: IMysqlDatabase, system: string, body: IRegistBody[], options: TAnyObj & { user: IBasicPassportRes }): Promise<IApiScopeDao[]>;
    dbRegist(db: Connection, system: string, body: IRegistBody[], options: TAnyObj & { user: IBasicPassportRes }): Promise<IApiScopeDao[]>;
}

// ---------- DAO -----------

export interface IApiScopeDao {
    ID: string;
    NAME: string;
    DESCRIPTION?: string;
    SYSTEM: string;
    APIS: IAPIs[] | string; // setting string type because JSON.stringify(apis)
    IS_REQUIRED?: boolean; // default: 0
    CREATE_TIME?: Date;
    CREATE_BY: string;
    UPDATE_TIME?: Date;
    UPDATE_BY?: string;
}
