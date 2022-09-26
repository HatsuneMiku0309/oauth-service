import { Connection } from "mysql2/promise";
import { IConfig, IMysqlDatabase, TAnyObj } from "../../utils.interface";
import { IBasicPassportRes } from "../jwt/passport.interface";
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

export interface IRegistBody {
    name: string;
    description?: string;
    apis: IAPIs[];
    is_required?: boolean; // default: false
    require_check?: boolean; // default: false
}

export interface IScope {
    options: TAnyObj & { config: IConfig };
    list(database: IMysqlDatabase, query: IListQuery, options: TAnyObj & IJWTCotext): Promise<IListRes>;
    dbList(db: Connection, query: IListQuery, options: TAnyObj & IJWTCotext): Promise<IListRes>;
    regist(database: IMysqlDatabase, system: string, body: IRegistBody[], options: TAnyObj & { user: IBasicPassportRes }): Promise<IApiScopeDao[]>;
    dbRegist(db: Connection, system: string, body: IRegistBody[], options: TAnyObj & { user: IBasicPassportRes }): Promise<IApiScopeDao[]>;
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
