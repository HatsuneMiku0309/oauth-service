import { Connection } from "mysql2/promise";
import { IMysqlDatabase, TAnyObj } from "../../utils.interface";
import { ILoginRes, TSource } from "../login/login.interface";
import { IJWTCotext, TContext } from "../utils.interface";

export interface IGetProfileRes {
    ID: string;
    ACCOUNT: string;
    EMAIL: string;
    PHONE: string;
}

export interface IUserAppsRes {
    ID: string;
    APP_NAME: string;
}

export interface IUpdateBody {
    account: string;
    password?: string;
    email: string;
    phone?: string;
}

export interface IProfile {
    options: TAnyObj;
    getProfile(database: IMysqlDatabase, options: TAnyObj & IJWTCotext): Promise<IGetProfileRes>;
    dbGetProfile(db: Connection, options: TAnyObj & IJWTCotext): Promise<IGetProfileRes>;
    update(ctx: TContext, database: IMysqlDatabase, id: string, body: IUpdateBody, options: TAnyObj & IJWTCotext): Promise<ILoginRes & { reload: boolean; }>;
    dbUpdate(ctx: TContext, db: Connection, id: string, body: IUpdateBody, options: TAnyObj & IJWTCotext): Promise<ILoginRes & { reload: boolean; }>;
    userApps(database: IMysqlDatabase, options: TAnyObj & IJWTCotext): Promise<IUserAppsRes[]>;
    dbUserApps(db: Connection, options: TAnyObj & IJWTCotext): Promise<IUserAppsRes[]>;
    userRemoveApps(database: IMysqlDatabase, id: string, options: TAnyObj & IJWTCotext): Promise<{ ID: string }>;
    dbUserRemoveApps(db: Connection, id: string, options: TAnyObj & IJWTCotext): Promise<{ ID: string }>;
}

// ---------- DAO -----------
