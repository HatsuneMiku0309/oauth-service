import { Connection } from "mysql2/promise";
import { IMysqlDatabase, TAnyObj } from "../../utils.interface";
import { IAPIs } from "../scope/scope.interface";
import { IJWTCotext } from "../utils.interface";

export interface IRegistBody {
    scope_id: string;
    is_disabled?: boolean; // default: false
    is_checked?: boolean; // default: true
}

export interface IOauthApplicationScopeAndApiScopeRes {
    ID: string;
    OAUTH_APPLICATION_ID: string;
    SCOPE_ID: string;
    NAME: string;
    SYSTEM: string;
    DESCRIPTION: string;
    APIS: IAPIs[],
    IS_REQUIRED: boolean;
    REQUIRE_CHECK: boolean;
    IS_DISABLED: boolean;
    IS_CHECKED: boolean;
    CREATE_TIME: Date;
    CREATE_BY: string;
    UPDATE_TIME: Date;
    UPDATE_BY: string;
}

export interface IOauthApplicationScope {
    options: TAnyObj;
    list(database: IMysqlDatabase, oa_id: string, options: TAnyObj & IJWTCotext): Promise<IOauthApplicationScopeAndApiScopeRes[]>;
    dbList(db: Connection, oa_id: string, options: TAnyObj & IJWTCotext): Promise<IOauthApplicationScopeAndApiScopeRes[]>;
    registScope(database: IMysqlDatabase, oa_id: string, body: IRegistBody[],  options: TAnyObj & IJWTCotext): Promise<IOauthApplicationScopeAndApiScopeRes[]>;
    dbRegistScope(db: Connection, oa_id: string, body: IRegistBody[],  options: TAnyObj & IJWTCotext): Promise<IOauthApplicationScopeAndApiScopeRes[]>;
}

// ---------- DAO -----------

export interface IOauthApplicationScopeDao {
    ID: string;
    OAUTH_APPLICATION_ID: string;
    SCOPE_ID: string;
    IS_DISABLED?: boolean; // default: 0
    IS_CHECKED?: boolean; // default: 1
    CREATE_TIME?: Date;
    CREATE_BY: string;
    UPDATE_TIME?: Date;
    UPDATE_BY?: string;
}
