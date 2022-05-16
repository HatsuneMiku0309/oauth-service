import { Connection } from "mysql2/promise";
import { IMysqlDatabase, TAnyObj } from "../../utils.interface";
import { IJWTCotext } from "../utils.interface";

export type TMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface IAPIs extends TAnyObj {
    api: string;
    method: TMethod;
}

export interface IListQuery {
    q: string;
    offset?: number;
    count?: number;
}

export interface IListRes {
    datas: IApiScopeDao[],
    offset: number;
    count: number;
    totalPage: number;
}


export interface ICreateBody {
    name: string;
    description?: string;
    system: string;
    apis: IAPIs[];
    is_required?: boolean;
    require_check?: boolean; // default: false
}

export interface IUpdateBody {
    description?: string;
    system: string;
    apis: IAPIs[];
    is_required?: boolean;
    require_check?: boolean; // default: false
}

export interface IUpdatesBody extends IUpdateBody {
    id: string;
    name: string;
}

export interface IRegistBody {
    name: string;
    description?: string;
    apis: IAPIs[];
    is_required?: boolean; // default: false
    require_check?: boolean; // default: false
}

export interface IScope {
    options: TAnyObj;
    list(database: IMysqlDatabase, query: IListQuery, options: TAnyObj & IJWTCotext): Promise<IListRes>;
    dbList(db: Connection, query: IListQuery, options: TAnyObj & IJWTCotext): Promise<IListRes>;
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
    regist(database: IMysqlDatabase, system: string, body: IRegistBody[], options: TAnyObj & IJWTCotext): Promise<IApiScopeDao[]>;
    dbRegist(db: Connection, system: string, body: IRegistBody[], options: TAnyObj & IJWTCotext): Promise<IApiScopeDao[]>;
}

// ---------- DAO -----------

export type TPublic = 'PUBLIC' | 'PRIVATE';

export interface IApiScopeDao {
    ID: string;
    NAME: string;
    DESCRIPTION?: string;
    SYSTEM: string;
    APIS: IAPIs[] | string; // setting string type because JSON.stringify(apis)
    IS_REQUIRED?: boolean; // default: 0
    IS_PUBLIC?: TPublic; // default: 'PRIVATE'
    REQUIRE_CHECK?: boolean; // default: false
    CREATE_TIME?: Date;
    CREATE_BY: string;
    UPDATE_TIME?: Date;
    UPDATE_BY?: string;
}
