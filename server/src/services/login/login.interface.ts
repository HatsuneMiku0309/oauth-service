import { Connection } from "mysql2/promise";
import { IMysqlDatabase, TAnyObj } from "../../utils.interface";
import { IJWTCotext, TContext } from "../utils.interface";

export interface ILoginBody {
    account: string;
    password: string;
}

export interface IRegistBody {
    account: string;
    password: string; // base64
    email: string;
    phone?: string;
}

export interface ITokenLoginTokenBody {
    user_token: string;
}

export interface ITokenLoginBody {
    ID: string;
    ACCOUNT: string;
    EMAIL: string;
    PHONE: string;
}

export interface ILoginRes {
    ID: string;
    ACCOUNT: string;
    EMAIL: string;
    PHONE: string;
}

export interface ILogin {
    options: TAnyObj;
    login(ctx: TContext, database: IMysqlDatabase, options?: TAnyObj): Promise<ILoginRes>;
    tokenLogin(ctx: TContext, database: IMysqlDatabase, body: ITokenLoginTokenBody, options: TAnyObj & IJWTCotext): Promise<ILoginRes>; 
    regist(database: IMysqlDatabase, body: IRegistBody, options?: TAnyObj): Promise<{ ID: string }>;
    dbRegist(db: Connection, body: IRegistBody, options?: TAnyObj): Promise<{ ID: string }>;
}

export type TSource = 'SELF' | 'COMPAL';

export interface IUserDAO {
    ID: string; // uuid
    SOURCE?: TSource; // varchar(100)
    ACCOUNT: string; // varchar(12)
    PASSWORD: string; //varchar(100)
    EMAIL: string; // varchar(255)
    PHONE?: string; // varchar(100)
    TOKEN: string; // varchar(1000)
    RESET_TOKEN: string; // varchar(100)
    CREATE_TIME: Date; // Datetime
    CREATE_BY: string; // varchar(100)
    UPDATE_BY: string; // varchar(100)
}

export interface ILdapUserDao {
    auth: boolean;
    depart_code: string;
    depart_name: string;
    emp_name: string;
    emp_no: string;
    email: string;
    phone: string;
}