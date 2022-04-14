import { Connection } from "mysql2/promise";
import { IMysqlDatabase, TAnyObj } from "../../utils.interface";
import { IJWTCotext } from "../utils.interface";

export interface IRegistBody {
    id: string;
    is_disabled?: boolean;
    is_checked?: boolean;
}

export interface IOauthApplicationScope {
    options: TAnyObj;
    registScope(database: IMysqlDatabase, id: string, body: IRegistBody[],  options: TAnyObj & IJWTCotext): Promise<IOauthApplicationScopeDao[]>;
    dbRegistScope(db: Connection, id: string, body: IRegistBody[],  options: TAnyObj & IJWTCotext): Promise<IOauthApplicationScopeDao[]>;
}

// ---------- DAO -----------

export interface IOauthApplicationScopeDao {
    ID: string;
    OAUTH_APPLICATION_ID: string;
    SCOPE_ID: string;
    IS_DISABLED?: number | boolean; // default: 0
    IS_CHECKED?: number | boolean; // default: 1
    CREATE_TIME?: Date;
    CREATE_BY: string;
    UPDATE_TIME?: Date;
    UPDATE_BY?: string;
}
